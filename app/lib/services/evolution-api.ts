
/**
 * Evolution API Service
 * Servicio para interactuar con la Evolution API de WhatsApp
 * Documentación: https://doc.evolution-api.com/
 */

import axios, { AxiosInstance } from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || '';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

if (!EVOLUTION_API_URL) {
  console.warn('⚠️ EVOLUTION_API_URL no está configurado');
}

if (!EVOLUTION_API_KEY) {
  console.warn('⚠️ EVOLUTION_API_KEY no está configurado');
}

// Cliente Axios configurado para Evolution API
export const evolutionApi: AxiosInstance = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'apikey': EVOLUTION_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interfaces para tipos de datos
export interface EvolutionInstance {
  instance: {
    instanceName: string;
    owner: string;
    profilePictureUrl?: string;
    profileName?: string;
    profileStatus?: string;
  };
  state: string;
  connectionStatus?: string;
}

export interface CreateInstanceParams {
  instanceName: string;
  qrcode?: boolean;
  integration?: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  webhook?: string;
  webhookByEvents?: boolean;
  events?: string[];
}

export interface SendMessageParams {
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  options?: {
    delay?: number;
    presence?: 'composing' | 'recording';
  };
}

export interface MessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message?: any;
  messageTimestamp?: number;
  status?: string;
}

/**
 * Verificar la conexión con Evolution API
 */
export async function checkEvolutionConnection(): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.get('/instance/fetchInstances');
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error verificando conexión con Evolution API:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Crear una nueva instancia de WhatsApp
 */
export async function createInstance(params: CreateInstanceParams): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.post('/instance/create', {
      instanceName: params.instanceName,
      qrcode: params.qrcode ?? true,
      integration: params.integration || 'WHATSAPP-BAILEYS',
      webhook: params.webhook,
      webhook_by_events: params.webhookByEvents ?? true,
      events: params.events || [
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'SEND_MESSAGE',
        'CONNECTION_UPDATE',
      ],
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error creando instancia:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Obtener información de una instancia
 */
export async function getInstance(instanceName: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error obteniendo instancia:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Obtener todas las instancias
 */
export async function fetchInstances(): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.get('/instance/fetchInstances');
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error obteniendo instancias:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Eliminar una instancia
 */
export async function deleteInstance(instanceName: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.delete(`/instance/delete/${instanceName}`);
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error eliminando instancia:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Obtener el estado de conexión de una instancia
 */
export async function getConnectionState(instanceName: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error obteniendo estado de conexión:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Desconectar una instancia (logout)
 */
export async function logoutInstance(instanceName: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.delete(`/instance/logout/${instanceName}`);
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error desconectando instancia:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Enviar mensaje de texto
 */
export async function sendTextMessage(
  instanceName: string, 
  params: SendMessageParams
): Promise<{ success: boolean; data?: MessageResponse; error?: any }> {
  try {
    const response = await evolutionApi.post(`/message/sendText/${instanceName}`, {
      number: params.number,
      text: params.text,
      options: params.options,
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error enviando mensaje:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Enviar mensaje con media (imagen, video, documento)
 */
export async function sendMediaMessage(
  instanceName: string, 
  params: SendMessageParams
): Promise<{ success: boolean; data?: MessageResponse; error?: any }> {
  try {
    const response = await evolutionApi.post(`/message/sendMedia/${instanceName}`, {
      number: params.number,
      mediaUrl: params.mediaUrl,
      caption: params.mediaCaption,
      options: params.options,
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error enviando media:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Marcar mensaje como leído
 */
export async function markMessageAsRead(
  instanceName: string,
  remoteJid: string,
  messageId: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.post(`/chat/markMessageAsRead/${instanceName}`, {
      read_messages: [{
        remoteJid,
        id: messageId,
        fromMe: false,
      }],
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error marcando mensaje como leído:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Obtener información del perfil
 */
export async function getProfileInfo(
  instanceName: string,
  number: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.get(`/chat/fetchProfilePictureUrl/${instanceName}`, {
      params: { number }
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error obteniendo perfil:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

/**
 * Verificar si un número está en WhatsApp
 */
export async function checkNumberExists(
  instanceName: string,
  numbers: string[]
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const response = await evolutionApi.post(`/chat/whatsappNumbers/${instanceName}`, {
      numbers
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error('Error verificando números:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

export default {
  checkEvolutionConnection,
  createInstance,
  getInstance,
  fetchInstances,
  deleteInstance,
  getConnectionState,
  logoutInstance,
  sendTextMessage,
  sendMediaMessage,
  markMessageAsRead,
  getProfileInfo,
  checkNumberExists,
};
