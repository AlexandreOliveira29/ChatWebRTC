import express, { Router, Application } from 'express';
import socketIO, { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import { Logger } from 'winston';
import { IConfig } from '../../config';
import { IEvents } from '../socket/Events';

interface IServerInjects {
  config: IConfig;
  router: Router;
  logger: Logger;
  events: IEvents;
}

class Server {
  private config: IConfig;
  private logger: Logger;
  private router: Router;
  private express: Application;
  private io: SocketIOServer;
  private httpServer: HTTPServer;
  private events: IEvents;

  constructor({ config, router, logger, events }: IServerInjects) {
    this.config = config;
    this.router = router;
    this.logger = logger;
    this.express = express();
    this.express.use(this.router);
    this.httpServer = createServer(this.express);
    this.io = socketIO(this.httpServer, {
      pingTimeout: 5000,
      pingInterval: 10000,
    });
    this.events = events;
  }

  start(): void {
    this.events.connection(this.io);

    this.httpServer.listen(this.config.port, () =>
      this.logger.info(`ServerApi is listening in PORT ${this.config.port}`)
    );
  }
}
export default Server;
