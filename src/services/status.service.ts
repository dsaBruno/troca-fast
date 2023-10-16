import { Injectable } from '@nestjs/common';
import { Status, User } from '@prisma/client';
import { prisma } from 'src/prisma/prisma.service';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'src/prisma/paginator.interface';
import { Request } from 'express';
import {
  CreateStatusDTO,
  IndexStatusDTO,
  UpdateStatusDTO,
} from 'src/validators/status.validator';
import { createSlug } from 'src/helpers/slug.helper';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class StatusService {
  async register(req: Request, body: CreateStatusDTO[]): Promise<Status[]> {
    const status = await Promise.all(
      body.map(async (data) => {
        const slug = createSlug(data.title);
        return await prisma.status.create({
          data: {
            group: data.group,
            title: data.title,
            slug,
          },
        });
      }),
    );
    return status;
  }

  async update(
    req: Request,
    id: string,
    body: UpdateStatusDTO,
  ): Promise<Status> {
    const slug = createSlug(body.title);
    const status = await prisma.status.update({
      where: {
        id,
      },
      data: {
        ...body,
        slug,
      },
    });

    return status;
  }

  async index(
    req: Request,
    body: IndexStatusDTO,
  ): Promise<PaginatedResult<Status>> {
    return await paginate(
      prisma.status,
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

  async listAll(req): Promise<Status[]> {
    const status = await prisma.status.findMany();
    return status;
  }

  async show(req: Request, id: string): Promise<Status> {
    const status = await prisma.status.findUnique({
      where: {
        id,
      },
    });
    return status;
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
