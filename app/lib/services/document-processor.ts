
import { PDFExtract } from 'pdf.js-extract';
import mammoth from 'mammoth';

export interface ProcessedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount: number;
    processedAt: Date;
  };
}

export class DocumentProcessor {
  /**
   * Procesa un archivo y extrae su texto
   */
  static async processFile(
    buffer: Buffer,
    fileName: string
  ): Promise<ProcessedDocument> {
    const fileType = this.getFileType(fileName);
    let text = '';

    switch (fileType) {
      case 'pdf':
        text = await this.extractFromPDF(buffer);
        break;
      case 'txt':
        text = buffer.toString('utf-8');
        break;
      case 'docx':
        text = await this.extractFromDOCX(buffer);
        break;
      default:
        throw new Error(`Tipo de archivo no soportado: ${fileType}`);
    }

    // Limpiar texto
    text = this.cleanText(text);

    // Validar que haya contenido
    if (!text || text.trim().length === 0) {
      throw new Error('El archivo no contiene texto extraíble');
    }

    return {
      text,
      metadata: {
        fileName,
        fileType,
        wordCount: text.split(/\s+/).length,
        processedAt: new Date(),
      },
    };
  }

  /**
   * Extrae texto de un PDF
   */
  private static async extractFromPDF(buffer: Buffer): Promise<string> {
    try {
      const pdfExtract = new PDFExtract();
      const options = {};
      const data = await pdfExtract.extractBuffer(buffer, options);

      let text = '';
      data.pages.forEach(page => {
        page.content.forEach(item => {
          if (item.str) {
            text += item.str + ' ';
          }
        });
        text += '\n\n';
      });

      return text;
    } catch (error) {
      console.error('Error extracting PDF:', error);
      throw new Error('Error al procesar PDF');
    }
  }

  /**
   * Extrae texto de un archivo DOCX
   */
  private static async extractFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX:', error);
      throw new Error('Error al procesar DOCX');
    }
  }

  /**
   * Limpia el texto extraído
   */
  private static cleanText(text: string): string {
    // Remover múltiples espacios en blanco
    text = text.replace(/\s+/g, ' ');
    
    // Remover caracteres especiales problemáticos
    text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Trim
    text = text.trim();
    
    return text;
  }

  /**
   * Obtiene el tipo de archivo de la extensión
   */
  private static getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (!extension) {
      throw new Error('No se pudo determinar el tipo de archivo');
    }

    if (!['pdf', 'txt', 'docx'].includes(extension)) {
      throw new Error(`Tipo de archivo no soportado: ${extension}`);
    }

    return extension;
  }

  /**
   * Divide el texto en chunks para embeddings
   */
  static chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = startIndex + chunkSize;
      const chunk = text.substring(startIndex, endIndex);
      
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }

      startIndex = endIndex - overlap;
    }

    return chunks;
  }
}
