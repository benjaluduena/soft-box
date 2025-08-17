import { supabase } from '../supabaseClient.js';

export async function renderVentas(container, usuario_id) {
  // Estado de la aplicación
  const state = {
    carrito: [],
    clientes: [],
    productos: [],
    proveedores: [],
    categorias: [],
    ventasRecientes: [],
    productosFrecuentes: [],
    productosFavoritos: [],
    plantillasVenta: [],
    
    // Configuración de venta
    clienteSeleccionado: null,
    metodoPago: 'efectivo',
    descuento: 0,
    plazoCheque: 30,
    modoRapido: false,
    busquedaProductos: '',
    
    // UI State
    paginaActual: 1,
    productosPorPagina: 20,
    filtroStock: 'todos',
    ordenProductos: 'nombre',
    ventaActual: null
  };

  // Utilidades
  const utils = {
    formatCurrency: (amount) => new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS' 
    }).format(amount || 0),
    
    formatDate: (date) => new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date)),
    
    generateId: () => crypto.randomUUID(),
    
    showNotification: (message, type = 'success') => {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
      }`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
    
    validateStock: (productoId, cantidad) => {
      const producto = state.productos.find(p => p.id === productoId);
      return producto && producto.stock >= cantidad;
    }
  };

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header mejorado -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Sistema de Ventas
                </h1>
                <p class="text-gray-600 text-lg">Gestión completa de ventas y productos</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-right text-sm">
                <div class="text-gray-600">Usuario:</div>
                <div class="font-semibold text-gray-800">${usuario_id}</div>
                <div id="hora-actual" class="text-xs text-gray-500"></div>
              </div>
              <button id="btn-refrescar-datos" class="p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 shadow-md hover:shadow-lg" title="Refrescar datos">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
              <button id="btn-diagnostico" class="p-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-200 shadow-md hover:shadow-lg" title="Ejecutar diagnóstico">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Barra de navegación rápida -->
          <div class="flex items-center gap-2 mb-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
            <div class="flex items-center gap-2 mr-6">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="text-sm font-medium text-blue-800">Atajos:</span>
            </div>
            <div class="grid grid-cols-6 gap-3 text-xs text-blue-700">
              <div><kbd class="px-2 py-1 bg-white rounded border shadow-sm">F1</kbd> Rápido</div>
              <div><kbd class="px-2 py-1 bg-white rounded border shadow-sm">F2</kbd> Buscar</div>
              <div><kbd class="px-2 py-1 bg-white rounded border shadow-sm">F3</kbd> Cliente</div>
              <div><kbd class="px-2 py-1 bg-white rounded border shadow-sm">F4</kbd> Historial</div>
              <div><kbd class="px-2 py-1 bg-white rounded border shadow-sm">F5</kbd> Refrescar</div>
              <div><kbd class="px-2 py-1 bg-white rounded border shadow-sm">Ctrl+Enter</kbd> Vender</div>
            </div>
          </div>
        </div>

        <!-- Estadísticas mejoradas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Ventas Hoy</p>
                <p class="text-3xl font-bold text-gray-900" id="ventas-hoy">0</p>
                <p class="text-xs text-green-600 mt-1" id="variacion-ventas">+0%</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Ingresos Hoy</p>
                <p class="text-3xl font-bold text-green-600" id="ingresos-hoy">$0</p>
                <p class="text-xs text-green-600 mt-1" id="meta-ingresos">Meta: $50.000</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Ticket Promedio</p>
                <p class="text-3xl font-bold text-indigo-600" id="promedio-venta">$0</p>
                <p class="text-xs text-gray-500 mt-1" id="comparacion-promedio">vs mes anterior</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p class="text-3xl font-bold text-orange-600" id="productos-stock-bajo">0</p>
                <p class="text-xs text-orange-600 mt-1">Productos críticos</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas simplificadas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Nuevo Cliente -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Nuevo Cliente</h3>
                <p class="text-sm text-gray-600">Registro rápido</p>
              </div>
            </div>
            <button id="nuevo-cliente-rapido" class="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium">
              Crear Cliente
            </button>
          </div>

          <!-- Limpiar Venta -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Limpiar Carrito</h3>
                <p class="text-sm text-gray-600">Reiniciar venta</p>
              </div>
            </div>
            <button id="limpiar-carrito-rapido" class="w-full px-4 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium">
              Limpiar Todo
            </button>
          </div>

          <!-- Productos Frecuentes -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">Más Vendidos</h3>
                <p class="text-sm text-gray-600">Acceso rápido</p>
              </div>
            </div>
            <button id="mostrar-frecuentes" class="w-full px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-medium">
              Ver Favoritos
            </button>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Panel de nueva venta mejorado -->
          <div class="xl:col-span-2">
            <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40">
              <!-- Header del panel -->
              <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 class="text-3xl font-bold text-gray-800">Nueva Venta</h2>
                      <p class="text-gray-600">Construye tu venta paso a paso</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500 mb-1">Venta #</div>
                    <div id="numero-venta" class="text-lg font-bold text-gray-800">--</div>
                  </div>
                </div>
              </div>

              <!-- Proceso de venta paso a paso -->
              <div class="p-8">
                <!-- Paso 1: Selección de Cliente -->
                <div class="mb-8">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <h3 class="text-xl font-semibold text-gray-800">Seleccionar Cliente</h3>
                  </div>
                  
                  <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div class="md:col-span-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                        <select id="select-cliente" class="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm">
                          <option value="">🔍 Buscar y seleccionar cliente...</option>
                        </select>
                        <div id="info-cliente-seleccionado" class="mt-2 hidden">
                          <div class="flex items-center gap-2 text-sm text-blue-700">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Cliente seleccionado: <strong id="nombre-cliente-seleccionado"></strong></span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Acciones</label>
                        <button type="button" id="nuevo-cliente-btn" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          Nuevo Cliente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Paso 2: Agregar Productos -->
                <div class="mb-8">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <h3 class="text-xl font-semibold text-gray-800">Agregar Productos</h3>
                  </div>
                  
                  <div class="bg-green-50 rounded-xl p-6 border border-green-200">
                    <!-- Selector de producto mejorado -->
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                      <div class="md:col-span-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                        <select id="select-producto" class="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm">
                          <option value="">🛍️ Seleccionar producto...</option>
                        </select>
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                        <input type="number" id="cantidad-producto" value="1" min="1" max="999" 
                          class="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-semibold shadow-sm" />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Precio Unit.</label>
                        <input type="text" id="precio-unitario" readonly 
                          class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-center font-semibold text-gray-700" 
                          placeholder="$0.00" />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Acción</label>
                        <button type="button" id="agregar-producto" 
                          class="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          Agregar
                        </button>
                      </div>
                    </div>

                    <!-- Botones de cantidad rápida -->
                    <div class="flex items-center gap-2 mb-4">
                      <span class="text-sm font-medium text-gray-700">Cantidad rápida:</span>
                      <button type="button" class="cantidad-rapida px-3 py-2 bg-white border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-sm font-medium" data-cantidad="1">1</button>
                      <button type="button" class="cantidad-rapida px-3 py-2 bg-white border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-sm font-medium" data-cantidad="2">2</button>
                      <button type="button" class="cantidad-rapida px-3 py-2 bg-white border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-sm font-medium" data-cantidad="5">5</button>
                      <button type="button" class="cantidad-rapida px-3 py-2 bg-white border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-sm font-medium" data-cantidad="10">10</button>
                    </div>

                    <!-- Info del producto seleccionado -->
                    <div id="info-producto" class="hidden bg-white rounded-lg p-4 border border-green-300 shadow-sm">
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span class="text-gray-600">Stock:</span>
                          <span id="stock-disponible" class="font-bold text-green-700">0</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span class="text-gray-600">Precio:</span>
                          <span id="precio-producto" class="font-bold text-blue-700">$0</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span class="text-gray-600">Tipo:</span>
                          <span id="tipo-producto" class="font-bold text-purple-700">-</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span class="text-gray-600">Marca:</span>
                          <span id="marca-producto" class="font-bold text-orange-700">-</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Paso 3: Carrito de Compras -->
                <div class="mb-8">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                      <h3 class="text-xl font-semibold text-gray-800">Carrito de Compras</h3>
                    </div>
                    <div class="flex items-center gap-3">
                      <span id="items-carrito" class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">0 productos</span>
                      <button id="limpiar-carrito" class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                        Limpiar
                      </button>
                    </div>
                  </div>
                  
                  <div class="bg-purple-50 rounded-xl border border-purple-200">
                    <div id="lista-carrito" class="p-4 max-h-80 overflow-y-auto">
                      <div class="text-center text-gray-500 py-12">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                        </svg>
                        <h4 class="text-lg font-medium text-gray-400 mb-2">Carrito vacío</h4>
                        <p class="text-gray-400">Agrega productos para comenzar tu venta</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Paso 4: Configuración de Pago -->
                <div class="mb-8">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                    <h3 class="text-xl font-semibold text-gray-800">Configuración de Pago</h3>
                  </div>
                  
                  <div class="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <select id="metodo-pago" class="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm">
                          <option value="efectivo">💵 Efectivo</option>
                          <option value="débito">💳 Débito</option>
                          <option value="crédito">💎 Crédito</option>
                          <option value="cheque">📝 Cheque</option>
                        </select>
                      </div>
                      
                      <div id="plazo-cheque-container" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Plazo (días)</label>
                        <select id="plazo-cheque" class="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm">
                          <option value="0">Al día</option>
                          <option value="30" selected>30 días</option>
                          <option value="60">60 días</option>
                          <option value="90">90 días</option>
                          <option value="120">120 días</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                      
                      <div id="plazo-custom-container" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Días custom</label>
                        <input type="number" id="plazo-custom" placeholder="Días" min="1" max="365" 
                          class="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm" />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                        <input type="number" id="descuento" placeholder="0" min="0" max="100" step="0.5" 
                          class="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm" />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                        <div class="px-4 py-3 bg-white border border-orange-200 rounded-lg shadow-sm">
                          <span id="subtotal-venta" class="text-lg font-bold text-gray-700">$0.00</span>
                        </div>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Total Final</label>
                        <div class="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md">
                          <span id="total-venta" class="text-xl font-bold">$0.00</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Información del cheque -->
                    <div id="info-cheque" class="hidden bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h4 class="font-semibold text-blue-800">Información del Cheque</h4>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span class="text-blue-600">Fecha de emisión:</span>
                          <span id="fecha-emision" class="font-semibold text-blue-800 ml-2">--</span>
                        </div>
                        <div>
                          <span class="text-blue-600">Fecha de vencimiento:</span>
                          <span id="fecha-vencimiento" class="font-semibold text-blue-800 ml-2">--</span>
                        </div>
                        <div>
                          <span class="text-blue-600">Plazo:</span>
                          <span id="dias-plazo" class="font-semibold text-blue-800 ml-2">-- días</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Paso 5: Confirmar Venta -->
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">5</div>
                      <div>
                        <h3 class="text-xl font-semibold">Confirmar Venta</h3>
                        <p class="text-green-100">Revisa y confirma los datos de la venta</p>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <button type="button" id="previsualizar-venta" class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium backdrop-blur-sm">
                        👁️ Previsualizar
                      </button>
                      <button type="button" id="confirmar-venta" class="px-8 py-3 bg-white text-green-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-bold shadow-lg hover:shadow-xl">
                        ✅ Confirmar Venta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel lateral -->
          <div class="space-y-6">
            <!-- Historial de ventas -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <div class="p-4 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-800">Historial Reciente</h3>
                  <button id="ver-todo-historial" class="text-sm text-blue-600 hover:text-blue-800">Ver todo</button>
                </div>
              </div>
              <div id="historial-ventas" class="p-4 max-h-80 overflow-y-auto">
                <!-- Se llena dinámicamente -->
              </div>
            </div>

            <!-- Productos frecuentes -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <div class="p-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">Más Vendidos</h3>
              </div>
              <div id="productos-frecuentes" class="p-4 max-h-64 overflow-y-auto">
                <!-- Se llena dinámicamente -->
              </div>
            </div>

            <!-- Alertas de stock -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <div class="p-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">Alertas de Stock</h3>
              </div>
              <div id="alertas-stock" class="p-4 max-h-64 overflow-y-auto">
                <!-- Se llena dinámicamente -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <div id="modal-nuevo-cliente" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Nuevo Cliente</h3>
        <form id="form-nuevo-cliente" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="nombre-cliente" required class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" id="telefono-cliente" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email-cliente" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" id="cancelar-cliente" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-plantillas" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">Plantillas de Venta</h3>
          <button id="cerrar-plantillas" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div id="lista-plantillas" class="space-y-3">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    </div>
  `;

  // API y funciones de datos
  const api = {
    async cargarClientes() {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nombre, telefono, email')
          .order('nombre');
        
        if (error) throw error;
        state.clientes = data || [];
        ui.actualizarSelectClientes();
      } catch (error) {
        console.error('Error cargando clientes:', error);
        utils.showNotification('Error al cargar clientes', 'error');
      }
    },

    async cargarProductos() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*, proveedores(nombre)')
          .order(state.ordenProductos);
        
        if (error) throw error;
        state.productos = data || [];
        ui.actualizarSelectProductos();
        ui.actualizarAlertasStock();
      } catch (error) {
        console.error('Error cargando productos:', error);
        utils.showNotification('Error al cargar productos', 'error');
      }
    },

    async cargarEstadisticas() {
      try {
        const hoy = new Date().toISOString().split('T')[0];
        
        // Ventas del día
        const { data: ventasHoy } = await supabase
          .from('ventas')
          .select('id, total, created_at')
          .gte('created_at', hoy + 'T00:00:00.000Z')
          .lt('created_at', hoy + 'T23:59:59.999Z');
        
        // Productos vendidos hoy
        const { data: productosVendidos } = await supabase
          .from('venta_detalle')
          .select('cantidad, ventas(created_at)')
          .gte('ventas.created_at', hoy + 'T00:00:00.000Z')
          .lt('ventas.created_at', hoy + 'T23:59:59.999Z');

        // Actualizar UI
        const totalVentas = ventasHoy?.length || 0;
        const totalIngresos = ventasHoy?.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0) || 0;
        const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;
        const totalProductosVendidos = productosVendidos?.reduce((sum, p) => sum + (p.cantidad || 0), 0) || 0;

        document.getElementById('ventas-hoy').textContent = totalVentas;
        document.getElementById('ingresos-hoy').textContent = utils.formatCurrency(totalIngresos);
        document.getElementById('promedio-venta').textContent = utils.formatCurrency(promedioVenta);

        // Stock bajo
        const productosStockBajo = state.productos.filter(p => p.stock <= 5).length;
        document.getElementById('productos-stock-bajo').textContent = productosStockBajo;

      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    },

    async cargarHistorialVentas(limite = 10) {
      try {
        const { data, error } = await supabase
          .from('ventas')
          .select(`
            id, total, metodo_pago, created_at,
            clientes(nombre),
            profiles(nombre, apellido)
          `)
          .order('created_at', { ascending: false })
          .limit(limite);
        
        if (error) throw error;
        state.ventasRecientes = data || [];
        ui.actualizarHistorialVentas();
      } catch (error) {
        console.error('Error cargando historial:', error);
      }
    },

    async cargarProductosFrecuentes() {
      try {
        const { data, error } = await supabase
          .from('venta_detalle')
          .select(`
            producto_id,
            productos(id, nombre, precio_calculado, stock),
            cantidad
          `)
          .limit(100);
        
        if (error) throw error;
        
        // Agrupar y contar
        const conteo = {};
        data?.forEach(detalle => {
          const id = detalle.producto_id;
          if (!conteo[id]) {
            conteo[id] = {
              producto: detalle.productos,
              cantidadVendida: 0,
              vecesVendido: 0
            };
          }
          conteo[id].cantidadVendida += detalle.cantidad;
          conteo[id].vecesVendido++;
        });

        state.productosFrecuentes = Object.values(conteo)
          .sort((a, b) => b.vecesVendido - a.vecesVendido)
          .slice(0, 10);
        
        ui.actualizarProductosFrecuentes();
      } catch (error) {
        console.error('Error cargando productos frecuentes:', error);
      }
    },

    async crearVenta() {
      if (state.carrito.length === 0) {
        utils.showNotification('Agrega productos al carrito', 'warning');
        return;
      }

      if (!state.clienteSeleccionado) {
        utils.showNotification('Selecciona un cliente', 'warning');
        return;
      }

      try {
        console.log('Iniciando creación de venta...');
        console.log('Cliente seleccionado:', state.clienteSeleccionado);
        console.log('Usuario ID:', usuario_id);
        console.log('Carrito:', state.carrito);
        
        const total = logic.calcularTotal();
        console.log('Total calculado:', total);
        
        // Validar método de pago
        const metodosPermitidos = ['efectivo', 'débito', 'crédito', 'cheque'];
        if (!metodosPermitidos.includes(state.metodoPago)) {
          throw new Error(`Método de pago inválido: ${state.metodoPago}. Debe ser uno de: ${metodosPermitidos.join(', ')}`);
        }

        // Crear venta
        const ventaData = {
          cliente_id: state.clienteSeleccionado,
          usuario_id: usuario_id,
          metodo_pago: state.metodoPago,
          descuento: state.descuento || 0,
          total: total
        };
        
        console.log('Datos de venta a insertar:', ventaData);
        
        const { data: venta, error: errorVenta } = await supabase
          .from('ventas')
          .insert([ventaData])
          .select()
          .single();

        if (errorVenta) {
          console.error('Error insertando venta:', errorVenta);
          throw errorVenta;
        }

        console.log('Venta creada exitosamente:', venta);

        // Crear detalles de venta
        const detalles = state.carrito.map(item => ({
          venta_id: venta.id,
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.precio_calculado) || 0,
          subtotal: (item.cantidad * parseFloat(item.precio_calculado)) || 0
        }));

        console.log('Detalles de venta a insertar:', detalles);

        const { error: errorDetalles } = await supabase
          .from('venta_detalle')
          .insert(detalles);

        if (errorDetalles) {
          console.error('Error insertando detalles:', errorDetalles);
          throw errorDetalles;
        }

        console.log('Detalles de venta creados exitosamente');

        // Actualizar stock
        for (const item of state.carrito) {
          console.log(`Actualizando stock para producto ${item.id}, cantidad: -${item.cantidad}`);
          const stockResult = await api.actualizarStock(item.id, -item.cantidad);
          if (!stockResult) {
            console.warn(`No se pudo actualizar stock para producto ${item.id}`);
          }
        }

        utils.showNotification('Venta procesada exitosamente', 'success');
        logic.limpiarCarrito();
        generarNumeroVenta(); // Generar nuevo número para próxima venta
        await api.cargarEstadisticas();
        await api.cargarHistorialVentas();
        await api.cargarProductos();

      } catch (error) {
        console.error('Error procesando venta:', error);
        console.error('Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        let mensajeError = 'Error al procesar la venta';
        if (error.message) {
          mensajeError += `: ${error.message}`;
        }
        
        utils.showNotification(mensajeError, 'error');
      }
    },

    async actualizarStock(productoId, delta) {
      try {
        const { data: producto, error: errorGet } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', productoId)
          .single();

        if (errorGet) throw errorGet;

        const nuevoStock = Math.max(0, producto.stock + delta);

        const { error: errorUpdate } = await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id', productoId);

        if (errorUpdate) throw errorUpdate;

        return true;
      } catch (error) {
        console.error('Error actualizando stock:', error);
        return false;
      }
    },

    async crearCliente(datosCliente) {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .insert([datosCliente])
          .select()
          .single();

        if (error) throw error;
        
        state.clientes.push(data);
        ui.actualizarSelectClientes();
        utils.showNotification('Cliente creado exitosamente', 'success');
        
        return data;
      } catch (error) {
        console.error('Error creando cliente:', error);
        utils.showNotification('Error al crear cliente', 'error');
        return null;
      }
    }
  };

  // Lógica de negocio
  const logic = {
    agregarProducto(producto, cantidad = 1) {
      if (!utils.validateStock(producto.id, cantidad)) {
        utils.showNotification('Stock insuficiente', 'warning');
        return;
      }

      const itemExistente = state.carrito.find(item => item.id === producto.id);
      
      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        if (!utils.validateStock(producto.id, nuevaCantidad)) {
          utils.showNotification('Stock insuficiente para esa cantidad', 'warning');
          return;
        }
        itemExistente.cantidad = nuevaCantidad;
      } else {
        state.carrito.push({
          ...producto,
          cantidad: cantidad
        });
      }

      ui.actualizarCarrito();
      utils.showNotification('Producto agregado al carrito', 'success');
    },

    eliminarProducto(productoId) {
      state.carrito = state.carrito.filter(item => item.id !== productoId);
      ui.actualizarCarrito();
    },

    modificarCantidad(productoId, nuevaCantidad) {
      const item = state.carrito.find(item => item.id === productoId);
      if (!item) return;

      if (nuevaCantidad <= 0) {
        this.eliminarProducto(productoId);
        return;
      }

      if (!utils.validateStock(productoId, nuevaCantidad)) {
        utils.showNotification('Stock insuficiente', 'warning');
        return;
      }

      item.cantidad = nuevaCantidad;
      ui.actualizarCarrito();
    },

    calcularTotal() {
      const subtotal = state.carrito.reduce((total, item) => {
        return total + (item.precio_calculado * item.cantidad);
      }, 0);
      
      const descuentoMonto = subtotal * (state.descuento / 100);
      return subtotal - descuentoMonto;
    },

    limpiarCarrito() {
      state.carrito = [];
      state.clienteSeleccionado = null;
      state.descuento = 0;
      state.metodoPago = 'efectivo';
      state.plazoCheque = 30;
      
      ui.actualizarCarrito();
      ui.actualizarInfoCliente();
      
      document.getElementById('select-cliente').value = '';
      document.getElementById('descuento').value = '';
      document.getElementById('metodo-pago').value = 'efectivo';
      document.getElementById('plazo-cheque').value = '30';
      document.getElementById('plazo-custom').value = '';
      
      ui.mostrarOcultarControlesCheque();
    },

    buscarProductos(termino) {
      if (!termino.trim()) return [];
      
      const terminoLower = termino.toLowerCase();
      return state.productos.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.tipo?.toLowerCase().includes(terminoLower) ||
        producto.marca?.toLowerCase().includes(terminoLower)
      ).slice(0, 10);
    }
  };

  // Interfaz de usuario
  const ui = {
    actualizarSelectClientes() {
      const select = document.getElementById('select-cliente');
      select.innerHTML = '<option value="">Seleccionar cliente...</option>';
      
      state.clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nombre;
        select.appendChild(option);
      });
    },

    actualizarSelectProductos() {
      const select = document.getElementById('select-producto');
      select.innerHTML = '<option value="">Seleccionar producto...</option>';
      
      const productosDisponibles = state.productos.filter(p => p.stock > 0);
      
      productosDisponibles.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} - Stock: ${producto.stock} - ${utils.formatCurrency(producto.precio_calculado)}`;
        select.appendChild(option);
      });
    },

    actualizarCarrito() {
      const container = document.getElementById('lista-carrito');
      const contadorItems = document.getElementById('items-carrito');
      
      const totalItems = state.carrito.reduce((sum, item) => sum + item.cantidad, 0);
      contadorItems.textContent = `${totalItems} productos`;

      if (state.carrito.length === 0) {
        container.innerHTML = `
          <div class="text-center text-gray-500 py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
            </svg>
            <h4 class="text-lg font-medium text-gray-400 mb-2">Carrito vacío</h4>
            <p class="text-gray-400">Agrega productos para comenzar tu venta</p>
          </div>
        `;
      } else {
        container.innerHTML = state.carrito.map((item, index) => `
          <div class="bg-white rounded-xl p-4 border border-purple-200 mb-3 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 font-bold text-sm">${index + 1}</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800 text-lg">${item.nombre}</h4>
                  <p class="text-sm text-gray-600">${item.tipo || ''} ${item.marca || ''}</p>
                  <div class="flex items-center gap-4 mt-2">
                    <span class="text-sm text-gray-500">Precio unitario:</span>
                    <span class="text-sm font-medium text-blue-600">${utils.formatCurrency(item.precio_calculado)}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <!-- Control de cantidad -->
                <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <button onclick="logic.modificarCantidad('${item.id}', ${item.cantidad - 1})" 
                    class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <span class="w-12 text-center font-bold text-lg">${item.cantidad}</span>
                  <button onclick="logic.modificarCantidad('${item.id}', ${item.cantidad + 1})" 
                    class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Subtotal -->
                <div class="text-right min-w-[100px]">
                  <div class="text-xs text-gray-500 mb-1">Subtotal</div>
                  <div class="text-xl font-bold text-green-600">${utils.formatCurrency(item.precio_calculado * item.cantidad)}</div>
                </div>
                
                <!-- Eliminar -->
                <button onclick="logic.eliminarProducto('${item.id}')" 
                  class="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors ml-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }

      // Actualizar totales
      const subtotal = state.carrito.reduce((total, item) => total + (item.precio_calculado * item.cantidad), 0);
      const total = logic.calcularTotal();
      
      document.getElementById('subtotal-venta').textContent = utils.formatCurrency(subtotal);
      document.getElementById('total-venta').textContent = utils.formatCurrency(total);
    },

    actualizarHistorialVentas() {
      const container = document.getElementById('historial-ventas');
      
      if (state.ventasRecientes.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">No hay ventas recientes</p>';
        return;
      }

      container.innerHTML = state.ventasRecientes.map(venta => `
        <div class="p-3 bg-white rounded-lg border border-gray-200 mb-2 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${venta.clientes?.nombre || 'Cliente no registrado'}</p>
              <p class="text-sm text-gray-600">${utils.formatDate(venta.created_at)}</p>
              <p class="text-xs text-gray-500 capitalize">${venta.metodo_pago}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-green-600">${utils.formatCurrency(venta.total)}</p>
              <button onclick="verDetalleVenta('${venta.id}')" class="text-xs text-blue-600 hover:text-blue-800">Ver detalle</button>
            </div>
          </div>
        </div>
      `).join('');
    },

    actualizarProductosFrecuentes() {
      const container = document.getElementById('productos-frecuentes');
      
      if (state.productosFrecuentes.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">No hay datos suficientes</p>';
        return;
      }

      container.innerHTML = state.productosFrecuentes.map(item => `
        <div class="p-3 bg-white rounded-lg border border-gray-200 mb-2 hover:shadow-md transition-shadow cursor-pointer" onclick="logic.agregarProducto(${JSON.stringify(item.producto).replace(/"/g, '&quot;')}, 1)">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${item.producto.nombre}</p>
              <p class="text-sm text-gray-600">Vendido ${item.vecesVendido} veces</p>
              <p class="text-xs text-gray-500">Stock: ${item.producto.stock}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-blue-600">${utils.formatCurrency(item.producto.precio_calculado)}</p>
              <p class="text-xs text-gray-500">Click para agregar</p>
            </div>
          </div>
        </div>
      `).join('');
    },

    actualizarAlertasStock() {
      const container = document.getElementById('alertas-stock');
      const productosStockBajo = state.productos.filter(p => p.stock <= 5);
      
      if (productosStockBajo.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">No hay alertas de stock</p>';
        return;
      }

      container.innerHTML = productosStockBajo.map(producto => `
        <div class="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${producto.nombre}</p>
              <p class="text-sm text-gray-600">${producto.tipo || ''} ${producto.marca || ''}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-orange-600">Stock: ${producto.stock}</p>
              <p class="text-xs text-orange-500">${producto.stock === 0 ? 'Sin stock' : 'Stock bajo'}</p>
            </div>
          </div>
        </div>
      `).join('');
    },

    mostrarInfoProducto(producto) {
      const container = document.getElementById('info-producto');
      const precioUnitario = document.getElementById('precio-unitario');
      
      if (!producto) {
        container.classList.add('hidden');
        precioUnitario.value = '';
        return;
      }

      document.getElementById('stock-disponible').textContent = producto.stock;
      document.getElementById('precio-producto').textContent = utils.formatCurrency(producto.precio_calculado);
      document.getElementById('tipo-producto').textContent = producto.tipo || '-';
      document.getElementById('marca-producto').textContent = producto.marca || '-';
      
      // Actualizar precio unitario en el formulario
      precioUnitario.value = utils.formatCurrency(producto.precio_calculado);
      
      container.classList.remove('hidden');
    },

    actualizarInfoCliente() {
      const infoContainer = document.getElementById('info-cliente-seleccionado');
      const nombreSpan = document.getElementById('nombre-cliente-seleccionado');
      
      if (state.clienteSeleccionado) {
        const cliente = state.clientes.find(c => c.id === state.clienteSeleccionado);
        if (cliente) {
          nombreSpan.textContent = cliente.nombre;
          infoContainer.classList.remove('hidden');
        }
      } else {
        infoContainer.classList.add('hidden');
      }
    },

    actualizarInfoCheque() {
      const infoCheque = document.getElementById('info-cheque');
      const fechaEmision = document.getElementById('fecha-emision');
      const fechaVencimiento = document.getElementById('fecha-vencimiento');
      const diasPlazo = document.getElementById('dias-plazo');
      
      if (state.metodoPago === 'cheque') {
        const hoy = new Date();
        const fechaVenc = new Date(hoy);
        fechaVenc.setDate(hoy.getDate() + state.plazoCheque);
        
        fechaEmision.textContent = hoy.toLocaleDateString('es-AR');
        fechaVencimiento.textContent = fechaVenc.toLocaleDateString('es-AR');
        diasPlazo.textContent = `${state.plazoCheque} días`;
        
        infoCheque.classList.remove('hidden');
      } else {
        infoCheque.classList.add('hidden');
      }
    },

    mostrarOcultarControlesCheque() {
      const plazoContainer = document.getElementById('plazo-cheque-container');
      const customContainer = document.getElementById('plazo-custom-container');
      
      if (state.metodoPago === 'cheque') {
        plazoContainer.classList.remove('hidden');
        this.actualizarInfoCheque();
      } else {
        plazoContainer.classList.add('hidden');
        customContainer.classList.add('hidden');
      }
    },

    mostrarResultadosBusqueda(resultados) {
      const container = document.getElementById('resultados-busqueda');
      
      if (resultados.length === 0) {
        container.classList.add('hidden');
        return;
      }

      container.innerHTML = resultados.map(producto => `
        <div class="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0" onclick="seleccionarProductoBusqueda('${producto.id}')">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-sm">${producto.nombre}</p>
              <p class="text-xs text-gray-600">${producto.tipo || ''} ${producto.marca || ''}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">${utils.formatCurrency(producto.precio_calculado)}</p>
              <p class="text-xs text-gray-500">Stock: ${producto.stock}</p>
            </div>
          </div>
        </div>
      `).join('');
      
      container.classList.remove('hidden');
    }
  };

  // Event listeners y funcionalidad
  function setupEventListeners() {
    // Actualizar hora
    function actualizarHora() {
      document.getElementById('hora-actual').textContent = new Date().toLocaleString('es-AR');
    }
    actualizarHora();
    setInterval(actualizarHora, 1000);

    // Refrescar datos
    document.getElementById('btn-refrescar-datos').addEventListener('click', async () => {
      await cargarTodosLosDatos();
      utils.showNotification('Datos actualizados', 'success');
    });

    // Ejecutar diagnóstico
    document.getElementById('btn-diagnostico').addEventListener('click', async () => {
      await diagnosticarSistema();
      utils.showNotification('Diagnóstico ejecutado - revisa la consola', 'info');
    });

    // Selección de cliente
    document.getElementById('select-cliente').addEventListener('change', (e) => {
      state.clienteSeleccionado = e.target.value || null;
      ui.actualizarInfoCliente();
    });

    // Selección de producto
    document.getElementById('select-producto').addEventListener('change', (e) => {
      const productoId = e.target.value;
      const producto = state.productos.find(p => p.id === productoId);
      ui.mostrarInfoProducto(producto);
    });

    // Agregar producto
    document.getElementById('agregar-producto').addEventListener('click', () => {
      const productoId = document.getElementById('select-producto').value;
      const cantidad = parseInt(document.getElementById('cantidad-producto').value) || 1;
      
      if (!productoId) {
        utils.showNotification('Selecciona un producto', 'warning');
        return;
      }

      const producto = state.productos.find(p => p.id === productoId);
      if (producto) {
        logic.agregarProducto(producto, cantidad);
        document.getElementById('select-producto').value = '';
        document.getElementById('cantidad-producto').value = '1';
        ui.mostrarInfoProducto(null);
      }
    });

    // Cantidad rápida
    document.querySelectorAll('.cantidad-rapida').forEach(btn => {
      btn.addEventListener('click', () => {
        const cantidad = parseInt(btn.dataset.cantidad);
        document.getElementById('cantidad-producto').value = cantidad;
      });
    });

    // Método de pago
    document.getElementById('metodo-pago').addEventListener('change', (e) => {
      state.metodoPago = e.target.value;
      ui.mostrarOcultarControlesCheque();
    });

    // Plazo del cheque
    document.getElementById('plazo-cheque').addEventListener('change', (e) => {
      const valor = e.target.value;
      const customContainer = document.getElementById('plazo-custom-container');
      
      if (valor === 'custom') {
        customContainer.classList.remove('hidden');
        document.getElementById('plazo-custom').focus();
      } else {
        customContainer.classList.add('hidden');
        state.plazoCheque = parseInt(valor) || 30;
        ui.actualizarInfoCheque();
      }
    });

    // Plazo personalizado
    document.getElementById('plazo-custom').addEventListener('input', (e) => {
      const valor = parseInt(e.target.value);
      if (valor && valor > 0) {
        state.plazoCheque = valor;
        ui.actualizarInfoCheque();
      }
    });

    // Descuento
    document.getElementById('descuento').addEventListener('input', (e) => {
      state.descuento = parseFloat(e.target.value) || 0;
      ui.actualizarCarrito();
    });

    // Mostrar productos frecuentes
    document.getElementById('mostrar-frecuentes').addEventListener('click', () => {
      // Scroll al panel lateral donde están los productos frecuentes
      document.getElementById('productos-frecuentes').scrollIntoView({ 
        behavior: 'smooth' 
      });
    });

    // Nuevo cliente rápido
    document.getElementById('nuevo-cliente-rapido').addEventListener('click', () => {
      document.getElementById('modal-nuevo-cliente').classList.remove('hidden');
    });

    // Limpiar carrito rápido
    document.getElementById('limpiar-carrito-rapido').addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
        logic.limpiarCarrito();
      }
    });

    // Limpiar carrito (botón del carrito)
    document.getElementById('limpiar-carrito').addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
        logic.limpiarCarrito();
      }
    });

    // Confirmar venta
    document.getElementById('confirmar-venta').addEventListener('click', async () => {
      if (state.carrito.length === 0) {
        utils.showNotification('Agrega productos al carrito', 'warning');
        return;
      }

      if (!state.clienteSeleccionado) {
        utils.showNotification('Selecciona un cliente', 'warning');
        return;
      }

      const total = logic.calcularTotal();
      if (confirm(`¿Confirmar venta por ${utils.formatCurrency(total)}?`)) {
        await api.crearVenta();
      }
    });

    // Nuevo cliente
    document.getElementById('nuevo-cliente-btn').addEventListener('click', () => {
      document.getElementById('modal-nuevo-cliente').classList.remove('hidden');
    });

    document.getElementById('cancelar-cliente').addEventListener('click', () => {
      document.getElementById('modal-nuevo-cliente').classList.add('hidden');
      document.getElementById('form-nuevo-cliente').reset();
    });

    document.getElementById('form-nuevo-cliente').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const datosCliente = {
        nombre: document.getElementById('nombre-cliente').value,
        telefono: document.getElementById('telefono-cliente').value,
        email: document.getElementById('email-cliente').value
      };

      const cliente = await api.crearCliente(datosCliente);
      if (cliente) {
        document.getElementById('modal-nuevo-cliente').classList.add('hidden');
        document.getElementById('form-nuevo-cliente').reset();
        document.getElementById('select-cliente').value = cliente.id;
        state.clienteSeleccionado = cliente.id;
      }
    });

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        document.getElementById('toggle-modo-rapido').click();
      } else if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('busqueda-inteligente').focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        document.getElementById('nuevo-cliente-btn').click();
      } else if (e.key === 'F5') {
        e.preventDefault();
        document.getElementById('btn-refrescar-datos').click();
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('confirmar-venta').click();
      }
    });
  }

  // Funciones globales para el HTML
  window.logic = logic;
  window.seleccionarProductoBusqueda = (productoId) => {
    const producto = state.productos.find(p => p.id === productoId);
    if (producto) {
      document.getElementById('select-producto').value = productoId;
      ui.mostrarInfoProducto(producto);
      document.getElementById('resultados-busqueda').classList.add('hidden');
      document.getElementById('busqueda-inteligente').value = producto.nombre;
    }
  };

  window.verDetalleVenta = async (ventaId) => {
    // Implementar modal de detalle de venta
    console.log('Ver detalle de venta:', ventaId);
  };

  // Función de diagnóstico para verificar autenticación y permisos
  async function diagnosticarSistema() {
    try {
      console.log('=== DIAGNÓSTICO DEL SISTEMA ===');
      
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Usuario autenticado:', user ? user.id : 'No autenticado');
      console.log('Error de auth:', authError);
      
      if (user) {
        // Verificar perfil
        const { data: perfil, error: perfilError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Perfil del usuario:', perfil);
        console.log('Error de perfil:', perfilError);
        
        // Test de permisos básicos
        const { data: testClientes, error: errorClientes } = await supabase
          .from('clientes')
          .select('id, nombre')
          .limit(1);
        
        console.log('Test clientes:', testClientes);
        console.log('Error clientes:', errorClientes);
        
        const { data: testProductos, error: errorProductos } = await supabase
          .from('productos')
          .select('id, nombre')
          .limit(1);
        
        console.log('Test productos:', testProductos);
        console.log('Error productos:', errorProductos);
        
        // Verificar estado actual
        console.log('Estado actual del sistema:');
        console.log('- Cliente seleccionado:', state.clienteSeleccionado);
        console.log('- Método de pago:', state.metodoPago);
        console.log('- Plazo cheque:', state.plazoCheque, 'días');
        console.log('- Descuento:', state.descuento, '%');
        console.log('- Carrito:', state.carrito.length, 'productos');
        console.log('- Productos en carrito:', state.carrito);
      }
      
      console.log('=== FIN DIAGNÓSTICO ===');
    } catch (error) {
      console.error('Error en diagnóstico:', error);
    }
  }

  // Cargar datos iniciales
  async function cargarTodosLosDatos() {
    // Ejecutar diagnóstico primero
    await diagnosticarSistema();
    
    await Promise.all([
      api.cargarClientes(),
      api.cargarProductos(),
      api.cargarEstadisticas(),
      api.cargarHistorialVentas(),
      api.cargarProductosFrecuentes()
    ]);
    
    // Generar número de venta
    generarNumeroVenta();
  }

  function generarNumeroVenta() {
    const now = new Date();
    const numeroVenta = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    document.getElementById('numero-venta').textContent = numeroVenta;
  }

  // Inicialización
  setupEventListeners();
  await cargarTodosLosDatos();
}