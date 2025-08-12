import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import v1Auth from './routes/v1/Auth';
import v1Tasks from './routes/v1/Tasks';
import v2Tasks from './routes/v2/Tasks';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));

  app.use('/api/v1/auth', v1Auth);
  app.use('/api/v1', v1Tasks);
  app.use('/api/v2', v2Tasks);

  // handler simples
  app.use((erro: any, _request: any, response: any, _next: any) => {
    console.error(erro);
    response.status(500).json({ error: 'internal error' });
  });

  return app;
}
