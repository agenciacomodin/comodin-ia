
/**
 * Servicio de Almacenamiento Real (Supabase Storage)
 * Reemplaza el sistema mock de archivos
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
  private static readonly BUCKET = 'comodin-files'
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  /**
   * Inicializa el bucket si no existe
   */
  static async initializeBucket() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET)

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.BUCKET, {
          public: false,
          allowedMimeTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'audio/mpeg', 'audio/mp4', 'audio/wav',
            'video/mp4', 'video/quicktime', 'video/x-msvideo'
          ]
        })

        if (error) {
          console.error('Error creating bucket:', error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error initializing bucket:', error)
      return false
    }
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

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          metadata: {
            originalName: metadata.fileName,
            uploadedBy: metadata.uploadedBy,
            organizationId: metadata.organizationId,
            uploadedAt: new Date().toISOString()
          }
        })

      if (error) {
        console.error('Upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      // Generar URL firmada (válida por 7 días)
      const { data: signedUrlData } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(filePath, 7 * 24 * 60 * 60) // 7 días en segundos

      return {
        success: true,
        path: filePath,
        url: signedUrlData?.signedUrl,
        fileName: metadata.fileName,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: 'Error interno del servidor'
      }
    }
  }

  /**
   * Obtiene una URL firmada para descargar un archivo
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        console.error('Error getting signed URL:', error)
        return null
      }

      return data?.signedUrl || null
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
      const { error } = await supabase.storage
        .from(this.BUCKET)
        .remove([filePath])

      if (error) {
        console.error('Error deleting file:', error)
        return false
      }

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
      const path = folder ? `${organizationId}/${folder}` : organizationId

      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .list(path, {
          limit: 100,
          offset: 0
        })

      if (error) {
        console.error('Error listing files:', error)
        return []
      }

      return data || []
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
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
          search: filePath.substring(filePath.lastIndexOf('/') + 1)
        })

      if (error) {
        console.error('Error getting file info:', error)
        return null
      }

      return data?.[0] || null
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

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .upload(filePath, buffer, {
          contentType,
          metadata: {
            originalName: fileName,
            uploadedBy: metadata.uploadedBy,
            organizationId: metadata.organizationId,
            uploadedAt: new Date().toISOString()
          }
        })

      if (error) {
        console.error('Upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      // Generar URL firmada
      const { data: signedUrlData } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(filePath, 7 * 24 * 60 * 60)

      return {
        success: true,
        path: filePath,
        url: signedUrlData?.signedUrl,
        fileName,
        size: buffer.byteLength,
        type: contentType
      }
    } catch (error) {
      console.error('Error uploading from buffer:', error)
      return {
        success: false,
        error: 'Error interno del servidor'
      }
    }
  }
}

export default StorageService
