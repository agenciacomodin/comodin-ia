
import crypto from 'crypto'

// Configuración de cifrado
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Generar una clave de cifrado desde la clave secreta del entorno
function getEncryptionKey(): Buffer {
  const secretKey = process.env.ENCRYPTION_SECRET || 'default-secret-key-change-in-production'
  return crypto.scryptSync(secretKey, 'salt', KEY_LENGTH)
}

/**
 * Cifrar una clave de API de forma segura
 */
export function encryptApiKey(apiKey: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, key)
    cipher.setAAD(Buffer.from('apikey', 'utf8'))
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // Combinar IV + Tag + Datos cifrados
    const result = iv.toString('hex') + tag.toString('hex') + encrypted
    return result
  } catch (error) {
    console.error('Error encrypting API key:', error)
    throw new Error('Failed to encrypt API key')
  }
}

/**
 * Descifrar una clave de API
 */
export function decryptApiKey(encryptedKey: string): string {
  try {
    const key = getEncryptionKey()
    
    // Extraer IV, Tag y datos cifrados
    const iv = Buffer.from(encryptedKey.slice(0, IV_LENGTH * 2), 'hex')
    const tag = Buffer.from(encryptedKey.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex')
    const encrypted = encryptedKey.slice((IV_LENGTH + TAG_LENGTH) * 2)
    
    const decipher = crypto.createDecipher(ALGORITHM, key)
    decipher.setAAD(Buffer.from('apikey', 'utf8'))
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Error decrypting API key:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Generar una máscara para mostrar parcialmente la clave (para UI)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••'
  }
  
  const start = apiKey.slice(0, 4)
  const end = apiKey.slice(-4)
  const middle = '•'.repeat(Math.min(apiKey.length - 8, 20))
  
  return `${start}${middle}${end}`
}

/**
 * Validar el formato básico de una clave API
 */
export function validateApiKeyFormat(apiKey: string, providerName: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false
  }

  // Validaciones específicas por proveedor
  switch (providerName.toLowerCase()) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20
    case 'anthropic':
    case 'claude':
      return apiKey.startsWith('sk-ant-') || apiKey.startsWith('sk-') 
    case 'google':
    case 'gemini':
      return apiKey.length >= 20 // Keys de Google suelen ser largas
    case 'cohere':
      return apiKey.length >= 40 // Keys de Cohere
    default:
      return apiKey.length >= 10 // Validación básica
  }
}
