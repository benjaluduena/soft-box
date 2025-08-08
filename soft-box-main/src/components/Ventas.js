import { supabase } from '../supabaseClient.js';

export async function renderVentas(container, usuario_id) {
  let carrito = [];
  let clientes = [];
  let productos = [];
  let clienteSeleccionado = null;
  let metodoPago = 'efectivo';
  let descuento = 0;
  let plazoCheque = 30;
  let ventasRecientes = [];
  let productosFrecuentes = [];
  let modoRapido = false;

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Gestión de Ventas
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Procesa ventas y administra el historial de transacciones</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Ventas Hoy</p>
                <p class="text-2xl font-bold text-gray-900" id="ventas-hoy">0</p>
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
                <p class="text-sm font-medium text-gray-600">Ingresos Hoy</p>
                <p class="text-2xl font-bold text-green-600" id="ingresos-hoy">$0.00</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Promedio Venta</p>
                <p class="text-2xl font-bold text-indigo-600" id="promedio-venta">$0.00</p>
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
                <p class="text-sm font-medium text-gray-600">Productos Vendidos</p>
                <p class="text-2xl font-bold text-purple-600" id="productos-vendidos">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Modo Rápido Toggle -->
        <div class="mb-6">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">Modo Rápido</h3>
                  <p class="text-sm text-gray-600">Ventas express para clientes frecuentes</p>
                </div>
              </div>
              <button id="toggle-modo-rapido" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2" role="switch" aria-checked="false">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Nueva Venta -->
          <div class="xl:col-span-2">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-800">Nueva Venta</h2>
                </div>
                <div class="flex gap-2">
                  <button id="limpiar-carrito" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Limpiar
                  </button>
                  <button id="duplicar-venta" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Duplicar
                  </button>
                </div>
              </div>

              <form id="ventas-form" class="space-y-6">
                <!-- Cliente y Producto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                    <div class="flex gap-2">
                      <select id="select-cliente" class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                        <option value="">Seleccionar cliente</option>
                      </select>
                      <button type="button" id="nuevo-cliente-rapido" class="px-3 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                    <div class="flex gap-2">
                      <select id="select-producto" class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                        <option value="">Seleccionar producto</option>
                      </select>
                      <button type="button" id="agregar-producto" class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Productos Frecuentes (Modo Rápido) -->
                <div id="productos-frecuentes" class="hidden">
                  <label class="block text-sm font-medium text-gray-700 mb-3">Productos Frecuentes</label>
                  <div id="lista-productos-frecuentes" class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <!-- Se llenará dinámicamente -->
                  </div>
                </div>

                <!-- Carrito -->
                <div id="carrito-lista" class="space-y-3"></div>

                <!-- Método de pago y descuento -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
                    <select id="metodo-pago" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                      <option value="efectivo">Efectivo</option>
                      <option value="crédito">Crédito</option>
                      <option value="débito">Débito</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div id="plazo-cheque-label" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Plazo (días)</label>
                    <select id="plazo-cheque" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                      <option value="30">30 días</option>
                      <option value="60">60 días</option>
                      <option value="90">90 días</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                    <input type="number" id="input-descuento" value="0" min="0" max="100" step="0.01" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm" />
                  </div>
                </div>

                <!-- Total y Confirmar -->
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div>
                    <p class="text-sm text-gray-600">Total de la venta</p>
                    <p class="text-3xl font-bold text-green-600">$<span id="total-venta">0.00</span></p>
                  </div>
                  <button type="button" id="confirmar-venta" class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Confirmar Venta
                  </button>
                </div>

                <!-- Mensajes -->
                <div id="venta-error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
                <div id="venta-ok" class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm hidden"></div>
              </form>
            </div>
          </div>

          <!-- Historial de Ventas -->
          <div class="xl:col-span-1">
            <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
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
                <input id="buscar-venta-cliente" type="text" placeholder="Buscar por cliente..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm" />
              </div>
              
              <div id="ventas-lista-historial" class="space-y-3 max-h-96 overflow-y-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  async function cargarClientes() {
    const { data } = await supabase.from('clientes').select('id,nombre').order('nombre');
    clientes = data || [];
    const select = document.getElementById('select-cliente');
    select.innerHTML = '<option value="">Seleccionar cliente</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    select.onchange = () => {
      clienteSeleccionado = select.value;
    };
  }

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    productos = data || [];
    const select = document.getElementById('select-producto');
    select.innerHTML = '<option value="">Seleccionar producto</option>' + productos.map(p => `<option value="${p.id}">${p.nombre} ($${p.precio_calculado?.toFixed(2)})</option>`).join('');
  }

  function renderCarrito() {
    const div = document.getElementById('carrito-lista');
    if (!carrito.length) {
      div.innerHTML = `
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
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
            <p class="text-sm text-gray-500">$${item.precio_unitario.toFixed(2)} c/u</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Cant:</label>
              <input type="number" min="1" value="${item.cantidad}" data-idx="${i}" class="input-cantidad w-16 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center" />
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-800">$${(item.precio_unitario * item.cantidad).toFixed(2)}</p>
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
    let total = carrito.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0);
    descuento = parseFloat(document.getElementById('input-descuento').value) || 0;
    total = total * (1 - descuento / 100);
    document.getElementById('total-venta').textContent = total.toFixed(2);
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
        precio_unitario: prod.precio_calculado,
        cantidad: 1
      });
    }
    renderCarrito();
    calcularTotal();
  };

  document.getElementById('input-descuento').oninput = calcularTotal;
  document.getElementById('metodo-pago').onchange = (e) => {
    metodoPago = e.target.value;
    const labelPlazo = document.getElementById('plazo-cheque-label');
    if (metodoPago === 'cheque') {
      labelPlazo.classList.remove('hidden');
    } else {
      labelPlazo.classList.add('hidden');
    }
  };
  document.getElementById('plazo-cheque').onchange = (e) => { plazoCheque = parseInt(e.target.value, 10); };

  document.getElementById('confirmar-venta').onclick = async () => {
    const errorDiv = document.getElementById('venta-error');
    const okDiv = document.getElementById('venta-ok');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
    okDiv.textContent = '';
    okDiv.classList.add('hidden');
    
    if (!clienteSeleccionado) {
      errorDiv.textContent = 'Selecciona un cliente.';
      errorDiv.classList.remove('hidden');
      return;
    }
    if (!carrito.length) {
      errorDiv.textContent = 'El carrito está vacío.';
      errorDiv.classList.remove('hidden');
      return;
    }
    
    const total = calcularTotal();
    
    // Guardar venta
    const { data: venta, error } = await supabase.from('ventas').insert([{
      cliente_id: clienteSeleccionado,
      usuario_id,
      metodo_pago: metodoPago,
      descuento,
      total,
      plazo_cheque: metodoPago === 'cheque' ? plazoCheque : null
    }]).select().single();
    
    if (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
      return;
    }
    
    // Guardar detalle y ajustar stock con control optimista
    for (const item of carrito) {
      await supabase.from('venta_detalle').insert({
        venta_id: venta.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      });

      const ok = await ajustarStockOptimista(item.id, -item.cantidad);
      if (!ok) {
        errorDiv.textContent = 'Conflicto al actualizar stock. Intenta nuevamente.';
        errorDiv.classList.remove('hidden');
        return;
      }
    }
    
    okDiv.textContent = '¡Venta registrada exitosamente!';
    okDiv.classList.remove('hidden');
    
    carrito = [];
    renderCarrito();
    calcularTotal();
    
    // Recargar estadísticas e historial
    cargarEstadisticas();
    cargarHistorialVentas();
  };

  async function cargarEstadisticas() {
    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
    
    // Ventas e ingresos de hoy
    const { data: ventasHoy } = await supabase
      .from('ventas')
      .select('total')
      .eq('created_at', hoy);
    
    const ventasHoyCount = ventasHoy?.length || 0;
    const ingresosHoy = ventasHoy?.reduce((acc, v) => acc + (v.total || 0), 0) || 0;
    
    // Productos vendidos hoy
    const { data: productosHoy } = await supabase
      .from('venta_detalle')
      .select('cantidad')
      .gte('created_at', hoy);
    
    const productosVendidosHoy = productosHoy?.reduce((acc, p) => acc + (p.cantidad || 0), 0) || 0;
    
    // Promedio de venta (últimos 7 días)
    const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: ventas7Dias } = await supabase
      .from('ventas')
      .select('total')
      .gte('created_at', hace7Dias);
    
    const promedioVenta = ventas7Dias && ventas7Dias.length > 0 
      ? ventas7Dias.reduce((acc, v) => acc + (v.total || 0), 0) / ventas7Dias.length 
      : 0;
    
    document.getElementById('ventas-hoy').textContent = ventasHoyCount;
    document.getElementById('ingresos-hoy').textContent = `$${ingresosHoy.toFixed(2)}`;
    document.getElementById('promedio-venta').textContent = `$${promedioVenta.toFixed(2)}`;
    document.getElementById('productos-vendidos').textContent = productosVendidosHoy;
  }

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
      if (nuevoStock < 0) return false;
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

  async function cargarHistorialVentas(filtroCliente = '') {
    const historialDiv = document.getElementById('ventas-lista-historial');
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let desde = new Date(year, month, 1).toISOString().slice(0, 10);
    let hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    
    let query = supabase
      .from('ventas')
      .select('*,clientes(nombre)')
      .gte('created_at', desde)
      .lte('created_at', hasta)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (filtroCliente) {
      query = query.ilike('clientes.nombre', `%${filtroCliente}%`);
    }
    
    const { data, error } = await query;
    
    // Guardar ventas recientes para duplicación
    ventasRecientes = data || [];
    
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
          <p class="text-gray-500 text-sm">No hay ventas este mes</p>
        </div>
      `;
      return;
    }
    
    historialDiv.innerHTML = data.map(v => `
      <div class="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" data-id="${v.id}">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="font-semibold text-gray-800 text-sm">${v.clientes?.nombre || 'Sin cliente'}</p>
            <p class="text-xs text-gray-500">${new Date(v.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-green-600">$${v.total?.toFixed(2)}</p>
            <p class="text-xs text-gray-500">${v.metodo_pago}</p>
          </div>
        </div>
      </div>
    `).join('');
    
    // Event listeners para expandir detalles
    data.forEach(v => {
      const row = historialDiv.querySelector(`[data-id="${v.id}"]`);
      row.onclick = () => toggleDetalleVenta(v.id);
    });
  }

  async function toggleDetalleVenta(ventaId) {
    const detalleDiv = document.getElementById(`detalle-venta-${ventaId}`);
    if (detalleDiv) {
      if (!detalleDiv.classList.contains('hidden')) {
        detalleDiv.classList.add('hidden');
        detalleDiv.innerHTML = '';
        return;
      }
    }
    
    // Crear elemento si no existe
    if (!detalleDiv) {
      const parent = document.querySelector(`[data-id="${ventaId}"]`);
      const newDiv = document.createElement('div');
      newDiv.id = `detalle-venta-${ventaId}`;
      newDiv.className = 'mt-3 p-3 bg-gray-50 rounded-lg';
      parent.appendChild(newDiv);
    }
    
    const { data: detalles } = await supabase
      .from('venta_detalle')
      .select('*,productos(nombre)')
      .eq('venta_id', ventaId);
    
    const targetDiv = document.getElementById(`detalle-venta-${ventaId}`);
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

  /**
   * Configura todos los event listeners adicionales
   */
  function setupEventListeners() {
    // Toggle modo rápido
    const toggleBtn = document.getElementById('toggle-modo-rapido');
    toggleBtn.addEventListener('click', () => {
      modoRapido = !modoRapido;
      toggleBtn.classList.toggle('bg-orange-500', modoRapido);
      toggleBtn.classList.toggle('bg-gray-200', !modoRapido);
      toggleBtn.querySelector('span').classList.toggle('translate-x-5', modoRapido);
      toggleBtn.querySelector('span').classList.toggle('translate-x-1', !modoRapido);
      toggleBtn.setAttribute('aria-checked', modoRapido);
      
      const productosFrecuentes = document.getElementById('productos-frecuentes');
      productosFrecuentes.classList.toggle('hidden', !modoRapido);
    });

    // Limpiar carrito
    document.getElementById('limpiar-carrito').addEventListener('click', () => {
      carrito = [];
      renderCarrito();
      calcularTotal();
    });

    // Duplicar venta
    document.getElementById('duplicar-venta').addEventListener('click', () => {
      if (ventasRecientes.length > 0) {
        mostrarModalDuplicarVenta();
      } else {
        alert('No hay ventas recientes para duplicar');
      }
    });

    // Nuevo cliente rápido
    document.getElementById('nuevo-cliente-rapido').addEventListener('click', () => {
      mostrarModalNuevoCliente();
    });
  }

  /**
   * Carga los productos más frecuentemente vendidos
   */
  async function cargarProductosFrecuentes() {
    const { data: detalles } = await supabase
      .from('venta_detalle')
      .select('producto_id, cantidad, productos(nombre, precio_calculado)')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 días

    if (!detalles) return;

    const productosMap = {};
    detalles.forEach(d => {
      if (!productosMap[d.producto_id]) {
        productosMap[d.producto_id] = {
          id: d.producto_id,
          nombre: d.productos?.nombre || 'Sin nombre',
          precio: d.productos?.precio_calculado || 0,
          cantidad: 0
        };
      }
      productosMap[d.producto_id].cantidad += d.cantidad;
    });

    productosFrecuentes = Object.values(productosMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);

    renderProductosFrecuentes();
  }

  /**
   * Renderiza los productos frecuentes
   */
  function renderProductosFrecuentes() {
    const container = document.getElementById('lista-productos-frecuentes');
    if (!container) return;

    container.innerHTML = productosFrecuentes.map(p => `
      <button 
        class="producto-frecuente p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-left"
        data-producto-id="${p.id}"
      >
        <div class="font-medium text-gray-800 text-sm mb-1">${p.nombre}</div>
        <div class="text-xs text-gray-600">$${p.precio.toFixed(2)}</div>
      </button>
    `).join('');

    // Event listeners para productos frecuentes
    container.querySelectorAll('.producto-frecuente').forEach(btn => {
      btn.addEventListener('click', () => {
        const productoId = btn.dataset.productoId;
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
          agregarProductoAlCarrito(producto);
        }
      });
    });
  }

  /**
   * Agrega un producto al carrito
   */
  function agregarProductoAlCarrito(producto) {
    const idx = carrito.findIndex(i => i.id === producto.id);
    if (idx >= 0) {
      carrito[idx].cantidad += 1;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_calculado,
        cantidad: 1
      });
    }
    renderCarrito();
    calcularTotal();
  }

  /**
   * Muestra modal para duplicar venta
   */
  function mostrarModalDuplicarVenta() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Duplicar Venta Reciente</h3>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          ${ventasRecientes.map(v => `
            <button 
              class="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onclick="duplicarVenta('${v.id}'); this.closest('.fixed').remove()"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-medium text-gray-800">${v.clientes?.nombre || 'Sin cliente'}</p>
                  <p class="text-sm text-gray-500">${new Date(v.created_at).toLocaleString('es-AR')}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">$${v.total?.toFixed(2)}</p>
                  <p class="text-xs text-gray-500">${v.metodo_pago}</p>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Duplica una venta específica
   */
  async function duplicarVenta(ventaId) {
    const { data: detalles } = await supabase
      .from('venta_detalle')
      .select('*, productos(nombre, precio_calculado)')
      .eq('venta_id', ventaId);

    if (detalles && detalles.length > 0) {
      carrito = detalles.map(d => ({
        id: d.producto_id,
        nombre: d.productos?.nombre || 'Sin nombre',
        precio_unitario: d.productos?.precio_calculado || 0,
        cantidad: d.cantidad
      }));
      renderCarrito();
      calcularTotal();
    }
  }

  /**
   * Muestra modal para nuevo cliente rápido
   */
  function mostrarModalNuevoCliente() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Nuevo Cliente Rápido</h3>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form id="form-cliente-rapido" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" id="nombre-cliente-rapido" required class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" id="telefono-cliente-rapido" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div class="flex gap-2 pt-4">
            <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Crear Cliente
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listener para el formulario
    document.getElementById('form-cliente-rapido').addEventListener('submit', async (e) => {
      e.preventDefault();
      await crearClienteRapido();
    });
  }

  /**
   * Crea un cliente rápidamente
   */
  async function crearClienteRapido() {
    const nombre = document.getElementById('nombre-cliente-rapido').value;
    const telefono = document.getElementById('telefono-cliente-rapido').value;

    const { data: nuevoCliente, error } = await supabase
      .from('clientes')
      .insert([{ nombre, telefono }])
      .select()
      .single();

    if (error) {
      alert('Error al crear cliente: ' + error.message);
      return;
    }

    // Agregar a la lista de clientes
    clientes.push(nuevoCliente);
    
    // Actualizar select
    const select = document.getElementById('select-cliente');
    select.innerHTML = '<option value="">Seleccionar cliente</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
    // Seleccionar el nuevo cliente
    select.value = nuevoCliente.id;
    clienteSeleccionado = nuevoCliente.id;

    // Cerrar modal
    document.querySelector('.fixed').remove();
  }

  // Inicialización
  await cargarClientes();
  await cargarProductos();
  await cargarEstadisticas();
  await cargarHistorialVentas();
  await cargarProductosFrecuentes();
  renderCarrito();
  calcularTotal();

  // Event listeners
  document.getElementById('buscar-venta-cliente').oninput = (e) => cargarHistorialVentas(e.target.value);
  
  // Nuevos event listeners
  setupEventListeners();

  // Cerrar overlays con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlays = document.querySelectorAll('.fixed.inset-0');
      overlays.forEach((o) => o.classList.add('hidden'));
    }
  });
} 