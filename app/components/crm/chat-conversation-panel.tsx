

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
  ConversationDetail, 
  MessageSummary,
  CONVERSATION_STATUS_LABELS,
  CONVERSATION_PRIORITY_LABELS 
} from '@/lib/types'
import { MessageDirection, MessageType, ConversationStatus } from '@prisma/client'

interface ChatConversationPanelProps {
  conversation: ConversationDetail | null
  onSendMessage: (content: string, type?: MessageType) => void
  onUpdateStatus: (status: ConversationStatus) => void
  onAssignAgent: (agentId: string) => void
}

export function ChatConversationPanel({
  conversation,
  onSendMessage,
  onUpdateStatus,
  onAssignAgent
}: ChatConversationPanelProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSendMessage = () => {
    if (message.trim() && conversation) {
      onSendMessage(message.trim())
      setMessage('')
      textareaRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMessageDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    }
    
    return messageDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
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

  const groupMessagesByDate = (messages: MessageSummary[]) => {
    const groups: { [key: string]: MessageSummary[] } = {}
    
    messages.forEach(message => {
      const dateKey = new Date(message.sentAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date),
      messages: msgs
    }))
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-500">
            Elige un chat de la lista para comenzar a conversar
          </p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(conversation.messages)

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header de la conversación */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.contact.avatar} />
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {getInitials(conversation.contact.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {conversation.contact.name}
                {conversation.contact.isVip && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                    VIP
                  </Badge>
                )}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{conversation.contact.phone}</span>
                <span>•</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    conversation.status === 'OPEN' && "border-green-200 text-green-700",
                    conversation.status === 'PENDING' && "border-yellow-200 text-yellow-700",
                    conversation.status === 'RESOLVED' && "border-gray-200 text-gray-700"
                  )}
                >
                  {CONVERSATION_STATUS_LABELS[conversation.status]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {CONVERSATION_PRIORITY_LABELS[conversation.priority]}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onUpdateStatus('PENDING')}>
                  Marcar como pendiente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('RESOLVED')}>
                  Marcar como resuelta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus('ARCHIVED')}>
                  Archivar conversación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Separador de fecha */}
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-gray-200 text-xs text-gray-600 rounded-full">
                  {formatMessageDate(group.date)}
                </span>
              </div>

              {/* Mensajes del grupo */}
              <div className="space-y-2">
                {group.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end space-x-2",
                      msg.direction === 'OUTGOING' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.direction === 'INCOMING' && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={conversation.contact.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(conversation.contact.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg shadow-sm",
                        msg.direction === 'OUTGOING'
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border"
                      )}
                    >
                      {msg.replyTo && (
                        <div className={cn(
                          "text-xs border-l-2 pl-2 mb-1 opacity-70",
                          msg.direction === 'OUTGOING' 
                            ? "border-blue-300" 
                            : "border-gray-300"
                        )}>
                          <p className="font-medium">{msg.replyTo.sentByName || 'Cliente'}</p>
                          <p>{msg.replyTo.content}</p>
                        </div>
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className={cn(
                          "text-xs",
                          msg.direction === 'OUTGOING' 
                            ? "text-blue-200" 
                            : "text-gray-500"
                        )}>
                          {formatMessageTime(msg.sentAt)}
                        </span>
                        
                        {msg.direction === 'OUTGOING' && (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-blue-200" />
                            {msg.isRead && <div className="w-2 h-2 rounded-full bg-blue-200" />}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {msg.direction === 'OUTGOING' && msg.sentByName && (
                      <div className="text-xs text-gray-500">
                        {msg.sentByName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Compositor de mensajes */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="resize-none min-h-[40px] max-h-32"
              rows={1}
            />
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
