import { supabase } from '../supabaseClient.js';
import { renderVehiculos } from './Vehiculos.js';

export async function renderClientes(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Clientes
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Administra la información de tus clientes y sus vehículos</p>
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
                  id="buscar-cliente" 
                  placeholder="Buscar por nombre, email o teléfono..." 
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>
            <button 
              id="nuevo-cliente" 
              class="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuevo Cliente
              <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>

        <!-- Clients List -->
        <div id="clientes-lista" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>

        <!-- Modals -->
        <div id="cliente-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
          <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0" id="modal-content">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-800" id="modal-title">Nuevo Cliente</h3>
              <button id="cerrar-modal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form id="cliente-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <input 
                  name="nombre" 
                  placeholder="Ingresa el nombre completo" 
                  required 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input 
                  name="telefono" 
                  placeholder="Ingresa el teléfono" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  name="email" 
                  type="email"
                  placeholder="Ingresa el email" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input 
                  name="direccion" 
                  placeholder="Ingresa la dirección" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div class="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Guardar
                </button>
                <button 
                  type="button" 
                  id="cancelar-cliente" 
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
            <div id="cliente-form-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
          </div>
        </div>

        <div id="vehiculos-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden"></div>
      </div>
    </div>
  `;

  const listaDiv = document.getElementById('clientes-lista');
  const buscarInput = document.getElementById('buscar-cliente');
  const modal = document.getElementById('cliente-form-modal');
  const modalContent = document.getElementById('modal-content');
  const vehiculosModal = document.getElementById('vehiculos-modal');

  async function cargarClientes(filtro = '') {
    let query = supabase.from('clientes').select('*').order('created_at', { ascending: false });
    if (filtro) {
      query = query.or(`nombre.ilike.%${filtro}%,email.ilike.%${filtro}%,telefono.ilike.%${filtro}%`);
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
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Error al cargar clientes</h3>
          <p class="text-gray-500">Intenta recargar la página</p>
        </div>
      `;
      return;
    }

    if (!data || data.length === 0) {
      listaDiv.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No hay clientes registrados</h3>
          <p class="text-gray-500 mb-4">Comienza agregando tu primer cliente</p>
          <button 
            id="nuevo-cliente-empty" 
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Agregar Cliente
          </button>
        </div>
      `;
      document.getElementById('nuevo-cliente-empty')?.addEventListener('click', () => mostrarFormCliente());
      return;
    }

    listaDiv.innerHTML = data.map(cliente => `
      <div class="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">${cliente.nombre.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">${cliente.nombre}</h3>
                <p class="text-sm text-gray-500">Cliente desde ${new Date(cliente.created_at).toLocaleDateString('es-AR')}</p>
              </div>
            </div>
            <div class="space-y-1">
              ${cliente.email ? `
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  ${cliente.email}
                </div>
              ` : ''}
              ${cliente.telefono ? `
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  ${cliente.telefono}
                </div>
              ` : ''}
              ${cliente.direccion ? `
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  ${cliente.direccion}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="flex gap-2 pt-4 border-t border-gray-100">
          <button 
            data-id="${cliente.id}" 
            class="ver-vehiculos flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Vehículos
          </button>
          <button 
            data-id="${cliente.id}" 
            class="editar-cliente bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Editar
          </button>
          <button 
            data-id="${cliente.id}" 
            class="eliminar-cliente bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    `).join('');

    // Event listeners
    document.querySelectorAll('.ver-vehiculos').forEach(btn => {
      btn.onclick = () => mostrarVehiculos(btn.dataset.id);
    });
    document.querySelectorAll('.editar-cliente').forEach(btn => {
      btn.onclick = () => mostrarFormCliente(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-cliente').forEach(btn => {
      btn.onclick = () => eliminarCliente(btn.dataset.id);
    });
  }

  buscarInput.oninput = () => cargarClientes(buscarInput.value);
  document.getElementById('nuevo-cliente').onclick = () => mostrarFormCliente();

  async function mostrarFormCliente(id) {
    let cliente = { nombre: '', telefono: '', email: '', direccion: '' };
    if (id) {
      const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
      cliente = data;
    }
    
    document.getElementById('modal-title').textContent = id ? 'Editar Cliente' : 'Nuevo Cliente';
    document.getElementById('cliente-form-error').classList.add('hidden');
    
    // Fill form
    const form = document.getElementById('cliente-form');
    form.nombre.value = cliente.nombre || '';
    form.telefono.value = cliente.telefono || '';
    form.email.value = cliente.email || '';
    form.direccion.value = cliente.direccion || '';
    
    modal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    document.getElementById('cerrar-modal').onclick = cerrarModal;
    document.getElementById('cancelar-cliente').onclick = cerrarModal;
    
    document.getElementById('cliente-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        telefono: form.telefono.value,
        email: form.email.value,
        direccion: form.direccion.value
      };
      
      const errorDiv = document.getElementById('cliente-form-error');
      let res;
      
      if (id) {
        res = await supabase.from('clientes').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('clientes').insert([nuevo]);
      }
      
      if (res.error) {
        errorDiv.textContent = res.error.message;
        errorDiv.classList.remove('hidden');
      } else {
        cerrarModal();
        cargarClientes(buscarInput.value);
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

  async function eliminarCliente(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) return;
    
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (!error) {
      cargarClientes(buscarInput.value);
    }
  }

  async function mostrarVehiculos(cliente_id) {
    vehiculosModal.classList.remove('hidden');
    renderVehiculos(vehiculosModal, cliente_id, () => vehiculosModal.classList.add('hidden'));
  }

  cargarClientes();
} 