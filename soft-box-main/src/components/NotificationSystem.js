import { supabase } from '../supabaseClient.js';

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Crear contenedor de notificaciones si no existe
    this.createNotificationContainer();
    
    // Configurar intervalos de verificación
    this.setupIntervals();
    
    // Cargar notificaciones iniciales
    await this.loadNotifications();
    
    this.isInitialized = true;
  }

  createNotificationContainer() {
    if (document.getElementById('notification-container')) return;

    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
    document.body.appendChild(container);
  }

  setupIntervals() {
    // Verificar stock bajo cada 30 minutos
    setInterval(() => this.checkLowStock(), 30 * 60 * 1000);
    
    // Verificar turnos próximos cada 15 minutos
    setInterval(() => this.checkUpcomingAppointments(), 15 * 60 * 1000);
    
    // Verificar recordatorios cada hora
    setInterval(() => this.checkReminders(), 60 * 60 * 1000);
  }

  async loadNotifications() {
    await this.checkLowStock();
    await this.checkUpcomingAppointments();
    await this.checkReminders();
  }

  async checkLowStock() {
    const { data: productos } = await supabase
      .from('productos')
      .select('nombre, stock')
      .lt('stock', 5);

    if (productos && productos.length > 0) {
      this.showNotification({
        type: 'warning',
        title: 'Stock Bajo',
        message: `${productos.length} producto(s) con stock bajo`,
        action: () => this.navigateToInventory(),
        duration: 10000
      });
    }
  }

  async checkUpcomingAppointments() {
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const { data: turnos } = await supabase
      .from('turnos')
      .select('fecha, clientes(nombre), vehiculos(patente)')
      .gte('fecha', hoy.toISOString().slice(0, 10))
      .lte('fecha', mañana.toISOString().slice(0, 10))
      .eq('estado', 'confirmado');

    if (turnos && turnos.length > 0) {
      this.showNotification({
        type: 'info',
        title: 'Turnos Próximos',
        message: `${turnos.length} turno(s) confirmado(s) para hoy/mañana`,
        action: () => this.navigateToAppointments(),
        duration: 8000
      });
    }
  }

  async checkReminders() {
    // Verificar recordatorios personalizados
    const { data: recordatorios } = await supabase
      .from('recordatorios')
      .select('*')
      .eq('fecha', new Date().toISOString().slice(0, 10))
      .eq('completado', false);

    if (recordatorios && recordatorios.length > 0) {
      recordatorios.forEach(recordatorio => {
        this.showNotification({
          type: 'reminder',
          title: 'Recordatorio',
          message: recordatorio.descripcion,
          action: () => this.markReminderComplete(recordatorio.id),
          duration: 15000
        });
      });
    }
  }

  showNotification({ type, title, message, action, duration = 5000 }) {
    const notification = document.createElement('div');
    notification.className = `
      transform transition-all duration-300 ease-out translate-x-full
      bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm
      ${this.getTypeStyles(type)}
    `;

    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${this.getTypeIcon(type)}
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">${title}</p>
          <p class="text-sm text-gray-500 mt-1">${message}</p>
          ${action ? `
            <div class="mt-3 flex space-x-2">
              <button class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                Ver más
              </button>
              <button class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                Descartar
              </button>
            </div>
          ` : ''}
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Configurar eventos
    const closeBtn = notification.querySelector('button');
    const actionBtn = notification.querySelector('button:first-of-type');
    const dismissBtn = notification.querySelector('button:nth-of-type(2)');

    closeBtn.addEventListener('click', () => this.removeNotification(notification));
    dismissBtn?.addEventListener('click', () => this.removeNotification(notification));
    actionBtn?.addEventListener('click', () => {
      if (action) action();
      this.removeNotification(notification);
    });

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  removeNotification(notification) {
    notification.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getTypeStyles(type) {
    const styles = {
      success: 'border-green-500',
      warning: 'border-yellow-500',
      error: 'border-red-500',
      info: 'border-blue-500',
      reminder: 'border-purple-500'
    };
    return styles[type] || styles.info;
  }

  getTypeIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>`,
      warning: `<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>`,
      error: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      info: `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      reminder: `<svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`
    };
    return icons[type] || icons.info;
  }

  navigateToInventory() {
    const inventoryLink = document.querySelector('a[href="#inventario"]');
    if (inventoryLink) inventoryLink.click();
  }

  navigateToAppointments() {
    const appointmentsLink = document.querySelector('a[href="#turnos"]');
    if (appointmentsLink) appointmentsLink.click();
  }

  async markReminderComplete(id) {
    await supabase
      .from('recordatorios')
      .update({ completado: true })
      .eq('id', id);
  }
}

export const notificationSystem = new NotificationSystem(); 