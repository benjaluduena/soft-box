import { supabase } from '../supabaseClient.js';

export async function renderCompras(container, usuario_id) {
  // Estado centralizado de la aplicación
  const state = {
    carrito: [],
    proveedores: [],
    productos: [],
    proveedorSeleccionado: null,
    metodoPago: 'efectivo',
    descuento: 0,
    busquedaProductos: '',
    comprasRecientes: [],
    paginaActual: 1,
    productosPorPagina: 20,
    filtroFecha: 'mes'
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
    
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Compras
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Administra las compras a proveedores y controla el inventario</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Compras Hoy</p>
                <p class="text-2xl font-bold text-gray-900" id="compras-hoy">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Gastos Hoy</p>
                <p class="text-2xl font-bold text-purple-600" id="gastos-hoy">$0.00</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Compras Mes</p>
                <p class="text-2xl font-bold text-indigo-600" id="compras-mes">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Gastos Mes</p>
                <p class="text-2xl font-bold text-indigo-600" id="gastos-mes">$0.00</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Nueva Compra -->
          <div class="lg:col-span-3 order-1">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800">Nueva Compra</h2>
              </div>

              <form id="compras-form" class="space-y-6">
                <!-- Proveedor y Producto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                    <select id="select-proveedor" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                      <option value="">Seleccionar proveedor</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                    <select id="select-producto" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                      <option value="">Seleccionar producto</option>
                    </select>
                  </div>
                </div>

                <!-- Botón Agregar -->
                <div class="mt-4">
                  <button type="button" id="agregar-producto" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="text-lg">Agregar al Carrito</span>
                  </button>
                </div>

                <!-- Carrito -->
                <div id="carrito-lista" class="space-y-3"></div>

                <!-- Total y Confirmar -->
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div>
                    <p class="text-sm text-gray-600">Total de la compra</p>
                    <p class="text-3xl font-bold text-purple-600">$<span id="total-compra">0.00</span></p>
                  </div>
                  <button type="button" id="confirmar-compra" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Confirmar Compra
                  </button>
                </div>

              </form>
            </div>
          </div>

          <!-- Panel lateral -->
          <div class="lg:col-span-1 order-2 space-y-6">
            <!-- Historial de compras -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <div class="p-4 border-b border-gray-100">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-800">Historial Reciente</h3>
                  <button id="ver-todo-historial" class="text-sm text-purple-600 hover:text-purple-800">Ver todo</button>
                </div>
              </div>
              
              <div class="p-4">
                <div class="relative mb-4">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input id="buscar-compra-proveedor" type="text" placeholder="Buscar por proveedor..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm" />
                </div>
                
                <div id="compras-lista-historial" class="space-y-3 max-h-80 overflow-y-auto"></div>
              </div>
            </div>

            <!-- Productos más comprados -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <div class="p-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">Más Comprados</h3>
              </div>
              <div id="productos-frecuentes" class="p-4 max-h-64 overflow-y-auto">
                <!-- Se llena dinámicamente -->
              </div>
            </div>

            <!-- Proveedores principales -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <div class="p-4 border-b border-gray-100">
                <h3 class="text-lg font-semibold text-gray-800">Proveedores Principales</h3>
              </div>
              <div id="proveedores-principales" class="p-4 max-h-64 overflow-y-auto">
                <!-- Se llena dinámicamente -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <div id="modal-nuevo-proveedor" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Nuevo Proveedor</h3>
        <form id="form-nuevo-proveedor" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="nombre-proveedor" required class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" id="telefono-proveedor" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email-proveedor" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <textarea id="direccion-proveedor" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" id="cancelar-proveedor" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // API y funciones de datos
  const api = {
    async cargarProveedores() {
      try {
        const { data, error } = await supabase
          .from('proveedores')
          .select('id, nombre, telefono, email, margen_ganancia')
          .order('nombre');
        
        if (error) throw error;
        state.proveedores = data || [];
      } catch (error) {
        console.error('Error cargando proveedores:', error);
        utils.showNotification('Error al cargar proveedores', 'error');
      }
    },

    async cargarProductos() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('nombre');
        
        if (error) throw error;
        state.productos = data || [];
      } catch (error) {
        console.error('Error cargando productos:', error);
        utils.showNotification('Error al cargar productos', 'error');
      }
    },

    async cargarEstadisticas() {
      try {
        const hoy = new Date().toISOString().split('T')[0];
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
        
        // Compras e gastos de hoy
        const { data: comprasHoy } = await supabase
          .from('compras')
          .select('total')
          .gte('created_at', hoy + 'T00:00:00.000Z')
          .lt('created_at', hoy + 'T23:59:59.999Z');
        
        const comprasHoyCount = comprasHoy?.length || 0;
        const gastosHoy = comprasHoy?.reduce((acc, c) => acc + (c.total || 0), 0) || 0;
        
        // Compras e gastos del mes
        const { data: comprasMes } = await supabase
          .from('compras')
          .select('total')
          .gte('created_at', inicioMes + 'T00:00:00.000Z')
          .lte('created_at', finMes + 'T23:59:59.999Z');
        
        const comprasMesCount = comprasMes?.length || 0;
        const gastosMes = comprasMes?.reduce((acc, c) => acc + (c.total || 0), 0) || 0;
        
        document.getElementById('compras-hoy').textContent = comprasHoyCount;
        document.getElementById('gastos-hoy').textContent = utils.formatCurrency(gastosHoy);
        document.getElementById('compras-mes').textContent = comprasMesCount;
        document.getElementById('gastos-mes').textContent = utils.formatCurrency(gastosMes);
        
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    },

    async cargarHistorialCompras(filtroProveedor = '') {
      try {
        const historialDiv = document.getElementById('compras-lista-historial');
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const desde = new Date(year, month, 1).toISOString().split('T')[0];
        const hasta = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        let query = supabase
          .from('compras')
          .select('*, proveedores(nombre)')
          .gte('created_at', desde + 'T00:00:00.000Z')
          .lte('created_at', hasta + 'T23:59:59.999Z')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (filtroProveedor) {
          query = query.ilike('proveedores.nombre', `%${filtroProveedor}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        state.comprasRecientes = data || [];
        ui.actualizarHistorialCompras();
      } catch (error) {
        console.error('Error cargando historial:', error);
      }
    },

    async crearProveedor(datosProveedor) {
      try {
        const { data, error } = await supabase
          .from('proveedores')
          .insert([datosProveedor])
          .select()
          .single();

        if (error) throw error;
        
        state.proveedores.push(data);
        ui.actualizarSelectProveedores();
        utils.showNotification('Proveedor creado exitosamente', 'success');
        
        return data;
      } catch (error) {
        console.error('Error creando proveedor:', error);
        utils.showNotification('Error al crear proveedor', 'error');
        return null;
      }
    },

    async crearCompra() {
      if (state.carrito.length === 0) {
        utils.showNotification('Agrega productos al carrito', 'warning');
        return;
      }

      if (!state.proveedorSeleccionado) {
        utils.showNotification('Selecciona un proveedor', 'warning');
        return;
      }

      try {
        const total = logic.calcularTotal();
        
        // Crear compra (sin descuento ya que no existe la columna)
        const compraData = {
          proveedor_id: state.proveedorSeleccionado,
          usuario_id: usuario_id,
          total: total
        };
        
        const { data: compra, error: errorCompra } = await supabase
          .from('compras')
          .insert([compraData])
          .select()
          .single();

        if (errorCompra) throw errorCompra;

        // Crear detalles de compra
        const detalles = state.carrito.map(item => ({
          compra_id: compra.id,
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.costo_unitario) || 0,
          subtotal: (item.cantidad * parseFloat(item.costo_unitario)) || 0
        }));

        const { error: errorDetalles } = await supabase
          .from('compra_detalle')
          .insert(detalles);

        if (errorDetalles) throw errorDetalles;

        // Actualizar stock
        for (const item of state.carrito) {
          const stockResult = await this.actualizarStock(item.id, item.cantidad);
          if (!stockResult) {
            console.warn(`No se pudo actualizar stock para producto ${item.id}`);
          }
        }

        utils.showNotification('Compra procesada exitosamente', 'success');
        logic.limpiarCarrito();
        await api.cargarEstadisticas();
        await api.cargarHistorialCompras();
        await api.cargarProductos();

      } catch (error) {
        console.error('Error procesando compra:', error);
        utils.showNotification('Error al procesar la compra: ' + error.message, 'error');
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
    }
  };

  // Lógica de negocio
  const logic = {
    agregarProducto(producto, cantidad = 1, costoUnitario = null) {
      const itemExistente = state.carrito.find(item => item.id === producto.id);
      const costo = costoUnitario || producto.costo || 0;
      
      if (itemExistente) {
        itemExistente.cantidad += cantidad;
      } else {
        state.carrito.push({
          ...producto,
          cantidad: cantidad,
          costo_unitario: costo
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

      item.cantidad = nuevaCantidad;
      ui.actualizarCarrito();
    },

    calcularTotal() {
      const subtotal = state.carrito.reduce((total, item) => {
        return total + (item.costo_unitario * item.cantidad);
      }, 0);
      
      const descuentoMonto = subtotal * (state.descuento / 100);
      return subtotal - descuentoMonto;
    },

    limpiarCarrito() {
      state.carrito = [];
      state.proveedorSeleccionado = null;
      state.descuento = 0;
      state.metodoPago = 'efectivo';
      
      ui.actualizarCarrito();
      ui.actualizarInfoProveedor();
      
      // Solo limpiar elementos si existen
      const selectProveedor = document.getElementById('select-proveedor');
      const descuentoEl = document.getElementById('descuento');
      const metodoPagoEl = document.getElementById('metodo-pago');
      
      if (selectProveedor) selectProveedor.value = '';
      if (descuentoEl) descuentoEl.value = '';
      if (metodoPagoEl) metodoPagoEl.value = 'efectivo';
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
    actualizarSelectProveedores() {
      const select = document.getElementById('select-proveedor');
      select.innerHTML = '<option value="">🏢 Seleccionar proveedor...</option>';
      
      state.proveedores.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor.id;
        const margenTexto = proveedor.margen_ganancia ? `- ${(proveedor.margen_ganancia * 100).toFixed(1)}% margen` : '';
        option.textContent = `${proveedor.nombre} ${margenTexto}`;
        select.appendChild(option);
      });
    },

    actualizarSelectProductos() {
      const select = document.getElementById('select-producto');
      select.innerHTML = '<option value="">🛍️ Seleccionar producto...</option>';
      
      state.productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} - ${utils.formatCurrency(producto.costo || 0)}`;
        select.appendChild(option);
      });
    },

    actualizarCarrito() {
      const container = document.getElementById('carrito-lista');
      const contadorItems = document.getElementById('items-carrito');
      
      if (!container) {
        console.warn('Elemento carrito-lista no encontrado');
        return;
      }
      
      const totalItems = state.carrito.reduce((sum, item) => sum + item.cantidad, 0);
      
      // Solo actualizar el contador si el elemento existe
      if (contadorItems) {
        contadorItems.textContent = `${totalItems} productos`;
      }

      if (state.carrito.length === 0) {
        container.innerHTML = `
          <div class="text-center text-gray-500 py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <h4 class="text-lg font-medium text-gray-400 mb-2">Carrito vacío</h4>
            <p class="text-gray-400">Agrega productos para comenzar tu compra</p>
          </div>
        `;
      } else {
        container.innerHTML = state.carrito.map((item, index) => `
          <div class="bg-white rounded-xl p-4 border border-orange-200 mb-3 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span class="text-orange-600 font-bold text-sm">${index + 1}</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800 text-lg">${item.nombre}</h4>
                  <p class="text-sm text-gray-600">${item.tipo || ''} ${item.marca || ''}</p>
                  <div class="flex items-center gap-4 mt-2">
                    <span class="text-sm text-gray-500">Costo unitario:</span>
                    <span class="text-sm font-medium text-blue-600">${utils.formatCurrency(item.costo_unitario)}</span>
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
                  <div class="text-xl font-bold text-orange-600">${utils.formatCurrency(item.costo_unitario * item.cantidad)}</div>
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
      const subtotal = state.carrito.reduce((total, item) => total + (item.costo_unitario * item.cantidad), 0);
      const total = logic.calcularTotal();
      
      // Solo actualizar si los elementos existen
      const subtotalEl = document.getElementById('subtotal-compra');
      const totalEl = document.getElementById('total-compra');
      
      if (subtotalEl) {
        subtotalEl.textContent = utils.formatCurrency(subtotal);
      }
      
      if (totalEl) {
        totalEl.textContent = utils.formatCurrency(total);
      }
    },

    actualizarHistorialCompras() {
      const container = document.getElementById('compras-lista-historial');
      
      if (state.comprasRecientes.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">No hay compras recientes</p>';
        return;
      }

      container.innerHTML = state.comprasRecientes.map(compra => `
        <div class="p-3 bg-white rounded-lg border border-gray-200 mb-2 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${compra.proveedores?.nombre || 'Proveedor no registrado'}</p>
              <p class="text-sm text-gray-600">${utils.formatDate(compra.created_at)}</p>
              <p class="text-xs text-gray-500 capitalize">${compra.metodo_pago || 'efectivo'}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-purple-600">${utils.formatCurrency(compra.total)}</p>
              <button onclick="verDetalleCompra('${compra.id}')" class="text-xs text-blue-600 hover:text-blue-800">Ver detalle</button>
            </div>
          </div>
        </div>
      `).join('');
    },

    actualizarInfoProveedor() {
      const infoContainer = document.getElementById('info-proveedor-seleccionado');
      const nombreSpan = document.getElementById('nombre-proveedor-seleccionado');
      
      // Solo actualizar si los elementos existen
      if (!infoContainer || !nombreSpan) {
        return;
      }
      
      if (state.proveedorSeleccionado) {
        const proveedor = state.proveedores.find(p => p.id === state.proveedorSeleccionado);
        if (proveedor) {
          nombreSpan.textContent = proveedor.nombre;
          infoContainer.classList.remove('hidden');
        }
      } else {
        infoContainer.classList.add('hidden');
      }
    },

    mostrarInfoProducto(producto) {
      const container = document.getElementById('info-producto');
      const costoUnitario = document.getElementById('costo-unitario');
      
      if (!producto) {
        if (container) container.classList.add('hidden');
        if (costoUnitario) costoUnitario.value = '';
        return;
      }

      // Solo actualizar si los elementos existen
      const stockEl = document.getElementById('stock-actual');
      const costoSugeridoEl = document.getElementById('costo-sugerido');
      const tipoEl = document.getElementById('tipo-producto');
      const marcaEl = document.getElementById('marca-producto');
      
      if (stockEl) stockEl.textContent = producto.stock || 0;
      if (costoSugeridoEl) costoSugeridoEl.textContent = utils.formatCurrency(producto.costo);
      if (tipoEl) tipoEl.textContent = producto.tipo || '-';
      if (marcaEl) marcaEl.textContent = producto.marca || '-';
      
      // Actualizar costo unitario en el formulario si existe
      if (costoUnitario) {
        costoUnitario.value = producto.costo || 0;
        ui.actualizarSubtotalItem();
      }
      
      if (container) container.classList.remove('hidden');
    },

    actualizarSubtotalItem() {
      const cantidadEl = document.getElementById('cantidad-producto');
      const costoEl = document.getElementById('costo-unitario');
      const subtotalEl = document.getElementById('subtotal-item');
      
      if (cantidadEl && costoEl && subtotalEl) {
        const cantidad = parseInt(cantidadEl.value) || 0;
        const costo = parseFloat(costoEl.value) || 0;
        const subtotal = cantidad * costo;
        
        subtotalEl.textContent = utils.formatCurrency(subtotal);
      }
    },

    mostrarResultadosBusqueda(resultados) {
      const container = document.getElementById('resultados-busqueda-producto');
      
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
              <p class="text-sm font-medium">${utils.formatCurrency(producto.costo)}</p>
              <p class="text-xs text-gray-500">Stock: ${producto.stock || 0}</p>
            </div>
          </div>
        </div>
      `).join('');
      
      container.classList.remove('hidden');
    },

    actualizarProveedoresPrincipales() {
      const container = document.getElementById('proveedores-principales');
      
      if (state.proveedores.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">No hay proveedores registrados</p>';
        return;
      }

      container.innerHTML = state.proveedores.slice(0, 5).map(proveedor => `
        <div class="p-3 bg-white rounded-lg border border-gray-200 mb-2 hover:shadow-md transition-shadow cursor-pointer" onclick="seleccionarProveedor('${proveedor.id}')">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${proveedor.nombre}</p>
              <p class="text-sm text-gray-600">${proveedor.telefono || 'Sin teléfono'}</p>
              ${proveedor.margen_ganancia ? `<p class="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Margen: ${(proveedor.margen_ganancia * 100).toFixed(1)}%</p>` : ''}
            </div>
            <div class="text-right">
              <p class="text-xs text-purple-600">Click para seleccionar</p>
            </div>
          </div>
        </div>
      `).join('');
    }
  };

  // Event listeners y funcionalidad
  function setupEventListeners() {
    
    // Selección de proveedor
    const selectProveedor = document.getElementById('select-proveedor');
    if (selectProveedor) {
      selectProveedor.addEventListener('change', (e) => {
        state.proveedorSeleccionado = e.target.value || null;
        ui.actualizarInfoProveedor();
      });
    }

    // Selección de producto
    document.getElementById('select-producto').addEventListener('change', (e) => {
      const productoId = e.target.value;
      const producto = state.productos.find(p => p.id === productoId);
      ui.mostrarInfoProducto(producto);
    });

    // Busqueda de productos
    const busquedaProducto = document.getElementById('busqueda-producto');
    if (busquedaProducto) {
      const debouncedSearch = utils.debounce((termino) => {
        const resultados = logic.buscarProductos(termino);
        ui.mostrarResultadosBusqueda(resultados);
      }, 300);
      
      busquedaProducto.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // Agregar producto
    const btnAgregar = document.getElementById('agregar-producto');
    
    if (btnAgregar) {
      btnAgregar.addEventListener('click', () => {
        const selectProducto = document.getElementById('select-producto');
        
        if (!selectProducto) {
          utils.showNotification('Error: Select de productos no encontrado', 'error');
          return;
        }
        
        const productoId = selectProducto.value;
        
        if (!productoId) {
          utils.showNotification('Selecciona un producto', 'warning');
          return;
        }

        const producto = state.productos.find(p => p.id === productoId);
        
        if (producto) {
          // Usar el costo del producto o un valor por defecto
          const costoUnitario = producto.costo || 0;
          
          if (costoUnitario <= 0) {
            utils.showNotification('El producto no tiene un costo válido', 'warning');
            return;
          }
          
          logic.agregarProducto(producto, 1, costoUnitario);
          selectProducto.value = '';
        } else {
          utils.showNotification('Producto no encontrado', 'error');
        }
      });
    }

    // Cantidad rápida (solo si existen los elementos)
    document.querySelectorAll('.cantidad-rapida').forEach(btn => {
      btn.addEventListener('click', () => {
        const cantidad = parseInt(btn.dataset.cantidad);
        const cantidadEl = document.getElementById('cantidad-producto');
        if (cantidadEl) {
          cantidadEl.value = cantidad;
          ui.actualizarSubtotalItem();
        }
      });
    });

    // Cambios en cantidad y costo (solo si existen los elementos)
    const cantidadEl = document.getElementById('cantidad-producto');
    const costoEl = document.getElementById('costo-unitario');
    
    if (cantidadEl) {
      cantidadEl.addEventListener('input', ui.actualizarSubtotalItem);
    }
    
    if (costoEl) {
      costoEl.addEventListener('input', ui.actualizarSubtotalItem);
    }

    // Método de pago (solo si existe)
    const metodoPagoEl = document.getElementById('metodo-pago');
    if (metodoPagoEl) {
      metodoPagoEl.addEventListener('change', (e) => {
        state.metodoPago = e.target.value;
      });
    }

    // Descuento (solo si existe)
    const descuentoEl = document.getElementById('descuento');
    if (descuentoEl) {
      descuentoEl.addEventListener('input', (e) => {
        state.descuento = parseFloat(e.target.value) || 0;
        ui.actualizarCarrito();
      });
    }

    // Limpiar carrito (solo si existe)
    const limpiarCarritoEl = document.getElementById('limpiar-carrito');
    if (limpiarCarritoEl) {
      limpiarCarritoEl.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
          logic.limpiarCarrito();
        }
      });
    }

    // Confirmar compra
    document.getElementById('confirmar-compra').addEventListener('click', async () => {
      if (state.carrito.length === 0) {
        utils.showNotification('Agrega productos al carrito', 'warning');
        return;
      }

      if (!state.proveedorSeleccionado) {
        utils.showNotification('Selecciona un proveedor', 'warning');
        return;
      }

      const total = logic.calcularTotal();
      if (confirm(`¿Confirmar compra por ${utils.formatCurrency(total)}?`)) {
        await api.crearCompra();
      }
    });

    // Nuevo proveedor (solo si existen los elementos)
    const nuevoProveedorBtn = document.getElementById('nuevo-proveedor-btn');
    const cancelarProveedorBtn = document.getElementById('cancelar-proveedor');
    const modalProveedor = document.getElementById('modal-nuevo-proveedor');
    const formProveedor = document.getElementById('form-nuevo-proveedor');
    
    if (nuevoProveedorBtn && modalProveedor) {
      nuevoProveedorBtn.addEventListener('click', () => {
        modalProveedor.classList.remove('hidden');
      });
    }

    if (cancelarProveedorBtn && modalProveedor && formProveedor) {
      cancelarProveedorBtn.addEventListener('click', () => {
        modalProveedor.classList.add('hidden');
        formProveedor.reset();
      });
    }

    if (formProveedor) {
      formProveedor.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombreEl = document.getElementById('nombre-proveedor');
        const telefonoEl = document.getElementById('telefono-proveedor');
        const emailEl = document.getElementById('email-proveedor');
        const direccionEl = document.getElementById('direccion-proveedor');
        
        if (!nombreEl) return;
        
        const datosProveedor = {
          nombre: nombreEl.value,
          telefono: telefonoEl?.value || '',
          email: emailEl?.value || '',
          direccion: direccionEl?.value || ''
        };

        const proveedor = await api.crearProveedor(datosProveedor);
        if (proveedor) {
          if (modalProveedor) modalProveedor.classList.add('hidden');
          if (formProveedor) formProveedor.reset();
          
          const selectProveedor = document.getElementById('select-proveedor');
          if (selectProveedor) {
            selectProveedor.value = proveedor.id;
            state.proveedorSeleccionado = proveedor.id;
            ui.actualizarInfoProveedor();
          }
        }
      });
    }

    // Búsqueda en historial (solo si existe)
    const busquedaProveedor = document.getElementById('buscar-compra-proveedor');
    if (busquedaProveedor) {
      const debouncedSearchProveedor = utils.debounce((filtro) => {
        api.cargarHistorialCompras(filtro);
      }, 300);
      
      busquedaProveedor.addEventListener('input', (e) => {
        debouncedSearchProveedor(e.target.value);
      });
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        document.getElementById('busqueda-producto').focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('nuevo-proveedor-btn').click();
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.fixed.inset-0').forEach(modal => {
          modal.classList.add('hidden');
        });
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('confirmar-compra').click();
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
      document.getElementById('resultados-busqueda-producto').classList.add('hidden');
      document.getElementById('busqueda-producto').value = producto.nombre;
    }
  };

  window.seleccionarProveedor = (proveedorId) => {
    document.getElementById('select-proveedor').value = proveedorId;
    state.proveedorSeleccionado = proveedorId;
    ui.actualizarInfoProveedor();
  };

  window.verDetalleCompra = async (compraId) => {
    console.log('Ver detalle de compra:', compraId);
  };

  // Cargar datos iniciales
  async function cargarTodosLosDatos() {
    await Promise.all([
      api.cargarProveedores(),
      api.cargarProductos(),
      api.cargarEstadisticas(),
      api.cargarHistorialCompras()
    ]);
    
    // Actualizar UI después de cargar los datos
    ui.actualizarSelectProveedores();
    ui.actualizarSelectProductos();
    ui.actualizarProveedoresPrincipales();
  }

  // Inicialización
  await cargarTodosLosDatos();
  ui.actualizarCarrito();
  setupEventListeners();

} 