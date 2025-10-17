import { OptimizedTransformerService, ModelGroup } from './optimizedTransformer';
import { OptimizedUploaderService, UploadResult } from './optimizedUploader';
import { CsvExporterService } from './csvExporter';
import { ShopifyProduct, PanelPreciosRow } from '../types';
import { createParentHandle, createIndividualHandle } from '../utils/handleGenerator';
import * as fs from 'fs';
import * as path from 'path';

export interface SyncResult {
  modelo: string;
  parentSuccess: boolean;
  parentProductId?: string;
  parentVariantCount?: number;
  individualsSuccess: number;
  individualsFailed: number;
  errors: string[];
}

/**
 * Servicio de Sincronización Optimizado
 *
 * Flujo modelo por modelo:
 * 1. Transformar modelo completo (padre + individuales)
 * 2. Exportar padre a CSV temporal
 * 3. Subir padre via CSV
 * 4. Subir individuales via API en batches
 * 5. Limpiar archivos temporales
 */
export class OptimizedSyncService {
  private transformer: OptimizedTransformerService;
  private uploader: OptimizedUploaderService;
  private csvExporter: CsvExporterService;
  private tempDir: string;

  constructor(tempDir: string = './temp') {
    this.transformer = new OptimizedTransformerService();
    this.uploader = new OptimizedUploaderService();
    this.csvExporter = new CsvExporterService();
    this.tempDir = tempDir;

    // Asegurar que el directorio temporal existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Sincroniza un modelo completo (padre + todos sus individuales)
   */
  async syncModel(modelGroup: ModelGroup): Promise<SyncResult> {
    const { marca, modelo, variants } = modelGroup;
    const result: SyncResult = {
      modelo: `${marca} ${modelo}`,
      parentSuccess: false,
      individualsSuccess: 0,
      individualsFailed: 0,
      errors: []
    };

    try {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`📦 Sincronizando: ${marca} ${modelo}`);
      console.log(`   Variantes: ${variants.length}`);
      console.log(`${'═'.repeat(60)}\n`);

      // 1. Transformar modelo completo
      console.log('🔄 Transformando datos...');
      const { padres, individuales } = this.transformer.transformModel(modelGroup);
      console.log(`   ✅ Padre: ${padres.length} filas (1 producto + ${padres.length - 1} variantes)`);
      console.log(`   ✅ Individuales: ${individuales.length} productos\n`);

      // 2. Subir producto PADRE
      console.log('📤 PASO 1: Subiendo producto PADRE...');
      const parentResult = await this.uploadParent(padres, marca, modelo);

      if (parentResult.success) {
        result.parentSuccess = true;
        result.parentProductId = parentResult.productId;
        result.parentVariantCount = parentResult.variantIds?.length || 0;
        console.log(`   ✅ Padre creado exitosamente`);
        console.log(`   ID: ${parentResult.productId}`);
        console.log(`   Variantes: ${result.parentVariantCount}`);
        console.log(`   📦 Stock: 20 unidades por variante\n`);
      } else {
        result.errors.push(`Padre: ${parentResult.error}`);
        console.error(`   ❌ Error creando padre: ${parentResult.error}\n`);
        // Si falla el padre, no continuar con individuales
        return result;
      }

      // Delay entre padre e individuales
      await this.delay(2000);

      // 3. Subir productos INDIVIDUALES uno por uno con delay de 600ms
      console.log('📤 PASO 2: Subiendo productos INDIVIDUALES (1 por segundo)...\n');
      const individualResults = await this.uploader.uploadBatch(individuales);

      // Procesar resultados
      individualResults.forEach((res, idx) => {
        if (res.success) {
          result.individualsSuccess++;
          console.log(`   ✅ [${idx + 1}/${individuales.length}] ${individuales[idx].Title}`);
        } else {
          result.individualsFailed++;
          result.errors.push(`Individual ${individuales[idx].Title}: ${res.error}`);
          console.error(`   ❌ [${idx + 1}/${individuales.length}] ${individuales[idx].Title}: ${res.error}`);
        }
      });

      console.log(`\n✅ Modelo sincronizado: ${result.individualsSuccess}/${individuales.length} individuales creados`);

    } catch (error: any) {
      result.errors.push(`Error general: ${error.message}`);
      console.error(`\n❌ Error sincronizando modelo: ${error.message}`);
    }

    return result;
  }

  /**
   * Sube el producto padre con TODAS sus variantes
   * Usa el método uploadParentWithVariants que crea el producto con la primera variante
   * y luego agrega las restantes una por una
   */
  private async uploadParent(padreRows: ShopifyProduct[], marca: string, modelo: string): Promise<UploadResult> {
    try {
      console.log(`   📦 Creando producto padre con ${padreRows.length} variantes...`);

      // Subir producto padre con TODAS las variantes
      // Este método crea el producto con la primera variante y luego agrega las restantes
      return await this.uploader.uploadParentWithVariants(padreRows);

    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  /**
   * Sincroniza múltiples modelos en secuencia
   */
  async syncModels(panelPrecios: PanelPreciosRow[]): Promise<SyncResult[]> {
    console.log('\n🚀 INICIANDO SINCRONIZACIÓN OPTIMIZADA\n');
    console.log(`${'═'.repeat(60)}`);

    // 1. Agrupar por modelo
    const modelGroups = this.transformer.groupByModel(panelPrecios);
    console.log(`📦 ${modelGroups.length} modelos a sincronizar`);
    console.log(`${'═'.repeat(60)}`);

    const results: SyncResult[] = [];

    // 2. Sincronizar modelo por modelo
    for (let i = 0; i < modelGroups.length; i++) {
      const modelGroup = modelGroups[i];

      console.log(`\n[${i + 1}/${modelGroups.length}] Procesando: ${modelGroup.marca} ${modelGroup.modelo}`);

      const result = await this.syncModel(modelGroup);
      results.push(result);

      // Delay entre modelos
      if (i < modelGroups.length - 1) {
        await this.delay(2000);
      }
    }

    // 3. Resumen final
    this.printSummary(results);

    return results;
  }

  /**
   * Imprime resumen de sincronización
   */
  private printSummary(results: SyncResult[]): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 RESUMEN FINAL DE SINCRONIZACIÓN');
    console.log(`${'═'.repeat(60)}`);

    const totalModels = results.length;
    const successfulParents = results.filter(r => r.parentSuccess).length;
    const totalIndividuals = results.reduce((sum, r) => sum + r.individualsSuccess, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.individualsFailed, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`\n📦 MODELOS PROCESADOS: ${totalModels}`);
    console.log(`   ✅ Padres creados: ${successfulParents}`);
    console.log(`   ❌ Padres fallidos: ${totalModels - successfulParents}`);

    console.log(`\n📦 PRODUCTOS INDIVIDUALES:`);
    console.log(`   ✅ Creados: ${totalIndividuals}`);
    console.log(`   ❌ Fallidos: ${totalFailed}`);

    if (totalErrors > 0) {
      console.log(`\n⚠️  ERRORES ENCONTRADOS: ${totalErrors}`);
      console.log(`\nPrimeros errores:`);
      results
        .filter(r => r.errors.length > 0)
        .slice(0, 5)
        .forEach(r => {
          console.log(`\n   Modelo: ${r.modelo}`);
          r.errors.slice(0, 2).forEach(err => console.log(`      - ${err}`));
        });
    }

    console.log(`\n${'═'.repeat(60)}`);
  }

  /**
   * Helper para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpia archivos temporales
   */
  cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      const files = fs.readdirSync(this.tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.tempDir, file));
      });
      console.log('🧹 Archivos temporales limpiados');
    }
  }
}
