import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';

export const createQrToken = (): string => randomBytes(32).toString('base64url');

export const createPassCode = (): string => `FST-${randomBytes(6).toString('hex').toUpperCase()}`;
export const createTicketCode = (): string => `TKT-${randomBytes(6).toString('hex').toUpperCase()}`;

export const createQrDataUrl = (token: string): Promise<string> =>
  QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
  });
