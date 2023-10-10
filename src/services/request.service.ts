import { Injectable } from '@nestjs/common';
import { Request as RequestExpress } from 'express';
import { Prisma, Request } from '@prisma/client';
import { getOrderInfos } from 'src/helpers/get-order.helper';
import { prisma } from 'src/prisma/prisma.service';
import {
  ApproveRequestDTO,
  CreateRequestDTO,
  IndexRequestDTO,
  ReceivingRequestDTO,
} from 'src/validators/request.validator';
import { env } from 'src/env';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'src/prisma/paginator.interface';
import { CreateOrderReturnIDW } from 'src/helpers/create-return-order-idw.helper';
import { idWorksApi } from 'src/helpers/apis/idw';
import { updateSkuReturnOrder } from 'src/helpers/update-sku-return-order-idw.helper';
import { MailerService } from '@nestjs-modules/mailer';

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
  reason_id: string;
}

@Injectable()
export class RequestService {
  constructor(private readonly mailerService: MailerService) {}

  async register(req: any, body: CreateRequestDTO, files): Promise<Request> {
    const { idw, vtex } = await getOrderInfos(body.order_id);

    const statusRequest = await prisma.status.findUnique({
      where: {
        group_slug: {
          slug: 'em-analise',
          group: 'request',
        },
      },
    });

    const statusProtocol = await prisma.status.findUnique({
      where: {
        group_slug: {
          slug: 'solicitado',
          group: 'protocol',
        },
      },
    });

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
        reason_id: product.reason_id,
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
            id: statusRequest.id,
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
              id: statusProtocol.id,
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
            const reason_id = product.reason_id;

            delete product.images;
            delete product.action;
            delete product.reason_id;

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
                  id: reason_id,
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
    const request = await prisma.request.findUnique({
      where: {
        id,
      },
      include: {
        LogsRequest: {
          include: {
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
          },
        },
        status: true,
        protocol: {
          include: {
            logsProtocol: {
              include: {
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
      },
    });
    return request;
  }

  async index(
    req: RequestExpress,
    body: IndexRequestDTO,
  ): Promise<PaginatedResult<Request>> {
    return await paginate(
      prisma.request,
      {
        where: body.where,
        orderBy: body.orderBy,
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
    const validations = {
      approvedComplete: true,
    };
    const refIds: { refId: string; quantity: number }[] = [];
    let request = await prisma.request.findUnique({
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
            const productApprovalInformation: {
              product_id: string;
              quantity: number;
              reason_id: string | null;
              approved: boolean;
            } = body.products.find((item) => item.product_id === product.id);

            const reason_id =
              productApprovalInformation.reason_id || product.reason_id;

            await prisma.product.update({
              where: {
                id: productApprovalInformation.product_id,
              },
              data: {
                approved: productApprovalInformation.approved,
                quantity: productApprovalInformation.quantity,
                reason: {
                  connect: {
                    id: reason_id,
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
            } else {
              validations.approvedComplete = false;
            }
            return;
          }),
        );

        let group_slug;

        if (proportionalAmounts.value === 0) {
          group_slug = {
            slug: 'recusado',
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
        } else {
          group_slug = {
            slug: 'solicitado',
            group: 'protocol',
          };
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

    const orderReturnIDW = await CreateOrderReturnIDW(
      request.order_id_idw,
      refIds,
    );

    // IDCarrier = 1864 (PAC) || 1865 (SEDEX)

    try {
      const SRO = await idWorksApi.post('/correios/reversa', {
        IDCarrier: 1864,
        IDOrder: orderReturnIDW.IDOrder,
        QtyObject: 1,
        Schedule: null,
        TipoColeta: 0,
      });

      console.log(SRO.data);
    } catch (error) {
      console.log(error);
    }

    let group_slug;

    if (validations.approvedComplete) {
      group_slug = {
        slug: 'aprovado',
        group: 'request',
      };
    } else {
      group_slug = {
        slug: 'aprovado',
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

    if (!body.without_postage_code) {
      group_slug = {
        slug: 'aguardando-envio',
        group: 'request',
      };

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
    }

    await prisma.request.update({
      where: {
        id,
      },
      data: {
        nfd: orderReturnIDW.NfeNumber,
        order_id_return: orderReturnIDW.IDOrder,
        status: {
          connect: {
            group_slug,
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
}
