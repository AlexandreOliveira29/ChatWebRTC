import { Socket } from 'socket.io';
import { IMakeAnswerData, ICallUserData } from './Events';
import { IActiveSockets } from './ActiveSockets';

export interface IDispachs {
  updateUserList: (socket: Socket) => void;
  answerMade: (socket: Socket, data: IMakeAnswerData) => void;
  callMade: (socket: Socket, data: ICallUserData) => void;
  removeUser: (socket: Socket) => void;
}

interface IDispachsInject {
  activeSockets: IActiveSockets;
}

class Dispachs implements IDispachs {
  private activeSockets: IActiveSockets;

  constructor({ activeSockets }: IDispachsInject) {
    this.activeSockets = activeSockets;
  }
  updateUserList(socket: Socket): void {
    socket.emit('update-user-list', {
      users: this.activeSockets.othersClients(socket)
    });

    socket.broadcast.emit('update-user-list', {
      users: [this.activeSockets.getClientBySocket(socket)]
    });
  }

  answerMade(socket: Socket, { to, answer }: IMakeAnswerData): void {
    socket.to(to).emit('answer-made', {
      socket: socket.id,
      answer
    });
  }

  callMade(socket: Socket, { to, offer }: ICallUserData): void {
    socket.to(to).emit('call-made', {
      offer: offer,
      socket: socket.id
    });
  }

  removeUser(socket: Socket): void {
    socket.broadcast.emit('remove-user', {
      socketId: socket.id
    });
  }
}

export default Dispachs;
