import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class RequestGateway /*implements OnModuleInit */ {
  // @WebSocketServer()
  // server: Server;

  // onModuleInit() {
  //   this.server.on('connection', (socket) => {
  //     console.log(socket.id);
  //   });
  // }

  @SubscribeMessage('requests')
  onNewMessage(@MessageBody() body: any) {
    // this.server.emit('requests', {});
    console.log(body);
  }
}
