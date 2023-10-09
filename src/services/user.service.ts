import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { prisma } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  PaginateFunction,
  PaginatedResult,
  paginator,
} from 'src/prisma/paginator.interface';
import { Request } from 'express';
import {
  CreateUserDTO,
  IndexUserDTO,
  UpdateUserDTO,
} from 'src/validators/user.validator';

const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class UserService {
  async register(req: Request, body: CreateUserDTO): Promise<User> {
    const saltOrRounds = 10;
    const password_hash = await bcrypt.hash(body.password, saltOrRounds);

    const user = await prisma.user.create({
      data: {
        is_active: true,
        fullname: body.fullname,
        email: body.email,
        type: body.type,
        password_hash,
      },
    });

    return user;
  }

  async update(req: Request, id, body: UpdateUserDTO): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });

    return user;
  }

  async index(
    req: Request,
    body: IndexUserDTO,
  ): Promise<PaginatedResult<User>> {
    return await paginate(
      prisma.user,
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

  async show(req: Request, id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  async delete(req: Request, id: string) {
    await prisma.user.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Usuário deletado com sucesso!',
    };
  }
}
