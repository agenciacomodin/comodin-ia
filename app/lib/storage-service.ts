
/**
 * Servicio de Almacenamiento Real (Supabase Storage)
 * Reemplaza el sistema mock de archivos
 */

// Configuración simplificada para Supabase (sin dependencias externas)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
const BUCKET_NAME = 'comodin-files'

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

      // Subir archivo usando fetch API (compatible con Supabase)
      const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: arrayBuffer
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text()
        console.error('Upload failed:', errorData)
        return {
          success: false,
          error: `Error de subida: ${uploadResponse.status}`
        }
      }

      // Generar URL pública (Supabase permite URLs públicas)
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`

      return {
        success: true,
        path: filePath,
        url: publicUrl,
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
      // Para Supabase, generar URL firmada usando fetch API
      const signedUrlResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET_NAME}/${filePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn })
      })

      if (signedUrlResponse.ok) {
        const data = await signedUrlResponse.json()
        return `${SUPABASE_URL}/storage/v1${data.signedURL}`
      }
      
      return null
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
      const deleteResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      })

      return deleteResponse.ok
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

      // Subir archivo usando fetch API (compatible con Supabase)
      const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': contentType,
          'x-upsert': 'true'
        },
        body: buffer
      })

      if (!uploadResponse.ok) {
        return {
          success: false,
          error: `Error de subida: ${uploadResponse.status}`
        }
      }

      // Generar URL pública
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`

      return {
        success: true,
        path: filePath,
        url: publicUrl,
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
