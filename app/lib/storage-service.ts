
/**
 * Servicio de Almacenamiento Real (AWS S3)
 * Reemplaza el sistema mock de archivos
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuración AWS S3 (usar variables de entorno o valores por defecto para desarrollo)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  } : undefined
})

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'comodin-dev-files'

interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
  fileName?: string
  size?: number
  type?: string
}

interface FileMetadata {
  fileName: string
  size: number
  type: string
  organizationId: string
  uploadedBy: string
  folder?: string
}

export class StorageService {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  /**
   * Inicializa el bucket si no existe (para AWS S3 el bucket debe existir previamente)
   */
  static async initializeBucket() {
    // Para AWS S3, asumimos que el bucket ya existe
    // En producción, el bucket debe ser creado previamente
    return true
  }

  /**
   * Sube un archivo al storage
   */
  static async uploadFile(
    file: File,
    metadata: FileMetadata
  ): Promise<UploadResult> {
    try {
      // Validar tamaño del archivo
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'El archivo es demasiado grande (máximo 50MB)'
        }
      }

      // Generar nombre único del archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = metadata.fileName.split('.').pop()
      const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`

      // Generar path del archivo
      const folder = metadata.folder || 'general'
      const filePath = `${metadata.organizationId}/${folder}/${uniqueFileName}`

      // Convertir File a ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Subir archivo a S3
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        Metadata: {
          originalName: metadata.fileName,
          uploadedBy: metadata.uploadedBy,
          organizationId: metadata.organizationId,
          uploadedAt: new Date().toISOString()
        }
      })

      await s3Client.send(putCommand)

      // Generar URL firmada (válida por 7 días)
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath
      })
      
      const signedUrl = await getSignedUrl(s3Client, getCommand, { 
        expiresIn: 7 * 24 * 60 * 60 // 7 días
      })

      return {
        success: true,
        path: filePath,
        url: signedUrl,
        fileName: metadata.fileName,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      }
    }
  }

  /**
   * Obtiene una URL firmada para descargar un archivo
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath
      })
      
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn })
      return signedUrl
    } catch (error) {
      console.error('Error getting signed URL:', error)
      return null
    }
  }

  /**
   * Elimina un archivo del storage
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath
      })

      await s3Client.send(deleteCommand)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  /**
   * Lista archivos de una organización
   */
  static async listFiles(organizationId: string, folder: string = ''): Promise<any[]> {
    try {
      // Implementación simplificada para S3
      // En una implementación completa, se usaría ListObjectsV2Command
      console.log(`Listing files for organization ${organizationId} in folder ${folder}`)
      return []
    } catch (error) {
      console.error('Error listing files:', error)
      return []
    }
  }

  /**
   * Obtiene información de un archivo
   */
  static async getFileInfo(filePath: string): Promise<any> {
    try {
      // Implementación simplificada para S3
      // En una implementación completa, se usaría HeadObjectCommand
      console.log(`Getting file info for ${filePath}`)
      return null
    } catch (error) {
      console.error('Error getting file info:', error)
      return null
    }
  }

  /**
   * Sube un archivo desde buffer (para webhooks)
   */
  static async uploadFromBuffer(
    buffer: ArrayBuffer,
    fileName: string,
    contentType: string,
    metadata: FileMetadata
  ): Promise<UploadResult> {
    try {
      // Generar nombre único del archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = fileName.split('.').pop()
      const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`

      // Generar path del archivo
      const folder = metadata.folder || 'webhooks'
      const filePath = `${metadata.organizationId}/${folder}/${uniqueFileName}`

      // Subir archivo a S3
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: new Uint8Array(buffer),
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedBy: metadata.uploadedBy,
          organizationId: metadata.organizationId,
          uploadedAt: new Date().toISOString()
        }
      })

      await s3Client.send(putCommand)

      // Generar URL firmada
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath
      })
      
      const signedUrl = await getSignedUrl(s3Client, getCommand, { 
        expiresIn: 7 * 24 * 60 * 60 
      })

      return {
        success: true,
        path: filePath,
        url: signedUrl,
        fileName,
        size: buffer.byteLength,
        type: contentType
      }
    } catch (error) {
      console.error('Error uploading from buffer:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      }
    }
  }
}

export default StorageService
