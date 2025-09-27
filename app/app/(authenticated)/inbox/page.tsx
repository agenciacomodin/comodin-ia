
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { ChatListPanel } from '@/components/crm/chat-list-panel'
import { ChatConversationPanel } from '@/components/crm/chat-conversation-panel'
import { ContactDetailsPanel } from '@/components/crm/contact-details-panel'
import { 
  ConversationSummary2, 
  ConversationDetail, 
  ContactDetail,
  MessageSummary
} from '@/lib/types'
import { ConversationStatus, ConversationPriority, MessageType } from '@prisma/client'

// Datos de muestra para la demo
const mockConversations: ConversationSummary2[] = [
  {
    id: '1',
    contact: {
      id: '1',
      name: 'Juan Pérez García',
      phone: '+52 55 1234 5678',
      avatar: '',
      isVip: true
    },
    status: 'OPEN',
    priority: 'HIGH',
    assignedAgent: {
      id: 'agent1',
      name: 'Ana Martínez'
    },
    messageCount: 15,
    unreadCount: 3,
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    lastMessageText: '¿Tienen disponibilidad para esta semana?',
    lastMessageFrom: 'INCOMING'
  },
  {
    id: '2',
    contact: {
      id: '2',
      name: 'María García López',
      phone: '+52 55 8765 4321',
      avatar: '',
      isVip: false
    },
    status: 'PENDING',
    priority: 'MEDIUM',
    messageCount: 8,
    unreadCount: 1,
    lastMessageAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
    lastMessageText: 'Gracias por la información, excelente servicio',
    lastMessageFrom: 'INCOMING'
  },
  {
    id: '3',
    contact: {
      id: '3',
      name: 'Carlos Rodríguez',
      phone: '+52 55 5555 0000',
      avatar: '',
      isVip: false
    },
    status: 'OPEN',
    priority: 'URGENT',
    messageCount: 22,
    unreadCount: 5,
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
    lastMessageText: 'Necesito más información sobre los precios urgentemente',
    lastMessageFrom: 'INCOMING'
  },
  {
    id: '4',
    contact: {
      id: '4',
      name: 'Ana Fernández',
      phone: '+52 55 9999 1111',
      avatar: '',
      isVip: true
    },
    status: 'RESOLVED',
    priority: 'LOW',
    assignedAgent: {
      id: 'agent2',
      name: 'Roberto Silva'
    },
    messageCount: 6,
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    lastMessageText: 'Perfecto, muchas gracias por todo',
    lastMessageFrom: 'OUTGOING'
  }
]

const mockMessages: Record<string, MessageSummary[]> = {
  '1': [
    {
      id: 'm1',
      conversationId: '1',
      direction: 'INCOMING',
      type: 'TEXT',
      content: 'Hola, buenos días. Me interesa conocer sus servicios.',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      isRead: true
    },
    {
      id: 'm2',
      conversationId: '1',
      direction: 'OUTGOING',
      type: 'TEXT',
      content: '¡Hola Juan! Muchas gracias por contactarnos. Con mucho gusto te ayudo con información sobre nuestros servicios. ¿En qué área específicamente estás interesado?',
      sentBy: 'agent1',
      sentByName: 'Ana Martínez',
      sentAt: new Date(Date.now() - 110 * 60 * 1000), // 110 minutos atrás
      isRead: true
    },
    {
      id: 'm3',
      conversationId: '1',
      direction: 'INCOMING',
      type: 'TEXT',
      content: 'Me interesa el servicio de consultoría empresarial. Tengo una empresa mediana y necesito optimizar procesos.',
      sentAt: new Date(Date.now() - 100 * 60 * 1000), // 100 minutos atrás
      isRead: true
    },
    {
      id: 'm4',
      conversationId: '1',
      direction: 'OUTGOING',
      type: 'TEXT',
      content: 'Perfecto! Nuestro servicio de consultoría es ideal para empresas como la tuya. Te puedo agendar una llamada para esta semana y hacer una evaluación inicial sin costo.',
      sentBy: 'agent1',
      sentByName: 'Ana Martínez',
      sentAt: new Date(Date.now() - 90 * 60 * 1000),
      isRead: true
    },
    {
      id: 'm5',
      conversationId: '1',
      direction: 'INCOMING',
      type: 'TEXT',
      content: '¿Tienen disponibilidad para esta semana?',
      sentAt: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false
    }
  ]
}

const mockContactDetails: Record<string, ContactDetail> = {
  '1': {
    id: '1',
    name: 'Juan Pérez García',
    phone: '+52 55 1234 5678',
    email: 'juan.perez@empresa.com',
    avatar: '',
    status: 'ACTIVE',
    isVip: true,
    lastContact: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 3,
    firstName: 'Juan',
    lastName: 'Pérez García',
    company: 'Empresa ABC S.A. de C.V.',
    jobTitle: 'Director General',
    city: 'Ciudad de México',
    country: 'México',
    source: 'Referido',
    leadScore: 85,
    lifetimeValue: 15000,
    firstContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
    tags: [
      { id: 't1', name: 'Cliente VIP', color: 'yellow' },
      { id: 't2', name: 'Prospecto Caliente', color: 'red' },
      { id: 't3', name: 'Consultoría', color: 'blue' }
    ],
    notes: [
      {
        id: 'n1',
        content: 'Cliente muy interesado en servicios de consultoría. Empresa mediana con buen potencial de crecimiento.',
        isImportant: true,
        createdBy: 'agent1',
        createdByName: 'Ana Martínez',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'n2',
        content: 'Prefiere llamadas en horario matutino entre 9-11 AM.',
        isImportant: false,
        createdBy: 'agent1',
        createdByName: 'Ana Martínez',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ],
    lastConversation: {
      id: '1',
      lastMessageText: '¿Tienen disponibilidad para esta semana?',
      lastMessageAt: new Date(Date.now() - 5 * 60 * 1000),
      status: 'OPEN'
    }
  }
}

export default function InboxPage() {
  const { data: session } = useSession() || {}
  const [conversations] = useState<ConversationSummary2[]>(mockConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null)
  const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'ALL'>('ALL')

  // Simular la carga de detalles de conversación
  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find(c => c.id === selectedConversationId)
      const messages = mockMessages[selectedConversationId] || []
      const contact = mockContactDetails[conversation?.contact.id || '']

      if (conversation && contact) {
        setSelectedConversation({
          id: conversation.id,
          contact,
          status: conversation.status,
          priority: conversation.priority,
          assignedAgent: conversation.assignedAgent,
          messageCount: conversation.messageCount,
          unreadCount: conversation.unreadCount,
          messages,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(conversation.lastMessageAt || Date.now())
        })
        setSelectedContact(contact)
      }
    } else {
      setSelectedConversation(null)
      setSelectedContact(null)
    }
  }, [selectedConversationId, conversations])

  // Seleccionar automáticamente la primera conversación
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id)
    }
  }, [conversations, selectedConversationId])

  const handleSendMessage = (content: string, type: MessageType = 'TEXT') => {
    if (!selectedConversation) return
    
    const newMessage: MessageSummary = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation.id,
      direction: 'OUTGOING',
      type,
      content,
      sentBy: session?.user?.id || 'current-user',
      sentByName: session?.user?.name || 'Usuario',
      sentAt: new Date(),
      isRead: true
    }

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage]
    } : null)

    // TODO: Aquí se enviaría el mensaje a la API
    console.log('Enviando mensaje:', newMessage)
  }

  const handleUpdateStatus = (status: ConversationStatus) => {
    if (!selectedConversation) return
    
    setSelectedConversation(prev => prev ? {
      ...prev,
      status
    } : null)

    // TODO: Aquí se actualizaría el estado en la API
    console.log('Actualizando estado:', status)
  }

  const handleAssignAgent = (agentId: string) => {
    // TODO: Implementar asignación de agente
    console.log('Asignando agente:', agentId)
  }

  const handleAddNote = (content: string, isImportant: boolean = false) => {
    if (!selectedContact) return

    const newNote = {
      id: `n${Date.now()}`,
      content,
      isImportant,
      createdBy: session?.user?.id || 'current-user',
      createdByName: session?.user?.name || 'Usuario',
      createdAt: new Date()
    }

    setSelectedContact(prev => prev ? {
      ...prev,
      notes: [newNote, ...prev.notes]
    } : null)

    // TODO: Aquí se guardaría la nota en la API
    console.log('Agregando nota:', newNote)
  }

  const handleAddTag = (name: string, color?: string) => {
    if (!selectedContact) return

    const newTag = {
      id: `t${Date.now()}`,
      name,
      color: color || 'blue'
    }

    setSelectedContact(prev => prev ? {
      ...prev,
      tags: [...prev.tags, newTag]
    } : null)

    // TODO: Aquí se guardaría la etiqueta en la API
    console.log('Agregando etiqueta:', newTag)
  }

  const handleRemoveTag = (tagId: string) => {
    if (!selectedContact) return

    setSelectedContact(prev => prev ? {
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    } : null)

    // TODO: Aquí se eliminaría la etiqueta de la API
    console.log('Eliminando etiqueta:', tagId)
  }

  const handleUpdateContact = (updates: Partial<ContactDetail>) => {
    if (!selectedContact) return

    setSelectedContact(prev => prev ? {
      ...prev,
      ...updates
    } : null)

    // TODO: Aquí se actualizaría el contacto en la API
    console.log('Actualizando contacto:', updates)
  }

  return (
    <ProtectedRoute permissions={[Permission.VIEW_CRM_INBOX]}>
      <div className="flex h-screen bg-gray-50">
        {/* Panel izquierdo - Lista de chats */}
        <ChatListPanel
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Panel central - Conversación activa */}
        <ChatConversationPanel
          conversation={selectedConversation}
          onSendMessage={handleSendMessage}
          onUpdateStatus={handleUpdateStatus}
          onAssignAgent={handleAssignAgent}
        />

        {/* Panel derecho - Detalles del contacto */}
        <ContactDetailsPanel
          contact={selectedContact}
          onAddNote={handleAddNote}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onUpdateContact={handleUpdateContact}
        />
      </div>
    </ProtectedRoute>
  )
}
