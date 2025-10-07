
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard,
  DollarSign,
  History,
  TrendingUp,
  Loader2
} from 'lucide-react'

interface WalletPageProps {
  organizationId: string
}

export function WalletPage({ organizationId }: WalletPageProps) {
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    fetchWalletData()
  }, [organizationId])

  const fetchWalletData = async () => {
    setLoading(true)
    try {
      // Fetch wallet balance
      const walletRes = await fetch('/api/wallet')
      if (walletRes.ok) {
        const data = await walletRes.json()
        setWalletData(data)
      }

      // Fetch transactions
      const transactionsRes = await fetch('/api/wallet/transactions')
      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const balance = walletData?.balance || 0
  const monthlyUsage = walletData?.monthlyUsage || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cartera Virtual</h1>
        <p className="text-gray-600 mt-1">Gestiona tu saldo y transacciones de IA</p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">
              Disponible para usar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyUsage)}</div>
            <p className="text-xs text-muted-foreground">
              +15% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas IA</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0.072)}</div>
            <p className="text-xs text-muted-foreground">
              Por consulta
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sección de recarga */}
        <Card>
          <CardHeader>
            <CardTitle>Recargar Saldo</CardTitle>
            <CardDescription>
              Añade fondos a tu cartera virtual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Recargar</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="50.00"
                min="10"
                step="0.01"
              />
            </div>

            {/* Montos sugeridos */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">$25</Button>
              <Button variant="outline" size="sm">$50</Button>
              <Button variant="outline" size="sm">$100</Button>
            </div>

            <div className="space-y-2">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Recargar con Stripe
              </Button>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Recargar con Mercado Pago
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historial de transacciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Historial de Transacciones
            </CardTitle>
            <CardDescription>
              Registro de todas tus transacciones recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'recharge' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'recharge' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'recharge' ? '+' : ''}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={transaction.status === 'completed' ? 'secondary' : 'outline'}>
                      {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline">Ver Todas las Transacciones</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
