

'use client'

import { useState } from 'react'
import { Search, Filter, MessageSquare, Phone, Users, User, UserX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { 
  ConversationSummary2, 
  CONVERSATION_STATUS_LABELS, 
  CONVERSATION_PRIORITY_COLORS 
} from '@/lib/types'
import { ConversationStatus, ConversationPriority } from '@prisma/client'

type AgentFilter = 'ALL' | 'MINE' | 'UNASSIGNED'

interface ChatListPanelProps {
  conversations: ConversationSummary2[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: ConversationStatus | 'ALL'
  onStatusFilterChange: (status: ConversationStatus | 'ALL') => void
  currentUserId?: string // Para saber cuáles conversaciones son "mías"
}

export function ChatListPanel({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  currentUserId
}: ChatListPanelProps) {
  const [agentFilter, setAgentFilter] = useState<AgentFilter>('ALL')

  const formatTime = (date?: Date) => {
    if (!date) return ''
    
    const now = new Date()
    const messageDate = new Date(date)
    const diffInMs = now.getTime() - messageDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInDays < 7) return `${diffInDays}d`
    
    return messageDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getPriorityColor = (priority: ConversationPriority) => {
    const colors = CONVERSATION_PRIORITY_COLORS[priority]
    switch (colors) {
      case 'red': return 'bg-red-500'
      case 'orange': return 'bg-orange-500'  
      case 'blue': return 'bg-blue-500'
      case 'gray': 
      default: return 'bg-gray-400'
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.contact.phone.includes(searchTerm) ||
                         (conversation.lastMessageText || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || conversation.status === statusFilter
    
    const matchesAgent = (() => {
      switch (agentFilter) {
        case 'MINE':
          return conversation.assignedAgent?.id === currentUserId
        case 'UNASSIGNED':
          return !conversation.assignedAgent
        case 'ALL':
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesAgent
  })

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusFilterChange('ALL')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('OPEN')}>
                {CONVERSATION_STATUS_LABELS.OPEN}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('PENDING')}>
                {CONVERSATION_STATUS_LABELS.PENDING}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilterChange('RESOLVED')}>
                {CONVERSATION_STATUS_LABELS.RESOLVED}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Filtros por agente */}
        <div className="flex space-x-1 mb-3">
          <Button
            variant={agentFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAgentFilter('ALL')}
            className="flex items-center text-xs h-8"
          >
            <Users className="h-3 w-3 mr-1" />
            Todas
          </Button>
          <Button
            variant={agentFilter === 'MINE' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAgentFilter('MINE')}
            className="flex items-center text-xs h-8"
          >
            <User className="h-3 w-3 mr-1" />
            Mías
          </Button>
          <Button
            variant={agentFilter === 'UNASSIGNED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAgentFilter('UNASSIGNED')}
            className="flex items-center text-xs h-8"
          >
            <UserX className="h-3 w-3 mr-1" />
            Sin asignar
          </Button>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar chats..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay conversaciones</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "p-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-transparent",
                  selectedConversationId === conversation.id && "bg-blue-50 border-l-blue-500"
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.contact.avatar} />
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {getInitials(conversation.contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Indicador VIP */}
                    {conversation.contact.isVip && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">★</span>
                      </div>
                    )}
                  </div>

                  {/* Información del chat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.contact.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {/* Indicador de prioridad */}
                        {conversation.priority !== 'MEDIUM' && (
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getPriorityColor(conversation.priority)
                          )} />
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                    </div>

                    {/* Último mensaje */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.lastMessageFrom === 'OUTGOING' && (
                          <span className="text-gray-400 mr-1">→</span>
                        )}
                        {conversation.lastMessageText || 'Sin mensajes'}
                      </p>
                      
                      {/* Badge de mensajes no leídos */}
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* Número de teléfono */}
                    <div className="flex items-center mt-1">
                      <Phone className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {conversation.contact.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
