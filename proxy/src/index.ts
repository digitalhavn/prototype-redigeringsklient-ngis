import express, { Application } from 'express';
import { RequestHandler, createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';

const app: Application = express();

const NGIS_URL = process.env.NGIS_URL || 'ngis-url';
const NGIS_TOKEN = process.env.NGIS_TOKEN || 'ngis-token';
const PORT = 8001;
const BASE_HEADERS = {
  Authorization: `Basic ${NGIS_TOKEN}`,
  'X-Client-Product-Version': 'NGISProxy 1.0.0',
};

const proxy: RequestHandler = createProxyMiddleware({
  target: NGIS_URL,
  headers: BASE_HEADERS,
  changeOrigin: true,
  logLevel: 'debug',
});

app.get('/datasets', proxy);

app.get('/datasets/:datasetId', proxy);

app.get('/datasets/:datasetId/features', (req, res, next) => {
  req.headers['accept'] = 'application/vnd.kartverket.sosi+json';
  proxy(req, res, next);
});

app.get('/datasets/:datasetId/features/:localId/attributes', (req, res, next) => {
  req.headers['accept'] = 'application/vnd.kartverket.ngis.attributes+json';
  proxy(req, res, next);
});

app.put('/datasets/:datasetId/features/:localId/attributes', (req, res, next) => {
  req.headers['accept'] = 'application/vnd.kartverket.ngis.attributes+json';
  proxy(req, res, next);
});

app.get('/datasets/:datasetId/schema', proxy);

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
