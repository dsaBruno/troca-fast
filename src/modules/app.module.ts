import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { env } from 'src/env';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { RequestModule } from './request.module';
import { FileUploadModule } from './file.module';
import { ReasonModule } from './reason.module';
import { StatusModule } from './status.module';
import { DeleteImagesMiddleware } from 'src/middlewares/file-delete.middleware';
import { ProtocolModule } from './protocol.module';
import { RequestGatewayModule } from './request.gateway.module';

@Module({
  imports: [
    FileUploadModule,
    UserModule,
    AuthModule,
    RequestModule,
    ReasonModule,
    StatusModule,
    ProtocolModule,
    RequestGatewayModule,
    MailerModule.forRoot({
      transport: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        tls: {
          ciphers: 'SSLv3',
        },
        secure: true, // true for 465, false for other ports
        auth: {
          user: env.SMTP_ID, // generated ethereal user
          pass: env.SMTP_PASS, // generated ethereal password
        },
      },
      defaults: {
        from: '"Troca Fácil" <trocafacil@lojasantoantonio.com.br>', // outgoing email ID
      },
      template: {
        dir: process.cwd() + '/src/templates/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeleteImagesMiddleware).forRoutes({
      method: RequestMethod.POST,
      path: 'request',
    });
  }
}
