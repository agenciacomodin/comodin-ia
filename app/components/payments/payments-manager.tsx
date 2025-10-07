
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Receipt, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethod {
  id: string
  type: 'stripe' | 'mercadopago'
  currency: 'USD' | 'ARS'
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

interface Transaction {
  id: string
  amount: number
  currency: 'USD' | 'ARS'
  status: 'completed' | 'pending' | 'failed'
  description: string
  date: string
  paymentMethod: 'stripe' | 'mercadopago'
}

export function PaymentsManager() {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'ARS'>('USD')
  const [isAddMethodDialogOpen, setIsAddMethodDialogOpen] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    setLoading(true)
    try {
      // Fetch payment methods
      const methodsRes = await fetch('/api/payments')
      if (methodsRes.ok) {
        const data = await methodsRes.json()
        setPaymentMethods(data.paymentMethods || [])
      }

      // Fetch transaction history
      // TODO: Implementar cuando la API esté disponible
      setTransactions([])
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: ''
  })

  const getPaymentProvider = (currency: 'USD' | 'ARS') => {
    return currency === 'USD' ? 'stripe' : 'mercadopago'
  }

  const getProviderName = (provider: 'stripe' | 'mercadopago') => {
    return provider === 'stripe' ? 'Stripe' : 'Mercado Pago'
  }

  const getCurrencySymbol = (currency: 'USD' | 'ARS') => {
    return currency === 'USD' ? '$' : '$'
  }

  const formatAmount = (amount: number, currency: 'USD' | 'ARS') => {
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleAddPaymentMethod = async () => {
    setIsProcessing(true)
    try {
      // Simular proceso de agregar método de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Método de pago agregado",
        description: `Se agregó correctamente el método de pago para ${selectedCurrency} via ${getProviderName(getPaymentProvider(selectedCurrency))}.`,
      })
      
      setIsAddMethodDialogOpen(false)
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: ''
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el método de pago. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetryPayment = (transactionId: string) => {
    toast({
      title: "Reintentando pago",
      description: "Se está procesando el pago nuevamente.",
    })
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'pending':
        return 'Pendiente'
      case 'failed':
        return 'Fallido'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos y Facturación</h1>
          <p className="text-gray-600 mt-1">Gestiona tus métodos de pago y consulta tu historial de transacciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Descargar Facturas
          </Button>
          
          <Dialog open={isAddMethodDialogOpen} onOpenChange={setIsAddMethodDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Agregar Método
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Método de Pago</DialogTitle>
                <DialogDescription>
                  Agrega una nueva tarjeta para realizar pagos. Selecciona la moneda según tu preferencia.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Selector de moneda y proveedor */}
                <div className="space-y-2">
                  <Label>Moneda y Proveedor</Label>
                  <Select 
                    value={selectedCurrency} 
                    onValueChange={(value: 'USD' | 'ARS') => setSelectedCurrency(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólares (via Stripe)</SelectItem>
                      <SelectItem value="ARS">ARS - Pesos Argentinos (via Mercado Pago)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {selectedCurrency === 'USD' 
                      ? 'Los pagos en USD se procesan a través de Stripe'
                      : 'Los pagos en ARS se procesan a través de Mercado Pago'
                    }
                  </p>
                </div>

                {/* Información de la tarjeta */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de tarjeta</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={newPaymentMethod.cardNumber}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, cardNumber: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Mes</Label>
                    <Input
                      id="expiryMonth"
                      placeholder="MM"
                      value={newPaymentMethod.expiryMonth}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiryMonth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Año</Label>
                    <Input
                      id="expiryYear"
                      placeholder="AAAA"
                      value={newPaymentMethod.expiryYear}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiryYear: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={newPaymentMethod.cvv}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, cvv: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderName">Nombre del titular</Label>
                  <Input
                    id="holderName"
                    placeholder="Nombre completo"
                    value={newPaymentMethod.holderName}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, holderName: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  onClick={handleAddPaymentMethod}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Agregar Método'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumen de cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Emprendedor</div>
            <p className="text-xs text-muted-foreground">
              Renovación: 1 de abril, 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$29.99</div>
            <p className="text-xs text-muted-foreground">
              USD via Stripe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Este Año</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89.97</div>
            <p className="text-xs text-muted-foreground">
              3 pagos completados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métodos de pago */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>
              Gestiona tus tarjetas y métodos de pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">•••• {method.last4}</p>
                    <p className="text-sm text-gray-600">
                      {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear} - {method.currency}
                    </p>
                    <p className="text-xs text-gray-500">
                      via {getProviderName(method.type)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="secondary">Predeterminada</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Historial de transacciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>
              Consulta tus pagos y facturas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('es-ES')} - 
                        via {getProviderName(transaction.paymentMethod)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </div>
                    {transaction.status === 'failed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRetryPayment(transaction.id)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reintentar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de Facturación</CardTitle>
            <CardDescription>
              Detalles importantes sobre pagos y facturación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Pagos en USD (Stripe)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Procesamiento inmediato</li>
                  <li>• Tarjetas internacionales aceptadas</li>
                  <li>• Facturación automática mensual/anual</li>
                  <li>• Soporte 24/7</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pagos en ARS (Mercado Pago)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Procesamiento local en Argentina</li>
                  <li>• Tarjetas nacionales e internacionales</li>
                  <li>• Factura A disponible para empresas</li>
                  <li>• Soporte en español</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
