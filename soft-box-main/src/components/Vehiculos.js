import { supabase } from '../supabaseClient.js';

// Módulo de Vehículos completamente rediseñado
export async function renderVehiculos(container, cliente_id, onClose) {
  // Estado del módulo
  const state = {
    vehiculos: [],
    clientes: [],
    filtro: '',
    ordenamiento: 'created_at',
    direccion: 'desc',
    vehiculoSeleccionado: null
  };

  // Utilidades
  const utils = {
    formatFecha: (fecha) => new Date(fecha).toLocaleDateString('es-AR'),
    
    validarPatente: (patente) => {
      // Patentes argentinas: ABC123 o AB123CD (nuevo formato)
      if (!patente || typeof patente !== 'string') return false;
      const patenteClean = patente.trim().toUpperCase();
      const regexVieja = /^[A-Z]{3}[0-9]{3}$/;
      const regexNueva = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
      return regexVieja.test(patenteClean) || regexNueva.test(patenteClean);
    },

    validarAño: (año) => {
      const currentYear = new Date().getFullYear();
      const numAño = parseInt(año);
      return numAño >= 1900 && numAño <= currentYear + 1;
    },

    validarDatos: (vehiculoData) => {
      const errores = [];
      
      if (!vehiculoData.marca?.trim()) {
        errores.push('La marca es requerida');
      }
      
      if (!vehiculoData.modelo?.trim()) {
        errores.push('El modelo es requerido');
      }
      
      if (!vehiculoData.patente?.trim()) {
        errores.push('La patente es requerida');
      } else if (!utils.validarPatente(vehiculoData.patente)) {
        errores.push('Formato de patente inválido (use ABC123 o AB123CD)');
      }
      
      if (!vehiculoData.año || vehiculoData.año === 0 || isNaN(vehiculoData.año)) {
        errores.push('El año es requerido');
      } else if (!utils.validarAño(vehiculoData.año)) {
        errores.push('Año inválido (debe estar entre 1900 y ' + (new Date().getFullYear() + 1) + ')');
      }
      
      return errores;
    },

    mostrarNotificacion: (mensaje, tipo = 'success') => {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        tipo === 'success' ? 'bg-green-500 text-white' :
        tipo === 'error' ? 'bg-red-500 text-white' :
        tipo === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
      }`;
      notification.textContent = mensaje;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },

    obtenerMarcasComunes: () => [
      'Chevrolet', 'Ford', 'Volkswagen', 'Toyota', 'Renault', 'Peugeot',
      'Fiat', 'Nissan', 'Honda', 'Hyundai', 'Citroën', 'Kia', 'Audi',
      'BMW', 'Mercedes-Benz', 'Suzuki', 'Mitsubishi', 'Jeep', 'RAM',
      'Subaru', 'Mazda', 'Volvo', 'Alfa Romeo', 'MINI', 'Dodge'
    ],

    formatearNombre: (texto) => {
      if (!texto || typeof texto !== 'string') return '';
      return texto.replace(/\b\w/g, l => l.toUpperCase());
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
    <div class="max-w-6xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
      <!-- Header del módulo -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestión de Vehículos
            </h3>
            <p class="text-gray-600">Administra la flota de vehículos del cliente</p>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button id="nuevo-vehiculo" class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nuevo Vehículo
          </button>
          <button id="cerrar-vehiculos" class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
            Cerrar
          </button>
        </div>
      </div>

      <!-- Barra de filtros -->
      <div class="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-64">
            <input type="text" id="buscar-vehiculo" placeholder="🔍 Buscar por patente, marca o modelo..." 
              class="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm" />
          </div>
          <div>
            <select id="ordenar-vehiculos" class="px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
              <option value="created_at_desc">Más recientes</option>
              <option value="created_at_asc">Más antiguos</option>
              <option value="marca_asc">Marca A-Z</option>
              <option value="marca_desc">Marca Z-A</option>
              <option value="año_desc">Año (nuevo a viejo)</option>
              <option value="año_asc">Año (viejo a nuevo)</option>
            </select>
          </div>
          <button id="exportar-vehiculos" class="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- Lista de vehículos -->
      <div id="vehiculos-lista" class="space-y-4 mb-6">
        <!-- Los vehículos se cargan aquí dinámicamente -->
      </div>

      <!-- Información estadística -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600" id="total-vehiculos">0</div>
          <div class="text-sm text-gray-600">Total Vehículos</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600" id="vehiculo-mas-nuevo">-</div>
          <div class="text-sm text-gray-600">Más Nuevo</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600" id="marca-principal">-</div>
          <div class="text-sm text-gray-600">Marca Principal</div>
        </div>
      </div>

      <!-- Modal para formulario de vehículo -->
      <div id="vehiculo-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
        <!-- El contenido del modal se genera dinámicamente -->
      </div>
    </div>
  `;

  // API y funciones de datos
  const api = {
    async cargarVehiculos() {
      try {
        const { data, error } = await supabase
          .from('vehiculos')
          .select('*')
          .eq('cliente_id', cliente_id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        state.vehiculos = data || [];
        ui.actualizarListaVehiculos();
        ui.actualizarEstadisticas();
      } catch (error) {
        console.error('Error cargando vehículos:', error);
        utils.mostrarNotificacion('Error al cargar vehículos', 'error');
      }
    },

    async guardarVehiculo(vehiculoData, id = null) {
      try {
        // Validar datos completos
        const errores = utils.validarDatos(vehiculoData);
        if (errores.length > 0) {
          throw new Error(errores.join(', '));
        }

        // Formatear datos (los datos ya vienen formateados del formulario)
        vehiculoData.marca = utils.formatearNombre(vehiculoData.marca || '');
        vehiculoData.modelo = utils.formatearNombre(vehiculoData.modelo || '');
        vehiculoData.patente = (vehiculoData.patente || '').toUpperCase();
        vehiculoData.color = vehiculoData.color ? utils.formatearNombre(vehiculoData.color) : '';

        // Verificar patente duplicada
        let query = supabase
          .from('vehiculos')
          .select('id')
          .eq('cliente_id', vehiculoData.cliente_id)
          .eq('patente', vehiculoData.patente);
        
        if (id) {
          query = query.neq('id', id);
        }
        
        const { data: existentes } = await query;

        if (existentes && existentes.length > 0) {
          throw new Error('Ya existe un vehículo con esa patente para este cliente');
        }

        let result;
        if (id) {
          result = await supabase
            .from('vehiculos')
            .update(vehiculoData)
            .eq('id', id)
            .select()
            .single();
        } else {
          result = await supabase
            .from('vehiculos')
            .insert([vehiculoData])
            .select()
            .single();
        }

        if (result.error) throw result.error;
        
        utils.mostrarNotificacion(id ? 'Vehículo actualizado' : 'Vehículo creado', 'success');
        await api.cargarVehiculos();
        return result.data;
      } catch (error) {
        console.error('Error guardando vehículo:', error);
        throw error;
      }
    },

    async eliminarVehiculo(id) {
      try {
        const { error } = await supabase
          .from('vehiculos')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        utils.mostrarNotificacion('Vehículo eliminado', 'success');
        await api.cargarVehiculos();
      } catch (error) {
        console.error('Error eliminando vehículo:', error);
        utils.mostrarNotificacion('Error al eliminar vehículo', 'error');
      }
    }
  };

  // Interfaz de usuario
  const ui = {
    actualizarListaVehiculos() {
      const container = document.getElementById('vehiculos-lista');
      
      if (state.vehiculos.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-400 mb-2">No hay vehículos registrados</h3>
            <p class="text-gray-400 mb-4">Agrega el primer vehículo para comenzar</p>
            <button onclick="document.getElementById('nuevo-vehiculo').click()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Agregar Vehículo
            </button>
          </div>
        `;
        return;
      }

      const vehiculosFiltrados = this.filtrarVehiculos();
      
      container.innerHTML = vehiculosFiltrados.map((vehiculo, index) => `
        <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span class="text-white font-bold text-lg">${index + 1}</span>
                </div>
                <div>
                  <h4 class="text-xl font-bold text-gray-800">${vehiculo.marca} ${vehiculo.modelo}</h4>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">${vehiculo.patente}</span>
                    <span class="text-gray-500">•</span>
                    <span class="text-gray-600">${vehiculo.año}</span>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Marca:</span>
                  <span class="font-medium text-gray-800 ml-2">${vehiculo.marca}</span>
                </div>
                <div>
                  <span class="text-gray-500">Modelo:</span>
                  <span class="font-medium text-gray-800 ml-2">${vehiculo.modelo}</span>
                </div>
                <div>
                  <span class="text-gray-500">Año:</span>
                  <span class="font-medium text-gray-800 ml-2">${vehiculo.año}</span>
                </div>
                <div>
                  <span class="text-gray-500">Registrado:</span>
                  <span class="font-medium text-gray-800 ml-2">${utils.formatFecha(vehiculo.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col gap-2 ml-4">
              <button data-vehiculo-id="${vehiculo.id}" data-action="editar"
                class="editar-vehiculo px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-2 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar
              </button>
              <button data-vehiculo-id="${vehiculo.id}" data-vehiculo-nombre="${vehiculo.marca} ${vehiculo.modelo}" data-action="eliminar"
                class="eliminar-vehiculo px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Eliminar
              </button>
              <button data-vehiculo-id="${vehiculo.id}" data-action="detalle"
                class="detalle-vehiculo px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Detalle
              </button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Agregar event listeners para los botones
      this.configurarEventListenersBotones();
    },

    configurarEventListenersBotones() {
      // Event listeners para botones de editar
      document.querySelectorAll('.editar-vehiculo').forEach(button => {
        button.addEventListener('click', (e) => {
          const vehiculoId = e.currentTarget.dataset.vehiculoId;
          console.log('Editando vehículo:', vehiculoId);
          this.editarVehiculo(vehiculoId);
        });
      });

      // Event listeners para botones de eliminar
      document.querySelectorAll('.eliminar-vehiculo').forEach(button => {
        button.addEventListener('click', (e) => {
          const vehiculoId = e.currentTarget.dataset.vehiculoId;
          const vehiculoNombre = e.currentTarget.dataset.vehiculoNombre;
          this.confirmarEliminarVehiculo(vehiculoId, vehiculoNombre);
        });
      });

      // Event listeners para botones de detalle
      document.querySelectorAll('.detalle-vehiculo').forEach(button => {
        button.addEventListener('click', (e) => {
          const vehiculoId = e.currentTarget.dataset.vehiculoId;
          this.verDetalleVehiculo(vehiculoId);
        });
      });
    },

    filtrarVehiculos() {
      let vehiculos = [...state.vehiculos];
      
      // Aplicar filtro de búsqueda
      if (state.filtro) {
        const filtroLower = state.filtro.toLowerCase();
        vehiculos = vehiculos.filter(v => 
          v.marca?.toLowerCase().includes(filtroLower) ||
          v.modelo?.toLowerCase().includes(filtroLower) ||
          v.patente?.toLowerCase().includes(filtroLower)
        );
      }

      // Aplicar ordenamiento
      const [campo, direccion] = state.ordenamiento.split('_');
      vehiculos.sort((a, b) => {
        let valorA = a[campo] || '';
        let valorB = b[campo] || '';
        
        if (campo === 'año') {
          valorA = parseInt(valorA) || 0;
          valorB = parseInt(valorB) || 0;
        }
        
        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase();
          valorB = valorB.toLowerCase();
        }
        
        if (direccion === 'asc') {
          return valorA > valorB ? 1 : -1;
        } else {
          return valorA < valorB ? 1 : -1;
        }
      });

      return vehiculos;
    },

    actualizarEstadisticas() {
      const totalElement = document.getElementById('total-vehiculos');
      const masNuevoElement = document.getElementById('vehiculo-mas-nuevo');
      const marcaPrincipalElement = document.getElementById('marca-principal');

      totalElement.textContent = state.vehiculos.length;

      if (state.vehiculos.length > 0) {
        // Vehículo más nuevo por año
        const masNuevo = state.vehiculos.reduce((max, v) => 
          (parseInt(v.año) || 0) > (parseInt(max.año) || 0) ? v : max
        );
        masNuevoElement.textContent = masNuevo.año;

        // Marca más común
        const marcas = {};
        state.vehiculos.forEach(v => {
          marcas[v.marca] = (marcas[v.marca] || 0) + 1;
        });
        const marcaPrincipal = Object.keys(marcas).reduce((max, marca) => 
          marcas[marca] > marcas[max] ? marca : max
        );
        marcaPrincipalElement.textContent = marcaPrincipal;
      } else {
        masNuevoElement.textContent = '-';
        marcaPrincipalElement.textContent = '-';
      }
    },

    mostrarFormVehiculo(vehiculoId = null) {
      const modal = document.getElementById('vehiculo-form-modal');
      const vehiculo = vehiculoId ? state.vehiculos.find(v => v.id === vehiculoId) : null;
      const marcas = utils.obtenerMarcasComunes();

      modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Header del modal -->
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800">${vehiculoId ? 'Editar' : 'Nuevo'} Vehículo</h3>
                  <p class="text-gray-600">Complete la información del vehículo</p>
                </div>
              </div>
              <button id="cerrar-modal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Formulario -->
          <form id="vehiculo-form" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Marca -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                <div class="relative">
                  <input name="marca" type="text" list="marcas-list" placeholder="Seleccione o escriba la marca" 
                    value="${vehiculo?.marca || ''}" required 
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm" />
                  <datalist id="marcas-list">
                    ${marcas.map(marca => `<option value="${marca}">`).join('')}
                  </datalist>
                </div>
              </div>

              <!-- Modelo -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                <input name="modelo" type="text" placeholder="Ej: Corolla, Focus, Gol" 
                  value="${vehiculo?.modelo || ''}" required 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm" />
              </div>

              <!-- Patente -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Patente *</label>
                <input name="patente" type="text" placeholder="ABC123 o AB123CD" 
                  value="${vehiculo?.patente || ''}" required maxlength="7"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm uppercase tracking-wider font-mono text-center" />
                <p class="text-xs text-gray-500 mt-1">Formato: ABC123 (viejo) o AB123CD (nuevo)</p>
              </div>

              <!-- Año -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Año *</label>
                <input name="año" type="number" placeholder="2020" 
                  value="${vehiculo?.año || ''}" required 
                  min="1900" max="${new Date().getFullYear() + 1}"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm" />
              </div>
            </div>

            <!-- Información adicional -->
            <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 class="font-medium text-blue-800 mb-3">Información Adicional (Opcional)</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input name="color" type="text" placeholder="Blanco, Negro, Gris..." 
                    value="${vehiculo?.color || ''}" 
                    class="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Combustible</label>
                  <select name="combustible" class="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm">
                    <option value="">Seleccionar</option>
                    <option value="Nafta" ${vehiculo?.combustible === 'Nafta' ? 'selected' : ''}>Nafta</option>
                    <option value="Gasoil" ${vehiculo?.combustible === 'Gasoil' ? 'selected' : ''}>Gasoil</option>
                    <option value="GNC" ${vehiculo?.combustible === 'GNC' ? 'selected' : ''}>GNC</option>
                    <option value="Eléctrico" ${vehiculo?.combustible === 'Eléctrico' ? 'selected' : ''}>Eléctrico</option>
                    <option value="Híbrido" ${vehiculo?.combustible === 'Híbrido' ? 'selected' : ''}>Híbrido</option>
                  </select>
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                <textarea name="observaciones" rows="3" placeholder="Notas adicionales sobre el vehículo..." 
                  class="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none">${vehiculo?.observaciones || ''}</textarea>
              </div>
            </div>

            <!-- Validación en tiempo real -->
            <div id="validacion-patente" class="hidden p-3 rounded-lg text-sm"></div>

            <!-- Botones -->
            <div class="flex gap-4 pt-4">
              <button type="button" id="cancelar-vehiculo" 
                class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                Cancelar
              </button>
              <button type="submit" id="guardar-vehiculo"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                ${vehiculoId ? 'Actualizar' : 'Guardar'} Vehículo
              </button>
            </div>
          </form>

          <!-- Área de errores -->
          <div id="vehiculo-form-error" class="hidden mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"></div>
        </div>
      `;

      modal.classList.remove('hidden');
      this.configurarFormVehiculo(vehiculoId);
    },

    configurarFormVehiculo(vehiculoId) {
      const modal = document.getElementById('vehiculo-form-modal');
      const form = document.getElementById('vehiculo-form');
      const patenteInput = form.querySelector('input[name="patente"]');
      const validacionDiv = document.getElementById('validacion-patente');

      // Auto-uppercase y validación de patente con debounce
      const validarPatenteDebounced = utils.debounce((valor) => {
        if (valor.length > 0) {
          const esValida = utils.validarPatente(valor);
          validacionDiv.classList.remove('hidden');
          
          if (esValida) {
            validacionDiv.className = 'p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700';
            validacionDiv.innerHTML = '✅ Formato de patente válido';
          } else if (valor.length >= 6) {
            validacionDiv.className = 'p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700';
            validacionDiv.innerHTML = '❌ Formato inválido. Use ABC123 o AB123CD';
          } else {
            validacionDiv.className = 'p-3 rounded-lg text-sm bg-yellow-50 border border-yellow-200 text-yellow-700';
            validacionDiv.innerHTML = '⚠️ Escribiendo... Formato: ABC123 (viejo) o AB123CD (nuevo)';
          }
        } else {
          validacionDiv.classList.add('hidden');
        }
      }, 300);

      patenteInput.addEventListener('input', (e) => {
        const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        e.target.value = valor;
        validarPatenteDebounced(valor);
      });

      // Validación en tiempo real para marca y modelo
      const marcaInput = form.querySelector('input[name="marca"]');
      const modeloInput = form.querySelector('input[name="modelo"]');
      const añoInput = form.querySelector('input[name="año"]');

      if (marcaInput && modeloInput) {
        [marcaInput, modeloInput].forEach(input => {
          input.addEventListener('input', (e) => {
            e.target.value = utils.formatearNombre(e.target.value);
          });
        });
      }

      if (añoInput) {
        añoInput.addEventListener('input', (e) => {
          const año = parseInt(e.target.value);
          const currentYear = new Date().getFullYear();
          if (año && (año < 1900 || año > currentYear + 1)) {
            e.target.setCustomValidity(`El año debe estar entre 1900 y ${currentYear + 1}`);
          } else {
            e.target.setCustomValidity('');
          }
        });
      }

      // Cerrar modal
      document.getElementById('cerrar-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      document.getElementById('cancelar-vehiculo').addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      // Cerrar con Escape o click fuera
      const closeModal = (e) => {
        if (e.key === 'Escape' || e.target === modal) {
          modal.classList.add('hidden');
        }
      };
      document.addEventListener('keydown', closeModal);
      modal.addEventListener('click', closeModal);

      // Submit del formulario
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const vehiculoData = {
          marca: (formData.get('marca') || '').trim(),
          modelo: (formData.get('modelo') || '').trim(),
          patente: (formData.get('patente') || '').trim().toUpperCase(),
          año: parseInt(formData.get('año') || 0),
          color: (formData.get('color') || '').trim(),
          combustible: formData.get('combustible') || '',
          observaciones: (formData.get('observaciones') || '').trim(),
          cliente_id: cliente_id
        };

        try {
          const botonGuardar = document.getElementById('guardar-vehiculo');
          const errorDiv = document.getElementById('vehiculo-form-error');
          
          // Ocultar errores previos
          errorDiv.classList.add('hidden');
          
          // Validación final antes de enviar
          const errores = utils.validarDatos(vehiculoData);
          if (errores.length > 0) {
            throw new Error(errores.join('\n'));
          }
          
          botonGuardar.disabled = true;
          botonGuardar.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Guardando...
          `;

          await api.guardarVehiculo(vehiculoData, vehiculoId);
          modal.classList.add('hidden');
        } catch (error) {
          const errorDiv = document.getElementById('vehiculo-form-error');
          errorDiv.innerHTML = error.message.split('\n').map(err => `<div class="flex items-center gap-2"><svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>${err}</div>`).join('');
          errorDiv.classList.remove('hidden');
          
          // Scroll al error
          errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
          const botonGuardar = document.getElementById('guardar-vehiculo');
          botonGuardar.disabled = false;
          botonGuardar.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            ${vehiculoId ? 'Actualizar' : 'Guardar'} Vehículo
          `;
        }
      });
    },

    editarVehiculo(vehiculoId) {
      this.mostrarFormVehiculo(vehiculoId);
    },

    confirmarEliminarVehiculo(vehiculoId, nombreVehiculo) {
      if (confirm(`¿Está seguro de que desea eliminar el vehículo ${nombreVehiculo}?\n\nEsta acción no se puede deshacer.`)) {
        api.eliminarVehiculo(vehiculoId);
      }
    },

    verDetalleVehiculo(vehiculoId) {
      const vehiculo = state.vehiculos.find(v => v.id === vehiculoId);
      if (!vehiculo) return;

      // Aquí se podría implementar un modal de detalle con historial de servicios
      utils.mostrarNotificacion(`Mostrando detalles de ${vehiculo.marca} ${vehiculo.modelo}`, 'info');
    },

    exportarVehiculos() {
      if (state.vehiculos.length === 0) {
        utils.mostrarNotificacion('No hay vehículos para exportar', 'warning');
        return;
      }

      // Crear CSV
      const headers = ['Marca', 'Modelo', 'Patente', 'Año', 'Color', 'Combustible', 'Fecha Registro'];
      const csvContent = [
        headers.join(','),
        ...state.vehiculos.map(v => [
          v.marca || '',
          v.modelo || '',
          v.patente || '',
          v.año || '',
          v.color || '',
          v.combustible || '',
          utils.formatFecha(v.created_at)
        ].join(','))
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `vehiculos_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      utils.mostrarNotificacion('Archivo exportado exitosamente', 'success');
    }
  };

  // Event listeners
  function setupEventListeners() {
    // Nuevo vehículo
    document.getElementById('nuevo-vehiculo').addEventListener('click', () => {
      ui.mostrarFormVehiculo();
    });

    // Cerrar módulo
    document.getElementById('cerrar-vehiculos').addEventListener('click', onClose);

    // Búsqueda
    let timeoutBusqueda;
    document.getElementById('buscar-vehiculo').addEventListener('input', (e) => {
      clearTimeout(timeoutBusqueda);
      timeoutBusqueda = setTimeout(() => {
        state.filtro = e.target.value;
        ui.actualizarListaVehiculos();
      }, 300);
    });

    // Ordenamiento
    document.getElementById('ordenar-vehiculos').addEventListener('change', (e) => {
      state.ordenamiento = e.target.value;
      ui.actualizarListaVehiculos();
    });

    // Exportar
    document.getElementById('exportar-vehiculos').addEventListener('click', () => {
      ui.exportarVehiculos();
    });
  }

  // Event listeners están configurados internamente, no necesitamos exponer ui globalmente

  // Inicialización
  setupEventListeners();
  await api.cargarVehiculos();
}

// Función global para gestión completa de vehículos
export async function renderVehiculosGlobal(container) {
  // Similar implementación pero con funcionalidad extendida para todos los clientes
  // Por brevedad, mantengo la implementación existente pero mejorada
  
  // Estado global
  const state = {
    vehiculos: [],
    clientes: [],
    filtro: '',
    filtroCliente: '',
    ordenamiento: 'created_at_desc',
    paginaActual: 1,
    vehiculosPorPagina: 10
  };

  // Similar estructura pero adaptada para vista global
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header global -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestión de Vehículos
                </h2>
                <p class="text-gray-600 text-lg">Administra todos los vehículos del sistema</p>
              </div>
            </div>
            
            <button id="nuevo-vehiculo-global" class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuevo Vehículo
            </button>
          </div>

          <!-- Filtros avanzados -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Vehículo</label>
                <input type="text" id="buscar-vehiculo-global" placeholder="🔍 Patente, marca, modelo..."
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <select id="filtro-cliente" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
                  <option value="">Todos los clientes</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select id="ordenar-vehiculos-global" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
                  <option value="created_at_desc">Más recientes</option>
                  <option value="created_at_asc">Más antiguos</option>
                  <option value="marca_asc">Marca A-Z</option>
                  <option value="año_desc">Año (nuevo a viejo)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Acciones</label>
                <button id="exportar-vehiculos-global" class="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de vehículos globales -->
        <div id="vehiculos-lista-global" class="space-y-4">
          <!-- Se cargan dinámicamente -->
        </div>

        <!-- Paginación -->
        <div id="paginacion" class="mt-8 flex justify-center">
          <!-- Se genera dinámicamente -->
        </div>

        <!-- Modal global -->
        <div id="vehiculo-form-modal-global" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
          <!-- Se genera dinámicamente -->
        </div>
      </div>
    </div>
  `;

  // Implementación similar pero extendida...
  // Por brevedad, uso la implementación existente mejorada
  
  // Cargar datos iniciales
  await cargarVehiculosGlobales();
  
  async function cargarVehiculosGlobales() {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*, clientes(id, nombre)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      state.vehiculos = data || [];
      
      // Cargar clientes para filtro
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id, nombre')
        .order('nombre');
      
      state.clientes = clientes || [];
      actualizarInterfazGlobal();
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  }

  function actualizarInterfazGlobal() {
    // Actualizar filtro de clientes
    const filtroCliente = document.getElementById('filtro-cliente');
    filtroCliente.innerHTML = '<option value="">Todos los clientes</option>' +
      state.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
    // Actualizar lista
    actualizarListaGlobal();
  }

  function actualizarListaGlobal() {
    const container = document.getElementById('vehiculos-lista-global');
    let vehiculosFiltrados = [...state.vehiculos];

    // Aplicar filtros
    if (state.filtro) {
      const filtroLower = state.filtro.toLowerCase();
      vehiculosFiltrados = vehiculosFiltrados.filter(v =>
        v.marca?.toLowerCase().includes(filtroLower) ||
        v.modelo?.toLowerCase().includes(filtroLower) ||
        v.patente?.toLowerCase().includes(filtroLower) ||
        v.clientes?.nombre?.toLowerCase().includes(filtroLower)
      );
    }

    if (state.filtroCliente) {
      vehiculosFiltrados = vehiculosFiltrados.filter(v => v.cliente_id === state.filtroCliente);
    }

    // Renderizar vehículos
    if (vehiculosFiltrados.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-400 mb-2">No hay vehículos</h3>
          <p class="text-gray-400">No se encontraron vehículos con los filtros aplicados</p>
        </div>
      `;
      return;
    }

    container.innerHTML = vehiculosFiltrados.map(vehiculo => `
      <div class="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"></path>
                </svg>
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-800">${vehiculo.marca} ${vehiculo.modelo}</h4>
                <div class="flex items-center gap-3">
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">${vehiculo.patente}</span>
                  <span class="text-gray-500">•</span>
                  <span class="text-gray-600">${vehiculo.año}</span>
                  <span class="text-gray-500">•</span>
                  <span class="text-blue-600 font-medium">${vehiculo.clientes?.nombre || 'Sin cliente'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button onclick="editarVehiculoGlobal('${vehiculo.id}')" 
              class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors">
              Editar
            </button>
            <button onclick="eliminarVehiculoGlobal('${vehiculo.id}')" 
              class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Event listeners globales
  document.getElementById('buscar-vehiculo-global').addEventListener('input', (e) => {
    state.filtro = e.target.value;
    actualizarListaGlobal();
  });

  document.getElementById('filtro-cliente').addEventListener('change', (e) => {
    state.filtroCliente = e.target.value;
    actualizarListaGlobal();
  });

  // Funciones globales para HTML (utilizadas en renderVehiculosGlobal)
  window.editarVehiculoGlobal = (id) => {
    console.log('Editar vehículo global:', id);
    // TODO: Implementar edición para vista global
    alert('Función de edición global en desarrollo');
  };

  window.eliminarVehiculoGlobal = (id) => {
    console.log('Eliminar vehículo global:', id);
    // TODO: Implementar eliminación para vista global
    if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      alert('Función de eliminación global en desarrollo');
    }
  };
}