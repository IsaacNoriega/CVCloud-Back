import express, { Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { metricsMiddleware } from './middlewares/metrics.middleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Aumentar límite para imágenes base64 en HTML
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Aplicar middleware de métricas ANTES de las rutas
app.use(metricsMiddleware);

app.use(routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});