
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Download,
  Calendar,
  Filter,
  FileText,
  Mail,
  Phone
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { DateRange } from 'react-day-picker'
import { addDays, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

interface ReportData {
  conversations: number
  newLeads: number
  conversionRate: number
  closedSales: number
  revenue: number
  previousPeriod: {
    conversations: number
    newLeads: number
    conversionRate: number
    closedSales: number
    revenue: number
  }
}

const mockData: ReportData = {
  conversations: 3247,
  newLeads: 428,
  conversionRate: 24.3,
  closedSales: 104,
  revenue: 87400,
  previousPeriod: {
    conversations: 2741,
    newLeads: 382,
    conversionRate: 24.8,
    closedSales: 96,
    revenue: 75800
  }
}

const agentData = [
  { name: 'Ana Martínez', role: 'Agente Senior', conversations: 87 },
  { name: 'Luis García', role: 'Agente', conversations: 73 },
  { name: 'Carmen López', role: 'Agente', conversations: 68 },
  { name: 'Diego Ruiz', role: 'Agente Junior', conversations: 52 }
]

const channelData = [
  { name: 'WhatsApp', count: 2847, percentage: 87.6, color: 'bg-green-500' },
  { name: 'Email', count: 289, percentage: 8.9, color: 'bg-blue-500' },
  { name: 'Teléfono', count: 87, percentage: 2.7, color: 'bg-purple-500' },
  { name: 'Web Chat', count: 24, percentage: 0.8, color: 'bg-orange-500' }
]

export function ReportsManager() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  
  const [quickPeriod, setQuickPeriod] = useState('last30days')
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    channels: ['whatsapp', 'email', 'phone', 'webchat'],
    agents: ['all'],
    reportTypes: ['conversations', 'leads', 'sales', 'revenue']
  })

  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeCharts: false,
    includeSummary: true,
    includeDetails: true
  })

  const { toast } = useToast()

  const handleQuickPeriodChange = (period: string) => {
    setQuickPeriod(period)
    const today = new Date()
    
    switch (period) {
      case 'today':
        setDateRange({ from: today, to: today })
        break
      case 'yesterday':
        const yesterday = subDays(today, 1)
        setDateRange({ from: yesterday, to: yesterday })
        break
      case 'last7days':
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case 'last30days':
        setDateRange({ from: subDays(today, 30), to: today })
        break
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })
        break
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1)
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) })
        break
      case 'thisYear':
        setDateRange({ from: startOfYear(today), to: endOfYear(today) })
        break
    }
  }

  const calculatedData = useMemo(() => {
    // Simulamos el cálculo de diferencias porcentuales
    const conversationsGrowth = ((mockData.conversations - mockData.previousPeriod.conversations) / mockData.previousPeriod.conversations) * 100
    const leadsGrowth = ((mockData.newLeads - mockData.previousPeriod.newLeads) / mockData.previousPeriod.newLeads) * 100
    const conversionChange = mockData.conversionRate - mockData.previousPeriod.conversionRate
    const salesGrowth = ((mockData.closedSales - mockData.previousPeriod.closedSales) / mockData.previousPeriod.closedSales) * 100
    const revenueGrowth = ((mockData.revenue - mockData.previousPeriod.revenue) / mockData.previousPeriod.revenue) * 100

    return {
      ...mockData,
      growth: {
        conversations: conversationsGrowth,
        leads: leadsGrowth,
        conversion: conversionChange,
        sales: salesGrowth,
        revenue: revenueGrowth
      }
    }
  }, [dateRange])

  const handleExport = () => {
    const reportData = {
      period: `${dateRange?.from?.toLocaleDateString()} - ${dateRange?.to?.toLocaleDateString()}`,
      summary: calculatedData,
      agents: agentData,
      channels: channelData
    }

    let content = ''
    let filename = 'reporte'

    if (exportOptions.format === 'csv') {
      const csvRows = [
        ['Métrica', 'Valor Actual', 'Período Anterior', 'Crecimiento (%)'],
        ['Conversaciones', calculatedData.conversations, calculatedData.previousPeriod.conversations, calculatedData.growth.conversations.toFixed(1)],
        ['Nuevos Leads', calculatedData.newLeads, calculatedData.previousPeriod.newLeads, calculatedData.growth.leads.toFixed(1)],
        ['Tasa de Conversión (%)', calculatedData.conversionRate, calculatedData.previousPeriod.conversionRate, calculatedData.growth.conversion.toFixed(1)],
        ['Ventas Cerradas', calculatedData.closedSales, calculatedData.previousPeriod.closedSales, calculatedData.growth.sales.toFixed(1)],
        ['Ingresos ($)', calculatedData.revenue, calculatedData.previousPeriod.revenue, calculatedData.growth.revenue.toFixed(1)],
        [],
        ['Agente', 'Conversaciones'],
        ...agentData.map(agent => [agent.name, agent.conversations]),
        [],
        ['Canal', 'Cantidad', 'Porcentaje (%)'],
        ...channelData.map(channel => [channel.name, channel.count, channel.percentage])
      ]
      
      content = csvRows.map(row => row.join(',')).join('\n')
      filename = 'reporte.csv'
    } else {
      // Formato JSON
      content = JSON.stringify(reportData, null, 2)
      filename = 'reporte.json'
    }

    const blob = new Blob([content], { 
      type: exportOptions.format === 'csv' ? 'text/csv' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exportación completada",
      description: `Reporte exportado como ${filename}`,
    })
    setIsExportDialogOpen(false)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(num)
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '+' : ''
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Analítica y métricas de rendimiento de tu negocio</p>
        </div>
        <div className="flex gap-2">
          {/* Selector de período rápido */}
          <Select value={quickPeriod} onValueChange={handleQuickPeriodChange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="yesterday">Ayer</SelectItem>
              <SelectItem value="last7days">Últimos 7 días</SelectItem>
              <SelectItem value="last30days">Últimos 30 días</SelectItem>
              <SelectItem value="thisMonth">Este mes</SelectItem>
              <SelectItem value="lastMonth">Mes pasado</SelectItem>
              <SelectItem value="thisYear">Este año</SelectItem>
            </SelectContent>
          </Select>

          {/* Selector de rango personalizado */}
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />

          {/* Filtros avanzados */}
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtros Avanzados</DialogTitle>
                <DialogDescription>
                  Personaliza qué datos incluir en tu reporte
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Canales de Comunicación</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'email', label: 'Email' },
                      { id: 'phone', label: 'Teléfono' },
                      { id: 'webchat', label: 'Web Chat' }
                    ].map((channel) => (
                      <div key={channel.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={channel.id}
                          checked={filters.channels.includes(channel.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({
                                ...filters,
                                channels: [...filters.channels, channel.id]
                              })
                            } else {
                              setFilters({
                                ...filters,
                                channels: filters.channels.filter(c => c !== channel.id)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={channel.id}>{channel.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Métricas a Incluir</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'conversations', label: 'Conversaciones' },
                      { id: 'leads', label: 'Nuevos Leads' },
                      { id: 'sales', label: 'Ventas Cerradas' },
                      { id: 'revenue', label: 'Ingresos' }
                    ].map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={metric.id}
                          checked={filters.reportTypes.includes(metric.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({
                                ...filters,
                                reportTypes: [...filters.reportTypes, metric.id]
                              })
                            } else {
                              setFilters({
                                ...filters,
                                reportTypes: filters.reportTypes.filter(r => r !== metric.id)
                              })
                            }
                          }}
                        />
                        <Label htmlFor={metric.id}>{metric.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsFilterDialogOpen(false)}>Aplicar Filtros</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Exportar */}
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Reporte</DialogTitle>
                <DialogDescription>
                  Configura las opciones de exportación para tu reporte
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="format">Formato de archivo</Label>
                  <Select value={exportOptions.format} onValueChange={(value) => setExportOptions({...exportOptions, format: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Excel)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Incluir en el reporte:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeSummary"
                        checked={exportOptions.includeSummary}
                        onCheckedChange={(checked) => setExportOptions({...exportOptions, includeSummary: !!checked})}
                      />
                      <Label htmlFor="includeSummary">Resumen ejecutivo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeDetails"
                        checked={exportOptions.includeDetails}
                        onCheckedChange={(checked) => setExportOptions({...exportOptions, includeDetails: !!checked})}
                      />
                      <Label htmlFor="includeDetails">Datos detallados</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleExport}>Descargar Reporte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Período seleccionado */}
      {dateRange && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Mostrando datos del {dateRange.from?.toLocaleDateString()} al {dateRange.to?.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(calculatedData.conversations)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(calculatedData.growth.conversations)}>
                {getGrowthIcon(calculatedData.growth.conversations)}{calculatedData.growth.conversations.toFixed(1)}%
              </span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(calculatedData.newLeads)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(calculatedData.growth.leads)}>
                {getGrowthIcon(calculatedData.growth.leads)}{calculatedData.growth.leads.toFixed(1)}%
              </span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(calculatedData.growth.conversion)}>
                {getGrowthIcon(calculatedData.growth.conversion)}{calculatedData.growth.conversion.toFixed(1)}pp
              </span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Cerradas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(calculatedData.closedSales)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(calculatedData.growth.sales)}>
                {getGrowthIcon(calculatedData.growth.sales)}{calculatedData.growth.sales.toFixed(1)}%
              </span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calculatedData.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(calculatedData.growth.revenue)}>
                {getGrowthIcon(calculatedData.growth.revenue)}{calculatedData.growth.revenue.toFixed(1)}%
              </span> vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Conversaciones por Día</CardTitle>
            <CardDescription>Volumen de conversaciones en el período seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between px-4">
              {Array.from({ length: 30 }, (_, i) => {
                const height = Math.random() * 250 + 50
                return (
                  <div
                    key={i}
                    className="w-2 bg-blue-600 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ height: `${height}px` }}
                    title={`Día ${i + 1}: ${Math.round(height * 10)} conversaciones`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Inicio del período</span>
              <span>Fin del período</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Ventas</CardTitle>
            <CardDescription>Distribución de oportunidades por etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Prospecto', count: 142, value: 284500, percentage: 85 },
                { stage: 'Calificado', count: 89, value: 156200, percentage: 62 },
                { stage: 'Propuesta', count: 45, value: 98700, percentage: 45 },
                { stage: 'Cerrado Ganado', count: 23, value: 67300, percentage: 30 }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.stage}</p>
                    <p className="text-sm text-gray-600">{item.count} oportunidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.value)}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${item.percentage}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalles por agente y canal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Agentes</CardTitle>
            <CardDescription>Rendimiento del equipo en el período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentData.map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-600">{agent.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{agent.conversations}</p>
                    <p className="text-sm text-gray-600">conversaciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canales de Comunicación</CardTitle>
            <CardDescription>Distribución de conversaciones por canal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelData.map((channel, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${channel.color} rounded-full`}></div>
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(channel.count)}</p>
                    <p className="text-xs text-gray-600">{channel.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios Pico</CardTitle>
            <CardDescription>Distribución de actividad por horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 12 }, (_, i) => {
                const hour = i + 9
                const activity = Math.random() * 100
                return (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 w-8">
                      {hour}:00
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${activity}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">
                      {Math.round(activity)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
