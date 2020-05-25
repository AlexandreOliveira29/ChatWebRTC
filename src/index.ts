import Server from './app/http/Server';
import Router from './app/http/Router';
import config from './config';
import Logger from './logger';
import Events from './app/socket/Events';
import Dispachs from './app/socket/Dispachs';
import ActiveSockets from './app/socket/ActiveSockets';

const router = Router();
const logger = Logger();
const activeSockets = new ActiveSockets();
const dispach = new Dispachs({ activeSockets });
const events = new Events({ dispach, logger, activeSockets });

const app = new Server({ config, logger, router, events });

app.start();
