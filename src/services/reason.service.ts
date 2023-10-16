import { Injectable } from '@nestjs/common';
import { Reason } from '@prisma/client';
import { prisma } from 'src/prisma/prisma.service';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'src/prisma/paginator.interface';
import { Request } from 'express';
import { createSlug } from 'src/helpers/slug.helper';
import {
  CreateReasonDTO,
  IndexReasonDTO,
  UpdateReasonDTO,
} from 'src/validators/reason.validator';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class ReasonService {
  async register(req: Request, body: CreateReasonDTO[]): Promise<Reason[]> {
    const reasons = await Promise.all(
      body.map(async (reason) => {
        const slug = createSlug(reason.title);
        return await prisma.reason.create({
          data: {
            action: reason.action,
            title: reason.title,
            slug,
          },
        });
      }),
    );
    return reasons;
  }

  async update(
    req: Request,
    id: string,
    body: UpdateReasonDTO,
  ): Promise<Reason> {
    const slug = createSlug(body.title);
    const reason = await prisma.reason.update({
      where: {
        id,
      },
      data: {
        ...body,
        slug,
      },
    });

    return reason;
  }

  async index(
    req: Request,
    body: IndexReasonDTO,
  ): Promise<PaginatedResult<Reason>> {
    return await paginate(
      prisma.reason,
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

  async listAll(res): Promise<Reason[]> {
    const reasons = await prisma.reason.findMany();
    return reasons;
  }

  async show(req: Request, id: string): Promise<Reason> {
    const reason = await prisma.reason.findUnique({
      where: {
        id,
      },
    });
    return reason;
  }

  async delete(req: Request, id: string) {
    await prisma.status.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Status deletado com sucesso!',
    };
  }
}
