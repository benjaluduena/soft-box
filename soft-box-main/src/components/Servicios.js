import { supabase } from '../supabaseClient.js';

// Estado global del módulo de servicios
const serviciosState = {
  servicios: [],
  clientes: [],
  vehiculos: [],
  productos: [],
  servicioActual: null,
  productosServicio: [],
  filtros: {
    busqueda: '',
    estado: '',
    tipoServicio: '',
    fechaDesde: '',
    fechaHasta: '',
    cliente: '',
    vehiculo: '',
    tecnico: ''
  },
  paginacion: {
    pagina: 1,
    porPagina: 20,
    total: 0
  },
  vista: 'lista', // 'lista' | 'grid' | 'calendario' | 'timeline'
  tiposServicio: [
    'mantenimiento',
    'reparacion',
    'cambio_neumaticos',
    'alineacion_balanceo',
    'cambio_aceite',
    'frenos',
    'suspension',
    'motor',
    'transmision',
    'electrico',
    'aire_acondicionado',
    'otros'
  ]
};

// Utilidades
const utils = {
  formatCurrency: (amount) => new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS' 
  }).format(amount || 0),
  
  formatDate: (date) => new Date(date).toLocaleDateString('es-AR'),
  
  formatDateTime: (date) => new Date(date).toLocaleString('es-AR'),
  
  formatDuration: (start, end) => {
    if (!start || !end) return 'N/A';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  },
  
  formatInterval: (interval) => {
    if (!interval) return 'N/A';
    // Parsear intervalo PostgreSQL (formato: HH:MM:SS o P#Y#M#DT#H#M#S)
    const match = interval.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const [, hours, minutes] = match;
      return `${parseInt(hours)}h ${parseInt(minutes)}m`;
    }
    return interval;
  },

  showNotification: (message, type = 'success') => {
    if (window.notificationSystem) {
      window.notificationSystem.show(message, type);
    } else {
      alert(message);
    }
  },

  getEstadoColor: (estado) => {
    const colores = {
      'programado': 'bg-blue-100 text-blue-800',
      'en_proceso': 'bg-yellow-100 text-yellow-800',
      'completado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  },

  getEstadoIcon: (estado) => {
    const iconos = {
      'programado': '📅',
      'en_proceso': '🔧',
      'completado': '✅',
      'cancelado': '❌'
    };
    return iconos[estado] || '📋';
  },

  getTipoServicioIcon: (tipo) => {
    const iconos = {
      'mantenimiento': '🔧',
      'reparacion': '⚙️',
      'cambio_neumaticos': '🚗',
      'alineacion_balanceo': '⚖️',
      'cambio_aceite': '🛢️',
      'frenos': '🛑',
      'suspension': '🔩',
      'motor': '🚙',
      'transmision': '⚙️',
      'electrico': '⚡',
      'aire_acondicionado': '❄️',
      'otros': '🔨'
    };
    return iconos[tipo] || '🔧';
  },

  calcularProximoServicio: (kilometrajeActual, frecuenciaKm = 10000) => {
    return kilometrajeActual + frecuenciaKm;
  },

  calcularProximaFecha: (fechaUltimo, frecuenciaMeses = 6) => {
    const fecha = new Date(fechaUltimo);
    fecha.setMonth(fecha.getMonth() + frecuenciaMeses);
    return fecha.toISOString().split('T')[0];
  },

  generarNumeroServicio: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getHours().toString().padStart(2, '0') + 
                  now.getMinutes().toString().padStart(2, '0');
    return `SRV-${year}${month}${day}-${time}`;
  }
};

export async function renderServicios(container, usuario_id) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Historial de Servicios
                </h1>
                <p class="text-gray-600 text-lg">Gestión completa de servicios y mantenimientos</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button id="nuevo-servicio" class="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nuevo Servicio
                <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
              
              <button id="calendario-servicios" class="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Calendario
              </button>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Servicios</p>
                <p class="text-3xl font-bold text-emerald-600" id="total-servicios">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">En Proceso</p>
                <p class="text-3xl font-bold text-yellow-600" id="servicios-proceso">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Completados Hoy</p>
                <p class="text-3xl font-bold text-green-600" id="servicios-completados-hoy">0</p>
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
                <p class="text-sm font-medium text-gray-600">Programados</p>
                <p class="text-3xl font-bold text-blue-600" id="servicios-programados">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Ingresos Mes</p>
                <p class="text-2xl font-bold text-purple-600" id="ingresos-mes-servicios">$0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input type="text" id="buscar-servicios" placeholder="Buscar por cliente, vehículo..." 
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-200" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select id="filtro-estado" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm">
                <option value="">Todos</option>
                <option value="programado">Programado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select id="filtro-tipo-servicio" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm">
                <option value="">Todos</option>
                ${serviciosState.tiposServicio.map(tipo => `
                  <option value="${tipo}">${tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}</option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select id="filtro-cliente" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm">
                <option value="">Todos</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input type="date" id="filtro-fecha-desde" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input type="date" id="filtro-fecha-hasta" 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm" />
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-3">
              <button id="limpiar-filtros" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Limpiar Filtros
              </button>
              <span class="text-sm text-gray-500" id="resultados-info">Mostrando 0 servicios</span>
            </div>
            
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-gray-100 rounded-lg p-1">
                <button id="vista-lista" class="p-2 rounded-md bg-white shadow-sm text-emerald-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                </button>
                <button id="vista-grid" class="p-2 rounded-md text-gray-500 hover:text-emerald-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
                <button id="vista-timeline" class="p-2 rounded-md text-gray-500 hover:text-emerald-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>
              
              <button id="exportar-reportes" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Reportes
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Servicios -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-800">Historial de Servicios</h3>
              <div class="flex items-center gap-3">
                <button id="alertas-mantenimiento" class="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Alertas Mantenimiento
                </button>
              </div>
            </div>
          </div>
          
          <div id="contenedor-servicios" class="p-6">
            <!-- Se llena dinámicamente -->
          </div>
          
          <!-- Paginación -->
          <div id="paginacion-servicios" class="px-6 py-4 border-t border-gray-200">
            <!-- Se llena dinámicamente -->
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Nuevo/Editar Servicio -->
    <div id="modal-servicio" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-800" id="modal-servicio-titulo">Nuevo Servicio</h3>
            <button id="cerrar-modal-servicio" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6" id="contenido-modal-servicio">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>

    <!-- Modal de Alertas de Mantenimiento -->
    <div id="modal-alertas" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-800">Alertas de Mantenimiento</h3>
            <button id="cerrar-modal-alertas" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6" id="contenido-alertas">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>
  `;

  // API functions
  const api = {
    async cargarServicios() {
      try {
        let query = supabase
          .from('servicios')
          .select(`
            *,
            clientes(nombre, telefono, email),
            vehiculos(marca, modelo, patente, kilometraje_actual),
            turnos(fecha, motivo),
            ventas(total, numero_factura)
          `)
          .order('fecha_inicio', { ascending: false });

        // Aplicar filtros
        if (serviciosState.filtros.busqueda) {
          query = query.or(`descripcion.ilike.%${serviciosState.filtros.busqueda}%,clientes.nombre.ilike.%${serviciosState.filtros.busqueda}%,vehiculos.patente.ilike.%${serviciosState.filtros.busqueda}%`);
        }
        
        if (serviciosState.filtros.estado) {
          query = query.eq('estado', serviciosState.filtros.estado);
        }
        
        if (serviciosState.filtros.tipoServicio) {
          query = query.eq('tipo_servicio', serviciosState.filtros.tipoServicio);
        }
        
        if (serviciosState.filtros.cliente) {
          query = query.eq('cliente_id', serviciosState.filtros.cliente);
        }
        
        if (serviciosState.filtros.fechaDesde) {
          query = query.gte('fecha_inicio', serviciosState.filtros.fechaDesde);
        }
        
        if (serviciosState.filtros.fechaHasta) {
          query = query.lte('fecha_inicio', serviciosState.filtros.fechaHasta);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        serviciosState.servicios = data || [];
        ui.actualizarListaServicios();
        ui.actualizarEstadisticas();
        
      } catch (error) {
        console.error('Error cargando servicios:', error);
        utils.showNotification('Error al cargar servicios', 'error');
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
        serviciosState.clientes = data || [];
        
        // Llenar select de filtro
        const selectCliente = document.getElementById('filtro-cliente');
        selectCliente.innerHTML = '<option value="">Todos</option>' +
          data.map(cliente => `<option value="${cliente.id}">${cliente.nombre}</option>`).join('');
        
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    },

    async cargarVehiculos() {
      try {
        const { data, error } = await supabase
          .from('vehiculos')
          .select(`
            *,
            clientes(nombre)
          `)
          .eq('activo', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        serviciosState.vehiculos = data || [];
        
      } catch (error) {
        console.error('Error cargando vehículos:', error);
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
        serviciosState.productos = data || [];
        
      } catch (error) {
        console.error('Error cargando productos:', error);
      }
    },

    async guardarServicio(servicioData, productos) {
      try {
        let result;
        
        if (servicioData.id) {
          // Actualizar servicio existente
          const { data, error } = await supabase
            .from('servicios')
            .update(servicioData)
            .eq('id', servicioData.id)
            .select()
            .single();
          
          if (error) throw error;
          result = data;
          
          // Eliminar productos anteriores
          await supabase
            .from('servicio_productos')
            .delete()
            .eq('servicio_id', servicioData.id);
            
        } else {
          // Crear nuevo servicio
          const { data, error } = await supabase
            .from('servicios')
            .insert([servicioData])
            .select()
            .single();
          
          if (error) throw error;
          result = data;
        }

        // Insertar productos utilizados
        if (productos && productos.length > 0) {
          const productosConId = productos.map(producto => ({
            ...producto,
            servicio_id: result.id
          }));

          const { error: errorProductos } = await supabase
            .from('servicio_productos')
            .insert(productosConId);

          if (errorProductos) throw errorProductos;

          // Actualizar stock de productos
          for (const producto of productos) {
            if (producto.producto_id) {
              await supabase.rpc('actualizar_stock', {
                producto_id: producto.producto_id,
                cantidad_vendida: producto.cantidad
              });
            }
          }
        }

        // Actualizar kilometraje del vehículo si se proporciona
        if (servicioData.vehiculo_id && servicioData.kilometraje) {
          await supabase
            .from('vehiculos')
            .update({ 
              kilometraje_actual: servicioData.kilometraje,
              fecha_ultima_revision: servicioData.fecha_inicio.split('T')[0]
            })
            .eq('id', servicioData.vehiculo_id);
        }

        utils.showNotification('Servicio guardado exitosamente', 'success');
        return result;
        
      } catch (error) {
        console.error('Error guardando servicio:', error);
        utils.showNotification('Error al guardar servicio', 'error');
        throw error;
      }
    },

    async cambiarEstadoServicio(id, nuevoEstado) {
      try {
        const updateData = { 
          estado: nuevoEstado,
          updated_at: new Date().toISOString()
        };

        // Si se completa el servicio, agregar fecha de fin
        if (nuevoEstado === 'completado') {
          updateData.fecha_fin = new Date().toISOString();
        }

        const { error } = await supabase
          .from('servicios')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
        
        utils.showNotification(`Estado cambiado a ${nuevoEstado}`, 'success');
        await this.cargarServicios();
        
      } catch (error) {
        console.error('Error cambiando estado:', error);
        utils.showNotification('Error al cambiar estado', 'error');
      }
    },

    async eliminarServicio(id) {
      try {
        const { error } = await supabase
          .from('servicios')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        utils.showNotification('Servicio eliminado', 'success');
        await this.cargarServicios();
        
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        utils.showNotification('Error al eliminar servicio', 'error');
      }
    },

    async cargarAlertasMantenimiento() {
      try {
        // Servicios próximos por fecha
        const { data: serviciosFecha, error: errorFecha } = await supabase
          .from('servicios')
          .select(`
            *,
            clientes(nombre),
            vehiculos(marca, modelo, patente)
          `)
          .lte('proximo_servicio_fecha', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .eq('estado', 'completado');

        // Servicios próximos por kilometraje
        const { data: serviciosKm, error: errorKm } = await supabase
          .from('servicios')
          .select(`
            *,
            clientes(nombre),
            vehiculos(marca, modelo, patente, kilometraje_actual)
          `)
          .eq('estado', 'completado');

        if (errorFecha || errorKm) throw errorFecha || errorKm;

        // Filtrar servicios por kilometraje
        const alertasKm = serviciosKm?.filter(servicio => {
          if (!servicio.proximo_servicio_km || !servicio.vehiculos?.kilometraje_actual) return false;
          return servicio.vehiculos.kilometraje_actual >= (servicio.proximo_servicio_km - 1000); // 1000km de margen
        }) || [];

        return {
          porFecha: serviciosFecha || [],
          porKilometraje: alertasKm
        };
        
      } catch (error) {
        console.error('Error cargando alertas:', error);
        return { porFecha: [], porKilometraje: [] };
      }
    }
  };

  // UI functions
  const ui = {
    actualizarListaServicios() {
      const container = document.getElementById('contenedor-servicios');
      
      if (serviciosState.servicios.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay servicios registrados</h3>
            <p class="text-gray-500 mb-4">Comienza registrando el primer servicio</p>
            <button onclick="document.getElementById('nuevo-servicio').click()" 
              class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Nuevo Servicio
            </button>
          </div>
        `;
        return;
      }

      if (serviciosState.vista === 'lista') {
        this.renderVistaLista(container);
      } else if (serviciosState.vista === 'timeline') {
        this.renderVistaTimeline(container);
      } else {
        this.renderVistaGrid(container);
      }
    },

    renderVistaLista(container) {
      container.innerHTML = `
        <div class="space-y-4">
          ${serviciosState.servicios.map(servicio => `
            <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl">
                    ${utils.getTipoServicioIcon(servicio.tipo_servicio)}
                  </div>
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <h4 class="text-lg font-semibold text-gray-800">${servicio.descripcion}</h4>
                      <span class="px-2 py-1 rounded-full text-xs font-medium ${utils.getEstadoColor(servicio.estado)}">
                        ${servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1).replace('_', ' ')}
                      </span>
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${servicio.tipo_servicio.charAt(0).toUpperCase() + servicio.tipo_servicio.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        ${servicio.clientes?.nombre || 'Cliente no encontrado'}
                      </span>
                      ${servicio.vehiculos ? `
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                          </svg>
                          ${servicio.vehiculos.marca} ${servicio.vehiculos.modelo} - ${servicio.vehiculos.patente}
                        </span>
                      ` : ''}
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        ${utils.formatDateTime(servicio.fecha_inicio)}
                      </span>
                      ${servicio.tecnico_responsable ? `
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          </svg>
                          ${servicio.tecnico_responsable}
                        </span>
                      ` : ''}
                    </div>
                    ${servicio.observaciones ? `
                      <div class="mt-2 text-sm text-gray-600">
                        <span class="font-medium">Observaciones:</span> ${servicio.observaciones}
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="text-lg font-bold text-emerald-600">${utils.formatCurrency(servicio.costo_mano_obra || 0)}</div>
                    ${servicio.tiempo_estimado || servicio.tiempo_real ? `
                      <div class="text-sm text-gray-500">
                        ${servicio.tiempo_real ? 
                          `Duración: ${utils.formatInterval(servicio.tiempo_real)}` : 
                          `Estimado: ${utils.formatInterval(servicio.tiempo_estimado)}`
                        }
                      </div>
                    ` : ''}
                    ${servicio.kilometraje ? `<div class="text-sm text-gray-500">${servicio.kilometraje.toLocaleString()} km</div>` : ''}
                  </div>
                  
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onclick="mostrarServicio('${servicio.id}')" 
                      class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Ver detalles">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button onclick="editarServicio('${servicio.id}')" 
                      class="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                      title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <div class="relative">
                      <button onclick="toggleMenuEstado('${servicio.id}')" 
                        class="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Cambiar estado">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                      <div id="menu-estado-${servicio.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div class="py-1">
                          ${servicio.estado === 'programado' ? `
                            <button onclick="cambiarEstado('${servicio.id}', 'en_proceso')" 
                              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              🔧 Iniciar Servicio
                            </button>
                          ` : ''}
                          ${servicio.estado === 'en_proceso' ? `
                            <button onclick="cambiarEstado('${servicio.id}', 'completado')" 
                              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              ✅ Marcar Completado
                            </button>
                          ` : ''}
                          <button onclick="cambiarEstado('${servicio.id}', 'cancelado')" 
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            ❌ Cancelar Servicio
                          </button>
                          <hr class="my-1">
                          <button onclick="eliminarServicio('${servicio.id}')" 
                            class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              ${servicio.calificacion ? `
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-700">Calificación:</span>
                      <div class="flex items-center">
                        ${Array.from({length: 5}, (_, i) => `
                          <svg class="w-4 h-4 ${i < servicio.calificacion ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        `).join('')}
                      </div>
                    </div>
                    ${servicio.comentario_cliente ? `
                      <div class="text-sm text-gray-600">
                        <span class="font-medium">Comentario:</span> "${servicio.comentario_cliente}"
                      </div>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    },

    renderVistaGrid(container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${serviciosState.servicios.map(servicio => `
            <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">${utils.getTipoServicioIcon(servicio.tipo_servicio)}</span>
                  <div>
                    <h4 class="font-semibold text-gray-800">${servicio.descripcion}</h4>
                    <span class="text-xs ${utils.getEstadoColor(servicio.estado)} px-2 py-1 rounded-full">
                      ${servicio.estado}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div>👤 ${servicio.clientes?.nombre || 'N/A'}</div>
                ${servicio.vehiculos ? `<div>🚗 ${servicio.vehiculos.marca} ${servicio.vehiculos.modelo}</div>` : ''}
                <div>📅 ${utils.formatDate(servicio.fecha_inicio)}</div>
                ${servicio.tecnico_responsable ? `<div>🔧 ${servicio.tecnico_responsable}</div>` : ''}
              </div>
              
              <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-lg font-bold text-emerald-600">${utils.formatCurrency(servicio.costo_mano_obra || 0)}</span>
                  ${servicio.calificacion ? `
                    <div class="flex items-center">
                      ${Array.from({length: servicio.calificacion}, () => '⭐').join('')}
                    </div>
                  ` : ''}
                </div>
                
                <div class="flex gap-2">
                  <button onclick="mostrarServicio('${servicio.id}')" 
                    class="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                    Ver
                  </button>
                  <button onclick="editarServicio('${servicio.id}')" 
                    class="flex-1 bg-amber-100 text-amber-600 px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors text-sm">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    renderVistaTimeline(container) {
      // Agrupar servicios por fecha
      const serviciosPorFecha = serviciosState.servicios.reduce((grupos, servicio) => {
        const fecha = servicio.fecha_inicio.split('T')[0];
        if (!grupos[fecha]) {
          grupos[fecha] = [];
        }
        grupos[fecha].push(servicio);
        return grupos;
      }, {});

      const fechasOrdenadas = Object.keys(serviciosPorFecha).sort((a, b) => new Date(b) - new Date(a));

      container.innerHTML = `
        <div class="space-y-8">
          ${fechasOrdenadas.map(fecha => `
            <div class="relative">
              <div class="sticky top-0 bg-emerald-100 p-3 rounded-lg mb-4 z-10">
                <h3 class="text-lg font-semibold text-emerald-800">${utils.formatDate(fecha)}</h3>
                <p class="text-sm text-emerald-600">${serviciosPorFecha[fecha].length} servicios</p>
              </div>
              
              <div class="space-y-4 pl-6 border-l-2 border-emerald-200">
                ${serviciosPorFecha[fecha].map((servicio, index) => `
                  <div class="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div class="absolute -left-8 top-6 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-3">
                        <span class="text-lg">${utils.getTipoServicioIcon(servicio.tipo_servicio)}</span>
                        <h4 class="font-semibold text-gray-800">${servicio.descripcion}</h4>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${utils.getEstadoColor(servicio.estado)}">
                          ${servicio.estado}
                        </span>
                      </div>
                      <div class="text-sm text-gray-500">${utils.formatDateTime(servicio.fecha_inicio).split(' ')[1]}</div>
                    </div>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <span>👤 ${servicio.clientes?.nombre || 'N/A'}</span>
                      ${servicio.vehiculos ? `<span>🚗 ${servicio.vehiculos.patente}</span>` : ''}
                      <span class="font-semibold text-emerald-600">${utils.formatCurrency(servicio.costo_mano_obra || 0)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    actualizarEstadisticas() {
      const total = serviciosState.servicios.length;
      const enProceso = serviciosState.servicios.filter(s => s.estado === 'en_proceso').length;
      const programados = serviciosState.servicios.filter(s => s.estado === 'programado').length;
      
      // Completados hoy
      const hoy = new Date().toISOString().split('T')[0];
      const completadosHoy = serviciosState.servicios.filter(s => 
        s.estado === 'completado' && s.fecha_fin?.split('T')[0] === hoy
      ).length;
      
      // Ingresos del mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const ingresosMes = serviciosState.servicios
        .filter(s => s.estado === 'completado' && new Date(s.fecha_fin) >= inicioMes)
        .reduce((sum, s) => sum + (parseFloat(s.costo_mano_obra) || 0), 0);

      document.getElementById('total-servicios').textContent = total;
      document.getElementById('servicios-proceso').textContent = enProceso;
      document.getElementById('servicios-completados-hoy').textContent = completadosHoy;
      document.getElementById('servicios-programados').textContent = programados;
      document.getElementById('ingresos-mes-servicios').textContent = utils.formatCurrency(ingresosMes);
      
      document.getElementById('resultados-info').textContent = `Mostrando ${total} servicios`;
    },

    async mostrarAlertasMantenimiento() {
      const alertas = await api.cargarAlertasMantenimiento();
      const modal = document.getElementById('modal-alertas');
      const contenido = document.getElementById('contenido-alertas');
      
      contenido.innerHTML = `
        <div class="space-y-6">
          <!-- Alertas por fecha -->
          <div>
            <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Próximos por Fecha (30 días)
            </h4>
            ${alertas.porFecha.length === 0 ? `
              <div class="text-center py-6 text-gray-500">
                <p>No hay servicios próximos por fecha</p>
              </div>
            ` : `
              <div class="space-y-3">
                ${alertas.porFecha.map(servicio => `
                  <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h5 class="font-semibold text-gray-800">${servicio.clientes?.nombre}</h5>
                        <p class="text-sm text-gray-600">${servicio.vehiculos?.marca} ${servicio.vehiculos?.modelo} - ${servicio.vehiculos?.patente}</p>
                        <p class="text-sm text-orange-700">Próximo servicio: ${utils.formatDate(servicio.proximo_servicio_fecha)}</p>
                      </div>
                      <button onclick="programarServicio('${servicio.cliente_id}', '${servicio.vehiculo_id}')" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        Programar
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
          
          <!-- Alertas por kilometraje -->
          <div>
            <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Próximos por Kilometraje
            </h4>
            ${alertas.porKilometraje.length === 0 ? `
              <div class="text-center py-6 text-gray-500">
                <p>No hay servicios próximos por kilometraje</p>
              </div>
            ` : `
              <div class="space-y-3">
                ${alertas.porKilometraje.map(servicio => `
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h5 class="font-semibold text-gray-800">${servicio.clientes?.nombre}</h5>
                        <p class="text-sm text-gray-600">${servicio.vehiculos?.marca} ${servicio.vehiculos?.modelo} - ${servicio.vehiculos?.patente}</p>
                        <p class="text-sm text-red-700">
                          Actual: ${(servicio.vehiculos?.kilometraje_actual || 0).toLocaleString()} km | 
                          Próximo: ${(servicio.proximo_servicio_km || 0).toLocaleString()} km
                        </p>
                      </div>
                      <button onclick="programarServicio('${servicio.cliente_id}', '${servicio.vehiculo_id}')" 
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Programar
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;
      
      modal.classList.remove('hidden');
    }
  };

  // Funciones globales para el HTML
  window.mostrarServicio = (id) => {
    const servicio = serviciosState.servicios.find(s => s.id === id);
    if (!servicio) return;
    
    const modal = document.getElementById('modal-servicio');
    const titulo = document.getElementById('modal-servicio-titulo');
    const contenido = document.getElementById('contenido-modal-servicio');
    
    titulo.textContent = 'Detalle del Servicio';
    
    contenido.innerHTML = `
      <div class="bg-white rounded-lg">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Información Principal -->
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">Información General</h4>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">${utils.getTipoServicioIcon(servicio.tipo_servicio)}</span>
                  <div>
                    <p class="font-semibold text-gray-800">${servicio.descripcion}</p>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${utils.getEstadoColor(servicio.estado)}">
                      ${servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Tipo:</span>
                    <p class="font-medium">${servicio.tipo_servicio.charAt(0).toUpperCase() + servicio.tipo_servicio.slice(1).replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span class="text-gray-600">Costo M.O.:</span>
                    <p class="font-medium text-emerald-600">${utils.formatCurrency(servicio.costo_mano_obra || 0)}</p>
                  </div>
                  <div>
                    <span class="text-gray-600">Fecha Inicio:</span>
                    <p class="font-medium">${utils.formatDateTime(servicio.fecha_inicio)}</p>
                  </div>
                  ${servicio.fecha_fin ? `
                    <div>
                      <span class="text-gray-600">Fecha Fin:</span>
                      <p class="font-medium">${utils.formatDateTime(servicio.fecha_fin)}</p>
                    </div>
                  ` : ''}
                  ${servicio.kilometraje ? `
                    <div>
                      <span class="text-gray-600">Kilometraje:</span>
                      <p class="font-medium">${servicio.kilometraje.toLocaleString()} km</p>
                    </div>
                  ` : ''}
                  ${servicio.tecnico_responsable ? `
                    <div>
                      <span class="text-gray-600">Técnico:</span>
                      <p class="font-medium">${servicio.tecnico_responsable}</p>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- Cliente y Vehículo -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">Cliente y Vehículo</h4>
              <div class="space-y-3">
                <div>
                  <span class="text-gray-600">Cliente:</span>
                  <p class="font-semibold text-blue-800">${servicio.clientes?.nombre || 'No especificado'}</p>
                  ${servicio.clientes?.telefono ? `<p class="text-sm text-gray-600">Tel: ${servicio.clientes.telefono}</p>` : ''}
                  ${servicio.clientes?.email ? `<p class="text-sm text-gray-600">Email: ${servicio.clientes.email}</p>` : ''}
                </div>
                ${servicio.vehiculos ? `
                  <div>
                    <span class="text-gray-600">Vehículo:</span>
                    <p class="font-semibold text-blue-800">${servicio.vehiculos.marca} ${servicio.vehiculos.modelo}</p>
                    <p class="text-sm text-gray-600">Patente: ${servicio.vehiculos.patente}</p>
                    ${servicio.vehiculos.kilometraje_actual ? `<p class="text-sm text-gray-600">Km actual: ${servicio.vehiculos.kilometraje_actual.toLocaleString()}</p>` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
            
            ${servicio.observaciones ? `
              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Observaciones</h4>
                <p class="text-gray-700">${servicio.observaciones}</p>
              </div>
            ` : ''}
          </div>
          
          <!-- Información Adicional -->
          <div class="space-y-6">
            ${servicio.tiempo_estimado || servicio.tiempo_real ? `
              <div class="bg-green-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Tiempo de Servicio</h4>
                <div class="space-y-2">
                  ${servicio.tiempo_estimado ? `
                    <div class="flex justify-between">
                      <span class="text-gray-600">Tiempo Estimado:</span>
                      <span class="font-medium">${utils.formatInterval(servicio.tiempo_estimado)}</span>
                    </div>
                  ` : ''}
                  ${servicio.tiempo_real ? `
                    <div class="flex justify-between">
                      <span class="text-gray-600">Tiempo Real:</span>
                      <span class="font-medium text-green-600">${utils.formatInterval(servicio.tiempo_real)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
            
            ${servicio.proximo_servicio_km || servicio.proximo_servicio_fecha ? `
              <div class="bg-purple-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Próximo Servicio</h4>
                <div class="space-y-2">
                  ${servicio.proximo_servicio_km ? `
                    <div class="flex justify-between">
                      <span class="text-gray-600">Por Kilometraje:</span>
                      <span class="font-medium">${servicio.proximo_servicio_km.toLocaleString()} km</span>
                    </div>
                  ` : ''}
                  ${servicio.proximo_servicio_fecha ? `
                    <div class="flex justify-between">
                      <span class="text-gray-600">Por Fecha:</span>
                      <span class="font-medium">${utils.formatDate(servicio.proximo_servicio_fecha)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
            
            ${servicio.calificacion ? `
              <div class="bg-yellow-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Calificación del Cliente</h4>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-600">Calificación:</span>
                    <div class="flex items-center">
                      ${Array.from({length: 5}, (_, i) => `
                        <svg class="w-5 h-5 ${i < servicio.calificacion ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      `).join('')}
                      <span class="ml-2 font-medium">${servicio.calificacion}/5</span>
                    </div>
                  </div>
                  ${servicio.comentario_cliente ? `
                    <div>
                      <span class="text-gray-600">Comentario:</span>
                      <p class="font-medium text-gray-700 mt-1">"${servicio.comentario_cliente}"</p>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">Acciones</h4>
              <div class="space-y-2">
                <button onclick="editarServicio('${servicio.id}')" 
                  class="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  Editar Servicio
                </button>
                ${servicio.estado === 'programado' ? `
                  <button onclick="cambiarEstado('${servicio.id}', 'en_proceso')" 
                    class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Iniciar Servicio
                  </button>
                ` : ''}
                ${servicio.estado === 'en_proceso' ? `
                  <button onclick="cambiarEstado('${servicio.id}', 'completado')" 
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Marcar Completado
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  };

  window.editarServicio = async (id) => {
    const servicio = serviciosState.servicios.find(s => s.id === id);
    if (!servicio) return;
    
    serviciosState.servicioActual = servicio;
    mostrarFormularioServicio(true);
  };

  window.cambiarEstado = async (id, estado) => {
    await api.cambiarEstadoServicio(id, estado);
    document.getElementById(`menu-estado-${id}`).classList.add('hidden');
  };

  window.eliminarServicio = async (id) => {
    if (confirm('¿Está seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
      await api.eliminarServicio(id);
    }
    document.getElementById(`menu-estado-${id}`).classList.add('hidden');
  };

  window.programarServicio = (clienteId, vehiculoId) => {
    // Pre-llenar el formulario con cliente y vehículo
    serviciosState.servicioActual = {
      cliente_id: clienteId,
      vehiculo_id: vehiculoId,
      fecha_inicio: new Date().toISOString().slice(0, 16),
      estado: 'programado'
    };
    
    document.getElementById('modal-alertas').classList.add('hidden');
    mostrarFormularioServicio(false);
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

  // Event listeners principales
  function setupEventListeners() {
    // Nuevo servicio
    document.getElementById('nuevo-servicio').addEventListener('click', () => {
      serviciosState.servicioActual = null;
      mostrarFormularioServicio(false);
    });

    // Calendario
    document.getElementById('calendario-servicios').addEventListener('click', () => {
      mostrarCalendarioServicios();
    });

    // Alertas
    document.getElementById('alertas-mantenimiento').addEventListener('click', () => {
      ui.mostrarAlertasMantenimiento();
    });

    // Cerrar modales
    document.getElementById('cerrar-modal-servicio').addEventListener('click', () => {
      document.getElementById('modal-servicio').classList.add('hidden');
    });

    document.getElementById('cerrar-modal-alertas').addEventListener('click', () => {
      document.getElementById('modal-alertas').classList.add('hidden');
    });

    // Filtros
    document.getElementById('buscar-servicios').addEventListener('input', (e) => {
      serviciosState.filtros.busqueda = e.target.value;
      api.cargarServicios();
    });

    document.getElementById('filtro-estado').addEventListener('change', (e) => {
      serviciosState.filtros.estado = e.target.value;
      api.cargarServicios();
    });

    document.getElementById('filtro-tipo-servicio').addEventListener('change', (e) => {
      serviciosState.filtros.tipoServicio = e.target.value;
      api.cargarServicios();
    });

    document.getElementById('filtro-cliente').addEventListener('change', (e) => {
      serviciosState.filtros.cliente = e.target.value;
      api.cargarServicios();
    });

    document.getElementById('filtro-fecha-desde').addEventListener('change', (e) => {
      serviciosState.filtros.fechaDesde = e.target.value;
      api.cargarServicios();
    });

    document.getElementById('filtro-fecha-hasta').addEventListener('change', (e) => {
      serviciosState.filtros.fechaHasta = e.target.value;
      api.cargarServicios();
    });

    // Limpiar filtros
    document.getElementById('limpiar-filtros').addEventListener('click', () => {
      serviciosState.filtros = {
        busqueda: '',
        estado: '',
        tipoServicio: '',
        fechaDesde: '',
        fechaHasta: '',
        cliente: '',
        vehiculo: '',
        tecnico: ''
      };
      
      document.getElementById('buscar-servicios').value = '';
      document.getElementById('filtro-estado').value = '';
      document.getElementById('filtro-tipo-servicio').value = '';
      document.getElementById('filtro-cliente').value = '';
      document.getElementById('filtro-fecha-desde').value = '';
      document.getElementById('filtro-fecha-hasta').value = '';
      
      api.cargarServicios();
    });

    // Vistas
    document.getElementById('vista-lista').addEventListener('click', () => {
      serviciosState.vista = 'lista';
      document.getElementById('vista-lista').className = 'p-2 rounded-md bg-white shadow-sm text-emerald-600';
      document.getElementById('vista-grid').className = 'p-2 rounded-md text-gray-500 hover:text-emerald-600';
      document.getElementById('vista-timeline').className = 'p-2 rounded-md text-gray-500 hover:text-emerald-600';
      ui.actualizarListaServicios();
    });

    document.getElementById('vista-grid').addEventListener('click', () => {
      serviciosState.vista = 'grid';
      document.getElementById('vista-grid').className = 'p-2 rounded-md bg-white shadow-sm text-emerald-600';
      document.getElementById('vista-lista').className = 'p-2 rounded-md text-gray-500 hover:text-emerald-600';
      document.getElementById('vista-timeline').className = 'p-2 rounded-md text-gray-500 hover:text-emerald-600';
      ui.actualizarListaServicios();
    });

    document.getElementById('vista-timeline').addEventListener('click', () => {
      serviciosState.vista = 'timeline';
      document.getElementById('vista-timeline').className = 'p-2 rounded-md bg-white shadow-sm text-emerald-600';
      document.getElementById('vista-lista').className = 'p-2 rounded-md text-gray-500 hover:text-emerald-600';
      document.getElementById('vista-grid').className = 'p-2 rounded-md text-gray-500 hover:text-emerald-600';
      ui.actualizarListaServicios();
    });

    // Exports
    document.getElementById('exportar-reportes').addEventListener('click', () => {
      exportarReporteServicios();
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

  // Funciones auxiliares
  function mostrarFormularioServicio(esEdicion = false) {
    const modal = document.getElementById('modal-servicio');
    const titulo = document.getElementById('modal-servicio-titulo');
    const contenido = document.getElementById('contenido-modal-servicio');
    
    titulo.textContent = esEdicion ? 'Editar Servicio' : 'Nuevo Servicio';
    
    const servicio = serviciosState.servicioActual || {};
    
    contenido.innerHTML = `
      <form id="formulario-servicio" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Información Básica -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">Información Básica</h4>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select id="servicio-cliente" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar cliente</option>
                ${serviciosState.clientes.map(cliente => `
                  <option value="${cliente.id}" ${servicio.cliente_id === cliente.id ? 'selected' : ''}>
                    ${cliente.nombre}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Vehículo</label>
              <select id="servicio-vehiculo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar vehículo</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio *</label>
              <select id="servicio-tipo" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccionar tipo</option>
                ${serviciosState.tiposServicio.map(tipo => `
                  <option value="${tipo}" ${servicio.tipo_servicio === tipo ? 'selected' : ''}>
                    ${tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea id="servicio-descripcion" required rows="3" 
                placeholder="Descripción del servicio a realizar"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">${servicio.descripcion || ''}</textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select id="servicio-estado" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="programado" ${servicio.estado === 'programado' ? 'selected' : ''}>Programado</option>
                <option value="en_proceso" ${servicio.estado === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                <option value="completado" ${servicio.estado === 'completado' ? 'selected' : ''}>Completado</option>
                <option value="cancelado" ${servicio.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>
          </div>
          
          <!-- Detalles Técnicos -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-800 border-b pb-2">Detalles Técnicos</h4>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Inicio *</label>
              <input type="datetime-local" id="servicio-fecha-inicio" required
                value="${servicio.fecha_inicio ? new Date(servicio.fecha_inicio).toISOString().slice(0, 16) : ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Técnico Responsable</label>
              <input type="text" id="servicio-tecnico" 
                value="${servicio.tecnico_responsable || ''}"
                placeholder="Nombre del técnico"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Costo Mano de Obra</label>
                <input type="number" id="servicio-costo" step="0.01" min="0"
                  value="${servicio.costo_mano_obra || ''}"
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Kilometraje</label>
                <input type="number" id="servicio-kilometraje" min="0"
                  value="${servicio.kilometraje || ''}"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo Estimado (HH:MM)</label>
              <input type="text" id="servicio-tiempo-estimado" 
                pattern="[0-9]{1,2}:[0-9]{2}"
                placeholder="02:30"
                value="${servicio.tiempo_estimado ? utils.formatInterval(servicio.tiempo_estimado).replace('h ', ':').replace('m', '') : ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea id="servicio-observaciones" rows="3" 
                placeholder="Observaciones adicionales"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">${servicio.observaciones || ''}</textarea>
            </div>
          </div>
        </div>
        
        <!-- Próximo Servicio -->
        <div class="border-t pt-6">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">Programar Próximo Servicio</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Próximo Servicio (Km)</label>
              <input type="number" id="proximo-servicio-km" min="0"
                value="${servicio.proximo_servicio_km || ''}"
                placeholder="Kilometraje para próximo servicio"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Próximo Servicio (Fecha)</label>
              <input type="date" id="proximo-servicio-fecha" 
                value="${servicio.proximo_servicio_fecha || ''}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-6 border-t">
          <button type="button" onclick="document.getElementById('modal-servicio').classList.add('hidden')" 
            class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" 
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            ${esEdicion ? 'Actualizar' : 'Guardar'} Servicio
          </button>
        </div>
      </form>
    `;
    
    // Configurar eventos del formulario
    setupFormEventListeners();
    
    modal.classList.remove('hidden');
  }
  
  function setupFormEventListeners() {
    // Cargar vehículos cuando se selecciona un cliente
    document.getElementById('servicio-cliente').addEventListener('change', async (e) => {
      const clienteId = e.target.value;
      const vehiculoSelect = document.getElementById('servicio-vehiculo');
      
      vehiculoSelect.innerHTML = '<option value="">Seleccionar vehículo</option>';
      
      if (clienteId) {
        const vehiculosCliente = serviciosState.vehiculos.filter(v => v.cliente_id === clienteId);
        vehiculoSelect.innerHTML += vehiculosCliente.map(vehiculo => `
          <option value="${vehiculo.id}" ${serviciosState.servicioActual?.vehiculo_id === vehiculo.id ? 'selected' : ''}>
            ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}
          </option>
        `).join('');
      }
    });
    
    // Disparar evento de cambio de cliente si hay uno seleccionado
    const clienteSelect = document.getElementById('servicio-cliente');
    if (clienteSelect.value) {
      clienteSelect.dispatchEvent(new Event('change'));
    }
    
    // Enviar formulario
    document.getElementById('formulario-servicio').addEventListener('submit', async (e) => {
      e.preventDefault();
      await guardarServicioFormulario();
    });
  }
  
  async function guardarServicioFormulario() {
    try {
      const formData = {
        cliente_id: document.getElementById('servicio-cliente').value,
        vehiculo_id: document.getElementById('servicio-vehiculo').value || null,
        tipo_servicio: document.getElementById('servicio-tipo').value,
        descripcion: document.getElementById('servicio-descripcion').value,
        estado: document.getElementById('servicio-estado').value,
        fecha_inicio: document.getElementById('servicio-fecha-inicio').value,
        tecnico_responsable: document.getElementById('servicio-tecnico').value || null,
        costo_mano_obra: parseFloat(document.getElementById('servicio-costo').value) || 0,
        kilometraje: parseInt(document.getElementById('servicio-kilometraje').value) || null,
        observaciones: document.getElementById('servicio-observaciones').value || null,
        proximo_servicio_km: parseInt(document.getElementById('proximo-servicio-km').value) || null,
        proximo_servicio_fecha: document.getElementById('proximo-servicio-fecha').value || null
      };
      
      // Convertir tiempo estimado
      const tiempoEstimado = document.getElementById('servicio-tiempo-estimado').value;
      if (tiempoEstimado && tiempoEstimado.match(/^\d{1,2}:\d{2}$/)) {
        formData.tiempo_estimado = tiempoEstimado + ':00'; // Formato PostgreSQL interval
      }
      
      // Si es edición, agregar ID
      if (serviciosState.servicioActual?.id) {
        formData.id = serviciosState.servicioActual.id;
        formData.updated_at = new Date().toISOString();
      }
      
      await api.guardarServicio(formData, []);
      
      document.getElementById('modal-servicio').classList.add('hidden');
      await api.cargarServicios();
      
    } catch (error) {
      console.error('Error guardando servicio:', error);
      utils.showNotification('Error al guardar el servicio', 'error');
    }
  }
  
  function mostrarCalendarioServicios() {
    const modal = document.getElementById('modal-servicio');
    const titulo = document.getElementById('modal-servicio-titulo');
    const contenido = document.getElementById('contenido-modal-servicio');
    
    titulo.textContent = 'Calendario de Servicios';
    
    // Agrupar servicios por mes
    const serviciosPorMes = serviciosState.servicios.reduce((grupos, servicio) => {
      const fecha = new Date(servicio.fecha_inicio);
      const clave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(servicio);
      return grupos;
    }, {});
    
    const fechasOrdenadas = Object.keys(serviciosPorMes).sort((a, b) => b.localeCompare(a));
    
    contenido.innerHTML = `
      <div class="max-h-[70vh] overflow-y-auto">
        <div class="space-y-6">
          ${fechasOrdenadas.length === 0 ? `
            <div class="text-center py-12">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay servicios programados</h3>
              <p class="text-gray-500">Programa el primer servicio para ver el calendario</p>
            </div>
          ` : fechasOrdenadas.map(mes => {
            const [año, mesNum] = mes.split('-');
            const nombreMes = new Date(parseInt(año), parseInt(mesNum) - 1).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
            
            return `
              <div class="border rounded-lg overflow-hidden">
                <div class="bg-emerald-100 p-4 border-b">
                  <h3 class="text-lg font-semibold text-emerald-800 capitalize">${nombreMes}</h3>
                  <p class="text-sm text-emerald-600">${serviciosPorMes[mes].length} servicios</p>
                </div>
                
                <div class="p-4">
                  <div class="space-y-3">
                    ${serviciosPorMes[mes].sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)).map(servicio => `
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="flex items-center gap-3">
                          <div class="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg border">
                            <div class="text-xs text-gray-500">${new Date(servicio.fecha_inicio).getDate()}</div>
                            <div class="text-xs font-medium text-gray-700">
                              ${new Date(servicio.fecha_inicio).toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase()}
                            </div>
                          </div>
                          
                          <div>
                            <h4 class="font-semibold text-gray-800">${servicio.descripcion}</h4>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                              <span>${servicio.clientes?.nombre || 'Sin cliente'}</span>
                              ${servicio.vehiculos ? `<span>• ${servicio.vehiculos.patente}</span>` : ''}
                              <span class="px-2 py-1 rounded-full text-xs ${utils.getEstadoColor(servicio.estado)}">
                                ${servicio.estado}
                              </span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                              ${utils.formatDateTime(servicio.fecha_inicio)}
                            </div>
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-2">
                          <button onclick="mostrarServicio('${servicio.id}')" 
                            class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="Ver detalles">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </button>
                          <button onclick="editarServicio('${servicio.id}')" 
                            class="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors" title="Editar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    modal.classList.remove('hidden');
  }
  
  function exportarReporteServicios() {
    const datos = serviciosState.servicios.map(servicio => ({
      'Número': serviciosState.servicios.indexOf(servicio) + 1,
      'Fecha': utils.formatDate(servicio.fecha_inicio),
      'Cliente': servicio.clientes?.nombre || 'N/A',
      'Vehículo': servicio.vehiculos ? `${servicio.vehiculos.marca} ${servicio.vehiculos.modelo} - ${servicio.vehiculos.patente}` : 'N/A',
      'Tipo de Servicio': servicio.tipo_servicio.charAt(0).toUpperCase() + servicio.tipo_servicio.slice(1).replace('_', ' '),
      'Descripción': servicio.descripcion,
      'Estado': servicio.estado.charAt(0).toUpperCase() + servicio.estado.slice(1).replace('_', ' '),
      'Técnico': servicio.tecnico_responsable || 'N/A',
      'Costo M.O.': servicio.costo_mano_obra || 0,
      'Kilometraje': servicio.kilometraje || 'N/A',
      'Observaciones': servicio.observaciones || 'N/A'
    }));
    
    // Convertir a CSV
    const headers = Object.keys(datos[0] || {});
    const csvContent = [
      headers.join(','),
      ...datos.map(row => headers.map(header => {
        const value = row[header];
        // Escapar comillas y comas
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_servicios_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    utils.showNotification('Reporte exportado exitosamente', 'success');
  }

  // Inicialización
  setupEventListeners();
  
  // Cargar datos iniciales
  await Promise.all([
    api.cargarClientes(),
    api.cargarVehiculos(),
    api.cargarProductos(),
    api.cargarServicios()
  ]);
}