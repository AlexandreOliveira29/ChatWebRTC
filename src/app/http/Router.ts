import express, { Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const AppRouter = (): Router => {
  const rootPublicPath = path.join(__dirname, 'public');
  const indexFile = path.join(rootPublicPath, 'index.html');
  const apiRouter = Router();

  apiRouter.use(cors());
  apiRouter.use(bodyParser.json());
  apiRouter.use(express.static(rootPublicPath));
  apiRouter.get('/', (_, res) => {
    res.sendFile(indexFile);
  });

  return apiRouter;
};

export default AppRouter;
