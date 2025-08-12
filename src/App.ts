import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import v1Auth from './routes/v1/Auth';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_request, response) => response.json({ status: 'ok' }));

  app.use('/api/v1/auth', v1Auth);

  // handler simples
  app.use((erro: any, _request: any, response: any, _next: any) => {
    console.error(erro);
    response.status(500).json({ error: 'internal error' });
  });

  return app;
}
