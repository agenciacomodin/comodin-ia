
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  History, 
  AlertCircle,
  Plus,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WalletStats {
  balance: number;
  totalSpent: number;
  totalRecharged: number;
  transactionCount: number;
  lowBalanceAlert: boolean;
  recentTransactions: any[];
}

interface AITransaction {
  id: string;
  usageType: string;
  providerName: string;
  modelUsed: string;
  clientCost: number;
  inputTokens: number;
  outputTokens: number;
  description: string;
  userName: string;
  balanceAfter: number;
  createdAt: string;
}

interface FinancialTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  paymentProvider: string;
  balanceBefore: number;
  balanceAfter: number;
  userName: string;
  createdAt: string;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [aiTransactions, setAiTransactions] = useState<AITransaction[]>([]);
  const [financialHistory, setFinancialHistory] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeProvider, setRechargeProvider] = useState('STRIPE');
  const [isRecharging, setIsRecharging] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user) {
      loadBillingData();
    }
  }, [session, status]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas de billetera
      const walletResponse = await fetch('/api/wallet');
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWalletStats(walletData.data);
      }

      // Cargar transacciones de IA
      const aiResponse = await fetch('/api/wallet/transactions?limit=20');
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setAiTransactions(aiData.data);
      }

      // Cargar historial financiero
      const financialResponse = await fetch('/api/wallet/financial-history?limit=20');
      if (financialResponse.ok) {
        const financialData = await financialResponse.json();
        setFinancialHistory(financialData.data);
      }

    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Error al cargar datos de facturación');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    try {
      setIsRecharging(true);
      
      const response = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(rechargeAmount),
          currency: 'USD',
          provider: rechargeProvider
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar recarga');
      }

      // Redirigir al proveedor de pago
      if (data.provider === 'stripe' && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else if (data.provider === 'mercado_pago' && data.initPoint) {
        window.location.href = data.initPoint;
      }

    } catch (error) {
      console.error('Error creating recharge:', error);
      toast.error('Error al procesar recarga');
    } finally {
      setIsRecharging(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsageTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'CHAT_RESPONSE': 'Respuesta de Chat',
      'TEXT_ANALYSIS': 'Análisis de Texto',
      'SENTIMENT_ANALYSIS': 'Análisis de Sentimientos',
      'CONTENT_GENERATION': 'Generación de Contenido',
      'TRANSLATION': 'Traducción',
      'SUMMARY': 'Resumen',
      'OTHER': 'Otro'
    };
    return types[type] || type;
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'WALLET_RECHARGE': 'Recarga de Billetera',
      'AI_USAGE_DEDUCTION': 'Uso de IA',
      'REFUND': 'Reembolso',
      'ADJUSTMENT': 'Ajuste'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Facturación</h1>
          <p className="text-muted-foreground">
            Gestiona tu suscripción, billetera IA y historial financiero
          </p>
        </div>
        <Button onClick={loadBillingData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Resumen de Billetera IA */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Saldo Disponible
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(walletStats?.balance || 0)}
            </div>
            {walletStats?.lowBalanceAlert && (
              <div className="flex items-center text-red-600 text-xs mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Saldo bajo
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado en IA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(walletStats?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En {walletStats?.transactionCount || 0} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recargado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(walletStats?.totalRecharged || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fondos añadidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Recargar Billetera
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recargar Billetera IA</DialogTitle>
                  <DialogDescription>
                    Añade fondos a tu billetera para usar las funciones de IA
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Monto a recargar (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="50.00"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="provider">Método de Pago</Label>
                    <Select value={rechargeProvider} onValueChange={setRechargeProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STRIPE">Stripe (Tarjeta)</SelectItem>
                        <SelectItem value="MERCADO_PAGO">Mercado Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleRecharge} 
                    disabled={isRecharging}
                    className="w-full"
                  >
                    {isRecharging ? 'Procesando...' : 'Continuar al Pago'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" variant="outline" className="w-full" asChild>
              <a href="/suscripcion">
                <CreditCard className="h-4 w-4 mr-2" />
                Gestionar Plan
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {walletStats?.lowBalanceAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu saldo está por debajo del umbral configurado. 
            Considera recargar tu billetera para evitar interrupciones en el uso de IA.
          </AlertDescription>
        </Alert>
      )}

      {/* Historial de Transacciones */}
      <Tabs defaultValue="ai-usage" className="w-full">
        <TabsList>
          <TabsTrigger value="ai-usage">Uso de IA</TabsTrigger>
          <TabsTrigger value="financial">Historial Financiero</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-usage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Uso de IA
              </CardTitle>
              <CardDescription>
                Detalle de cada uso de IA y su costo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay transacciones de IA registradas aún
                </div>
              ) : (
                <div className="space-y-4">
                  {aiTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{getUsageTypeLabel(transaction.usageType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.providerName} {transaction.modelUsed && `• ${transaction.modelUsed}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.inputTokens ? `${transaction.inputTokens + transaction.outputTokens} tokens` : ''}
                          {transaction.userName && ` • ${transaction.userName}`}
                          {` • ${formatDateTime(transaction.createdAt)}`}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-500">{transaction.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          -{formatCurrency(transaction.clientCost)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Saldo: {formatCurrency(transaction.balanceAfter)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historial Financiero
              </CardTitle>
              <CardDescription>
                Todas las transacciones financieras de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay transacciones financieras registradas aún
                </div>
              ) : (
                <div className="space-y-4">
                  {financialHistory.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.type === 'WALLET_RECHARGE' ? 'default' : 'secondary'}>
                            {getTransactionTypeLabel(transaction.type)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.paymentProvider && `${transaction.paymentProvider} • `}
                          {transaction.reference && `Ref: ${transaction.reference} • `}
                          {transaction.userName && `${transaction.userName} • `}
                          {formatDateTime(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.type === 'WALLET_RECHARGE' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'WALLET_RECHARGE' ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Saldo: {formatCurrency(transaction.balanceAfter)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
