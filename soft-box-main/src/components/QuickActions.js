import { supabase } from '../supabaseClient.js';

export class QuickActions {
  constructor() {
    this.isVisible = false;
    this.container = null;
  }

  render() {
    if (this.container) return this.container;

    this.container = document.createElement('div');
    this.container.id = 'quick-actions-panel';
    this.container.className = `
      fixed bottom-6 right-6 z-40 transition-all duration-300 ease-in-out
      ${this.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
    `;

    this.container.innerHTML = `
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Acciones Rápidas</h3>
          <button id="close-quick-actions" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <!-- Nueva Venta -->
          <button id="quick-nueva-venta" class="quick-action-btn bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span class="text-sm font-medium">Nueva Venta</span>
          </button>

          <!-- Nuevo Turno -->
          <button id="quick-nuevo-turno" class="quick-action-btn bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm font-medium">Nuevo Turno</span>
          </button>

          <!-- Nuevo Cliente -->
          <button id="quick-nuevo-cliente" class="quick-action-btn bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            <span class="text-sm font-medium">Nuevo Cliente</span>
          </button>

          <!-- Nueva Compra -->
          <button id="quick-nueva-compra" class="quick-action-btn bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span class="text-sm font-medium">Nueva Compra</span>
          </button>

          <!-- Ver Stock Bajo -->
          <button id="quick-stock-bajo" class="quick-action-btn bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="text-sm font-medium">Stock Bajo</span>
          </button>

          <!-- Reporte Diario -->
          <button id="quick-reporte" class="quick-action-btn bg-gradient-to-br from-gray-600 to-gray-800 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="text-sm font-medium">Reporte</span>
          </button>
        </div>

        <!-- Acciones Contextuales -->
        <div id="contextual-actions" class="mt-4 pt-4 border-t border-gray-200">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Acciones Contextuales</h4>
          <div id="contextual-actions-content" class="space-y-2">
            <!-- Se llenará dinámicamente -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // Botón de cerrar
    const closeBtn = this.container.querySelector('#close-quick-actions');
    closeBtn.addEventListener('click', () => this.hide());

    // Acciones rápidas
    const actions = {
      'quick-nueva-venta': () => this.navigateToSection('#ventas'),
      'quick-nuevo-turno': () => this.navigateToSection('#turnos'),
      'quick-nuevo-cliente': () => this.navigateToSection('#clientes'),
      'quick-nueva-compra': () => this.navigateToSection('#compras'),
      'quick-stock-bajo': () => this.showLowStockModal(),
      'quick-reporte': () => this.generateDailyReport()
    };

    Object.entries(actions).forEach(([id, action]) => {
      const btn = this.container.querySelector(`#${id}`);
      if (btn) {
        btn.addEventListener('click', action);
      }
    });
  }

  show() {
    this.isVisible = true;
    this.container.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
    this.container.classList.add('translate-y-0', 'opacity-100');
    this.loadContextualActions();
  }

  hide() {
    this.isVisible = false;
    this.container.classList.remove('translate-y-0', 'opacity-100');
    this.container.classList.add('translate-y-full', 'opacity-0', 'pointer-events-none');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  async loadContextualActions() {
    const contextualContainer = this.container.querySelector('#contextual-actions-content');
    
    // Cargar acciones basadas en el contexto actual
    const actions = await this.getContextualActions();
    
    if (actions.length === 0) {
      contextualContainer.innerHTML = `
        <p class="text-sm text-gray-500 text-center py-2">No hay acciones contextuales disponibles</p>
      `;
      return;
    }

    contextualContainer.innerHTML = actions.map(action => `
      <button class="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
        <div class="flex items-center gap-2">
          ${action.icon}
          <span>${action.label}</span>
        </div>
      </button>
    `).join('');

    // Bind events para acciones contextuales
    const buttons = contextualContainer.querySelectorAll('button');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', actions[index].action);
    });
  }

  async getContextualActions() {
    const actions = [];

    // Verificar turnos de hoy
    const hoy = new Date().toISOString().slice(0, 10);
    const { data: turnosHoy } = await supabase
      .from('turnos')
      .select('id, estado')
      .eq('fecha', hoy)
      .eq('estado', 'pendiente');

    if (turnosHoy && turnosHoy.length > 0) {
      actions.push({
        icon: '<svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        label: `Confirmar ${turnosHoy.length} turno(s) pendiente(s)`,
        action: () => this.navigateToSection('#turnos')
      });
    }

    // Verificar stock crítico
    const { data: stockCritico } = await supabase
      .from('productos')
      .select('id, nombre')
      .eq('stock', 0);

    if (stockCritico && stockCritico.length > 0) {
      actions.push({
        icon: '<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>',
        label: `${stockCritico.length} producto(s) sin stock`,
        action: () => this.navigateToSection('#inventario')
      });
    }

    // Verificar ventas pendientes de facturación
    const { data: ventasPendientes } = await supabase
      .from('ventas')
      .select('id')
      .is('factura_generada', false)
      .gte('created_at', hoy);

    if (ventasPendientes && ventasPendientes.length > 0) {
      actions.push({
        icon: '<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
        label: `Generar ${ventasPendientes.length} factura(s)`,
        action: () => this.navigateToSection('#ventas')
      });
    }

    return actions;
  }

  navigateToSection(hash) {
    const link = document.querySelector(`a[href="${hash}"]`);
    if (link) {
      link.click();
      this.hide();
    }
  }

  async showLowStockModal() {
    const { data: productos } = await supabase
      .from('productos')
      .select('nombre, stock, precio_calculado')
      .lt('stock', 5)
      .order('stock', { ascending: true });

    if (!productos || productos.length === 0) {
      this.showNotification('No hay productos con stock bajo', 'success');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Productos con Stock Bajo</h3>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="space-y-2">
          ${productos.map(p => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-medium text-gray-800">${p.nombre}</p>
                <p class="text-sm text-gray-500">Stock: ${p.stock} | Precio: $${p.precio_calculado}</p>
              </div>
              <button class="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                Comprar
              </button>
            </div>
          `).join('')}
        </div>
        <div class="mt-4 flex gap-2">
          <button class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" onclick="this.closest('.fixed').remove()">
            Cerrar
          </button>
          <button class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onclick="this.closest('.fixed').remove(); document.querySelector('a[href=\\'#compras\\']').click()">
            Ir a Compras
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.hide();
  }

  async generateDailyReport() {
    const hoy = new Date().toISOString().slice(0, 10);
    
    // Obtener datos del día
    const [ventas, compras, turnos] = await Promise.all([
      supabase.from('ventas').select('total').gte('created_at', hoy),
      supabase.from('compras').select('total').gte('created_at', hoy),
      supabase.from('turnos').select('estado').eq('fecha', hoy)
    ]);

    const totalVentas = ventas.data?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
    const totalCompras = compras.data?.reduce((sum, c) => sum + (c.total || 0), 0) || 0;
    const turnosCompletados = turnos.data?.filter(t => t.estado === 'realizado').length || 0;
    const turnosPendientes = turnos.data?.filter(t => t.estado === 'pendiente').length || 0;

    const reporte = `
      📊 REPORTE DIARIO - ${new Date().toLocaleDateString('es-AR')}
      
      💰 Ventas: $${totalVentas.toFixed(2)}
      🛒 Compras: $${totalCompras.toFixed(2)}
      💵 Ganancia: $${(totalVentas - totalCompras).toFixed(2)}
      
      📅 Turnos:
        ✅ Completados: ${turnosCompletados}
        ⏳ Pendientes: ${turnosPendientes}
    `;

    // Crear modal con el reporte
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Reporte Diario</h3>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-line">
          ${reporte}
        </div>
        <div class="mt-4 flex gap-2">
          <button class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" onclick="this.closest('.fixed').remove()">
            Cerrar
          </button>
          <button class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" onclick="navigator.clipboard.writeText(\`${reporte}\`); this.textContent='Copiado!'; setTimeout(() => this.textContent='Copiar', 2000)">
            Copiar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.hide();
  }

  showNotification(message, type = 'info') {
    // Usar el sistema de notificaciones si está disponible
    if (window.notificationSystem) {
      window.notificationSystem.showNotification({
        type,
        title: 'Acción Rápida',
        message,
        duration: 3000
      });
    } else {
      // Fallback simple
      alert(message);
    }
  }
}

// Estilos de .quick-action-btn definidos en public/styles.css para compatibilidad sin build

export const quickActions = new QuickActions(); 