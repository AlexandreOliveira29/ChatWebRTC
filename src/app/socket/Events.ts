import { Server as SocketIOServer, Socket } from 'socket.io';
import { IDispachs } from './Dispachs';
import { IActiveSockets } from './ActiveSockets';
import { Logger } from 'winston';

interface IEventsInject {
  dispach: IDispachs;
  logger: Logger;
  activeSockets: IActiveSockets;
}

export interface IEvents {
  connection: (io: SocketIOServer) => void;
  makeAnswer: (socket: Socket) => void;
  callUser: (socket: Socket) => void;
  disconnect: (socket: Socket) => void;
}

export interface IMakeAnswerData {
  answer: string;
  to: string;
}
export interface ICallUserData {
  offer: string;
  to: string;
}
export interface IAssignClientData {
  userId: string;
  name: string;
}

class Events implements IEvents {
  private dispach: IDispachs;
  private logger: Logger;
  private activeSockets: IActiveSockets;

  constructor({ dispach, logger, activeSockets }: IEventsInject) {
    this.dispach = dispach;
    this.logger = logger;
    this.activeSockets = activeSockets;
  }

  connection(io: SocketIOServer): void {
    io.on('connection', (socket) => {
      this.makeAnswer(socket);
      this.callUser(socket);
      this.assignClient(socket);
      this.disconnect(socket);
    });
  }

  makeAnswer(socket: Socket): void {
    socket.on('make-answer', (data: IMakeAnswerData) => {
      this.dispach.answerMade(socket, data);
    });
  }

  callUser(socket: Socket): void {
    socket.on('call-user', (data: ICallUserData) => {
      this.dispach.callMade(socket, data);
    });
  }

  assignClient(socket: Socket): void {
    socket.on('assign-client', (data: IAssignClientData) => {
      this.activeSockets.addClient(socket, data);

      this.logger.info(`Socket id ${socket.id} connected`);

      this.dispach.updateUserList(socket);
    });
  }

  disconnect(socket: Socket): void {
    socket.on('disconnect', () => {
      this.activeSockets.removeClient(socket);

      this.logger.info(`Socket id ${socket.id} disconnected`);

      this.dispach.removeUser(socket);
    });
  }
}

export default Events;
