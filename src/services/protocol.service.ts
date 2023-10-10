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
      },
      {
        page: body.page,
        perPage: body.perPage,
      },
    );
  }
}
