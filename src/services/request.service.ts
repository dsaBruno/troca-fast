import { Injectable } from '@nestjs/common';
import { Request as RequestExpress } from 'express';
import { Prisma, Product, Request } from '@prisma/client';
import { getOrderInfos } from 'src/helpers/get-order.helper';
import { prisma } from 'src/prisma/prisma.service';
import {
  ApproveRequestDTO,
  CreateRequestDTO,
  GetRequestDTO,
  IndexRequestDTO,
  ProductsRequestDTO,
  ReceivingRequestDTO,
} from 'src/validators/request.validator';
import { env } from 'src/env';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'src/prisma/paginator.interface';
import { CreateOrderReturnIDW } from 'src/helpers/create-return-order-idw.helper';
import { updateSkuReturnOrder } from 'src/helpers/update-sku-return-order-idw.helper';
import { MailerService } from '@nestjs-modules/mailer';
import { RequestGateway } from 'src/gateways/request.gateway';
import { GetProductRequestDTO } from 'src/validators/product.validator';

import * as fs from 'fs';
import * as path from 'path';

import { ProductNotFound } from 'src/errors/product-not-found-error';

const paginate: PaginateFunction = paginator({ perPage: 10 });

interface RequestBody {
  shipping_method: string;
  requester: string;
  order_id: string;
  order_id_idw: string;
  nfe: string;
  order_date: string;
  order_freight_value: number;
  order_value: number;
  client_name: string;
  client_document: string;
  client_email: string;
  client_uf: string;
  client_zipcode: string;
  client_address: string;
  client_address_number: string;
  client_telephone: string;
  client_state: string;
  order_gift_card?: number;
  voucher: boolean;
}

interface ProtocolBody {
  voucher: boolean;
  return_vtex: boolean;
  bank?: string;
  agency?: string;
  account?: string;
  digit_account?: string;
  type_key_pix?: string;
  key_pix?: string;
  action?: string;
}

interface ProductBody {
  name: string;
  value: number;
  quantity: number;
  refId: string;
  image: string;
  ean: string;
  category: string;
  brand: string;
  description_request: string;
  action: string;
  images: string[];
  reason_slug?: string;
  reason_refused_product?: string;
}

@Injectable()
export class RequestService {
  constructor(
    private readonly mailerService: MailerService, // private readonly requestGateway: RequestGateway,
  ) {}

  async register(req: any, body: CreateRequestDTO, files): Promise<Request> {
    const { idw, vtex } = await getOrderInfos(body.order_id);

    const gift = idw.Payments.find(
      (payment) => payment.PaymentDescription === 'VALE (VTEX)',
    );

    const NotIsCreditCard = idw.Payments.find(
      (payment) =>
        payment.PaymentDescription.indexOf('BOLETO') !== -1 ||
        payment.PaymentDescription.indexOf('PIX') !== -1,
    );

    const protocolBody: ProtocolBody = {
      voucher: body.voucher === 'true' ? true : false,
      return_vtex: NotIsCreditCard === undefined ? true : false,
      bank: body.bank || null,
      agency: body.agency || null,
      account: body.account || null,
      digit_account: body.digit_account || null,
      type_key_pix: body.type_key_pix || null,
      key_pix: body.key_pix || null,
    };

    const products: ProductBody[] = body.products.map((product) => {
      const itemVTX = vtex.items.find((item) => item.refId === product.refId);
      const itemIDW = idw.Items.find(
        (item) => item.IDSkuCompany === product.refId,
      );

      if (itemVTX === undefined || itemIDW === undefined) {
        throw new Error('Produto não localizado');
      }

      if (product.quantity > itemVTX.quantity) {
        throw new Error('Quantidade informada acima do total do pedido');
      }

      return {
        name: itemVTX.name,
        value: parseFloat(itemIDW.PriceSelling),
        quantity: parseInt(product.quantity),
        refId: itemVTX.refId,
        image: itemVTX.imageUrl,
        ean: itemVTX.ean,
        category: itemVTX.additionalInfo.categories.pop().name,
        brand: itemVTX.additionalInfo.brandName,
        description_request: product.description_request,
        reason_slug: product.reason_slug,
        action: product.action,
        images: product.images,
      };
    });

    const actionsType = new Set();
    for (const product of products) {
      actionsType.add(product.action);
    }
    const actionsTypePresents = Array.from(actionsType);

    const requestBody: RequestBody = {
      shipping_method: body.shipping_method,
      order_id: idw.OrderFrom,
      nfe: idw.NfeNumber.toString(),
      order_date: idw.Recordtimestamp,
      order_freight_value: parseFloat(idw.ValueShipping),
      order_id_idw: idw.IDOrder.toString(),
      order_value: parseFloat(idw.ValueProduct),
      order_gift_card: gift !== undefined ? gift.value : 0,
      requester: 'consumer',
      client_email: idw.ConsumerEmail,
      client_name: idw.ConsumerNameCorporateName,
      client_document: idw.ConsumerCpfCnpj,
      client_telephone: idw.ConsumerTelephone,
      client_address: idw.ShippingStreet,
      client_address_number: idw.ShippingNumber,
      client_state: idw.ShippingCity,
      client_uf: idw.ShippingState,
      client_zipcode: idw.ShippingPostalCode,
      voucher: body.voucher === 'true' ? true : false,
    };

    const request = await prisma.request.create({
      data: {
        ...requestBody,
        status: {
          connect: {
            group_slug: {
              slug: 'em-analise',
              group: 'request',
            },
          },
        },
      },
    });

    await prisma.logsRequest.create({
      data: {
        request: {
          connect: {
            id: request.id,
          },
        },
        status: {
          connect: {
            group_slug: {
              slug: 'em-analise',
              group: 'request',
            },
          },
        },
      },
    });

    await Promise.all(
      actionsTypePresents.map(async (action: string) => {
        const data: Prisma.ProtocolCreateInput = {
          ...protocolBody,
          action,
          freight_value: 0,
          total: 0,
          request: {
            connect: {
              id: request.id,
            },
          },
          status: {
            connect: {
              group_slug: {
                slug: 'solicitado',
                group: 'protocol',
              },
            },
          },
        };

        const protocol = await prisma.protocol.create({
          data,
        });

        await prisma.logsProtocol.create({
          data: {
            protocol: {
              connect: {
                id: protocol.id,
              },
            },
            status: {
              connect: {
                group_slug: {
                  slug: 'solicitado',
                  group: 'protocol',
                },
              },
            },
          },
        });

        const proportionalAmounts = {
          freight: 0,
          value: 0,
        };

        const productsAction = products.filter(
          (product) => product.action === action,
        );

        await Promise.all(
          productsAction.map(async (product) => {
            const images = product.images;
            const reason_slug = product.reason_slug;
            const action = product.action;

            delete product.images;
            delete product.action;
            delete product.reason_slug;

            const arrayImagesClient = images.map((img) => {
              const file = files.find((file) => file.originalname === img);
              return {
                url_image: `${env.URL_IMAGE}${file.filename}`,
              };
            });

            const data: Prisma.ProductCreateInput = {
              ...product,
              protocol: {
                connect: {
                  id: protocol.id,
                },
              },
              reason: {
                connect: {
                  action_slug: {
                    slug: reason_slug,
                    action,
                  },
                },
              },
              productImage: {
                createMany: {
                  data: arrayImagesClient,
                },
              },
            };

            proportionalAmounts.value += data.value * data.quantity;
            proportionalAmounts.freight += parseFloat(
              (
                (data.value * data.quantity * requestBody.order_freight_value) /
                requestBody.order_value
              ).toFixed(2),
            );

            await prisma.product.create({
              data,
            });
          }),
        );

        await prisma.protocol.update({
          where: {
            id: protocol.id,
          },
          data: {
            freight_value: proportionalAmounts.freight,
            total: proportionalAmounts.value,
          },
        });

        return;
      }),
    );

    await this.mailerService.sendMail({
      to: request.client_email,
      from: 'trocafacil@lojasantoantonio.com.br',
      subject: 'Solicitação Recebida',
      template: 'order-received',
      context: {
        user: request.client_name.split(' ')[0],
        sequencial: request.sequencial,
      },
    });

    await prisma.logsEmails.create({
      data: {
        email: 'Solicitação Recebida',
        request: {
          connect: {
            id: request.id,
          },
        },
      },
    });

    return request;
  }

  async show(req: RequestExpress, id: string): Promise<Request> {
    const request = await prisma.request.findFirst({
      where: {
        id,
      },
      include: {
        status: {
          select: {
            title: true,
            slug: true,
            updated_at: true,
          },
        },
        protocol: {
          include: {
            logsProtocol: {
              orderBy: {
                created_at: 'asc',
              },
              select: {
                status: {
                  select: {
                    title: true,
                  },
                },
                user: {
                  select: {
                    fullname: true,
                  },
                },
                created_at: true,
              },
            },
            status: true,
            product: {
              include: {
                reason: true,
                productImage: true,
              },
            },
          },
        },
        LogsRequest: {
          orderBy: {
            created_at: 'asc',
          },
          select: {
            status: {
              select: {
                title: true,
              },
            },
            user: {
              select: {
                fullname: true,
              },
            },
            created_at: true,
          },
        },
        LogsEmails: {
          select: {
            email: true,
            created_at: true,
          },
        },
      },
    });
    return request;
  }

  async index(
    req: RequestExpress,
    body: IndexRequestDTO,
  ): Promise<PaginatedResult<Request>> {
    const eventBody = {
      message: 'Motivo criado com sucesso',
    };

    // this.requestGateway.createRequest(eventBody);

    return await paginate(
      prisma.request,
      {
        where: body.where,
        orderBy: body.orderBy,
        include: {
          status: {
            select: {
              title: true,
            },
          },
        },
      },
      {
        page: body.page,
        perPage: body.perPage,
      },
    );
  }

  async approve(
    req: any,
    id: string,
    body: ApproveRequestDTO,
  ): Promise<Request> {
    const requestStatus: string[] = [];
    const refIds: { refId: string; quantity: number }[] = [];
    let request = await prisma.request.findUnique({
      where: {
        id,
      },
      include: {
        protocol: {
          include: {
            product: {
              include: {
                reason: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await Promise.all(
      request.protocol.map(async (protocol) => {
        const proportionalAmounts = {
          freight: 0,
          value: 0,
        };

        await Promise.all(
          protocol.product.map(async (product) => {
            const productApprovalInformation: {
              product_id: string;
              quantity: number;
              reason_slug: string | null;
              approved: boolean;
              reason_refused_product: string | null;
            } = body.products.find((item) => item.product_id === product.id);

            const reason_slug =
              productApprovalInformation.reason_slug || product.reason.slug;

            await prisma.product.update({
              where: {
                id: productApprovalInformation.product_id,
              },
              data: {
                approved: productApprovalInformation.approved,
                quantity: productApprovalInformation.quantity,
                reason: {
                  connect: {
                    action_slug: {
                      slug: reason_slug,
                      action: protocol.action,
                    },
                  },
                },
              },
            });

            if (productApprovalInformation.approved === true) {
              proportionalAmounts.value +=
                productApprovalInformation.quantity * product.value;

              proportionalAmounts.freight +=
                (productApprovalInformation.quantity *
                  product.value *
                  request.order_freight_value) /
                request.order_value;

              refIds.push({
                refId: product.refId,
                quantity: productApprovalInformation.quantity,
              });
            }

            return;
          }),
        );

        let group_slug = {
          slug: 'solicitado',
          group: 'protocol',
        };

        if (proportionalAmounts.value === 0) {
          group_slug = {
            slug: 'recusado',
            group: 'protocol',
          };

          requestStatus.push('refused');

          await prisma.logsProtocol.create({
            data: {
              status: {
                connect: {
                  group_slug,
                },
              },
              protocol: {
                connect: {
                  id: protocol.id,
                },
              },
              user: {
                connect: {
                  id: req.user.sub,
                },
              },
            },
          });
        } else {
          if (body.without_postage_code) {
            group_slug = {
              slug: 'pendente',
              group: 'protocol',
            };

            await prisma.logsProtocol.create({
              data: {
                status: {
                  connect: {
                    group_slug,
                  },
                },
                protocol: {
                  connect: {
                    id: protocol.id,
                  },
                },
                user: {
                  connect: {
                    id: req.user.sub,
                  },
                },
              },
            });
          }
          requestStatus.push('approved');
        }

        await prisma.protocol.update({
          where: {
            id: protocol.id,
          },
          data: {
            freight_value: proportionalAmounts.freight,
            total: proportionalAmounts.value,
            status: {
              connect: {
                group_slug,
              },
            },
          },
        });
      }),
    );

    // const orderReturnIDW = await CreateOrderReturnIDW(
    //   request.order_id_idw,
    //   refIds,
    // );

    // IDCarrier = 1864 (PAC) || 1865 (SEDEX)

    // try {
    //   const SRO = await idWorksApi.post('/correios/reversa', {
    //     IDCarrier: 1864,
    //     IDOrder: orderReturnIDW.IDOrder,
    //     QtyObject: 1,
    //     Schedule: null,
    //     TipoColeta: 0,
    //   });

    //   console.log(SRO.data);
    // } catch (error) {
    //   console.log(error);
    // }

    const slugs: string[] = [];

    if (requestStatus.length === 2) {
      requestStatus[0] !== requestStatus[1]
        ? slugs.push('aprovado-parcial')
        : slugs.push(requestStatus[0] === 'approved' ? 'aprovado' : 'recusado');
    } else {
      slugs.push(requestStatus[0] === 'approved' ? 'aprovado' : 'recusado');
    }

    if (!body.without_postage_code) {
      slugs.push('com-devolucao', 'aguardando-envio');
    } else {
      slugs.push('sem-devolucao', 'pendente');
    }

    await Promise.all(
      slugs.map(async (status) => {
        await prisma.logsRequest.create({
          data: {
            status: {
              connect: {
                group_slug: {
                  slug: status,
                  group: 'request',
                },
              },
            },
            request: {
              connect: {
                id: request.id,
              },
            },
            user: {
              connect: {
                id: req.user.sub,
              },
            },
          },
        });
      }),
    );

    await prisma.request.update({
      where: {
        id,
      },
      data: {
        without_postage_code: body.without_postage_code,
        // nfd: orderReturnIDW.NfeNumber,
        // order_id_return: orderReturnIDW.IDOrder,
        status: {
          connect: {
            group_slug: {
              slug: slugs.pop(),
              group: 'request',
            },
          },
        },
      },
    });

    request = await prisma.request.findUnique({
      where: {
        id,
      },
      include: {
        status: true,
        protocol: {
          include: {
            status: true,
            product: {
              include: {
                productImage: true,
                reason: true,
              },
            },
          },
        },
      },
    });

    return request;
  }

  async receiving(req: any, id: string, body: ReceivingRequestDTO[]) {
    const validations = {
      receivedComplete: false,
    };
    const request = await prisma.request.findUnique({
      where: {
        id,
      },
      include: {
        protocol: {
          include: {
            product: true,
          },
        },
      },
    });

    await Promise.all(
      request.protocol.map(async (protocol) => {
        const proportionalAmounts = {
          freight: 0,
          value: 0,
        };
        await Promise.all(
          protocol.product.map(async (product) => {
            if (product.approved === true) {
              const item = body.find((item) => item.ean === product.ean);

              if (item !== undefined) {
                if (item.quantity !== product.quantity) {
                  await updateSkuReturnOrder(request.order_id_return, {
                    refId: product.refId,
                    quantity: item.quantity,
                  });

                  proportionalAmounts.value += item.quantity * product.value;

                  proportionalAmounts.freight +=
                    (item.quantity *
                      product.value *
                      request.order_freight_value) /
                    request.order_value;
                }
              }
            }
          }),
        );

        let group_slug;

        if (proportionalAmounts.value === 0) {
          group_slug = {
            slug: 'cancelado',
            group: 'protocol',
          };
        } else {
          group_slug = {
            slug: 'aguardando-pagamento',
            group: 'protocol',
          };

          proportionalAmounts.value === protocol.total
            ? (validations.receivedComplete = true)
            : (validations.receivedComplete = false);
        }

        await prisma.logsProtocol.create({
          data: {
            status: {
              connect: {
                group_slug,
              },
            },
            protocol: {
              connect: {
                id: protocol.id,
              },
            },
            user: {
              connect: {
                id: req.user.sub,
              },
            },
          },
        });

        await prisma.protocol.update({
          where: {
            id: protocol.id,
          },
          data: {
            freight_value: proportionalAmounts.freight,
            total: proportionalAmounts.value,
            status: {
              connect: {
                group_slug,
              },
            },
          },
        });
      }),
    );

    let group_slug;

    if (validations.receivedComplete) {
      group_slug = {
        slug: 'recebido-completo',
        group: 'request',
      };
    } else {
      group_slug = {
        slug: 'recebido-parcial',
        group: 'request',
      };
    }

    await prisma.logsRequest.create({
      data: {
        status: {
          connect: {
            group_slug,
          },
        },
        request: {
          connect: {
            id: request.id,
          },
        },
        user: {
          connect: {
            id: req.user.sub,
          },
        },
      },
    });

    await prisma.request.update({
      where: {
        id,
      },
      data: {
        status: {
          connect: {
            group_slug,
          },
        },
      },
    });
    return;
  }

  async deleteProduct(
    req: any,
    id: string,
    product_id: string,
  ): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: {
        id: product_id,
        protocol: {
          request_id: id,
        },
      },
      include: {
        productImage: true,
        protocol: {
          include: {
            product: true,
            request: {
              include: {
                status: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new ProductNotFound();
    }

    const newTotalProtocol =
      product.protocol.total - product.value * product.quantity;
    const newFreightProtocol =
      (newTotalProtocol * product.protocol.freight_value) /
      product.protocol.total;

    if (newTotalProtocol === 0) {
      await prisma.protocol.update({
        where: {
          id: product.protocol.id,
        },
        data: {
          status: {
            connect: {
              group_slug: {
                slug: 'cancelado',
                group: 'protocol',
              },
            },
          },
        },
      });

      await prisma.logsProtocol.create({
        data: {
          user: {
            connect: {
              id: req.user.sub || null,
            },
          },
          protocol: {
            connect: {
              id: product.protocol.id,
            },
          },
          status: {
            connect: {
              group_slug: {
                slug: 'cancelado',
                group: 'protocol',
              },
            },
          },
        },
      });

      return product;
    }

    await prisma.protocol.update({
      where: {
        id: product.protocol.id,
      },
      data: {
        total: newTotalProtocol,
        freight_value: newFreightProtocol,
      },
    });

    await prisma.logsProtocol.create({
      data: {
        user: {
          connect: {
            id: req.user.sub || null,
          },
        },
        protocol: {
          connect: {
            id: product.protocol.id,
          },
        },
        status: {
          connect: {
            group_slug: {
              slug: 'alterado-produto-removido',
              group: 'protocol',
            },
          },
        },
      },
    });

    await Promise.all(
      product.productImage.map(async (image) => {
        const filename = image.url_image.replace(env.URL_IMAGE, '');
        fs.unlinkSync(path.join(process.cwd(), '/tmp/uploads/' + filename));

        await prisma.productImage.delete({
          where: {
            id: image.id,
          },
        });
      }),
    );

    await prisma.product.delete({
      where: {
        id: product.id,
      },
    });

    return product;
  }

  async addProduct(
    req: any,
    id: string,
    body: ProductsRequestDTO,
    files,
  ): Promise<any> {
    const protocol = await prisma.protocol.findFirst({
      where: {
        request_id: id,
        action: body.action,
      },
      include: {
        product: true,
        request: true,
      },
    });

    const orderInfos = await getOrderInfos(protocol.request.order_id);

    const freightOrder = protocol.request.order_freight_value;
    const totalOrder = protocol.request.order_value;

    const productIDW = orderInfos.idw.Items.find(
      (product) => product.IDSkuCompany == body.refId,
    );

    const productVTX = orderInfos.vtex.items.find(
      (product) => product.refId == body.refId,
    );

    const totalProtocol =
      productIDW.PriceSelling * parseInt(body.quantity) + protocol.total;

    const newFreightValue = (totalProtocol * freightOrder) / totalOrder;

    await prisma.protocol.update({
      where: {
        id: protocol.id,
      },
      data: {
        total: totalProtocol,
        freight_value: newFreightValue,
      },
    });

    const product = await prisma.product.create({
      data: {
        brand: productVTX.additionalInfo.brandName,
        category: productVTX.additionalInfo.categories.pop().name,
        description_request: body.description_request,
        ean: productIDW.BarCode,
        image: productVTX.imageUrl,
        name: productVTX.name,
        quantity: parseInt(body.quantity),
        refId: body.refId,
        value: productIDW.PriceSelling,
        protocol: {
          connect: {
            id: protocol.id,
          },
        },
        reason: {
          connect: {
            action_slug: {
              slug: body.reason_slug,
              action: body.action,
            },
          },
        },
      },
    });

    files.map(async (file) => {
      await prisma.productImage.create({
        data: {
          url_image: `${env.URL_IMAGE}${file.filename}`,
          product: {
            connect: {
              id: product.id,
            },
          },
        },
      });
    });

    await prisma.logsProtocol.create({
      data: {
        user: {
          connect: {
            id: req.user.sub || null,
          },
        },
        protocol: {
          connect: {
            id: protocol.id,
          },
        },
        status: {
          connect: {
            group_slug: {
              slug: 'alterado-produto-adicionado',
              group: 'protocol',
            },
          },
        },
      },
    });

    return await prisma.protocol.findUnique({
      where: {
        id: protocol.id,
      },
    });
  }
}
