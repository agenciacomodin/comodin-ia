
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, QrCode, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface WhatsAppConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WhatsAppConnectionDialog({
  open,
  onOpenChange,
  onSuccess
}: WhatsAppConnectionDialogProps) {
  const [step, setStep] = useState<'form' | 'qr' | 'connecting'>('form');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phoneNumber) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
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
      
      if (data.success && data.qrCode) {
        setQrCode(data.qrCode);
        setInstanceId(data.channel.instanceId);
        setStep('qr');
        
        // Start monitoring connection
        monitorConnection(data.channel.instanceId);
      }
    } catch (error: any) {
      console.error('Error creating WhatsApp instance:', error);
      toast.error(error.message || 'Error al crear instancia');
    } finally {
      setLoading(false);
    }
  };

  const monitorConnection = (instanceId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/whatsapp/status?instanceId=${instanceId}`);
        const data = await response.json();
        
        if (data.success && data.data?.state === 'open') {
          // Connected!
          clearInterval(interval);
          setStep('connecting');
          toast.success('¡WhatsApp conectado exitosamente!');
          
          setTimeout(() => {
            onSuccess?.();
            onOpenChange(false);
            resetForm();
          }, 2000);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.error('Tiempo de espera agotado. Intenta de nuevo.');
          setStep('form');
        }
        
        attempts++;
      } catch (error) {
        console.error('Error monitoring connection:', error);
      }
    }, 5000);
  };

  const resetForm = () => {
    setStep('form');
    setName('');
    setPhoneNumber('');
    setQrCode('');
    setInstanceId('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Conectar WhatsApp Business
              </DialogTitle>
              <DialogDescription>
                Ingresa los datos de tu cuenta de WhatsApp Business para conectarla.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Canal</Label>
                <Input
                  id="name"
                  placeholder="ej. Soporte Principal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Incluye el código de país (ej. +52 para México)
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generar Código QR
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Escanea el Código QR
              </DialogTitle>
              <DialogDescription>
                Abre WhatsApp en tu teléfono y escanea este código para conectar.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              {qrCode && (
                <div className="relative">
                  <Image
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    width={300}
                    height={300}
                    className="border-2 border-border rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <p className="font-medium">Cómo escanear:</p>
                <ol className="text-left space-y-1 pl-4">
                  <li>1. Abre WhatsApp en tu teléfono</li>
                  <li>2. Ve a Configuración → Dispositivos vinculados</li>
                  <li>3. Toca "Vincular dispositivo"</li>
                  <li>4. Escanea este código QR</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Esperando que escanees el código...</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'connecting' && (
          <>
            <DialogHeader>
              <DialogTitle>¡Conectado Exitosamente!</DialogTitle>
              <DialogDescription>
                Tu cuenta de WhatsApp ha sido conectada correctamente.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-500/10 p-4 mb-4">
                <svg
                  className="h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">Conexión establecida</p>
              <p className="text-sm text-muted-foreground">Redirigiendo...</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
