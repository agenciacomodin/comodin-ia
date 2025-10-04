
# ✅ QA Checklist - COMODÍN IA v2.0

**Fecha:** 4 de Octubre, 2025  
**Tester:** _______________  
**Entorno:** Producción

---

## 🔐 Autenticación

### Login
- [ ] Login con email/password funciona
- [ ] Login con Google OAuth funciona
- [ ] Mensajes de error apropiados para credenciales inválidas
- [ ] Redirección correcta después del login
- [ ] Session persiste después de refresh

### Registro
- [ ] Formulario de registro completo
- [ ] Validación de campos funciona
- [ ] Email de confirmación se envía
- [ ] Usuario creado en base de datos
- [ ] Organización asociada correctamente

### Recuperación de Contraseña
- [ ] Formulario "Olvidé mi contraseña" funciona
- [ ] Email con link de reseteo se envía
- [ ] Link de reseteo es válido
- [ ] Nueva contraseña se guarda correctamente

---

## 👥 Roles y Permisos

### SUPER_ADMIN
- [ ] Puede ver panel de administración
- [ ] Puede crear organizaciones
- [ ] Puede gestionar todos los usuarios
- [ ] Puede ver métricas del sistema

### PROPIETARIO
- [ ] Puede ver dashboard de organización
- [ ] Puede invitar agentes
- [ ] Puede gestionar suscripción
- [ ] Puede ver reportes

### DISTRIBUIDOR
- [ ] Puede crear organizaciones hijas
- [ ] Puede ver su árbol de distribución
- [ ] Puede ver comisiones
- [ ] Acceso limitado a configuración

### AGENTE
- [ ] Puede ver inbox
- [ ] Puede responder mensajes
- [ ] Puede agregar notas/tags
- [ ] NO puede ver billing
- [ ] NO puede invitar usuarios

---

## 💬 CRM - Inbox

### Lista de Conversaciones
- [ ] Conversaciones se cargan desde API
- [ ] Búsqueda funciona correctamente
- [ ] Filtros por estado funcionan
- [ ] Badge de mensajes no leídos
- [ ] Scroll infinito (si aplica)

### Panel de Conversación
- [ ] Mensajes se cargan correctamente
- [ ] Historial completo visible
- [ ] Timestamp correcto
- [ ] Diferencia entre INCOMING/OUTGOING
- [ ] Scroll automático a último mensaje

### Envío de Mensajes
- [ ] Textarea funciona
- [ ] Botón enviar activo/desactivo apropiadamente
- [ ] Mensaje se envía correctamente
- [ ] Mensaje aparece inmediatamente en UI
- [ ] Confirmación de envío

### Panel de Detalles de Contacto
- [ ] Información del contacto visible
- [ ] Tags se pueden agregar
- [ ] Tags se pueden eliminar
- [ ] Notas se pueden agregar
- [ ] Notas importantes destacadas
- [ ] Información se actualiza en tiempo real

---

## 📊 Dashboard

### Estadísticas
- [ ] Conversaciones activas muestra número correcto
- [ ] Miembros del equipo cuenta correcta
- [ ] Tiempo de respuesta promedio calculado
- [ ] Gráficos cargan correctamente

### Conversaciones Recientes
- [ ] Lista de conversaciones recientes
- [ ] Información de agente asignado
- [ ] Tiempo relativo correcto ("Hace 5 min")
- [ ] Estados de conversación correctos

### Estado del Sistema
- [ ] Estado de WhatsApp Business
- [ ] Estado del Asistente IA
- [ ] Reglas de automatización activas

---

## 📱 WhatsApp

### Conexión QR
- [ ] Botón generar QR funciona
- [ ] Código QR se muestra correctamente
- [ ] Polling de estado funciona
- [ ] Transición WAITING → SCANNING → SUCCESS
- [ ] Manejo de código expirado
- [ ] Canal creado después de conexión exitosa

### Envío de Mensajes
- [ ] Mensajes de texto se envían
- [ ] Mensajes con emojis funcionan
- [ ] Manejo de errores de envío
- [ ] Estado de entrega visible

### Recepción de Mensajes
- [ ] Webhooks reciben mensajes
- [ ] Mensajes aparecen en inbox
- [ ] Contacto se crea automáticamente si no existe
- [ ] Conversación se actualiza

---

## 🎯 Campañas

### Creación de Campañas
- [ ] Formulario completo funciona
- [ ] Selección de canal
- [ ] Selección de tags
- [ ] Configuración de mensaje
- [ ] Programación de envío

### Ejecución de Campañas
- [ ] Campaña se ejecuta según programación
- [ ] Mensajes se envían correctamente
- [ ] Límite de mensajes por día se respeta
- [ ] Duración de campaña se respeta

### Estadísticas de Campañas
- [ ] Mensajes enviados contados
- [ ] Tasa de apertura visible
- [ ] Tasa de respuesta calculada
- [ ] Exportación de resultados

---

## 💳 Facturación

### Suscripciones
- [ ] Plan actual visible
- [ ] Límites de uso mostrados
- [ ] Botón "Actualizar Plan" funciona
- [ ] Página de pricing accesible

### Pagos
- [ ] Integración con Stripe funciona
- [ ] Integración con MercadoPago funciona
- [ ] Webhooks procesan pagos
- [ ] Suscripción se actualiza después de pago

### Billetera IA
- [ ] Saldo actual visible
- [ ] Historial de transacciones
- [ ] Recarga de saldo funciona
- [ ] Costo por mensaje calculado correctamente

---

## 🔗 Integraciones

### Shopify
- [ ] Conexión se establece
- [ ] Webhooks configurados
- [ ] Productos sincronizados
- [ ] Órdenes importadas

### WooCommerce
- [ ] Plugin instalado
- [ ] API conectada
- [ ] Productos importados
- [ ] Clientes sincronizados

### Mailchimp
- [ ] Autenticación OAuth funciona
- [ ] Listas sincronizadas
- [ ] Contactos importados

### Google Analytics
- [ ] Measurement ID configurado
- [ ] Eventos tracked
- [ ] Dashboard de analytics funciona

### Stripe
- [ ] Webhooks configurados
- [ ] Pagos procesados
- [ ] Clientes sincronizados

---

## 🤖 IA - Knowledge Base

### Creación de Agentes
- [ ] Formulario de creación funciona
- [ ] Proveedor de IA seleccionable
- [ ] Configuración guardada

### Gestión de Documentos
- [ ] Upload de archivos funciona
- [ ] Procesamiento de documentos
- [ ] Indexación para búsqueda
- [ ] Eliminación de documentos

### Testing de IA
- [ ] Chat de prueba funciona
- [ ] Respuestas basadas en knowledge base
- [ ] Historial de conversación
- [ ] Feedback de respuestas

---

## 📈 Analytics y Reportes

### Dashboard de Analytics
- [ ] Métricas generales visibles
- [ ] Gráficos interactivos
- [ ] Filtros por fecha funcionan
- [ ] Exportación a CSV/PDF

### Reportes Personalizados
- [ ] Crear nuevo reporte
- [ ] Seleccionar métricas
- [ ] Guardar reporte
- [ ] Compartir reporte

---

## ⚙️ Configuración

### Organización
- [ ] Datos de organización editables
- [ ] Logo se puede subir
- [ ] Información guardada correctamente

### Usuarios
- [ ] Lista de usuarios del equipo
- [ ] Invitar nuevo usuario
- [ ] Editar roles
- [ ] Desactivar usuarios

### Canales
- [ ] Lista de canales WhatsApp
- [ ] Agregar nuevo canal
- [ ] Configurar canal
- [ ] Eliminar canal

### Respuestas Rápidas
- [ ] Crear respuesta rápida
- [ ] Editar respuesta
- [ ] Eliminar respuesta
- [ ] Usar respuesta en conversación

---

## 📱 Responsive Design

### Desktop (>1024px)
- [ ] Layout correcto
- [ ] Todos los paneles visibles
- [ ] Navegación funciona
- [ ] No hay overflow horizontal

### Tablet (768px-1024px)
- [ ] Layout adaptado
- [ ] Paneles colapsables
- [ ] Menú móvil funciona

### Mobile (<768px)
- [ ] Layout optimizado para móvil
- [ ] Navegación por hamburger menu
- [ ] Touch gestures funcionan
- [ ] Campos de formulario apropiados

---

## 🔍 Búsqueda Global

### Funcionalidad
- [ ] Barra de búsqueda visible
- [ ] Búsqueda por contactos funciona
- [ ] Búsqueda por mensajes funciona
- [ ] Resultados relevantes
- [ ] Link a resultado funciona

---

## 🔔 Notificaciones

### En App
- [ ] Centro de notificaciones funciona
- [ ] Notificaciones se marcan como leídas
- [ ] Badge de contador actualizado

### Push Notifications (si aplica)
- [ ] Permiso solicitado
- [ ] Notificaciones se envían
- [ ] Click en notificación abre app

---

## 🐛 Manejo de Errores

### Errores de Red
- [ ] Loading states visibles
- [ ] Mensaje de error apropiado
- [ ] Opción de reintentar

### Errores 404
- [ ] Página 404 personalizada
- [ ] Link de regreso a home

### Errores 500
- [ ] Página de error genérica
- [ ] Mensaje amigable
- [ ] Código de error visible

---

## 🚀 Performance

### Tiempos de Carga
- [ ] Home page < 2s
- [ ] Dashboard < 3s
- [ ] Inbox < 2s
- [ ] Imágenes optimizadas

### Optimizaciones
- [ ] Lazy loading implementado
- [ ] Code splitting funciona
- [ ] Cache de API implementado

---

## 🔒 Seguridad

### Autenticación
- [ ] Sesiones expiran apropiadamente
- [ ] Tokens refrescados automáticamente
- [ ] Logout funciona correctamente

### Autorización
- [ ] Rutas protegidas por permisos
- [ ] API endpoints validados
- [ ] CSRF protection habilitado

### Datos Sensibles
- [ ] Passwords hasheados
- [ ] API keys no expuestas en cliente
- [ ] HTTPS en producción

---

## ✅ Checklist Final

- [ ] Todos los tests de QA pasados
- [ ] No hay datos mock en producción
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Logs de errores monitoreados
- [ ] Backup de base de datos configurado
- [ ] Documentación actualizada
- [ ] Release notes completados

---

**Aprobado por:** _______________  
**Fecha:** _______________  
**Firma:** _______________

---

> 🎯 **Todos los checks deben estar ✅ antes de aprobar para producción**
