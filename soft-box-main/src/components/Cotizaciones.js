import { supabase } from '../supabaseClient.js';

// Estado global del módulo de cotizaciones
const cotizacionesState = {
  cotizaciones: [],
  clientes: [],
  productos: [],
  cotizacionActual: null,
  detalles: [],
  filtros: {
    busqueda: '',
    estado: '',
    tipo: '',
    fechaDesde: '',
    fechaHasta: '',
    cliente: ''
  },
  paginacion: {
    pagina: 1,
    porPagina: 20,
    total: 0
  },
  vista: 'lista', // 'lista' | 'grid' | 'calendario'
  editando: null,
  productosSeleccionados: [],
  calendarioFecha: new Date()
};

// Utilidades
const utils = {
  formatCurrency: (amount) => new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS' 
  }).format(amount || 0),
  
  formatDate: (date) => new Date(date).toLocaleDateString('es-AR'),
  
  formatDateTime: (date) => new Date(date).toLocaleString('es-AR'),
  
  generateNumeroCotizacion: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getHours().toString().padStart(2, '0') + 
                  now.getMinutes().toString().padStart(2, '0') +
                  now.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `COT-${year}${month}${day}-${time}-${random}`;
  },

  showNotification: (message, type = 'success') => {
    try {
      if (window.notificationSystem && typeof window.notificationSystem.show === 'function') {
        window.notificationSystem.show(message, type);
      } else {
        console.log('Sistema de notificaciones no disponible, usando fallback');
        // Crear notificación simple si no existe el sistema
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[100] transition-all duration-300 ${
          type === 'success' ? 'bg-green-500 text-white' :
          type === 'error' ? 'bg-red-500 text-white' :
          type === 'warning' ? 'bg-yellow-500 text-black' :
          'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      }
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      // Último recurso - alert
      alert(`${type.toUpperCase()}: ${message}`);
    }
  },

  calcularVencimiento: (dias = 30) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  },

  getEstadoColor: (estado) => {
    const colores = {
      'borrador': 'bg-gray-100 text-gray-800',
      'enviada': 'bg-blue-100 text-blue-800',
      'aprobada': 'bg-green-100 text-green-800',
      'rechazada': 'bg-red-100 text-red-800',
      'vencida': 'bg-orange-100 text-orange-800',
      'convertida': 'bg-purple-100 text-purple-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  },

  getEstadoIcon: (estado) => {
    const iconos = {
      'borrador': '📝',
      'enviada': '📤',
      'aprobada': '✅',
      'rechazada': '❌',
      'vencida': '⏰',
      'convertida': '🔄'
    };
    return iconos[estado] || '📄';
  }
};

export async function renderCotizaciones(container, usuario_id) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Cotizaciones
                </h1>
                <p class="text-gray-600 text-lg">Gestión de cotizaciones y ventas por catálogo</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button id="nueva-cotizacion" class="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nueva Cotización
                <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
              
              <button id="nuevo-catalogo" class="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Venta Catálogo
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Cotizaciones</p>
                <p class="text-3xl font-bold text-purple-600" id="total-cotizaciones">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Pendientes</p>
                <p class="text-3xl font-bold text-blue-600" id="cotizaciones-pendientes">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Aprobadas</p>
                <p class="text-3xl font-bold text-green-600" id="cotizaciones-aprobadas">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Convertidas</p>
                <p class="text-3xl font-bold text-indigo-600" id="cotizaciones-convertidas">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Valor Total</p>
                <p class="text-2xl font-bold text-orange-600" id="valor-total-cotizaciones">$0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input type="text" id="buscar-cotizaciones" placeholder="Buscar por número, cliente..." 
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select id="filtro-estado" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm">
                <option value="">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
                <option value="vencida">Vencida</option>
                <option value="convertida">Convertida</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select id="filtro-tipo" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm">
                <option value="">Todos los tipos</option>
                <option value="cotizacion">Cotización</option>
                <option value="catalogo">Catálogo</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input type="date" id="filtro-fecha-desde" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input type="date" id="filtro-fecha-hasta" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm" />
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-3">
              <button id="busqueda-avanzada" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
                Búsqueda Avanzada
              </button>
              <button id="limpiar-filtros" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Limpiar Filtros
              </button>
              <span class="text-sm text-gray-500" id="resultados-info">Mostrando 0 cotizaciones</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button id="exportar-excel" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Excel
              </button>
              <button id="exportar-pdf" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Cotizaciones -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-800">Lista de Cotizaciones</h3>
              <div class="flex items-center gap-3">
                <div class="flex items-center bg-gray-100 rounded-lg p-1">
                  <button id="vista-lista" class="p-2 rounded-md bg-white shadow-sm text-purple-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                  </button>
                  <button id="vista-grid" class="p-2 rounded-md text-gray-500 hover:text-purple-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                  </button>
                  <button id="vista-calendario" class="p-2 rounded-md text-gray-500 hover:text-purple-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div id="contenedor-cotizaciones" class="p-6">
            <!-- Se llena dinámicamente -->
          </div>
          
          <!-- Paginación -->
          <div id="paginacion-cotizaciones" class="px-6 py-4 border-t border-gray-200">
            <!-- Se llena dinámicamente -->
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Nueva/Editar Cotización -->
    <div id="modal-cotizacion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-800" id="modal-cotizacion-titulo">Nueva Cotización</h3>
            <button id="cerrar-modal-cotizacion" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6" id="contenido-modal-cotizacion">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>
  `;

  // API functions
  const api = {
    async cargarCotizaciones() {
      try {
        let query = supabase
          .from('cotizaciones')
          .select(`
            *,
            clientes(nombre, telefono, email),
            profiles(nombre, apellido)
          `)
          .order('created_at', { ascending: false });

        // Aplicar filtros
        if (cotizacionesState.filtros.busqueda) {
          query = query.or(`numero_cotizacion.ilike.%${cotizacionesState.filtros.busqueda}%,clientes.nombre.ilike.%${cotizacionesState.filtros.busqueda}%`);
        }
        
        if (cotizacionesState.filtros.estado) {
          query = query.eq('estado', cotizacionesState.filtros.estado);
        }
        
        if (cotizacionesState.filtros.tipo) {
          query = query.eq('tipo', cotizacionesState.filtros.tipo);
        }
        
        if (cotizacionesState.filtros.fechaDesde) {
          query = query.gte('fecha_emision', cotizacionesState.filtros.fechaDesde);
        }
        
        if (cotizacionesState.filtros.fechaHasta) {
          query = query.lte('fecha_emision', cotizacionesState.filtros.fechaHasta);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        cotizacionesState.cotizaciones = data || [];
        ui.actualizarListaCotizaciones();
        ui.actualizarEstadisticas();
        
      } catch (error) {
        console.error('Error cargando cotizaciones:', error);
        utils.showNotification('Error al cargar cotizaciones', 'error');
      }
    },

    async cargarClientes() {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nombre, telefono, email')
          .eq('activo', true)
          .order('nombre');
        
        if (error) throw error;
        cotizacionesState.clientes = data || [];
        
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    },

    async cargarProductos() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('nombre');
        
        if (error) throw error;
        cotizacionesState.productos = data || [];
        
      } catch (error) {
        console.error('Error cargando productos:', error);
      }
    },

    async guardarCotizacion(cotizacionData, detalles) {
      try {
        let result;
        
        if (cotizacionData.id) {
          // Actualizar cotización existente
          const { data, error } = await supabase
            .from('cotizaciones')
            .update(cotizacionData)
            .eq('id', cotizacionData.id)
            .select()
            .single();
          
          if (error) throw error;
          result = data;
          
          // Eliminar detalles anteriores
          await supabase
            .from('cotizacion_detalle')
            .delete()
            .eq('cotizacion_id', cotizacionData.id);
            
        } else {
          // Crear nueva cotización
          const { data, error } = await supabase
            .from('cotizaciones')
            .insert([cotizacionData])
            .select()
            .single();
          
          if (error) throw error;
          result = data;
        }

        // Insertar detalles - limpiar campos temporales
        const detallesConId = detalles.map(detalle => {
          const detalleClean = {
            cotizacion_id: result.id,
            producto_id: detalle.producto_id,
            descripcion: detalle.descripcion,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            descuento_item: detalle.descuento_item || 0,
            subtotal: detalle.subtotal,
            observaciones: detalle.observaciones,
            tiempo_entrega: detalle.tiempo_entrega,
            es_catalogo: detalle.es_catalogo || false
          };
          // Remover campos undefined o null
          return Object.fromEntries(Object.entries(detalleClean).filter(([_, v]) => v !== undefined && v !== null));
        });

        if (detallesConId.length > 0) {
          const { error: errorDetalles } = await supabase
            .from('cotizacion_detalle')
            .insert(detallesConId);

          if (errorDetalles) throw errorDetalles;
        }

        utils.showNotification('Cotización guardada exitosamente', 'success');
        return result;
        
      } catch (error) {
        console.error('Error guardando cotización:', error);
        
        // Manejo de errores específicos
        let mensaje = 'Error al guardar cotización';
        if (error.code === '23505') {
          mensaje = 'Ya existe una cotización con ese número. Generando nuevo número...';
          // Auto-regenerar número en caso de duplicado
          setTimeout(() => {
            document.getElementById('numero-cotizacion').value = utils.generateNumeroCotizacion();
          }, 1000);
        } else if (error.code === '23503') {
          mensaje = 'Error de referencia: verifique que el cliente exista';
        } else if (error.message.includes('violates check constraint')) {
          mensaje = 'Datos inválidos: verifique que todos los valores sean correctos';
        } else if (error.message) {
          mensaje = error.message;
        }
        
        utils.showNotification(mensaje, 'error');
        throw error;
      }
    },

    async cambiarEstadoCotizacion(id, nuevoEstado) {
      try {
        const { error } = await supabase
          .from('cotizaciones')
          .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
        
        utils.showNotification(`Estado cambiado a ${nuevoEstado}`, 'success');
        await this.cargarCotizaciones();
        
      } catch (error) {
        console.error('Error cambiando estado:', error);
        utils.showNotification('Error al cambiar estado', 'error');
      }
    },

    async eliminarCotizacion(id) {
      try {
        const { error } = await supabase
          .from('cotizaciones')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        utils.showNotification('Cotización eliminada', 'success');
        await this.cargarCotizaciones();
        
      } catch (error) {
        console.error('Error eliminando cotización:', error);
        utils.showNotification('Error al eliminar cotización', 'error');
      }
    },

    async convertirAVenta(cotizacionId) {
      try {
        // Obtener cotización con detalles
        const { data: cotizacion, error: errorCot } = await supabase
          .from('cotizaciones')
          .select(`
            *,
            cotizacion_detalle(*)
          `)
          .eq('id', cotizacionId)
          .single();

        if (errorCot) throw errorCot;

        // Crear venta
        const ventaData = {
          cliente_id: cotizacion.cliente_id,
          usuario_id: usuario_id,
          metodo_pago: cotizacion.metodo_pago || 'efectivo', // Usar el método seleccionado o efectivo por defecto
          total: cotizacion.total,
          descuento: cotizacion.descuento || 0,
          observaciones: `Convertida desde cotización ${cotizacion.numero_cotizacion}`
        };

        const { data: venta, error: errorVenta } = await supabase
          .from('ventas')
          .insert([ventaData])
          .select()
          .single();

        if (errorVenta) throw errorVenta;

        // Crear detalles de venta
        const detallesVenta = cotizacion.cotizacion_detalle
          .filter(d => d.producto_id) // Solo productos con stock
          .map(detalle => ({
            venta_id: venta.id,
            producto_id: detalle.producto_id,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            subtotal: detalle.subtotal
          }));

        if (detallesVenta.length > 0) {
          const { error: errorDetalles } = await supabase
            .from('venta_detalle')
            .insert(detallesVenta);

          if (errorDetalles) throw errorDetalles;

          // Actualizar stock
          for (const detalle of detallesVenta) {
            await supabase.rpc('actualizar_stock', {
              producto_id: detalle.producto_id,
              cantidad_vendida: detalle.cantidad
            });
          }
        }

        // Marcar cotización como convertida
        await supabase
          .from('cotizaciones')
          .update({ 
            estado: 'convertida', 
            venta_id: venta.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', cotizacionId);

        utils.showNotification('Cotización convertida a venta exitosamente', 'success');
        await this.cargarCotizaciones();
        
        return venta;
        
      } catch (error) {
        console.error('Error convirtiendo a venta:', error);
        utils.showNotification('Error al convertir a venta', 'error');
      }
    }
  };

  // UI functions
  const ui = {
    actualizarListaCotizaciones() {
      const container = document.getElementById('contenedor-cotizaciones');
      
      if (cotizacionesState.cotizaciones.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay cotizaciones</h3>
            <p class="text-gray-500 mb-4">Comienza creando tu primera cotización</p>
            <button onclick="document.getElementById('nueva-cotizacion').click()" 
              class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Nueva Cotización
            </button>
          </div>
        `;
        return;
      }

      if (cotizacionesState.vista === 'lista') {
        this.renderVistaLista(container);
      } else if (cotizacionesState.vista === 'grid') {
        this.renderVistaGrid(container);
      } else if (cotizacionesState.vista === 'calendario') {
        this.renderVistaCalendario(container);
      }
    },

    renderVistaLista(container) {
      container.innerHTML = `
        <div class="space-y-4">
          ${cotizacionesState.cotizaciones.map(cotizacion => `
            <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                    ${utils.getEstadoIcon(cotizacion.estado)}
                  </div>
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <h4 class="text-lg font-semibold text-gray-800">${cotizacion.numero_cotizacion}</h4>
                      <span class="px-2 py-1 rounded-full text-xs font-medium ${utils.getEstadoColor(cotizacion.estado)}">
                        ${cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
                      </span>
                      <span class="px-2 py-1 rounded-full text-xs font-medium ${cotizacion.tipo === 'catalogo' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                        ${cotizacion.tipo === 'catalogo' ? 'Catálogo' : 'Cotización'}
                      </span>
                    </div>
                    <p class="text-gray-600">${cotizacion.clientes?.nombre || 'Cliente no encontrado'}</p>
                    <div class="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>📅 ${utils.formatDate(cotizacion.fecha_emision)}</span>
                      <span>⏰ Vence: ${utils.formatDate(cotizacion.fecha_vencimiento)}</span>
                      <span>👤 ${cotizacion.profiles?.nombre || 'Usuario'}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="text-2xl font-bold text-purple-600">${utils.formatCurrency(cotizacion.total)}</div>
                    ${cotizacion.descuento > 0 ? `<div class="text-sm text-gray-500">Desc: ${cotizacion.descuento}%</div>` : ''}
                  </div>
                  
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onclick="mostrarCotizacion('${cotizacion.id}')" 
                      class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Ver">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button onclick="editarCotizacion('${cotizacion.id}')" 
                      class="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                      title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button onclick="imprimirCotizacion('${cotizacion.id}')" 
                      class="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Imprimir">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                      </svg>
                    </button>
                    <button onclick="duplicarCotizacion('${cotizacion.id}')" 
                      class="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      title="Duplicar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                    
                    <div class="relative">
                      <button onclick="toggleMenuEstado('${cotizacion.id}')" 
                        class="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Cambiar estado">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                      <div id="menu-estado-${cotizacion.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div class="py-1">
                          <button onclick="cambiarEstado('${cotizacion.id}', 'enviada')" 
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            📤 Marcar como Enviada
                          </button>
                          <button onclick="cambiarEstado('${cotizacion.id}', 'aprobada')" 
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            ✅ Marcar como Aprobada
                          </button>
                          <button onclick="cambiarEstado('${cotizacion.id}', 'rechazada')" 
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            ❌ Marcar como Rechazada
                          </button>
                          ${cotizacion.estado === 'aprobada' ? `
                            <hr class="my-1">
                            <button onclick="convertirAVenta('${cotizacion.id}')" 
                              class="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                              🔄 Convertir a Venta
                            </button>
                          ` : ''}
                          <hr class="my-1">
                          <button onclick="eliminarCotizacion('${cotizacion.id}')" 
                            class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    renderVistaGrid(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${cotizacionesState.cotizaciones.map(cotizacion => `
            <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">${utils.getEstadoIcon(cotizacion.estado)}</span>
                  <div>
                    <h4 class="font-semibold text-gray-800">${cotizacion.numero_cotizacion}</h4>
                    <span class="text-xs ${utils.getEstadoColor(cotizacion.estado)} px-2 py-1 rounded-full">
                      ${cotizacion.estado}
                    </span>
                  </div>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-medium ${cotizacion.tipo === 'catalogo' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                  ${cotizacion.tipo === 'catalogo' ? 'Catálogo' : 'Cotización'}
                </span>
              </div>
              
              <div class="mb-4">
                <h5 class="font-medium text-gray-800">${cotizacion.clientes?.nombre || 'Cliente no encontrado'}</h5>
                <div class="text-sm text-gray-500 space-y-1 mt-2">
                  <div>📅 ${utils.formatDate(cotizacion.fecha_emision)}</div>
                  <div>⏰ Vence: ${utils.formatDate(cotizacion.fecha_vencimiento)}</div>
                </div>
              </div>
              
              <div class="border-t border-gray-200 pt-4 mb-4">
                <div class="text-right">
                  <div class="text-xl font-bold text-purple-600">${utils.formatCurrency(cotizacion.total)}</div>
                  ${cotizacion.descuento > 0 ? `<div class="text-sm text-gray-500">Desc: ${cotizacion.descuento}%</div>` : ''}
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2">
                <button onclick="mostrarCotizacion('${cotizacion.id}')" 
                  class="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                  Ver
                </button>
                <button onclick="editarCotizacion('${cotizacion.id}')" 
                  class="flex-1 bg-amber-100 text-amber-600 px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors text-sm">
                  Editar
                </button>
                <button onclick="imprimirCotizacion('${cotizacion.id}')" 
                  class="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm">
                  Imprimir
                </button>
                <button onclick="duplicarCotizacion('${cotizacion.id}')" 
                  class="flex-1 bg-purple-100 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm">
                  Duplicar
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    renderVistaCalendario(container) {
      const fecha = cotizacionesState.calendarioFecha;
      const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      const diasEnMes = ultimoDia.getDate();
      const primerDiaSemana = primerDia.getDay();
      
      // Agrupar cotizaciones por fecha
      const cotizacionesPorFecha = {};
      cotizacionesState.cotizaciones.forEach(cot => {
        const fechaCot = new Date(cot.fecha_emision).toDateString();
        if (!cotizacionesPorFecha[fechaCot]) {
          cotizacionesPorFecha[fechaCot] = [];
        }
        cotizacionesPorFecha[fechaCot].push(cot);
      });

      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      container.innerHTML = `
        <div class="space-y-6">
          <!-- Header del calendario -->
          <div class="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl">
            <button onclick="cambiarMesCalendario(-1)" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 class="text-2xl font-bold">${meses[fecha.getMonth()]} ${fecha.getFullYear()}</h2>
            <button onclick="cambiarMesCalendario(1)" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <!-- Días de la semana -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            ${['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(dia => `
              <div class="p-3 text-center text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">
                ${dia}
              </div>
            `).join('')}
          </div>

          <!-- Días del mes -->
          <div class="grid grid-cols-7 gap-1">
            ${Array.from({length: primerDiaSemana}, () => `
              <div class="h-24 bg-gray-50 rounded-lg"></div>
            `).join('')}
            
            ${Array.from({length: diasEnMes}, (_, i) => {
              const dia = i + 1;
              const fechaDia = new Date(fecha.getFullYear(), fecha.getMonth(), dia);
              const fechaStr = fechaDia.toDateString();
              const cotizacionesDelDia = cotizacionesPorFecha[fechaStr] || [];
              const esHoy = fechaDia.toDateString() === new Date().toDateString();
              
              return `
                <div class="h-24 bg-white border border-gray-200 rounded-lg p-1 ${esHoy ? 'ring-2 ring-purple-500' : ''}">
                  <div class="text-sm font-medium text-gray-700 mb-1 ${esHoy ? 'text-purple-600' : ''}">${dia}</div>
                  <div class="space-y-1">
                    ${cotizacionesDelDia.slice(0, 2).map(cot => `
                      <div onclick="mostrarCotizacion('${cot.id}')" 
                        class="text-xs p-1 rounded cursor-pointer ${utils.getEstadoColor(cot.estado)} truncate"
                        title="${cot.numero_cotizacion} - ${cot.clientes?.nombre}">
                        ${cot.numero_cotizacion}
                      </div>
                    `).join('')}
                    ${cotizacionesDelDia.length > 2 ? `
                      <div class="text-xs text-gray-500">+${cotizacionesDelDia.length - 2} más</div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Leyenda -->
          <div class="bg-white rounded-xl p-4 border border-gray-200">
            <h3 class="font-medium text-gray-800 mb-3">Leyenda de Estados</h3>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-yellow-200 rounded"></div>
                <span class="text-sm">Borrador</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-200 rounded"></div>
                <span class="text-sm">Enviada</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-200 rounded"></div>
                <span class="text-sm">Aprobada</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-red-200 rounded"></div>
                <span class="text-sm">Rechazada</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-gray-200 rounded"></div>
                <span class="text-sm">Vencida</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-indigo-200 rounded"></div>
                <span class="text-sm">Convertida</span>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    actualizarEstadisticas() {
      const total = cotizacionesState.cotizaciones.length;
      const pendientes = cotizacionesState.cotizaciones.filter(c => c.estado === 'enviada').length;
      const aprobadas = cotizacionesState.cotizaciones.filter(c => c.estado === 'aprobada').length;
      const convertidas = cotizacionesState.cotizaciones.filter(c => c.estado === 'convertida').length;
      const valorTotal = cotizacionesState.cotizaciones.reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);

      document.getElementById('total-cotizaciones').textContent = total;
      document.getElementById('cotizaciones-pendientes').textContent = pendientes;
      document.getElementById('cotizaciones-aprobadas').textContent = aprobadas;
      document.getElementById('cotizaciones-convertidas').textContent = convertidas;
      document.getElementById('valor-total-cotizaciones').textContent = utils.formatCurrency(valorTotal);
      
      document.getElementById('resultados-info').textContent = `Mostrando ${total} cotizaciones`;
    },

    mostrarModalCotizacion(tipo = 'cotizacion', cotizacion = null) {
      const modal = document.getElementById('modal-cotizacion');
      const titulo = document.getElementById('modal-cotizacion-titulo');
      const contenido = document.getElementById('contenido-modal-cotizacion');
      
      titulo.textContent = cotizacion ? 'Editar Cotización' : 
                         (tipo === 'catalogo' ? 'Nueva Venta por Catálogo' : 'Nueva Cotización');
      
      contenido.innerHTML = this.renderFormularioCotizacion(tipo, cotizacion);
      modal.classList.remove('hidden');
      
      // Inicializar formulario
      this.inicializarFormularioCotizacion(tipo, cotizacion);
    },

    renderFormularioCotizacion(tipo, cotizacion) {
      return `
        <form id="form-cotizacion" class="space-y-6">
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Número</label>
              <input type="text" id="numero-cotizacion" value="${cotizacion?.numero_cotizacion || utils.generateNumeroCotizacion()}" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" readonly />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select id="cliente-cotizacion" required 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Seleccionar cliente...</option>
                ${cotizacionesState.clientes.map(cliente => `
                  <option value="${cliente.id}" ${cotizacion?.cliente_id === cliente.id ? 'selected' : ''}>
                    ${cliente.nombre}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Emisión</label>
              <input type="date" id="fecha-emision" value="${cotizacion?.fecha_emision || new Date().toISOString().split('T')[0]}" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento</label>
              <input type="date" id="fecha-vencimiento" value="${cotizacion?.fecha_vencimiento || utils.calcularVencimiento()}" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Validez (días)</label>
              <input type="number" id="validez-oferta" value="${cotizacion?.validez_oferta || 30}" min="1" max="365" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo de Entrega</label>
              <input type="text" id="tiempo-entrega" value="${cotizacion?.tiempo_entrega || ''}" placeholder="Ej: 5-7 días hábiles" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago (si se convierte a venta)</label>
              <select id="metodo-pago-cotizacion" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="efectivo" ${cotizacion?.metodo_pago === 'efectivo' ? 'selected' : ''}>Efectivo</option>
                <option value="crédito" ${cotizacion?.metodo_pago === 'crédito' ? 'selected' : ''}>Tarjeta de Crédito</option>
                <option value="débito" ${cotizacion?.metodo_pago === 'débito' ? 'selected' : ''}>Tarjeta de Débito</option>
                <option value="cheque" ${cotizacion?.metodo_pago === 'cheque' ? 'selected' : ''}>Cheque</option>
              </select>
            </div>
          </div>
          
          <!-- Observaciones y Condiciones -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea id="observaciones" rows="3" placeholder="Observaciones adicionales..." 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">${cotizacion?.observaciones || ''}</textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Condiciones de Pago</label>
              <textarea id="condiciones-pago" rows="3" placeholder="Condiciones de pago..." 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">${cotizacion?.condiciones_pago || ''}</textarea>
            </div>
          </div>
          
          <!-- Productos -->
          <div class="border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-800">Productos/Servicios</h4>
              <button type="button" id="agregar-producto-cotizacion" 
                class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Agregar ${tipo === 'catalogo' ? 'Servicio' : 'Producto'}
              </button>
            </div>
            
            <div id="lista-productos-cotizacion" class="space-y-3">
              <!-- Se llena dinámicamente -->
            </div>
          </div>
          
          <!-- Totales -->
          <div class="bg-gray-50 rounded-xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                <div class="text-xl font-bold text-gray-800" id="subtotal-cotizacion">$0.00</div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                <input type="number" id="descuento-cotizacion" value="${cotizacion?.descuento || 0}" min="0" max="100" step="0.1" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Impuestos</label>
                <input type="number" id="impuestos-cotizacion" value="${cotizacion?.impuestos || 0}" min="0" step="0.01" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Total</label>
                <div class="text-2xl font-bold text-purple-600" id="total-cotizacion">$0.00</div>
              </div>
            </div>
          </div>
          
          <!-- Botones -->
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button type="button" id="cancelar-cotizacion" 
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="button" id="guardar-borrador" 
              class="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors">
              Guardar Borrador
            </button>
            <button type="submit" 
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300">
              ${cotizacion ? 'Actualizar' : 'Crear'} Cotización
            </button>
          </div>
        </form>
      `;
    },

    inicializarFormularioCotizacion(tipo, cotizacion) {
      cotizacionesState.detalles = cotizacion ? [] : []; // Se cargarán si es edición
      cotizacionesState.cotizacionActual = cotizacion;
      
      // Event listeners
      document.getElementById('agregar-producto-cotizacion').addEventListener('click', () => {
        this.mostrarModalAgregarProducto(tipo);
      });
      
      document.getElementById('descuento-cotizacion').addEventListener('input', () => {
        this.calcularTotales();
      });
      
      document.getElementById('impuestos-cotizacion').addEventListener('input', () => {
        this.calcularTotales();
      });
      
      document.getElementById('form-cotizacion').addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardarCotizacion(tipo);
      });
      
      document.getElementById('guardar-borrador').addEventListener('click', () => {
        this.guardarCotizacion(tipo, 'borrador');
      });
      
      document.getElementById('cancelar-cotizacion').addEventListener('click', () => {
        document.getElementById('modal-cotizacion').classList.add('hidden');
      });
      
      // Cargar detalles si es edición
      if (cotizacion) {
        this.cargarDetallesCotizacion(cotizacion.id);
      }
      
      this.calcularTotales();
    },

    async cargarDetallesCotizacion(cotizacionId) {
      try {
        const { data, error } = await supabase
          .from('cotizacion_detalle')
          .select('*')
          .eq('cotizacion_id', cotizacionId);
        
        if (error) throw error;
        
        cotizacionesState.detalles = data || [];
        this.actualizarListaProductosCotizacion();
        this.calcularTotales();
        
      } catch (error) {
        console.error('Error cargando detalles:', error);
      }
    },

    mostrarModalAgregarProducto(tipo) {
      // Verificar si el modal ya existe y eliminarlo
      const existingModal = document.getElementById('modal-agregar-producto');
      if (existingModal) {
        existingModal.remove();
      }

      // Crear modal para agregar producto
      const modalHtml = `
        <div id="modal-agregar-producto" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">Agregar ${tipo === 'catalogo' ? 'Servicio' : 'Producto'}</h3>
                <button id="cerrar-header-producto" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="p-6">
              <div class="space-y-4">
                ${tipo === 'cotizacion' ? `
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                    <select id="producto-seleccionado" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Seleccionar producto...</option>
                      ${cotizacionesState.productos.map(producto => `
                        <option value="${producto.id}" data-precio="${producto.precio_calculado}">
                          ${producto.nombre} - ${utils.formatCurrency(producto.precio_calculado)}
                        </option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <input type="text" id="descripcion-producto" placeholder="Descripción del ${tipo === 'catalogo' ? 'servicio' : 'producto'}" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                    <input type="number" id="cantidad-producto" value="1" min="1" 
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                    <input type="number" id="precio-unitario-producto" step="0.01" min="0" 
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                    <input type="number" id="descuento-producto" value="0" min="0" max="100" 
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo Entrega</label>
                    <input type="text" id="tiempo-entrega-producto" placeholder="Ej: 2-3 días" 
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea id="observaciones-producto" rows="2" placeholder="Observaciones del producto..." 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-xl">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-700">Subtotal:</span>
                    <span class="text-xl font-bold text-purple-600" id="subtotal-producto">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" id="cancelar-producto" 
                class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button type="button" id="confirmar-producto" 
                class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300">
                Agregar
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      // Event listeners para el modal de producto
      const calcularSubtotalProducto = () => {
        const cantidad = parseFloat(document.getElementById('cantidad-producto').value) || 0;
        const precio = parseFloat(document.getElementById('precio-unitario-producto').value) || 0;
        const descuento = parseFloat(document.getElementById('descuento-producto').value) || 0;
        
        const subtotal = cantidad * precio * (1 - descuento / 100);
        document.getElementById('subtotal-producto').textContent = utils.formatCurrency(subtotal);
      };
      
      document.getElementById('cantidad-producto').addEventListener('input', calcularSubtotalProducto);
      document.getElementById('precio-unitario-producto').addEventListener('input', calcularSubtotalProducto);
      document.getElementById('descuento-producto').addEventListener('input', calcularSubtotalProducto);
      
      if (tipo === 'cotizacion') {
        document.getElementById('producto-seleccionado').addEventListener('change', (e) => {
          const option = e.target.selectedOptions[0];
          if (option && option.dataset.precio) {
            document.getElementById('precio-unitario-producto').value = option.dataset.precio;
            document.getElementById('descripcion-producto').value = option.textContent.split(' - ')[0];
            calcularSubtotalProducto();
          }
        });
      }
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';

      // Cerrar modal
      const cerrarModalProducto = () => {
        const modal = document.getElementById('modal-agregar-producto');
        if (modal) {
          modal.remove();
          // Restaurar scroll del body
          document.body.style.overflow = '';
        }
      };

      document.getElementById('cancelar-producto').addEventListener('click', cerrarModalProducto);
      document.getElementById('cerrar-header-producto').addEventListener('click', cerrarModalProducto);
      
      document.getElementById('confirmar-producto').addEventListener('click', () => {
        this.agregarProductoACotizacion(tipo);
      });

      // Cerrar con click fuera del modal
      document.getElementById('modal-agregar-producto').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          cerrarModalProducto();
        }
      });

      // Cerrar con Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          cerrarModalProducto();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      // Enfocar el primer campo
      setTimeout(() => {
        const firstInput = tipo === 'cotizacion' ? 
          document.getElementById('producto-seleccionado') : 
          document.getElementById('descripcion-producto');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    },

    agregarProductoACotizacion(tipo) {
      const productoId = tipo === 'cotizacion' ? document.getElementById('producto-seleccionado').value : null;
      const descripcion = document.getElementById('descripcion-producto').value;
      const cantidad = parseFloat(document.getElementById('cantidad-producto').value) || 0;
      const precioUnitario = parseFloat(document.getElementById('precio-unitario-producto').value) || 0;
      const descuento = parseFloat(document.getElementById('descuento-producto').value) || 0;
      const tiempoEntrega = document.getElementById('tiempo-entrega-producto').value;
      const observaciones = document.getElementById('observaciones-producto').value;
      
      if (!descripcion || cantidad <= 0 || precioUnitario <= 0) {
        utils.showNotification('Por favor completa todos los campos requeridos', 'warning');
        return;
      }
      
      const subtotal = cantidad * precioUnitario * (1 - descuento / 100);
      
      const nuevoDetalle = {
        id: Date.now(), // ID temporal
        producto_id: productoId,
        descripcion,
        cantidad,
        precio_unitario: precioUnitario,
        descuento_item: descuento,
        subtotal,
        observaciones,
        tiempo_entrega: tiempoEntrega,
        es_catalogo: tipo === 'catalogo'
      };
      
      cotizacionesState.detalles.push(nuevoDetalle);
      this.actualizarListaProductosCotizacion();
      this.calcularTotales();
      
      // Cerrar modal y restaurar scroll
      const modal = document.getElementById('modal-agregar-producto');
      if (modal) {
        modal.remove();
        document.body.style.overflow = '';
      }
      
      utils.showNotification('Producto agregado correctamente', 'success');
    },

    actualizarListaProductosCotizacion() {
      const container = document.getElementById('lista-productos-cotizacion');
      
      if (cotizacionesState.detalles.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p>No hay productos agregados</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = cotizacionesState.detalles.map((detalle, index) => `
        <div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                ${index + 1}
              </span>
              <div>
                <h5 class="font-medium text-gray-800">${detalle.descripcion}</h5>
                <div class="text-sm text-gray-500 space-x-4">
                  <span>Cant: ${detalle.cantidad}</span>
                  <span>Precio: ${utils.formatCurrency(detalle.precio_unitario)}</span>
                  ${detalle.descuento_item > 0 ? `<span>Desc: ${detalle.descuento_item}%</span>` : ''}
                  ${detalle.tiempo_entrega ? `<span>Entrega: ${detalle.tiempo_entrega}</span>` : ''}
                </div>
                ${detalle.observaciones ? `<div class="text-sm text-gray-600 mt-1">${detalle.observaciones}</div>` : ''}
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="font-bold text-purple-600">${utils.formatCurrency(detalle.subtotal)}</div>
            </div>
            <button onclick="eliminarProductoCotizacion(${index})" 
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
    },

    calcularTotales() {
      const subtotal = cotizacionesState.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
      const descuento = parseFloat(document.getElementById('descuento-cotizacion')?.value || 0);
      const impuestos = parseFloat(document.getElementById('impuestos-cotizacion')?.value || 0);
      
      const descuentoMonto = subtotal * (descuento / 100);
      const total = subtotal - descuentoMonto + impuestos;
      
      document.getElementById('subtotal-cotizacion').textContent = utils.formatCurrency(subtotal);
      document.getElementById('total-cotizacion').textContent = utils.formatCurrency(total);
    },

    async guardarCotizacion(tipo, estado = 'enviada') {
      try {
        // Validaciones exhaustivas
        const clienteId = document.getElementById('cliente-cotizacion')?.value;
        const fechaEmision = document.getElementById('fecha-emision')?.value;
        const fechaVencimiento = document.getElementById('fecha-vencimiento')?.value;
        const validezOferta = document.getElementById('validez-oferta')?.value;

        // Validar cliente
        if (!clienteId) {
          utils.showNotification('Debe seleccionar un cliente', 'warning');
          document.getElementById('cliente-cotizacion')?.focus();
          return;
        }

        // Validar productos
        if (cotizacionesState.detalles.length === 0) {
          utils.showNotification('Debe agregar al menos un producto o servicio', 'warning');
          document.getElementById('agregar-producto-cotizacion')?.focus();
          return;
        }

        // Validar fechas
        if (!fechaEmision) {
          utils.showNotification('La fecha de emisión es obligatoria', 'warning');
          document.getElementById('fecha-emision')?.focus();
          return;
        }

        if (!fechaVencimiento) {
          utils.showNotification('La fecha de vencimiento es obligatoria', 'warning');
          document.getElementById('fecha-vencimiento')?.focus();
          return;
        }

        // Validar que la fecha de vencimiento sea posterior a la de emisión
        if (new Date(fechaVencimiento) <= new Date(fechaEmision)) {
          utils.showNotification('La fecha de vencimiento debe ser posterior a la fecha de emisión', 'warning');
          document.getElementById('fecha-vencimiento')?.focus();
          return;
        }

        // Validar validez de oferta
        if (!validezOferta || parseInt(validezOferta) < 1) {
          utils.showNotification('La validez de la oferta debe ser al menos 1 día', 'warning');
          document.getElementById('validez-oferta')?.focus();
          return;
        }

        // Validar que cada producto tenga cantidad y precio válidos
        const productosInvalidos = cotizacionesState.detalles.filter(detalle => 
          !detalle.cantidad || detalle.cantidad <= 0 || !detalle.precio_unitario || detalle.precio_unitario <= 0
        );

        if (productosInvalidos.length > 0) {
          utils.showNotification('Todos los productos deben tener cantidad y precio válidos', 'warning');
          return;
        }

        // Validar totales
        const subtotal = cotizacionesState.detalles.reduce((sum, d) => sum + (d.subtotal || 0), 0);
        if (subtotal <= 0) {
          utils.showNotification('El subtotal debe ser mayor a cero', 'warning');
          return;
        }

        // Generar nuevo número si no es edición
        let numeroCotizacion = document.getElementById('numero-cotizacion').value;
        if (!cotizacionesState.cotizacionActual && !cotizacionesState.editando) {
          numeroCotizacion = utils.generateNumeroCotizacion();
          document.getElementById('numero-cotizacion').value = numeroCotizacion;
        }

        const formData = {
          numero_cotizacion: numeroCotizacion,
          cliente_id: clienteId,
          usuario_id: usuario_id,
          tipo: tipo,
          estado: estado,
          fecha_emision: document.getElementById('fecha-emision').value,
          fecha_vencimiento: document.getElementById('fecha-vencimiento').value,
          validez_oferta: parseInt(document.getElementById('validez-oferta').value) || 30,
          tiempo_entrega: document.getElementById('tiempo-entrega').value || null,
          observaciones: document.getElementById('observaciones').value || null,
          condiciones_pago: document.getElementById('condiciones-pago').value || null,
          metodo_pago: document.getElementById('metodo-pago-cotizacion').value,
          subtotal: cotizacionesState.detalles.reduce((sum, d) => sum + (d.subtotal || 0), 0),
          descuento: parseFloat(document.getElementById('descuento-cotizacion').value || 0),
          impuestos: parseFloat(document.getElementById('impuestos-cotizacion').value || 0),
          total: 0 // Se calculará automáticamente
        };
        
        // Calcular total
        const descuentoMonto = formData.subtotal * (formData.descuento / 100);
        formData.total = formData.subtotal - descuentoMonto + formData.impuestos;
        
        // Si es edición, agregar ID
        if (cotizacionesState.cotizacionActual) {
          formData.id = cotizacionesState.cotizacionActual.id;
        } else if (cotizacionesState.editando) {
          formData.id = cotizacionesState.editando;
        }
        
        // Guardar cotización
        const cotizacion = await api.guardarCotizacion(formData, cotizacionesState.detalles);
        
        if (cotizacion) {
          document.getElementById('modal-cotizacion').classList.add('hidden');
          await api.cargarCotizaciones();
        }
        
      } catch (error) {
        console.error('Error guardando cotización:', error);
        
        // Manejar errores específicos
        if (error.code === '23505') {
          // Duplicate key error
          utils.showNotification('Error: Número de cotización duplicado. Intentando nuevamente...', 'warning');
          // Regenerar número y reintentar
          setTimeout(() => {
            document.getElementById('numero-cotizacion').value = utils.generateNumeroCotizacion();
          }, 500);
        } else {
          utils.showNotification('Error al guardar cotización: ' + (error.message || 'Error desconocido'), 'error');
        }
      }
    },

    mostrarModalVerCotizacion(cotizacion, detalles) {
      const modalHtml = `
        <div id="modal-ver-cotizacion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    ${utils.getEstadoIcon(cotizacion.estado)}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-gray-800">${cotizacion.numero_cotizacion}</h3>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${utils.getEstadoColor(cotizacion.estado)}">
                        ${cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
                      </span>
                      <span class="px-3 py-1 rounded-full text-sm font-medium ${cotizacion.tipo === 'catalogo' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                        ${cotizacion.tipo === 'catalogo' ? 'Catálogo' : 'Cotización'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  ${cotizacion.estado === 'aprobada' ? `
                    <button onclick="convertirAVenta('${cotizacion.id}')" 
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                      Convertir a Venta
                    </button>
                  ` : ''}
                  
                  <button onclick="duplicarCotizacion('${cotizacion.id}')" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Duplicar
                  </button>
                  
                  <button onclick="imprimirCotizacion('${cotizacion.id}')" 
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Imprimir
                  </button>
                  
                  <button onclick="cerrarModalVerCotizacion()" 
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Contenido -->
            <div class="p-6">
              <!-- Información del Cliente -->
              <div class="bg-gray-50 rounded-xl p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h4>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Cliente:</span>
                        <span class="font-medium">${cotizacion.clientes?.nombre || 'N/A'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Teléfono:</span>
                        <span class="font-medium">${cotizacion.clientes?.telefono || 'N/A'}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Email:</span>
                        <span class="font-medium">${cotizacion.clientes?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">Detalles de la Cotización</h4>
                    <div class="space-y-2">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Fecha de Emisión:</span>
                        <span class="font-medium">${utils.formatDate(cotizacion.fecha_emision)}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Fecha de Vencimiento:</span>
                        <span class="font-medium">${utils.formatDate(cotizacion.fecha_vencimiento)}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Validez:</span>
                        <span class="font-medium">${cotizacion.validez_oferta || 30} días</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Vendedor:</span>
                        <span class="font-medium">${cotizacion.profiles?.nombre || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                ${cotizacion.observaciones ? `
                  <div class="mt-4 pt-4 border-t border-gray-200">
                    <h5 class="font-medium text-gray-800 mb-2">Observaciones:</h5>
                    <p class="text-gray-600">${cotizacion.observaciones}</p>
                  </div>
                ` : ''}
                
                ${cotizacion.condiciones_pago ? `
                  <div class="mt-4 pt-4 border-t border-gray-200">
                    <h5 class="font-medium text-gray-800 mb-2">Condiciones de Pago:</h5>
                    <p class="text-gray-600">${cotizacion.condiciones_pago}</p>
                  </div>
                ` : ''}
              </div>
              
              <!-- Productos/Servicios -->
              <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 class="text-lg font-semibold text-gray-800">Productos/Servicios</h4>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      ${detalles.map(detalle => `
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4">
                            <div>
                              <div class="font-medium text-gray-900">${detalle.descripcion}</div>
                              ${detalle.productos?.nombre ? `<div class="text-sm text-gray-500">Producto: ${detalle.productos.nombre}</div>` : ''}
                              ${detalle.observaciones ? `<div class="text-sm text-gray-500">${detalle.observaciones}</div>` : ''}
                              ${detalle.tiempo_entrega ? `<div class="text-sm text-blue-600">Entrega: ${detalle.tiempo_entrega}</div>` : ''}
                              ${detalle.es_catalogo ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Catálogo</span>` : ''}
                            </div>
                          </td>
                          <td class="px-6 py-4 text-sm text-gray-900">${detalle.cantidad}</td>
                          <td class="px-6 py-4 text-sm text-gray-900">${utils.formatCurrency(detalle.precio_unitario)}</td>
                          <td class="px-6 py-4 text-sm text-gray-900">${detalle.descuento_item || 0}%</td>
                          <td class="px-6 py-4 text-sm font-medium text-gray-900">${utils.formatCurrency(detalle.subtotal)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Totales -->
              <div class="bg-gray-50 rounded-xl p-6">
                <div class="max-w-md ml-auto space-y-3">
                  <div class="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span class="font-medium">${utils.formatCurrency(cotizacion.subtotal)}</span>
                  </div>
                  
                  ${cotizacion.descuento > 0 ? `
                    <div class="flex justify-between text-gray-600">
                      <span>Descuento (${cotizacion.descuento}%):</span>
                      <span class="font-medium text-red-600">-${utils.formatCurrency(cotizacion.subtotal * cotizacion.descuento / 100)}</span>
                    </div>
                  ` : ''}
                  
                  ${cotizacion.impuestos > 0 ? `
                    <div class="flex justify-between text-gray-600">
                      <span>Impuestos:</span>
                      <span class="font-medium">${utils.formatCurrency(cotizacion.impuestos)}</span>
                    </div>
                  ` : ''}
                  
                  <div class="border-t border-gray-300 pt-3">
                    <div class="flex justify-between">
                      <span class="text-lg font-semibold text-gray-800">Total:</span>
                      <span class="text-2xl font-bold text-purple-600">${utils.formatCurrency(cotizacion.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      
      // Event listeners
      window.cerrarModalVerCotizacion = () => {
        const modal = document.getElementById('modal-ver-cotizacion');
        if (modal) modal.remove();
      };
      
      // Cerrar con Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          window.cerrarModalVerCotizacion();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Cerrar con click fuera
      document.getElementById('modal-ver-cotizacion').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
          window.cerrarModalVerCotizacion();
        }
      });
    }
  };

  // Funciones globales para el HTML
  window.mostrarCotizacion = async (id) => {
    try {
      const cotizacion = cotizacionesState.cotizaciones.find(c => c.id === id);
      if (!cotizacion) {
        utils.showNotification('Cotización no encontrada', 'error');
        return;
      }

      // Cargar detalles de la cotización
      const { data: detalles, error } = await supabase
        .from('cotizacion_detalle')
        .select(`
          *,
          productos(nombre, codigo_barras)
        `)
        .eq('cotizacion_id', id);

      if (error) {
        console.error('Error cargando detalles:', error);
        utils.showNotification('Error al cargar detalles de la cotización', 'error');
        return;
      }

      ui.mostrarModalVerCotizacion(cotizacion, detalles || []);
    } catch (error) {
      console.error('Error mostrando cotización:', error);
      utils.showNotification('Error al mostrar cotización', 'error');
    }
  };

  window.editarCotizacion = async (id) => {
    const cotizacion = cotizacionesState.cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      ui.mostrarModalCotizacion(cotizacion.tipo, cotizacion);
    }
  };

  window.cambiarEstado = async (id, estado) => {
    await api.cambiarEstadoCotizacion(id, estado);
    document.getElementById(`menu-estado-${id}`).classList.add('hidden');
  };

  window.convertirAVenta = async (id) => {
    if (confirm('¿Desea convertir esta cotización en venta?')) {
      await api.convertirAVenta(id);
    }
    document.getElementById(`menu-estado-${id}`).classList.add('hidden');
  };

  window.eliminarCotizacion = async (id) => {
    if (confirm('¿Está seguro de eliminar esta cotización? Esta acción no se puede deshacer.')) {
      await api.eliminarCotizacion(id);
    }
    document.getElementById(`menu-estado-${id}`).classList.add('hidden');
  };

  window.eliminarProductoCotizacion = (index) => {
    cotizacionesState.detalles.splice(index, 1);
    ui.actualizarListaProductosCotizacion();
    ui.calcularTotales();
  };

  window.duplicarCotizacion = async (id) => {
    try {
      const cotizacion = cotizacionesState.cotizaciones.find(c => c.id === id);
      if (!cotizacion) {
        utils.showNotification('Cotización no encontrada', 'error');
        return;
      }

      // Cargar detalles de la cotización
      const { data: detalles, error } = await supabase
        .from('cotizacion_detalle')
        .select('*')
        .eq('cotizacion_id', id);

      if (error) {
        console.error('Error cargando detalles:', error);
        utils.showNotification('Error al cargar detalles de la cotización', 'error');
        return;
      }

      // Preparar datos para nueva cotización
      const nuevaCotizacion = {
        ...cotizacion,
        id: undefined, // Nuevo ID se generará automáticamente
        numero_cotizacion: utils.generateNumeroCotizacion(),
        estado: 'borrador',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: utils.calcularVencimiento(cotizacion.validez_oferta || 30),
        venta_id: null
      };

      // Preparar detalles
      const nuevosDetalles = detalles.map(detalle => ({
        ...detalle,
        id: undefined,
        cotizacion_id: undefined // Se asignará al guardar
      }));

      // Abrir modal de edición con los datos duplicados
      cotizacionesState.cotizacionActual = null; // Asegurar que es nueva
      cotizacionesState.detalles = nuevosDetalles;
      
      ui.mostrarModalCotizacion(cotizacion.tipo, nuevaCotizacion);
      
      // Prellenar el formulario
      setTimeout(() => {
        document.getElementById('numero-cotizacion').value = nuevaCotizacion.numero_cotizacion;
        document.getElementById('cliente-cotizacion').value = nuevaCotizacion.cliente_id;
        document.getElementById('fecha-emision').value = nuevaCotizacion.fecha_emision;
        document.getElementById('fecha-vencimiento').value = nuevaCotizacion.fecha_vencimiento;
        document.getElementById('validez-oferta').value = nuevaCotizacion.validez_oferta;
        document.getElementById('tiempo-entrega').value = nuevaCotizacion.tiempo_entrega || '';
        document.getElementById('observaciones').value = nuevaCotizacion.observaciones || '';
        document.getElementById('condiciones-pago').value = nuevaCotizacion.condiciones_pago || '';
        document.getElementById('metodo-pago-cotizacion').value = nuevaCotizacion.metodo_pago || 'efectivo';
        document.getElementById('descuento-cotizacion').value = nuevaCotizacion.descuento || 0;
        document.getElementById('impuestos-cotizacion').value = nuevaCotizacion.impuestos || 0;
        
        ui.actualizarListaProductosCotizacion();
        ui.calcularTotales();
      }, 100);

      // Cerrar modal de vista si está abierto
      window.cerrarModalVerCotizacion();
      
      utils.showNotification('Cotización duplicada. Puedes editarla antes de guardar.', 'info');
      
    } catch (error) {
      console.error('Error duplicando cotización:', error);
      utils.showNotification('Error al duplicar cotización', 'error');
    }
  };

  window.toggleMenuEstado = (id) => {
    const menu = document.getElementById(`menu-estado-${id}`);
    // Cerrar otros menús
    document.querySelectorAll('[id^="menu-estado-"]').forEach(m => {
      if (m.id !== `menu-estado-${id}`) {
        m.classList.add('hidden');
      }
    });
    menu.classList.toggle('hidden');
  };

  // Función global para cambiar mes en calendario
  window.cambiarMesCalendario = (direccion) => {
    const fechaActual = cotizacionesState.calendarioFecha;
    const nuevaFecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + direccion, 1);
    cotizacionesState.calendarioFecha = nuevaFecha;
    ui.actualizarListaCotizaciones();
  };

  // Funciones de export
  const exports = {
    // Exportar a Excel
    exportarExcel() {
      try {
        const cotizaciones = cotizacionesState.cotizaciones;
        if (!cotizaciones.length) {
          utils.showNotification('No hay cotizaciones para exportar', 'warning');
          return;
        }

        // Crear datos para export
        const data = cotizaciones.map(cot => ({
          'Número': cot.numero_cotizacion,
          'Cliente': cot.clientes?.nombre || 'N/A',
          'Tipo': cot.tipo,
          'Estado': cot.estado,
          'Fecha Emisión': new Date(cot.fecha_emision).toLocaleDateString(),
          'Fecha Vencimiento': new Date(cot.fecha_vencimiento).toLocaleDateString(),
          'Subtotal': parseFloat(cot.subtotal || 0).toFixed(2),
          'Descuento': parseFloat(cot.descuento || 0).toFixed(2),
          'Impuestos': parseFloat(cot.impuestos || 0).toFixed(2),
          'Total': parseFloat(cot.total || 0).toFixed(2),
          'Validez Oferta': cot.validez_oferta,
          'Tiempo Entrega': cot.tiempo_entrega || 'N/A',
          'Observaciones': cot.observaciones || 'N/A'
        }));

        // Convertir a CSV
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        utils.showNotification('Cotizaciones exportadas a Excel/CSV exitosamente', 'success');
      } catch (error) {
        console.error('Error exportando a Excel:', error);
        utils.showNotification('Error al exportar a Excel', 'error');
      }
    },

    // Exportar a PDF
    exportarPDF() {
      try {
        const cotizaciones = cotizacionesState.cotizaciones;
        if (!cotizaciones.length) {
          utils.showNotification('No hay cotizaciones para exportar', 'warning');
          return;
        }

        // Crear contenido HTML para PDF
        const htmlContent = this.generarHTMLReporte(cotizaciones);
        
        // Abrir en nueva ventana para imprimir
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Auto-print después de cargar
        printWindow.onload = () => {
          printWindow.print();
        };
        
        utils.showNotification('Reporte PDF generado para impresión', 'success');
      } catch (error) {
        console.error('Error exportando a PDF:', error);
        utils.showNotification('Error al exportar a PDF', 'error');
      }
    },

    // Generar HTML para reporte
    generarHTMLReporte(cotizaciones) {
      const totalCotizaciones = cotizaciones.length;
      const totalMonto = cotizaciones.reduce((sum, cot) => sum + parseFloat(cot.total || 0), 0);
      const estadisticas = cotizaciones.reduce((acc, cot) => {
        acc[cot.estado] = (acc[cot.estado] || 0) + 1;
        return acc;
      }, {});

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Cotizaciones</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat-card { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de Cotizaciones</h1>
            <p>Generado el ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>Total Cotizaciones</h3>
              <p style="font-size: 24px; color: #3b82f6;">${totalCotizaciones}</p>
            </div>
            <div class="stat-card">
              <h3>Monto Total</h3>
              <p style="font-size: 24px; color: #10b981;">$${totalMonto.toFixed(2)}</p>
            </div>
            <div class="stat-card">
              <h3>Estados</h3>
              ${Object.entries(estadisticas).map(([estado, count]) => 
                `<p>${estado}: ${count}</p>`
              ).join('')}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha Emisión</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cotizaciones.map(cot => `
                <tr>
                  <td>${cot.numero_cotizacion}</td>
                  <td>${cot.clientes?.nombre || 'N/A'}</td>
                  <td>${cot.tipo}</td>
                  <td>${cot.estado}</td>
                  <td>${new Date(cot.fecha_emision).toLocaleDateString()}</td>
                  <td class="total">$${parseFloat(cot.total || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
    }
  };

  // Función para editar cotización
  window.editarCotizacion = async (id) => {
    try {
      // Cargar datos de la cotización
      const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .select(`
          *,
          clientes (id, nombre, email, telefono),
          cotizacion_detalle (
            id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal,
            productos (id, nombre, precio_venta)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Cargar productos en el estado
      cotizacionesState.productosSeleccionados = cotizacion.cotizacion_detalle.map(detalle => ({
        id: detalle.producto_id,
        nombre: detalle.productos.nombre,
        precio: detalle.precio_unitario,
        cantidad: detalle.cantidad,
        subtotal: detalle.subtotal
      }));

      // Abrir modal de cotización
      ui.mostrarModalCotizacion(cotizacion.tipo);
      
      // Establecer modo edición
      cotizacionesState.editando = id;
      document.getElementById('titulo-modal-cotizacion').textContent = 
        `Editar ${cotizacion.tipo === 'cotizacion' ? 'Cotización' : 'Catálogo'}`;

      // Precargar datos en formulario
      setTimeout(() => {
        document.getElementById('numero-cotizacion').value = cotizacion.numero_cotizacion;
        document.getElementById('cliente-cotizacion').value = cotizacion.cliente_id;
        document.getElementById('fecha-emision').value = cotizacion.fecha_emision;
        document.getElementById('fecha-vencimiento').value = cotizacion.fecha_vencimiento;
        document.getElementById('validez-oferta').value = cotizacion.validez_oferta;
        document.getElementById('tiempo-entrega').value = cotizacion.tiempo_entrega || '';
        document.getElementById('observaciones').value = cotizacion.observaciones || '';
        document.getElementById('condiciones-pago').value = cotizacion.condiciones_pago || '';
        document.getElementById('metodo-pago-cotizacion').value = cotizacion.metodo_pago || 'efectivo';
        document.getElementById('descuento-cotizacion').value = cotizacion.descuento || 0;
        document.getElementById('impuestos-cotizacion').value = cotizacion.impuestos || 0;
        
        ui.actualizarListaProductosCotizacion();
        ui.calcularTotales();
      }, 100);

      utils.showNotification('Cotización cargada para edición', 'info');
      
    } catch (error) {
      console.error('Error cargando cotización:', error);
      utils.showNotification('Error al cargar cotización para editar', 'error');
    }
  };

  // Función para imprimir cotización individual
  window.imprimirCotizacion = async (id) => {
    try {
      // Cargar cotización completa
      const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .select(`
          *,
          clientes (nombre, email, telefono, direccion),
          cotizacion_detalle (
            cantidad,
            precio_unitario,
            subtotal,
            productos (nombre, descripcion)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const htmlContent = this.generarHTMLCotizacion(cotizacion);
      
      // Abrir ventana de impresión
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
      
    } catch (error) {
      console.error('Error al imprimir:', error);
      utils.showNotification('Error al imprimir cotización', 'error');
    }
  };

  // Generar HTML para cotización individual
  function generarHTMLCotizacion(cotizacion) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cotización ${cotizacion.numero_cotizacion}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company { text-align: left; }
          .quote-info { text-align: right; }
          .client-info { margin: 20px 0; padding: 15px; background: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .conditions { margin-top: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">
            <h1>BOX Taller Mecánico</h1>
            <p>Dirección del Taller<br>Teléfono: (000) 000-0000<br>Email: info@box.com</p>
          </div>
          <div class="quote-info">
            <h2>${cotizacion.tipo === 'cotizacion' ? 'COTIZACIÓN' : 'CATÁLOGO'}</h2>
            <p><strong>N°:</strong> ${cotizacion.numero_cotizacion}</p>
            <p><strong>Fecha:</strong> ${new Date(cotizacion.fecha_emision).toLocaleDateString()}</p>
            <p><strong>Vencimiento:</strong> ${new Date(cotizacion.fecha_vencimiento).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${cotizacion.estado}</p>
          </div>
        </div>

        <div class="client-info">
          <h3>Datos del Cliente</h3>
          <p><strong>Cliente:</strong> ${cotizacion.clientes?.nombre || 'N/A'}</p>
          <p><strong>Email:</strong> ${cotizacion.clientes?.email || 'N/A'}</p>
          <p><strong>Teléfono:</strong> ${cotizacion.clientes?.telefono || 'N/A'}</p>
          <p><strong>Dirección:</strong> ${cotizacion.clientes?.direccion || 'N/A'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cotizacion.cotizacion_detalle.map(item => `
              <tr>
                <td>${item.productos?.nombre || 'N/A'}</td>
                <td>${item.productos?.descripcion || 'N/A'}</td>
                <td>${item.cantidad}</td>
                <td>$${parseFloat(item.precio_unitario).toFixed(2)}</td>
                <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4">Subtotal:</td>
              <td>$${parseFloat(cotizacion.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4">Descuento:</td>
              <td>-$${parseFloat(cotizacion.descuento || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4">Impuestos:</td>
              <td>$${parseFloat(cotizacion.impuestos || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row" style="font-size: 18px;">
              <td colspan="4">TOTAL:</td>
              <td>$${parseFloat(cotizacion.total || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="conditions">
          <p><strong>Validez de la oferta:</strong> ${cotizacion.validez_oferta}</p>
          <p><strong>Tiempo de entrega:</strong> ${cotizacion.tiempo_entrega || 'A convenir'}</p>
          <p><strong>Condiciones de pago:</strong> ${cotizacion.condiciones_pago || 'A convenir'}</p>
          ${cotizacion.observaciones ? `<p><strong>Observaciones:</strong> ${cotizacion.observaciones}</p>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // Función para mostrar modal de búsqueda avanzada
  window.mostrarBusquedaAvanzada = () => {
    const modalHtml = `
      <div id="modal-busqueda-avanzada" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-800">Búsqueda Avanzada</h3>
              <button id="cerrar-busqueda-avanzada" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Criterios de búsqueda -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <select id="busq-cliente" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Todos los clientes</option>
                  ${cotizacionesState.clientes.map(cliente => `
                    <option value="${cliente.id}">${cliente.nombre}</option>
                  `).join('')}
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Rango de montos</label>
                <div class="grid grid-cols-2 gap-2">
                  <input type="number" id="busq-monto-min" placeholder="Monto mínimo" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="number" id="busq-monto-max" placeholder="Monto máximo" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <div class="space-y-2">
                  ${['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida', 'convertida'].map(estado => `
                    <label class="flex items-center">
                      <input type="checkbox" value="${estado}" class="busq-estado mr-2 text-purple-600 focus:ring-purple-500" />
                      <span class="text-sm">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" value="cotizacion" class="busq-tipo mr-2 text-purple-600 focus:ring-purple-500" />
                    <span class="text-sm">Cotización</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" value="catalogo" class="busq-tipo mr-2 text-purple-600 focus:ring-purple-500" />
                    <span class="text-sm">Catálogo</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Opciones</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" id="busq-con-descuento" class="mr-2 text-purple-600 focus:ring-purple-500" />
                    <span class="text-sm">Con descuento</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="busq-vencen-pronto" class="mr-2 text-purple-600 focus:ring-purple-500" />
                    <span class="text-sm">Vencen en 7 días</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="busq-alta-valor" class="mr-2 text-purple-600 focus:ring-purple-500" />
                    <span class="text-sm">Valor alto (>$50,000)</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Rango de fechas -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de emisión desde</label>
                <input type="date" id="busq-fecha-desde" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de emisión hasta</label>
                <input type="date" id="busq-fecha-hasta" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <!-- Búsqueda por texto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar en observaciones</label>
              <input type="text" id="busq-observaciones" placeholder="Buscar texto en observaciones..." 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button id="limpiar-busqueda-avanzada" class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
              Limpiar Todo
            </button>
            <button id="aplicar-busqueda-avanzada" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300">
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Event listeners del modal
    document.getElementById('cerrar-busqueda-avanzada').addEventListener('click', () => {
      document.getElementById('modal-busqueda-avanzada').remove();
    });

    document.getElementById('limpiar-busqueda-avanzada').addEventListener('click', () => {
      document.querySelectorAll('#modal-busqueda-avanzada input').forEach(input => {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else {
          input.value = '';
        }
      });
      document.getElementById('busq-cliente').value = '';
    });

    document.getElementById('aplicar-busqueda-avanzada').addEventListener('click', () => {
      aplicarBusquedaAvanzada();
      document.getElementById('modal-busqueda-avanzada').remove();
    });
  };

  // Aplicar filtros de búsqueda avanzada
  function aplicarBusquedaAvanzada() {
    const filtros = {
      cliente: document.getElementById('busq-cliente').value,
      montoMin: parseFloat(document.getElementById('busq-monto-min').value) || 0,
      montoMax: parseFloat(document.getElementById('busq-monto-max').value) || Infinity,
      estados: Array.from(document.querySelectorAll('.busq-estado:checked')).map(cb => cb.value),
      tipos: Array.from(document.querySelectorAll('.busq-tipo:checked')).map(cb => cb.value),
      conDescuento: document.getElementById('busq-con-descuento').checked,
      vencenPronto: document.getElementById('busq-vencen-pronto').checked,
      altaValor: document.getElementById('busq-alta-valor').checked,
      fechaDesde: document.getElementById('busq-fecha-desde').value,
      fechaHasta: document.getElementById('busq-fecha-hasta').value,
      observaciones: document.getElementById('busq-observaciones').value
    };

    // Aplicar filtros
    let cotizacionesFiltradas = [...cotizacionesState.cotizaciones];

    // Filtro por cliente
    if (filtros.cliente) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => cot.cliente_id === filtros.cliente);
    }

    // Filtro por monto
    cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => {
      const total = parseFloat(cot.total || 0);
      return total >= filtros.montoMin && total <= filtros.montoMax;
    });

    // Filtro por estados
    if (filtros.estados.length > 0) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => filtros.estados.includes(cot.estado));
    }

    // Filtro por tipos
    if (filtros.tipos.length > 0) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => filtros.tipos.includes(cot.tipo));
    }

    // Filtro con descuento
    if (filtros.conDescuento) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => parseFloat(cot.descuento || 0) > 0);
    }

    // Filtro vencen pronto
    if (filtros.vencenPronto) {
      const enUnaSemana = new Date();
      enUnaSemana.setDate(enUnaSemana.getDate() + 7);
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => {
        const fechaVenc = new Date(cot.fecha_vencimiento);
        return fechaVenc <= enUnaSemana && fechaVenc >= new Date();
      });
    }

    // Filtro alta valor
    if (filtros.altaValor) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => parseFloat(cot.total || 0) > 50000);
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => new Date(cot.fecha_emision) >= new Date(filtros.fechaDesde));
    }
    if (filtros.fechaHasta) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => new Date(cot.fecha_emision) <= new Date(filtros.fechaHasta));
    }

    // Filtro por observaciones
    if (filtros.observaciones) {
      const texto = filtros.observaciones.toLowerCase();
      cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
        (cot.observaciones || '').toLowerCase().includes(texto)
      );
    }

    // Actualizar estado y vista
    const originalCotizaciones = cotizacionesState.cotizaciones;
    cotizacionesState.cotizaciones = cotizacionesFiltradas;
    ui.actualizarListaCotizaciones();
    ui.actualizarEstadisticas();

    // Mostrar info de filtros aplicados
    const totalFiltrados = cotizacionesFiltradas.length;
    const totalOriginal = originalCotizaciones.length;
    utils.showNotification(`Búsqueda aplicada: ${totalFiltrados} de ${totalOriginal} cotizaciones`, 'info');

    // Restaurar cotizaciones originales al estado
    cotizacionesState.cotizaciones = originalCotizaciones;
  }

  // Event listeners principales
  function setupEventListeners() {
    // Nueva cotización
    document.getElementById('nueva-cotizacion').addEventListener('click', () => {
      ui.mostrarModalCotizacion('cotizacion');
    });

    // Nuevo catálogo
    document.getElementById('nuevo-catalogo').addEventListener('click', () => {
      ui.mostrarModalCotizacion('catalogo');
    });

    // Cerrar modal
    document.getElementById('cerrar-modal-cotizacion').addEventListener('click', () => {
      document.getElementById('modal-cotizacion').classList.add('hidden');
    });

    // Filtros
    document.getElementById('buscar-cotizaciones').addEventListener('input', (e) => {
      cotizacionesState.filtros.busqueda = e.target.value;
      api.cargarCotizaciones();
    });

    document.getElementById('filtro-estado').addEventListener('change', (e) => {
      cotizacionesState.filtros.estado = e.target.value;
      api.cargarCotizaciones();
    });

    document.getElementById('filtro-tipo').addEventListener('change', (e) => {
      cotizacionesState.filtros.tipo = e.target.value;
      api.cargarCotizaciones();
    });

    document.getElementById('filtro-fecha-desde').addEventListener('change', (e) => {
      cotizacionesState.filtros.fechaDesde = e.target.value;
      api.cargarCotizaciones();
    });

    document.getElementById('filtro-fecha-hasta').addEventListener('change', (e) => {
      cotizacionesState.filtros.fechaHasta = e.target.value;
      api.cargarCotizaciones();
    });

    // Búsqueda avanzada
    document.getElementById('busqueda-avanzada').addEventListener('click', () => {
      mostrarBusquedaAvanzada();
    });

    // Limpiar filtros
    document.getElementById('limpiar-filtros').addEventListener('click', () => {
      cotizacionesState.filtros = {
        busqueda: '',
        estado: '',
        tipo: '',
        fechaDesde: '',
        fechaHasta: '',
        cliente: ''
      };
      
      document.getElementById('buscar-cotizaciones').value = '';
      document.getElementById('filtro-estado').value = '';
      document.getElementById('filtro-tipo').value = '';
      document.getElementById('filtro-fecha-desde').value = '';
      document.getElementById('filtro-fecha-hasta').value = '';
      
      api.cargarCotizaciones();
    });

    // Vistas
    document.getElementById('vista-lista').addEventListener('click', () => {
      cotizacionesState.vista = 'lista';
      document.getElementById('vista-lista').className = 'p-2 rounded-md bg-white shadow-sm text-purple-600';
      document.getElementById('vista-grid').className = 'p-2 rounded-md text-gray-500 hover:text-purple-600';
      document.getElementById('vista-calendario').className = 'p-2 rounded-md text-gray-500 hover:text-purple-600';
      ui.actualizarListaCotizaciones();
    });

    document.getElementById('vista-grid').addEventListener('click', () => {
      cotizacionesState.vista = 'grid';
      document.getElementById('vista-grid').className = 'p-2 rounded-md bg-white shadow-sm text-purple-600';
      document.getElementById('vista-lista').className = 'p-2 rounded-md text-gray-500 hover:text-purple-600';
      document.getElementById('vista-calendario').className = 'p-2 rounded-md text-gray-500 hover:text-purple-600';
      ui.actualizarListaCotizaciones();
    });

    document.getElementById('vista-calendario').addEventListener('click', () => {
      cotizacionesState.vista = 'calendario';
      document.getElementById('vista-calendario').className = 'p-2 rounded-md bg-white shadow-sm text-purple-600';
      document.getElementById('vista-lista').className = 'p-2 rounded-md text-gray-500 hover:text-purple-600';
      document.getElementById('vista-grid').className = 'p-2 rounded-md text-gray-500 hover:text-purple-600';
      ui.actualizarListaCotizaciones();
    });

    // Exports
    document.getElementById('exportar-excel').addEventListener('click', () => {
      exports.exportarExcel();
    });

    document.getElementById('exportar-pdf').addEventListener('click', () => {
      exports.exportarPDF();
    });

    // Cerrar menús al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[id^="menu-estado-"]') && !e.target.closest('button[onclick^="toggleMenuEstado"]')) {
        document.querySelectorAll('[id^="menu-estado-"]').forEach(menu => {
          menu.classList.add('hidden');
        });
      }
    });
  }

  // Inicialización
  setupEventListeners();
  
  // Cargar datos iniciales
  await Promise.all([
    api.cargarClientes(),
    api.cargarProductos(),
    api.cargarCotizaciones()
  ]);
}