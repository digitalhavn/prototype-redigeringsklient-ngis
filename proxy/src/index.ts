import express, { Application } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'dotenv/config';

const app: Application = express();

const NGIS_URL = process.env.NGIS_URL || 'ngis-url';
const NGIS_TOKEN = process.env.NGIS_TOKEN || 'ngis-token';
const PORT = 8000;
const HEADERS = {
  Authorization: `Basic ${NGIS_TOKEN}`,
  'X-Client-Product-Version': 'NGISProxy 1.0.0',
};

app.get(
  '/datasets',
  createProxyMiddleware({
    target: `${NGIS_URL}/havn/v1/datasets`,
    headers: {
      ...HEADERS,
      accept: 'application/vnd.kartverket.ngis.dataset+json',
    },
    changeOrigin: true,
  }),
);

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
