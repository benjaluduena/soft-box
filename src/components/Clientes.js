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
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                <input 
                  name="nombre" 
                  placeholder="Ingresa el nombre completo" 
                  required 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div id="nombre-error" class="hidden mt-1 text-sm text-red-600"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input 
                  name="telefono" 
                  type="tel"
                  placeholder="Ej: +54 11 1234-5678 o 011 1234-5678" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div id="telefono-error" class="hidden mt-1 text-sm text-red-600"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  name="email" 
                  type="email"
                  placeholder="ejemplo@correo.com" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div id="email-error" class="hidden mt-1 text-sm text-red-600"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input 
                  name="direccion" 
                  placeholder="Calle, número, ciudad" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div id="direccion-error" class="hidden mt-1 text-sm text-red-600"></div>
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

  // Utilidades de validación
  const validacion = {
    nombre: (nombre) => {
      if (!nombre || nombre.trim().length < 2) {
        return 'El nombre debe tener al menos 2 caracteres';
      }
      if (nombre.trim().length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
      }
      return null;
    },

    telefono: (telefono) => {
      if (!telefono) return null; // El teléfono es opcional
      
      // Remover espacios, guiones y paréntesis para validación
      const telefonoLimpio = telefono.replace(/[\s\-\(\)\+]/g, '');
      
      // Validar que contenga solo números
      if (!/^\d{8,15}$/.test(telefonoLimpio)) {
        return 'El teléfono debe tener entre 8 y 15 dígitos';
      }
      
      return null;
    },

    email: (email) => {
      if (!email) return null; // El email es opcional
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return 'Formato de email inválido';
      }
      
      return null;
    },

    direccion: (direccion) => {
      if (direccion && direccion.length > 200) {
        return 'La dirección no puede exceder 200 caracteres';
      }
      return null;
    },

    validarFormulario: (datos) => {
      const errores = {};
      
      const errorNombre = validacion.nombre(datos.nombre);
      if (errorNombre) errores.nombre = errorNombre;
      
      const errorTelefono = validacion.telefono(datos.telefono);
      if (errorTelefono) errores.telefono = errorTelefono;
      
      const errorEmail = validacion.email(datos.email);
      if (errorEmail) errores.email = errorEmail;
      
      const errorDireccion = validacion.direccion(datos.direccion);
      if (errorDireccion) errores.direccion = errorDireccion;
      
      return errores;
    },

    mostrarErrores: (errores) => {
      // Limpiar errores previos
      ['nombre', 'telefono', 'email', 'direccion'].forEach(campo => {
        const errorDiv = document.getElementById(`${campo}-error`);
        if (errorDiv) {
          errorDiv.classList.add('hidden');
          errorDiv.textContent = '';
        }
      });
      
      // Mostrar nuevos errores
      Object.keys(errores).forEach(campo => {
        const errorDiv = document.getElementById(`${campo}-error`);
        if (errorDiv) {
          errorDiv.textContent = errores[campo];
          errorDiv.classList.remove('hidden');
        }
      });
    }
  };

  // Debounce para búsqueda
  let timeoutBusqueda;
  buscarInput.oninput = (e) => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
      cargarClientes(e.target.value);
    }, 300);
  };
  
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
    // Cerrar con clic fuera
    modal.onclick = (e) => { if (e.target === modal) cerrarModal(); };
    // Cerrar con Escape
    const onKey = (e) => { if (e.key === 'Escape') cerrarModal(); };
    document.addEventListener('keydown', onKey, { once: true });
    
    // Configurar validación en tiempo real
    // Ya tenemos la referencia del form arriba
    
    form.nombre.addEventListener('blur', () => {
      const error = validacion.nombre(form.nombre.value);
      const errorDiv = document.getElementById('nombre-error');
      if (error) {
        errorDiv.textContent = error;
        errorDiv.classList.remove('hidden');
        form.nombre.classList.add('border-red-500');
      } else {
        errorDiv.classList.add('hidden');
        form.nombre.classList.remove('border-red-500');
      }
    });
    
    form.telefono.addEventListener('blur', () => {
      const error = validacion.telefono(form.telefono.value);
      const errorDiv = document.getElementById('telefono-error');
      if (error) {
        errorDiv.textContent = error;
        errorDiv.classList.remove('hidden');
        form.telefono.classList.add('border-red-500');
      } else {
        errorDiv.classList.add('hidden');
        form.telefono.classList.remove('border-red-500');
      }
    });
    
    form.email.addEventListener('blur', () => {
      const error = validacion.email(form.email.value);
      const errorDiv = document.getElementById('email-error');
      if (error) {
        errorDiv.textContent = error;
        errorDiv.classList.remove('hidden');
        form.email.classList.add('border-red-500');
      } else {
        errorDiv.classList.add('hidden');
        form.email.classList.remove('border-red-500');
      }
    });

    document.getElementById('cliente-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value.trim(),
        telefono: form.telefono.value.trim(),
        email: form.email.value.trim(),
        direccion: form.direccion.value.trim()
      };
      
      // Validar datos antes de enviar
      const errores = validacion.validarFormulario(nuevo);
      if (Object.keys(errores).length > 0) {
        validacion.mostrarErrores(errores);
        return;
      }
      
      const errorDiv = document.getElementById('cliente-form-error');
      const submitButton = form.querySelector('button[type="submit"]');
      
      try {
        // Deshabilitar botón y mostrar loading
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          ${id ? 'Actualizando...' : 'Guardando...'}
        `;
        
        let res;
        if (id) {
          res = await supabase.from('clientes').update(nuevo).eq('id', id).select();
        } else {
          res = await supabase.from('clientes').insert([nuevo]).select();
        }
        
        if (res.error) {
          throw new Error(res.error.message);
        }
        
        // Mostrar notificación de éxito
        mostrarNotificacion(id ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente', 'success');
        
        cerrarModal();
        cargarClientes(buscarInput.value);
        
        // Preguntar si desea agregar un vehículo al cliente recién creado
        if (!id) { // Solo para clientes nuevos
          setTimeout(() => {
            preguntarAgregarVehiculo(res.data && res.data[0] ? res.data[0].id : null, nuevo.nombre);
          }, 500);
        }
        
      } catch (error) {
        console.error('Error guardando cliente:', error);
        errorDiv.textContent = error.message || 'Error al guardar el cliente';
        errorDiv.classList.remove('hidden');
      } finally {
        // Restaurar botón
        submitButton.disabled = false;
        submitButton.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          ${id ? 'Actualizar' : 'Guardar'}
        `;
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

  // Función para mostrar notificaciones
  function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
      tipo === 'success' ? 'bg-green-500 text-white' :
      tipo === 'error' ? 'bg-red-500 text-white' :
      tipo === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          ${
            tipo === 'success' ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' :
            tipo === 'error' ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>' :
            '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="flex-1">
          <p class="font-medium">${mensaje}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 10);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  async function eliminarCliente(id) {
    // Crear modal de confirmación personalizado
    const confirmModal = document.createElement('div');
    confirmModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
    confirmModal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">¡Atención!</h3>
          <p class="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar este cliente?<br><strong>Esta acción no se puede deshacer.</strong></p>
          
          <div class="flex gap-3">
            <button id="confirmar-eliminar-btn" class="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Sí, eliminar
            </button>
            <button id="cancelar-eliminar-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Event listeners
    document.getElementById('confirmar-eliminar-btn').onclick = async () => {
      try {
        const { error } = await supabase.from('clientes').delete().eq('id', id);
        if (error) throw error;
        
        mostrarNotificacion('Cliente eliminado correctamente', 'success');
        cargarClientes(buscarInput.value);
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        mostrarNotificacion('Error al eliminar el cliente', 'error');
      } finally {
        document.body.removeChild(confirmModal);
      }
    };
    
    document.getElementById('cancelar-eliminar-btn').onclick = () => {
      document.body.removeChild(confirmModal);
    };
    
    // Cerrar con click fuera del modal
    confirmModal.onclick = (e) => {
      if (e.target === confirmModal) {
        document.body.removeChild(confirmModal);
      }
    };
  }

  async function mostrarVehiculos(cliente_id) {
    vehiculosModal.classList.remove('hidden');
    renderVehiculos(vehiculosModal, cliente_id, () => vehiculosModal.classList.add('hidden'));
  }

  cargarClientes();

  // Función para preguntar si agregar vehículo después de crear cliente
  async function preguntarAgregarVehiculo(clienteId, nombreCliente) {
    if (!clienteId) {
      // Si no tenemos el ID, intentar obtenerlo del cliente recién creado
      const { data } = await supabase
        .from('clientes')
        .select('id')
        .eq('nombre', nombreCliente)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        clienteId = data[0].id;
      } else {
        return; // No podemos continuar sin ID
      }
    }

    // Crear modal de confirmación personalizado
    const confirmModal = document.createElement('div');
    confirmModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
    confirmModal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">¡Cliente creado exitosamente!</h3>
          <p class="text-gray-600 mb-2">El cliente <strong>${nombreCliente}</strong> ha sido registrado.</p>
          <p class="text-gray-600 mb-6">¿Deseas agregar un vehículo a este cliente ahora?</p>
          
          <div class="flex gap-3">
            <button id="agregar-vehiculo-btn" class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
              </svg>
              Sí, agregar vehículo
            </button>
            <button id="cerrar-confirm-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Ahora no
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Event listeners para los botones
    document.getElementById('agregar-vehiculo-btn').onclick = () => {
      document.body.removeChild(confirmModal);
      mostrarVehiculos(clienteId);
    };
    
    document.getElementById('cerrar-confirm-btn').onclick = () => {
      document.body.removeChild(confirmModal);
    };
    
    // Cerrar con click fuera del modal
    confirmModal.onclick = (e) => {
      if (e.target === confirmModal) {
        document.body.removeChild(confirmModal);
      }
    };
    
    // Cerrar con Escape
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(confirmModal);
        document.removeEventListener('keydown', closeOnEscape);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
  }
} 