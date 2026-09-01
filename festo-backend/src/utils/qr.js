import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';

export const createQrToken = () => randomBytes(32).toString('base64url');

export const createPassCode = () => `FST-${randomBytes(6).toString('hex').toUpperCase()}`;
export const createTicketCode = () => `TKT-${randomBytes(6).toString('hex').toUpperCase()}`;

export const createQrDataUrl = (token) => QRCode.toDataURL(token, {
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 512,
});