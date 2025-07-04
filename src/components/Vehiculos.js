import { supabase } from '../supabaseClient.js';

export async function renderVehiculos(modalContainer, cliente_id, onClose) { // modalContainer es el div con clase .modal-overlay
  // Obtener nombre del cliente para el título
  const { data: clienteData } = await supabase.from('clientes').select('nombre').eq('id', cliente_id).single();
  const nombreCliente = clienteData?.nombre || 'Cliente';

  modalContainer.innerHTML = `
    <div class="modal-content-inner max-w-2xl"> {/* Más ancho para lista y form */}
      <button id="cerrar-vehiculos-modal" class="close-modal-btn">&times;</button>
      <h3 class="text-xl font-bold mb-4">Vehículos de ${nombreCliente}</h3>
      <button id="nuevo-vehiculo-cliente" class="button primary mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Añadir Vehículo
      </button>
      <div id="vehiculos-lista-cliente" class="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4"></div>
      <div id="vehiculo-form-container-cliente"></div> {/* Contenedor para el formulario de añadir/editar */}
      <button id="cerrar-dialogo-vehiculos" class="button secondary mt-6 w-full">Cerrar Vista de Vehículos</button>
    </div>`;

  const listaDiv = modalContainer.querySelector('#vehiculos-lista-cliente');
  const formContainer = modalContainer.querySelector('#vehiculo-form-container-cliente');

  async function cargarVehiculos() {
    const { data, error } = await supabase.from('vehiculos').select('*').eq('cliente_id', cliente_id).order('marca', { ascending: true });
    if (error) {
      listaDiv.innerHTML = `<p class="text-error">Error al cargar vehículos: ${error.message}</p>`;
      return;
    }
    if (!data || data.length === 0) {
      listaDiv.innerHTML = '<p class="no-data-placeholder text-sm">Este cliente no tiene vehículos registrados.</p>';
      return;
    }
    listaDiv.innerHTML = data.map(v => `
      <div class="list-item-card p-3">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h4 class="item-title text-base">${v.marca || 'N/A'} ${v.modelo || 'N/A'}
              <span class="font-normal text-xs opacity-70">(${v.patente || 'N/A'})</span>
            </h4>
            <p class="item-subtitle text-xs">Año: ${v.año || '-'}</p>
          </div>
          <div class="item-actions mt-2 sm:mt-0">
            <button data-id="${v.id}" class="button editar-vehiculo-cliente text-xs" style="background-color: var(--color-advertencia); color:white;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
              Editar
            </button>
            <button data-id="${v.id}" class="button danger eliminar-vehiculo-cliente text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join('');
    modalContainer.querySelectorAll('.editar-vehiculo-cliente').forEach(btn => {
      btn.onclick = () => mostrarFormVehiculoCliente(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-vehiculo').forEach(btn => {
      btn.onclick = () => eliminarVehiculo(btn.dataset.id);
    });
  }

  modalContainer.querySelector('#nuevo-vehiculo-cliente').onclick = () => mostrarFormVehiculoCliente(null);
  modalContainer.querySelector('#cerrar-vehiculos-modal').onclick = () => { modalContainer.classList.add('hidden'); modalContainer.innerHTML=''; if(onClose) onClose(); };
  modalContainer.querySelector('#cerrar-dialogo-vehiculos').onclick = () => { modalContainer.classList.add('hidden'); modalContainer.innerHTML=''; if(onClose) onClose(); };


  async function mostrarFormVehiculoCliente(id) {
    let vehiculo = { marca: '', modelo: '', patente: '', año: '' };
    if (id) {
      const { data: vehData } = await supabase.from('vehiculos').select('*').eq('id', id).single();
      if (vehData) vehiculo = vehData;
    }

    formContainer.innerHTML = `
      <div class="list-item-card p-4 mt-4 border-t border-[var(--color-borde)]"> {/* Card para el form anidado */}
        <h4 class="text-md font-semibold mb-3" style="color: var(--color-texto-oscuro);">${id ? 'Editar' : 'Añadir Nuevo'} Vehículo</h4>
        <form id="vehiculo-form-cliente" class="flex flex-col gap-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="marca_vc" class="block text-xs font-medium mb-1">Marca</label>
              <input type="text" name="marca" id="marca_vc" value="${vehiculo.marca || ''}" required />
            </div>
            <div>
              <label for="modelo_vc" class="block text-xs font-medium mb-1">Modelo</label>
              <input type="text" name="modelo" id="modelo_vc" value="${vehiculo.modelo || ''}" required />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="patente_vc" class="block text-xs font-medium mb-1">Patente</label>
              <input type="text" name="patente" id="patente_vc" value="${vehiculo.patente || ''}" required />
            </div>
            <div>
              <label for="ano_vc" class="block text-xs font-medium mb-1">Año</label>
              <input type="number" name="año" id="ano_vc" placeholder="Ej: 2020" value="${vehiculo.año || ''}" required />
            </div>
          </div>
          <div id="vehiculo-form-cliente-error" class="text-error text-sm"></div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="button primary flex-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
              ${id ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" id="cancelar-vehiculo-cliente-form" class="button secondary flex-1 text-sm">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    formContainer.querySelector('#cancelar-vehiculo-cliente-form').onclick = () => { formContainer.innerHTML = ''; }; // Limpiar solo el form
    formContainer.querySelector('#vehiculo-form-cliente').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = formContainer.querySelector('#vehiculo-form-cliente-error');
      errorDiv.textContent = '';
      const form = e.target;
      const nuevo = {
        marca: form.marca.value,
        modelo: form.modelo.value,
        patente: form.patente.value,
        año: parseInt(form.año.value, 10),
        cliente_id
      };
      let res;
      if (id) {
        res = await supabase.from('vehiculos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('vehiculos').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('vehiculo-form-error').textContent = res.error.message;
      } else {
        modal.style.display = 'none';
        cargarVehiculos();
      }
    };
  }

  async function eliminarVehiculo(id) {
    if (!confirm('¿Eliminar vehículo?')) return;
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (!error) cargarVehiculos();
  }

  cargarVehiculos();
}

export async function renderVehiculosGlobal(container) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-6 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-acento);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 7L20 3H4L2.01 7L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7zM4.47 5h15.06l.94 2H3.53l.94-2zM20 17H4v-6h16v6zm-7-4H7v2h6v-2z"/></svg>
          Gestión de Vehículos
        </h2>
        <div class="flex gap-3 w-full sm:w-auto">
          <input type="search" id="buscar-vehiculo" placeholder="Buscar por patente, marca, modelo o cliente..." class="flex-1 px-3 py-2" />
          <button id="nuevo-vehiculo-global" class="button primary flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nuevo Vehículo
          </button>
        </div>
      </div>
      <div id="vehiculos-lista-global" class="space-y-4"></div>
      <div id="vehiculo-form-modal-global" class="modal-overlay hidden"></div>
      <div id="modal-nuevo-cliente-desde-vehiculo" class="modal-overlay hidden z-60"></div> {/* Z-index más alto para el modal de cliente */}
    </div>
  `;
  const listaDiv = document.getElementById('vehiculos-lista-global');
  const buscarInput = document.getElementById('buscar-vehiculo');
  const modal = document.getElementById('vehiculo-form-modal-global');
  const modalNuevoCliente = document.getElementById('modal-nuevo-cliente-desde-vehiculo');


  async function cargarVehiculos(filtro = '') {
    let query = supabase.from('vehiculos').select('*,clientes(nombre)').order('patente', { ascending: true });
    if (filtro) {
      query = query.or(`patente.ilike.%${filtro}%,marca.ilike.%${filtro}%,modelo.ilike.%${filtro}%,clientes.nombre.ilike.%${filtro}%`);
    }
    const { data, error } = await query;
    if (error) {
      listaDiv.innerHTML = `<div class="text-error p-4 text-center">Error al cargar vehículos: ${error.message}</div>`;
      return;
    }
     if (!data || data.length === 0) {
      listaDiv.innerHTML = '<p class="no-data-placeholder">No hay vehículos registrados. ¡Añade uno nuevo!</p>';
      return;
    }
    listaDiv.innerHTML = data.map(v => `
      <div class="list-item-card">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 class="item-title">${v.marca || 'Sin Marca'} ${v.modelo || 'Sin Modelo'}
              <span class="font-normal text-sm" style="color: var(--color-texto-oscuro); opacity: 0.7;">(${v.patente || 'Sin Patente'})</span>
            </h3>
            <p class="item-subtitle">Año: ${v.año || '-'} | Cliente:
              <span class="font-semibold" style="color: var(--color-acento);">${v.clientes?.nombre || 'No asignado'}</span>
            </p>
          </div>
          <div class="item-actions mt-3 sm:mt-0">
            <button data-id="${v.id}" class="button editar-vehiculo-global" style="background-color: var(--color-advertencia); color:white;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
              Editar
            </button>
            <button data-id="${v.id}" class="button danger eliminar-vehiculo-global">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.editar-vehiculo-global').forEach(btn => {
      btn.onclick = () => mostrarFormVehiculo(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-vehiculo-global').forEach(btn => {
      btn.onclick = () => eliminarVehiculo(btn.dataset.id);
    });
  }

  buscarInput.oninput = () => cargarVehiculos(buscarInput.value);
  document.getElementById('nuevo-vehiculo-global').onclick = () => mostrarFormVehiculo();

  async function mostrarFormVehiculo(id) {
    let vehiculo = { marca: '', modelo: '', patente: '', año: '', cliente_id: '' };
    if (id) {
      const { data } = await supabase.from('vehiculos').select('*').eq('id', id).single();
      vehiculo = data;
    }
    // Cargar clientes para el select
    const { data: clientesData } = await supabase.from('clientes').select('id,nombre').order('nombre');
    const clientes = clientesData || [];
    modal.classList.remove('hidden');
    modal.innerHTML = `
    <div class="modal-content-inner max-w-lg">
      <button id="cerrar-modal-global" class="close-modal-btn">&times;</button>
      <h3 class="text-xl font-bold mb-5">${id ? 'Editar' : 'Nuevo'} Vehículo</h3>
      <form id="vehiculo-form-global" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="marca_veh_g" class="block text-sm font-medium mb-1">Marca</label>
            <input type="text" name="marca" id="marca_veh_g" value="${vehiculo.marca || ''}" required />
          </div>
          <div>
            <label for="modelo_veh_g" class="block text-sm font-medium mb-1">Modelo</label>
            <input type="text" name="modelo" id="modelo_veh_g" value="${vehiculo.modelo || ''}" required />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="patente_veh_g" class="block text-sm font-medium mb-1">Patente</label>
            <input type="text" name="patente" id="patente_veh_g" value="${vehiculo.patente || ''}" required />
          </div>
          <div>
            <label for="ano_veh_g" class="block text-sm font-medium mb-1">Año</label>
            <input type="number" name="año" id="ano_veh_g" placeholder="Ej: 2020" value="${vehiculo.año || ''}" required />
          </div>
        </div>
        <div>
          <label for="cliente_id_veh_g" class="block text-sm font-medium mb-1">Cliente Asociado</label>
          <div class="flex gap-2 items-center">
            <select name="cliente_id" id="cliente_id_veh_g" required class="flex-1">
              <option value="">Seleccionar cliente existente</option>
              ${clientes.map(c => `<option value="${c.id}" ${vehiculo.cliente_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
            </select>
            <button type="button" id="nuevo-cliente-desde-vehiculo" class="button secondary p-2" title="Crear Nuevo Cliente">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
          </div>
        </div>
        <div id="vehiculo-form-error-global" class="text-error text-sm mt-1"></div>
        <div class="flex gap-3 mt-4">
          <button type="submit" class="button primary w-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
            Guardar Vehículo
          </button>
          <button type="button" id="cancelar-vehiculo-global" class="button secondary w-full">Cancelar</button>
        </div>
      </form>
    </div>
    `;
    document.getElementById('cerrar-modal-global').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('cancelar-vehiculo-global').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('vehiculo-form-global').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('vehiculo-form-error-global');
      errorDiv.textContent = '';
      const form = e.target;
      const nuevo = {
        marca: form.marca.value,
        modelo: form.modelo.value,
        patente: form.patente.value,
        año: parseInt(form.año.value, 10),
        cliente_id: form.cliente_id.value
      };
      let res;
      if (id) {
        res = await supabase.from('vehiculos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('vehiculos').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('vehiculo-form-error-global').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarVehiculos(buscarInput.value);
      }
    };
    // Lógica para crear cliente desde el modal de vehículo
    document.getElementById('nuevo-cliente-desde-vehiculo').onclick = () => mostrarFormNuevoCliente(modalNuevoCliente);

    function mostrarFormNuevoCliente(modalContainer) { // modalContainer es el div con clase .modal-overlay
      modalContainer.classList.remove('hidden');
      modalContainer.innerHTML = `
        <div class="modal-content-inner max-w-md"> {/* Usar modal-content-inner */}
          <button id="cerrar-modal-nuevo-cliente" class="close-modal-btn">&times;</button>
          <h3 class="text-xl font-bold mb-5">Nuevo Cliente Rápido</h3>
          <form id="form-nuevo-cliente" class="flex flex-col gap-4">
            <div>
              <label for="nombre_nc" class="block text-sm font-medium mb-1">Nombre completo</label>
              <input type="text" name="nombre" id="nombre_nc" placeholder="Nombre del cliente" required />
            </div>
            <div>
              <label for="telefono_nc" class="block text-sm font-medium mb-1">Teléfono</label>
              <input type="tel" name="telefono" id="telefono_nc" placeholder="Número de teléfono" />
            </div>
            {/* Se pueden añadir más campos si se desea, como email o dirección */}
            <div id="nuevo-cliente-error" class="text-error text-sm mt-1"></div>
            <div class="flex gap-3 mt-4">
              <button type="submit" class="button primary w-full">Guardar Cliente</button>
              <button type="button" id="cancelar-nuevo-cliente" class="button secondary w-full">Cancelar</button>
            </div>
          </form>
        </div>`;

      document.getElementById('cerrar-modal-nuevo-cliente').onclick = () => { modalContainer.classList.add('hidden'); modalContainer.innerHTML = ''; };
      document.getElementById('cancelar-nuevo-cliente').onclick = () => { modalContainer.classList.add('hidden'); modalContainer.innerHTML = ''; };
      document.getElementById('form-nuevo-cliente').onsubmit = async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('nuevo-cliente-error');
        errorDiv.textContent = '';
        const form = e.target;
        const nuevoCliente = {
          nombre: form.nombre.value,
          telefono: form.telefono.value,
          email: form.email.value,
          direccion: form.direccion.value
        };
        const { data, error } = await supabase.from('clientes').insert([nuevoCliente]).select().single();
        if (error) {
          document.getElementById('nuevo-cliente-error').textContent = error.message;
        } else {
          // Agregar el nuevo cliente al select y seleccionarlo
          const select = document.querySelector('select[name="cliente_id"]');
          const option = document.createElement('option');
          option.value = data.id;
          option.textContent = data.nombre;
          select.appendChild(option);
          select.value = data.id; // Seleccionar automáticamente el nuevo cliente
          modalContainer.classList.add('hidden'); // Ocultar el modal de nuevo cliente
          modalContainer.innerHTML = ''; // Limpiar su contenido
        }
      };
    }
  }

  async function eliminarVehiculo(id) {
    // Usar un modal de confirmación más estilizado en el futuro. Por ahora, confirm es OK.
    if (!confirm('¿Está seguro de que desea eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (error) {
        alert(`Error al eliminar vehículo: ${error.message}`);
    } else {
        cargarVehiculos(buscarInput.value); // Recargar la lista
    }
  }

  cargarVehiculos();
} 