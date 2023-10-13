import { Injectable } from '@nestjs/common';
import { Protocol } from '@prisma/client';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'src/prisma/paginator.interface';
import { prisma } from 'src/prisma/prisma.service';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class ProtocolService {
  async approve(req: any, id: string): Promise<Protocol> {
    await await prisma.logsProtocol.create({
      data: {
        protocol: {
          connect: {
            id,
          },
        },
        status: {
          connect: {
            group_slug: {
              slug: 'aprovado',
              group: 'protocol',
            },
          },
        },
      },
    });

    const protocol = await prisma.protocol.update({
      where: {
        id,
      },
      data: {
        status: {
          connect: {
            group_slug: {
              slug: 'aprovado',
              group: 'protocol',
            },
          },
        },
      },
    });

    return protocol;
  }

  async index(req, body): Promise<PaginatedResult<Protocol>> {
    return await paginate(
      prisma.protocol,
      {
        where: body.where,
        orderBy: body.orderBy,
        include: {
          status: {
            select: {
              title: true,
            },
          },
          request: true,
        },
      },
      {
        page: body.page,
        perPage: body.perPage,
      },
    );
  }

  async show(req, id): Promise<Protocol> {
    const protocol = await prisma.protocol.findUnique({
      where: {
        id,
      },
      include: {
        status: {
          select: {
            title: true,
          },
        },
        logsProtocol: {
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
        request: true,
        product: {
          include: {
            reason: {
              select: {
                title: true,
              },
            },
            productImage: {
              select: {
                url_image: true,
              },
            },
          },
        },
      },
    });

    return protocol;
  }

  async pay(req, id): Promise<Protocol> {
    return null;
  }
}
