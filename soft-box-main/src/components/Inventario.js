import { supabase } from '../supabaseClient.js';

export async function renderInventario(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Gestión de Inventario
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Administra tu stock de productos y controla los precios</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Productos</p>
                <p class="text-2xl font-bold text-gray-900" id="total-productos">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p class="text-2xl font-bold text-amber-600" id="stock-bajo-count">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Valor Total</p>
                <p class="text-2xl font-bold text-green-600" id="valor-total">$0.00</p>
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
                <p class="text-sm font-medium text-gray-600">Sin Stock</p>
                <p class="text-2xl font-bold text-red-600" id="sin-stock-count">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Actions Bar -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex-1">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="buscar-producto" 
                  placeholder="Buscar por nombre, marca o tipo..." 
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
            <button 
              id="nuevo-producto" 
              class="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuevo Producto
              <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>

        <!-- Products List -->
        <div id="productos-lista" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"></div>

        <!-- Modal -->
        <div id="producto-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
          <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all duration-300 scale-95 opacity-0" id="modal-content">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-800" id="modal-title">Nuevo Producto</h3>
              <button id="cerrar-modal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form id="producto-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del producto</label>
                  <input 
                    name="nombre" 
                    placeholder="Ingresa el nombre" 
                    required 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select 
                    name="tipo" 
                    required 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Selecciona el tipo</option>
                    <option value="neumático">Neumático</option>
                    <option value="repuesto">Repuesto</option>
                    <option value="aceite">Aceite</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <input 
                    name="marca" 
                    placeholder="Ingresa la marca" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Compatible con</label>
                  <input 
                    name="compatible_con" 
                    placeholder="Ej: Toyota, Honda..." 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                <select 
                  name="proveedor_id" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Selecciona un proveedor</option>
                </select>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input 
                    name="stock" 
                    type="number" 
                    placeholder="0" 
                    min="0" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Costo</label>
                  <input 
                    name="costo" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    min="0" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Margen (%)</label>
                  <input 
                    name="margen" 
                    type="number" 
                    step="0.01" 
                    placeholder="30" 
                    min="0" 
                    max="100" 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  class="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Guardar
                </button>
                <button 
                  type="button" 
                  id="cancelar-producto" 
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
            <div id="producto-form-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const listaDiv = document.getElementById('productos-lista');
  const buscarInput = document.getElementById('buscar-producto');
  const modal = document.getElementById('producto-form-modal');
  const modalContent = document.getElementById('modal-content');

  async function cargarProductos(filtro = '') {
    let query = supabase.from('productos').select('*,proveedores(nombre)').order('created_at', { ascending: false });
    if (filtro) {
      query = query.or(`nombre.ilike.%${filtro}%,marca.ilike.%${filtro}%,tipo.ilike.%${filtro}%`);
    }
    const { data, error } = await query;
    
    if (error) {
      listaDiv.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Error al cargar productos</h3>
          <p class="text-gray-500">Intenta recargar la página</p>
        </div>
      `;
      return;
    }

    // Actualizar estadísticas
    actualizarEstadisticas(data);

    if (!data || data.length === 0) {
      listaDiv.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay productos registrados</h3>
          <p class="text-gray-500 mb-4">Comienza agregando tu primer producto al inventario</p>
          <button 
            id="nuevo-producto-empty" 
            class="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Agregar Producto
          </button>
        </div>
      `;
      document.getElementById('nuevo-producto-empty')?.addEventListener('click', () => mostrarFormProducto());
      return;
    }

    listaDiv.innerHTML = data.map(prod => {
      const precioCalculado = prod.costo * (1 + (prod.margen || 0));
      const stockStatus = prod.stock === 0 ? 'sin-stock' : prod.stock < 5 ? 'stock-bajo' : 'stock-ok';
      const statusColors = {
        'sin-stock': 'bg-red-50 border-red-200 text-red-800',
        'stock-bajo': 'bg-amber-50 border-amber-200 text-amber-800',
        'stock-ok': 'bg-green-50 border-green-200 text-green-800'
      };
      const statusColor = statusColors[stockStatus];
      
      return `
        <div class="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105 ${stockStatus === 'sin-stock' ? 'ring-2 ring-red-300' : stockStatus === 'stock-bajo' ? 'ring-2 ring-amber-300' : ''}">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">${prod.nombre}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">${prod.tipo}</span>
                    ${prod.marca ? `<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">${prod.marca}</span>` : ''}
                    <span class="px-2 py-1 ${statusColor} text-xs font-semibold rounded-full">
                      ${stockStatus === 'sin-stock' ? 'Sin Stock' : stockStatus === 'stock-bajo' ? 'Stock Bajo' : 'Stock OK'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2">
                ${prod.compatible_con ? `
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Compatible: ${prod.compatible_con}
                  </div>
                ` : ''}
                
                ${prod.proveedores?.nombre ? `
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Proveedor: ${prod.proveedores.nombre}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
            <div class="text-center">
              <p class="text-sm text-gray-600">Stock</p>
              <p class="text-2xl font-bold ${stockStatus === 'sin-stock' ? 'text-red-600' : stockStatus === 'stock-bajo' ? 'text-amber-600' : 'text-green-600'}">${prod.stock}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-600">Precio</p>
              <p class="text-2xl font-bold text-gray-800">$${precioCalculado.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="flex gap-2 pt-4 border-t border-gray-100">
            <button 
              data-id="${prod.id}" 
              class="editar-producto flex-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Editar
            </button>
            <button 
              data-id="${prod.id}" 
              class="eliminar-producto bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Event listeners
    document.querySelectorAll('.editar-producto').forEach(btn => {
      btn.onclick = () => mostrarFormProducto(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
      btn.onclick = () => eliminarProducto(btn.dataset.id);
    });
  }

  function actualizarEstadisticas(data) {
    const totalProductos = data.length;
    const stockBajo = data.filter(p => p.stock < 5 && p.stock > 0).length;
    const sinStock = data.filter(p => p.stock === 0).length;
    const valorTotal = data.reduce((acc, p) => acc + (p.costo * p.stock), 0);

    document.getElementById('total-productos').textContent = totalProductos;
    document.getElementById('stock-bajo-count').textContent = stockBajo;
    document.getElementById('sin-stock-count').textContent = sinStock;
    document.getElementById('valor-total').textContent = `$${valorTotal.toFixed(2)}`;
  }

  buscarInput.oninput = () => cargarProductos(buscarInput.value);
  document.getElementById('nuevo-producto').onclick = () => mostrarFormProducto();

  async function mostrarFormProducto(id) {
    let producto = { nombre: '', tipo: '', marca: '', compatible_con: '', proveedor_id: '', stock: 0, costo: 0, margen: 0.3 };
    if (id) {
      const { data } = await supabase.from('productos').select('*').eq('id', id).single();
      producto = data;
    }
    
    // Cargar proveedores para el select
    const { data: proveedores } = await supabase.from('proveedores').select('id,nombre').order('nombre');
    
    document.getElementById('modal-title').textContent = id ? 'Editar Producto' : 'Nuevo Producto';
    document.getElementById('producto-form-error').classList.add('hidden');
    
    // Fill form
    const form = document.getElementById('producto-form');
    form.nombre.value = producto.nombre || '';
    form.tipo.value = producto.tipo || '';
    form.marca.value = producto.marca || '';
    form.compatible_con.value = producto.compatible_con || '';
    form.stock.value = producto.stock || 0;
    form.costo.value = producto.costo || 0;
    form.margen.value = ((producto.margen || 0.3) * 100).toFixed(0);
    
    // Fill proveedores select
    const proveedorSelect = form.proveedor_id;
    proveedorSelect.innerHTML = '<option value="">Selecciona un proveedor</option>';
    proveedores.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.nombre;
      option.selected = producto.proveedor_id === p.id;
      proveedorSelect.appendChild(option);
    });
    
    modal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    document.getElementById('cerrar-modal').onclick = cerrarModal;
    document.getElementById('cancelar-producto').onclick = cerrarModal;
    
    document.getElementById('producto-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        tipo: form.tipo.value,
        marca: form.marca.value,
        compatible_con: form.compatible_con.value,
        proveedor_id: form.proveedor_id.value || null,
        stock: parseInt(form.stock.value, 10),
        costo: parseFloat(form.costo.value),
        margen: parseFloat(form.margen.value) / 100
      };
      
      const errorDiv = document.getElementById('producto-form-error');
      let res;
      
      if (id) {
        res = await supabase.from('productos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('productos').insert([nuevo]);
      }
      
      if (res.error) {
        errorDiv.textContent = res.error.message;
        errorDiv.classList.remove('hidden');
      } else {
        cerrarModal();
        cargarProductos(buscarInput.value);
      }
    };
  }

  function cerrarModal() {
    modalContent.classList.add('scale-95', 'opacity-0');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) return;
    
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) {
      cargarProductos(buscarInput.value);
    }
  }

  cargarProductos();
} 