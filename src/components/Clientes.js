import { supabase } from '../supabaseClient.js';
import { renderVehiculos } from './Vehiculos.js';

export async function renderClientes(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-6 px-4"> {/* Ajustado max-w y py */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-acento);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05c1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          Gestión de Clientes
        </h2>
        <div class="flex gap-3 w-full sm:w-auto">
          <input type="search" id="buscar-cliente" placeholder="Buscar cliente..." class="flex-1 px-3 py-2" />
          <button id="nuevo-cliente" class="button primary flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nuevo Cliente
          </button>
        </div>
      </div>
      <div id="clientes-lista" class="space-y-4"></div>
      {/* Modales se renderizarán dentro de estos contenedores con la clase .modal-overlay */}
      <div id="cliente-form-modal" class="modal-overlay hidden"></div>
      <div id="vehiculos-modal" class="modal-overlay hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('clientes-lista');
  const buscarInput = document.getElementById('buscar-cliente');
  const modal = document.getElementById('cliente-form-modal');
  const vehiculosModal = document.getElementById('vehiculos-modal');

  async function cargarClientes(filtro = '') {
    let query = supabase.from('clientes').select('*').order('nombre', { ascending: true }); // Ordenar por nombre
    if (filtro) {
      query = query.ilike('nombre', `%${filtro}%`);
    }
    const { data, error } = await query;
    if (error) {
      listaDiv.innerHTML = '<div class="text-red-600">Error al cargar clientes</div>';
      return;
    }
    if (!data || data.length === 0) {
      listaDiv.innerHTML = '<p class="no-data-placeholder">No hay clientes para mostrar. ¡Añade uno nuevo!</p>';
      return;
    }
    listaDiv.innerHTML = data.map(cliente => `
      <div class="list-item-card">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 class="item-title">${cliente.nombre}</h3>
            <p class="item-subtitle">
              ${cliente.email ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5l-8-5V6l8 5l8-5v2z"/></svg>${cliente.email}` : ''}
              ${cliente.telefono ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1 ml-2" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${cliente.telefono}` : ''}
            </p>
            <p class="item-subtitle text-xs mt-1">
              ${cliente.direccion ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z"/></svg>${cliente.direccion}` : ''}
            </p>
          </div>
          <div class="item-actions mt-3 sm:mt-0">
            <button data-id="${cliente.id}" class="button secondary ver-vehiculos">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
              Vehículos
            </button>
            <button data-id="${cliente.id}" class="button editar-cliente" style="background-color: var(--color-advertencia); color: white;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
              Editar
            </button>
            <button data-id="${cliente.id}" class="button danger eliminar-cliente">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join('');
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
    modal.classList.remove('hidden');
    // El div con clase modal-overlay ya está en el HTML principal.
    // Aquí generamos solo el contenido interno del modal.
    modal.innerHTML = `
      <div class="modal-content-inner">
        <button id="cerrar-modal" class="close-modal-btn">&times;</button>
        <h3 class="text-xl font-bold mb-5">${id ? 'Editar' : 'Nuevo'} Cliente</h3>
        <form id="cliente-form" class="flex flex-col gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium mb-1" style="color: var(--color-texto-oscuro);">Nombre completo</label>
            <input type="text" name="nombre" id="nombre" placeholder="Nombre del cliente" value="${cliente.nombre || ''}" required />
          </div>
          <div>
            <label for="telefono" class="block text-sm font-medium mb-1" style="color: var(--color-texto-oscuro);">Teléfono</label>
            <input type="tel" name="telefono" id="telefono" placeholder="Número de teléfono" value="${cliente.telefono || ''}" />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium mb-1" style="color: var(--color-texto-oscuro);">Correo electrónico</label>
            <input type="email" name="email" id="email" placeholder="ejemplo@correo.com" value="${cliente.email || ''}" />
          </div>
          <div>
            <label for="direccion" class="block text-sm font-medium mb-1" style="color: var(--color-texto-oscuro);">Dirección</label>
            <input type="text" name="direccion" id="direccion" placeholder="Dirección del cliente" value="${cliente.direccion || ''}" />
          </div>
          <div id="cliente-form-error" class="text-error text-sm mt-1"></div> {/* Mensaje de error */}
          <div class="flex gap-3 mt-4">
            <button type="submit" class="button primary w-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
              Guardar Cliente
            </button>
            <button type="button" id="cancelar-cliente" class="button secondary w-full">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('cancelar-cliente').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('cliente-form').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('cliente-form-error');
      errorDiv.textContent = ''; // Limpiar errores previos
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        telefono: form.telefono.value,
        email: form.email.value,
        direccion: form.direccion.value
      };
      let res;
      if (id) {
        res = await supabase.from('clientes').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('clientes').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('cliente-form-error').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarClientes(buscarInput.value);
      }
    };
  }

  async function eliminarCliente(id) {
    if (!confirm('¿Eliminar cliente?')) return;
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (!error) cargarClientes(buscarInput.value);
  }

  async function mostrarVehiculos(cliente_id) {
    vehiculosModal.classList.remove('hidden');
    renderVehiculos(vehiculosModal, cliente_id, () => vehiculosModal.classList.add('hidden'));
  }

  cargarClientes();
} 