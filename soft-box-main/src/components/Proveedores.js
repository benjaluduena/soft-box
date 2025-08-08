import { supabase } from '../supabaseClient.js';

export async function renderProveedores(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Gestión de Proveedores
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Administra tus proveedores y mantén un registro completo de contactos comerciales</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Proveedores</p>
                <p class="text-2xl font-bold text-gray-900" id="total-proveedores">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Activos</p>
                <p class="text-2xl font-bold text-emerald-600" id="proveedores-activos">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Rubros</p>
                <p class="text-2xl font-bold text-teal-600" id="total-rubros">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Compras Mes</p>
                <p class="text-2xl font-bold text-cyan-600" id="compras-mes">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Actions -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div class="flex-1 w-full lg:w-auto">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input id="buscar-proveedor" type="text" placeholder="Buscar proveedores por nombre, rubro o email..." class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm" />
              </div>
            </div>
            <div class="flex gap-3">
              <select id="filtro-rubro" class="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm">
                <option value="">Todos los rubros</option>
              </select>
              <button id="nuevo-proveedor" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nuevo Proveedor
              </button>
            </div>
          </div>
        </div>

        <!-- Proveedores List -->
        <div id="proveedores-lista" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>

        <!-- Modal -->
        <div id="proveedor-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
          <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0" id="modal-content">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800" id="modal-title">Nuevo Proveedor</h3>
              </div>
              <button id="cerrar-modal" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form id="proveedor-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input name="nombre" placeholder="Nombre del proveedor" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" />
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">CUIT</label>
                  <input name="cuit" placeholder="CUIT" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rubro</label>
                  <input name="rubro" placeholder="Rubro" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input name="telefono" placeholder="Teléfono" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input name="email" type="email" placeholder="Email" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" />
              </div>
              
              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Guardar
                </button>
                <button type="button" id="cancelar-proveedor" class="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200">
                  Cancelar
                </button>
              </div>
            </form>
            
            <div id="proveedor-form-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const listaDiv = document.getElementById('proveedores-lista');
  const modal = document.getElementById('proveedor-form-modal');
  const modalContent = document.getElementById('modal-content');
  let proveedores = [];
  let rubros = [];

  async function cargarEstadisticas() {
    const totalProveedores = proveedores.length;
    const proveedoresActivos = proveedores.filter(p => p.telefono || p.email).length;
    const totalRubros = rubros.length;
    
    // Compras del mes
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
    const { data: comprasMes } = await supabase
      .from('compras')
      .select('id')
      .gte('created_at', inicioMes)
      .lte('created_at', finMes);
    
    document.getElementById('total-proveedores').textContent = totalProveedores;
    document.getElementById('proveedores-activos').textContent = proveedoresActivos;
    document.getElementById('total-rubros').textContent = totalRubros;
    document.getElementById('compras-mes').textContent = comprasMes?.length || 0;
  }

  async function cargarProveedores() {
    const { data, error } = await supabase.from('proveedores').select('*').order('nombre');
    if (error) {
      listaDiv.innerHTML = `
        <div class="col-span-full text-center py-8">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <p class="text-red-600 font-medium">Error al cargar proveedores</p>
        </div>
      `;
      return;
    }
    
    proveedores = data || [];
    
    // Extraer rubros únicos
    rubros = [...new Set(proveedores.filter(p => p.rubro).map(p => p.rubro))].sort();
    
    // Actualizar filtro de rubros
    const filtroRubro = document.getElementById('filtro-rubro');
    filtroRubro.innerHTML = '<option value="">Todos los rubros</option>' + rubros.map(r => `<option value="${r}">${r}</option>`).join('');
    
    renderProveedoresList(proveedores);
    await cargarEstadisticas();
  }

  function renderProveedoresList(proveedoresFiltrados) {
    if (!proveedoresFiltrados || proveedoresFiltrados.length === 0) {
      listaDiv.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p class="text-gray-500 font-medium text-lg">No se encontraron proveedores</p>
          <p class="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
        </div>
      `;
      return;
    }

    listaDiv.innerHTML = proveedoresFiltrados.map(prov => `
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">${prov.nombre}</h3>
            ${prov.rubro ? `<span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">${prov.rubro}</span>` : ''}
          </div>
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button data-id="${prov.id}" class="editar-proveedor p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button data-id="${prov.id}" class="eliminar-proveedor p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="space-y-3">
          ${prov.cuit ? `
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <span class="text-gray-600">CUIT: <span class="font-medium text-gray-800">${prov.cuit}</span></span>
            </div>
          ` : ''}
          
          ${prov.telefono ? `
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <span class="text-gray-600">Tel: <span class="font-medium text-gray-800">${prov.telefono}</span></span>
            </div>
          ` : ''}
          
          ${prov.email ? `
            <div class="flex items-center gap-3 text-sm">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span class="text-gray-600">Email: <span class="font-medium text-gray-800">${prov.email}</span></span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Event listeners
    document.querySelectorAll('.editar-proveedor').forEach(btn => {
      btn.onclick = () => mostrarFormProveedor(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-proveedor').forEach(btn => {
      btn.onclick = () => eliminarProveedor(btn.dataset.id);
    });
  }

  // Búsqueda y filtros
  document.getElementById('buscar-proveedor').oninput = (e) => {
    const busqueda = e.target.value.toLowerCase();
    const rubroFiltro = document.getElementById('filtro-rubro').value;
    
    const filtrados = proveedores.filter(prov => {
      const matchBusqueda = !busqueda || 
        prov.nombre.toLowerCase().includes(busqueda) ||
        (prov.rubro && prov.rubro.toLowerCase().includes(busqueda)) ||
        (prov.email && prov.email.toLowerCase().includes(busqueda));
      
      const matchRubro = !rubroFiltro || prov.rubro === rubroFiltro;
      
      return matchBusqueda && matchRubro;
    });
    
    renderProveedoresList(filtrados);
  };

  document.getElementById('filtro-rubro').onchange = () => {
    document.getElementById('buscar-proveedor').dispatchEvent(new Event('input'));
  };

  // Modal
  document.getElementById('nuevo-proveedor').onclick = () => mostrarFormProveedor();

  async function mostrarFormProveedor(id) {
    let proveedor = { nombre: '', cuit: '', telefono: '', email: '', rubro: '' };
    if (id) {
      const { data } = await supabase.from('proveedores').select('*').eq('id', id).single();
      proveedor = data;
    }
    
    document.getElementById('modal-title').textContent = id ? 'Editar Proveedor' : 'Nuevo Proveedor';
    
    // Llenar formulario
    const form = document.getElementById('proveedor-form');
    form.nombre.value = proveedor.nombre || '';
    form.cuit.value = proveedor.cuit || '';
    form.telefono.value = proveedor.telefono || '';
    form.email.value = proveedor.email || '';
    form.rubro.value = proveedor.rubro || '';
    
    // Mostrar modal con animación
    modal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
  }

  function cerrarModal() {
    modalContent.classList.add('scale-95', 'opacity-0');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }

  document.getElementById('cerrar-modal').onclick = cerrarModal;
  document.getElementById('cancelar-proveedor').onclick = cerrarModal;

  // Cerrar modal al hacer clic fuera
  modal.onclick = (e) => { if (e.target === modal) cerrarModal(); };
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); }, { once: true });

  document.getElementById('proveedor-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorDiv = document.getElementById('proveedor-form-error');
    
    const nuevo = {
      nombre: form.nombre.value.trim(),
      cuit: form.cuit.value.trim(),
      telefono: form.telefono.value.trim(),
      email: form.email.value.trim(),
      rubro: form.rubro.value.trim()
    };
    
    if (!nuevo.nombre) {
      errorDiv.textContent = 'El nombre es obligatorio';
      errorDiv.classList.remove('hidden');
      return;
    }
    
    let res;
    const proveedorId = form.dataset.proveedorId;
    
    if (proveedorId) {
      res = await supabase.from('proveedores').update(nuevo).eq('id', proveedorId);
    } else {
      res = await supabase.from('proveedores').insert([nuevo]);
    }
    
    if (res.error) {
      errorDiv.textContent = res.error.message;
      errorDiv.classList.remove('hidden');
    } else {
      cerrarModal();
      await cargarProveedores();
      errorDiv.classList.add('hidden');
    }
  };

  async function eliminarProveedor(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (!error) {
      await cargarProveedores();
    } else {
      alert('Error al eliminar el proveedor: ' + error.message);
    }
  }

  // Inicialización
  await cargarProveedores();
} 