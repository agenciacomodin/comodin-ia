
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface WhatsAppInstance {
  id: string;
  name: string;
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  qrCode?: string;
  phoneNumber?: string;
  errorMessage?: string;
  instanceId?: string;
}

interface UseWhatsAppConnectionReturn {
  instances: WhatsAppInstance[];
  loading: boolean;
  creating: boolean;
  createInstance: (name: string, phoneNumber: string) => Promise<void>;
  deleteInstance: (id: string) => Promise<void>;
  refreshInstances: () => Promise<void>;
  connectionState: Record<string, 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>;
}

export function useWhatsAppConnection(): UseWhatsAppConnectionReturn {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [connectionState, setConnectionState] = useState<Record<string, 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>>({});

  // Fetch instances on mount
  const refreshInstances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/whatsapp/instance');
      if (!response.ok) {
        throw new Error('Error al obtener instancias');
      }
      const data = await response.json();
      setInstances(data.channels || []);
      
      // Update connection states
      const states: Record<string, 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'> = {};
      data.channels?.forEach((instance: WhatsAppInstance) => {
        states[instance.id] = instance.status;
      });
      setConnectionState(states);
    } catch (error) {
      console.error('Error fetching WhatsApp instances:', error);
      toast.error('Error al cargar instancias de WhatsApp');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new instance
  const createInstance = useCallback(async (name: string, phoneNumber: string) => {
    try {
      setCreating(true);
      const response = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear instancia');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Instancia creada. Escanea el código QR para conectar.');
        
        // Add new instance to list
        const newInstance: WhatsAppInstance = {
          id: data.channel.id,
          name: data.channel.name,
          status: 'CONNECTING',
          qrCode: data.qrCode,
          phoneNumber: data.channel.phoneNumber,
          instanceId: data.channel.instanceId,
        };
        
        setInstances(prev => [...prev, newInstance]);
        setConnectionState(prev => ({
          ...prev,
          [newInstance.id]: 'CONNECTING'
        }));
        
        // Start polling for connection status
        startPollingConnection(newInstance.id, newInstance.instanceId!);
      }
    } catch (error: any) {
      console.error('Error creating WhatsApp instance:', error);
      toast.error(error.message || 'Error al crear instancia de WhatsApp');
    } finally {
      setCreating(false);
    }
  }, []);

  // Delete instance
  const deleteInstance = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/whatsapp/instance?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar instancia');
      }

      toast.success('Instancia eliminada correctamente');
      setInstances(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting WhatsApp instance:', error);
      toast.error('Error al eliminar instancia de WhatsApp');
    }
  }, []);

  // Poll connection status
  const startPollingConnection = useCallback((channelId: string, instanceId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (every 5 seconds)
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/whatsapp/status?instanceId=${instanceId}`);
        const data = await response.json();
        
        if (data.success && data.data?.state === 'open') {
          // Connected!
          setConnectionState(prev => ({
            ...prev,
            [channelId]: 'CONNECTED'
          }));
          
          setInstances(prev => prev.map(inst =>
            inst.id === channelId
              ? { ...inst, status: 'CONNECTED', qrCode: undefined }
              : inst
          ));
          
          toast.success('WhatsApp conectado exitosamente!');
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          // Timeout
          setConnectionState(prev => ({
            ...prev,
            [channelId]: 'ERROR'
          }));
          
          setInstances(prev => prev.map(inst =>
            inst.id === channelId
              ? { ...inst, status: 'ERROR', errorMessage: 'Tiempo de espera agotado' }
              : inst
          ));
          
          toast.error('Tiempo de espera agotado. Intenta de nuevo.');
          clearInterval(pollInterval);
        }
        
        attempts++;
      } catch (error) {
        console.error('Error polling connection:', error);
      }
    }, 5000); // Poll every 5 seconds
  }, []);

  useEffect(() => {
    refreshInstances();
  }, [refreshInstances]);

  return {
    instances,
    loading,
    creating,
    createInstance,
    deleteInstance,
    refreshInstances,
    connectionState,
  };
}
