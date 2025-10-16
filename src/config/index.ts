import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

export const config: AppConfig = {
  googleSheetId: process.env.GOOGLE_SHEET_ID || '',
  googleCredentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  panelPreciosSheetName: process.env.PANEL_PRECIOS_SHEET_NAME || 'Panel_Precios',
  padresSheetName: process.env.PADRES_SHEET_NAME || 'Padres',
  shopifyShopDomain: process.env.SHOPIFY_SHOP_DOMAIN || '',
  shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2024-01',
  outputCsvPath: process.env.OUTPUT_CSV_PATH || './output/shopify_products.csv'
};

export function validateConfig(): void {
  // Validar que exista Sheet ID
  if (!config.googleSheetId) {
    throw new Error('GOOGLE_SHEET_ID es requerido en el archivo .env');
  }

  // Validar que exista al menos un método de autenticación de Google
  if (!config.googleApiKey && !config.googleCredentialsPath) {
    throw new Error(
      'Debes configurar al menos uno:\n' +
      '  - GOOGLE_API_KEY en .env (método simple)\n' +
      '  - credentials.json (método seguro)\n' +
      'Ver DONDE_OBTENER_CREDENTIALS.md o COMO_USAR_API_KEY.md'
    );
  }

  // Validar Shopify
  if (!config.shopifyShopDomain) {
    throw new Error('SHOPIFY_SHOP_DOMAIN es requerido en el archivo .env');
  }

  if (!config.shopifyAccessToken) {
    throw new Error('SHOPIFY_ACCESS_TOKEN es requerido en el archivo .env');
  }
}
