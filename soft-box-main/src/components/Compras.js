import { supabase } from '../supabaseClient.js';

export async function renderCompras(container, usuario_id) {
  let carrito = [];
  let proveedores = [];
  let productos = [];
  let proveedorSeleccionado = null;

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
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Nueva Compra -->
          <div class="xl:col-span-2">
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
                    <div class="flex gap-2">
                      <select id="select-producto" class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                        <option value="">Seleccionar producto</option>
                      </select>
                      <button type="button" id="agregar-producto" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Agregar
                      </button>
                    </div>
                  </div>
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

                <!-- Mensajes -->
                <div id="compra-error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
                <div id="compra-ok" class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm hidden"></div>
              </form>
            </div>
          </div>

          <!-- Historial de Compras -->
          <div class="xl:col-span-1">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Historial Reciente</h3>
              </div>
              
              <div class="relative mb-4">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input id="buscar-compra-proveedor" type="text" placeholder="Buscar por proveedor..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm" />
              </div>
              
              <div id="compras-lista-historial" class="space-y-3 max-h-96 overflow-y-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  async function cargarProveedores() {
    const { data } = await supabase.from('proveedores').select('id,nombre').order('nombre');
    proveedores = data || [];
    const select = document.getElementById('select-proveedor');
    select.innerHTML = '<option value="">Seleccionar proveedor</option>' + proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    select.onchange = () => {
      proveedorSeleccionado = select.value;
    };
  }

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    productos = data || [];
    const select = document.getElementById('select-producto');
    select.innerHTML = '<option value="">Seleccionar producto</option>' + productos.map(p => `<option value="${p.id}">${p.nombre} ($${p.costo?.toFixed(2)})</option>`).join('');
  }

  function renderCarrito() {
    const div = document.getElementById('carrito-lista');
    if (!carrito.length) {
      div.innerHTML = `
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <p class="text-gray-500 font-medium">Carrito vacío</p>
          <p class="text-gray-400 text-sm">Agrega productos para comenzar</p>
        </div>
      `;
      return;
    }
    
    div.innerHTML = carrito.map((item, i) => `
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800">${item.nombre}</h4>
            <p class="text-sm text-gray-500">$${item.costo_unitario.toFixed(2)} c/u</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Cant:</label>
              <input type="number" min="1" value="${item.cantidad}" data-idx="${i}" class="input-cantidad w-16 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center" />
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-800">$${(item.costo_unitario * item.cantidad).toFixed(2)}</p>
            </div>
            <button data-idx="${i}" class="eliminar-item p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
    div.querySelectorAll('.input-cantidad').forEach(input => {
      input.onchange = (e) => {
        const idx = parseInt(input.dataset.idx);
        carrito[idx].cantidad = parseInt(input.value);
        renderCarrito();
        calcularTotal();
      };
    });
    div.querySelectorAll('.eliminar-item').forEach(btn => {
      btn.onclick = () => {
        carrito.splice(parseInt(btn.dataset.idx), 1);
        renderCarrito();
        calcularTotal();
      };
    });
  }

  function calcularTotal() {
    let total = carrito.reduce((acc, item) => acc + item.costo_unitario * item.cantidad, 0);
    document.getElementById('total-compra').textContent = total.toFixed(2);
    return total;
  }

  document.getElementById('agregar-producto').onclick = () => {
    const prodId = document.getElementById('select-producto').value;
    if (!prodId) return;
    const prod = productos.find(p => p.id === prodId);
    if (!prod) return;
    const idx = carrito.findIndex(i => i.id === prodId);
    if (idx >= 0) {
      carrito[idx].cantidad += 1;
    } else {
      carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        costo_unitario: prod.costo,
        cantidad: 1
      });
    }
    renderCarrito();
    calcularTotal();
  };

  document.getElementById('confirmar-compra').onclick = async () => {
    const errorDiv = document.getElementById('compra-error');
    const okDiv = document.getElementById('compra-ok');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
    okDiv.textContent = '';
    okDiv.classList.add('hidden');
    
    if (!proveedorSeleccionado) {
      errorDiv.textContent = 'Selecciona un proveedor.';
      errorDiv.classList.remove('hidden');
      return;
    }
    if (!carrito.length) {
      errorDiv.textContent = 'El carrito está vacío.';
      errorDiv.classList.remove('hidden');
      return;
    }
    
    const total = calcularTotal();
    
    // Guardar compra
    const { data: compra, error } = await supabase.from('compras').insert([{
      proveedor_id: proveedorSeleccionado,
      usuario_id,
      total
    }]).select().single();
    
    if (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
      return;
    }
    
    // Guardar detalle y ajustar stock con control optimista
    for (const item of carrito) {
      await supabase.from('compra_detalle').insert({
        compra_id: compra.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.costo_unitario,
        subtotal: item.costo_unitario * item.cantidad
      });

      const ok = await ajustarStockOptimista(item.id, item.cantidad);
      if (!ok) {
        errorDiv.textContent = 'Conflicto al actualizar stock. Intenta nuevamente.';
        errorDiv.classList.remove('hidden');
        return;
      }
    }
    
    okDiv.textContent = '¡Compra registrada exitosamente!';
    okDiv.classList.remove('hidden');
    
    carrito = [];
    renderCarrito();
    calcularTotal();
    
    // Recargar estadísticas e historial
    cargarEstadisticas();
    cargarHistorialCompras();
  };

  // Ajuste de stock con control optimista (sin RPC)
  async function ajustarStockOptimista(productoId, delta, reintentos = 5) {
    for (let i = 0; i < reintentos; i++) {
      const { data: prod, error: errSel } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', productoId)
        .single();
      if (errSel) return false;
      const stockActual = prod?.stock ?? 0;
      const nuevoStock = stockActual + delta;
      const { data: upd, error: errUpd } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', productoId)
        .eq('stock', stockActual)
        .select();
      if (!errUpd && upd && upd.length) return true;
      await new Promise(r => setTimeout(r, 50));
    }
    return false;
  }

  async function cargarEstadisticas() {
    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
    
    // Compras e gastos de hoy
    const { data: comprasHoy } = await supabase
      .from('compras')
      .select('total')
      .eq('created_at', hoy);
    
    const comprasHoyCount = comprasHoy?.length || 0;
    const gastosHoy = comprasHoy?.reduce((acc, c) => acc + (c.total || 0), 0) || 0;
    
    // Compras e gastos del mes
    const { data: comprasMes } = await supabase
      .from('compras')
      .select('total')
      .gte('created_at', inicioMes)
      .lte('created_at', finMes);
    
    const comprasMesCount = comprasMes?.length || 0;
    const gastosMes = comprasMes?.reduce((acc, c) => acc + (c.total || 0), 0) || 0;
    
    document.getElementById('compras-hoy').textContent = comprasHoyCount;
    document.getElementById('gastos-hoy').textContent = `$${gastosHoy.toFixed(2)}`;
    document.getElementById('compras-mes').textContent = comprasMesCount;
    document.getElementById('gastos-mes').textContent = `$${gastosMes.toFixed(2)}`;
  }

  async function cargarHistorialCompras(filtroProveedor = '') {
    const historialDiv = document.getElementById('compras-lista-historial');
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let desde = new Date(year, month, 1).toISOString().slice(0, 10);
    let hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    
    let query = supabase
      .from('compras')
      .select('*,proveedores(nombre)')
      .gte('created_at', desde)
      .lte('created_at', hasta)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (filtroProveedor) {
      query = query.ilike('proveedores.nombre', `%${filtroProveedor}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      historialDiv.innerHTML = `
        <div class="text-center py-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <p class="text-red-600 text-sm">Error al cargar historial</p>
        </div>
      `;
      return;
    }
    
    if (!data || data.length === 0) {
      historialDiv.innerHTML = `
        <div class="text-center py-4">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <p class="text-gray-500 text-sm">No hay compras este mes</p>
        </div>
      `;
      return;
    }
    
    historialDiv.innerHTML = data.map(c => `
      <div class="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" data-id="${c.id}">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="font-semibold text-gray-800 text-sm">${c.proveedores?.nombre || 'Sin proveedor'}</p>
            <p class="text-xs text-gray-500">${new Date(c.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-purple-600">$${c.total?.toFixed(2)}</p>
            <p class="text-xs text-gray-500">Compra</p>
          </div>
        </div>
      </div>
    `).join('');
    
    // Event listeners para expandir detalles
    data.forEach(c => {
      const row = historialDiv.querySelector(`[data-id="${c.id}"]`);
      row.onclick = () => toggleDetalleCompra(c.id);
    });
  }

  async function toggleDetalleCompra(compraId) {
    const detalleDiv = document.getElementById(`detalle-compra-${compraId}`);
    if (detalleDiv) {
      if (!detalleDiv.classList.contains('hidden')) {
        detalleDiv.classList.add('hidden');
        detalleDiv.innerHTML = '';
        return;
      }
    }
    
    // Crear elemento si no existe
    if (!detalleDiv) {
      const parent = document.querySelector(`[data-id="${compraId}"]`);
      const newDiv = document.createElement('div');
      newDiv.id = `detalle-compra-${compraId}`;
      newDiv.className = 'mt-3 p-3 bg-gray-50 rounded-lg';
      parent.appendChild(newDiv);
    }
    
    const { data: detalles } = await supabase
      .from('compra_detalle')
      .select('*,productos(nombre)')
      .eq('compra_id', compraId);
    
    const targetDiv = document.getElementById(`detalle-compra-${compraId}`);
    targetDiv.classList.remove('hidden');
    
    if (detalles && detalles.length > 0) {
      targetDiv.innerHTML = `
        <div class="space-y-2">
          ${detalles.map(d => `
            <div class="flex justify-between text-sm">
              <span class="text-gray-700">${d.productos?.nombre || ''}</span>
              <span class="text-gray-600">${d.cantidad} × $${d.precio_unitario?.toFixed(2)} = $${d.subtotal?.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      targetDiv.innerHTML = '<p class="text-gray-500 text-sm">Sin detalle disponible.</p>';
    }
  }

  // Inicialización
  await cargarProveedores();
  await cargarProductos();
  await cargarEstadisticas();
  await cargarHistorialCompras();
  renderCarrito();
  calcularTotal();

  // Event listeners
  document.getElementById('buscar-compra-proveedor').oninput = (e) => cargarHistorialCompras(e.target.value);

  // Cerrar modales con Escape (no hay modal propio, pero sí podemos cerrar posibles overlays)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlays = document.querySelectorAll('.fixed.inset-0');
      overlays.forEach((o) => o.classList.add('hidden'));
    }
  });
} 