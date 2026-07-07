import { MercadoPagoConfig } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

if (!accessToken) {
  console.warn('Falta la variable de entorno MERCADOPAGO_ACCESS_TOKEN');
}

export const mpClient = new MercadoPagoConfig({
  accessToken: accessToken,
  options: { timeout: 5000 }
});
