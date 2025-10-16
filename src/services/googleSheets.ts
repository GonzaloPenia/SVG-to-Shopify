import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { PanelPreciosRow, PadresRow } from '../types';
import { config } from '../config';

export class GoogleSheetsService {
  private auth: JWT | string | null = null;
  private useApiKey: boolean = false;

  /**
   * Inicializa la autenticación con Google Sheets API
   * Soporta 2 métodos:
   * 1. Service Account (credentials.json) - MÁS SEGURO
   * 2. API Key (GOOGLE_API_KEY en .env) - MÁS SIMPLE
   */
  async authenticate(): Promise<void> {
    try {
      // Método 1: Intentar usar API Key (más simple)
      if (config.googleApiKey) {
        console.log('🔑 Usando Google API Key para autenticación...');
        this.auth = config.googleApiKey;
        this.useApiKey = true;
        console.log('✅ Autenticación con API Key configurada');
        return;
      }

      // Método 2: Usar Service Account (más seguro)
      const credentialsPath = path.resolve(config.googleCredentialsPath);

      if (!fs.existsSync(credentialsPath)) {
        throw new Error(
          `No se encontró credentials.json ni GOOGLE_API_KEY.\n` +
          `Configura uno de los dos métodos:\n` +
          `  1. Crea credentials.json (ver DONDE_OBTENER_CREDENTIALS.md)\n` +
          `  2. O agrega GOOGLE_API_KEY en tu archivo .env`
        );
      }

      console.log('🔐 Usando Service Account (credentials.json)...');
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

      this.auth = new google.auth.JWT(
        credentials.client_email,
        undefined,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
      );

      await this.auth.authorize();
      this.useApiKey = false;
      console.log('✅ Autenticación con Service Account exitosa');
    } catch (error) {
      console.error('❌ Error en autenticación con Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Lee datos de una hoja específica
   */
  private async readSheet(sheetName: string): Promise<any[][]> {
    if (!this.auth) {
      throw new Error('No autenticado. Ejecuta authenticate() primero.');
    }

    try {
      // Configurar sheets API según el método de autenticación
      const sheets = this.useApiKey
        ? google.sheets({ version: 'v4', auth: this.auth as string })
        : google.sheets({ version: 'v4', auth: this.auth as JWT });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetId,
        range: `${sheetName}!A:ZZ`, // Lee todas las columnas
      });

      const rows = response.data.values || [];
      console.log(`✅ Leídas ${rows.length} filas de la hoja "${sheetName}"`);

      return rows;
    } catch (error: any) {
      console.error(`❌ Error leyendo la hoja "${sheetName}":`, error);

      // Mensaje de ayuda específico según el error
      if (error.code === 403) {
        if (this.useApiKey) {
          console.error('\n💡 Si usas API Key, asegúrate de que el Google Sheet sea PÚBLICO');
          console.error('   O usa Service Account (credentials.json) para sheets privados');
        } else {
          console.error('\n💡 Asegúrate de compartir el Sheet con el email de la Service Account');
        }
      }

      throw error;
    }
  }

  /**
   * Convierte filas de Google Sheets a objetos con headers como keys
   */
  private parseSheetData<T>(rows: any[][]): T[] {
    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj as T;
    });
  }

  /**
   * Lee y parsea la hoja "Panel_Precios"
   */
  async readPanelPrecios(): Promise<PanelPreciosRow[]> {
    console.log(`\n📊 Leyendo hoja "${config.panelPreciosSheetName}"...`);
    const rows = await this.readSheet(config.panelPreciosSheetName);
    const data = this.parseSheetData<PanelPreciosRow>(rows);
    console.log(`✅ ${data.length} registros procesados de Panel_Precios`);
    return data;
  }

  /**
   * Lee y parsea la hoja "Padres"
   */
  async readPadres(): Promise<PadresRow[]> {
    console.log(`\n📊 Leyendo hoja "${config.padresSheetName}"...`);
    const rows = await this.readSheet(config.padresSheetName);
    const data = this.parseSheetData<PadresRow>(rows);
    console.log(`✅ ${data.length} registros procesados de Padres`);
    return data;
  }

  /**
   * Lee ambas hojas y retorna los datos
   */
  async readAllData(): Promise<{
    panelPrecios: PanelPreciosRow[];
    padres: PadresRow[];
  }> {
    await this.authenticate();

    const [panelPrecios, padres] = await Promise.all([
      this.readPanelPrecios(),
      this.readPadres()
    ]);

    return { panelPrecios, padres };
  }
}
