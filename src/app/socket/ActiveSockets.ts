import { Socket } from 'socket.io';
import { IAssignClientData } from './Events';

export interface IActiveSockets {
  getClients: () => Array<ISocketClient>;
  getClientBySocket: (socket: Socket) => ISocketClient;
  othersClients: (socket: Socket) => Array<ISocketClient>;
  addClient: (socket: Socket, user: IAssignClientData) => void;
  removeClient: (socket: Socket) => void;
}

export interface ISocketClient {
  socketId: string;
  userId: string;
  name: string;
}

class ActiveSockets implements IActiveSockets {
  private clients: Array<ISocketClient>;
  constructor() {
    this.clients = [];
  }

  getClients(): Array<ISocketClient> {
    return this.clients;
  }

  getClientBySocket(socket: Socket): ISocketClient {
    const [client] = this.clients.filter(
      ({ socketId }) => socketId === socket.id
    );
    return client;
  }

  addClient(socket: Socket, { userId, name }: IAssignClientData): void {
    const existingSocket = this.clients.find(
      ({ socketId }) => socketId === socket.id
    );

    if (!existingSocket) {
      this.clients.push({ socketId: socket.id, userId, name });
    }
  }

  othersClients(socket: Socket): Array<ISocketClient> {
    const othersClients = this.clients.filter(
      ({ socketId }) => socketId !== socket.id
    );

    return othersClients;
  }

  removeClient(socket: Socket): void {
    this.clients = this.othersClients(socket);
  }
}

export default ActiveSockets;
