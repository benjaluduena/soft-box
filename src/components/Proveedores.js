import { supabase } from '../supabaseClient.js';

export async function renderProveedores(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-6 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-acento);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 15c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3zm0-10c-1.66 0-3 1.34-3 3s1.34 3 3 3s3 1.34 3 3s-1.34 3-3 3v-2c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1v2c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3zM4 9h16v2H4V9z"/></svg> {/* Icono genérico de edificio/empresa */}
          Gestión de Proveedores
        </h2>
        <button id="nuevo-proveedor" class="button primary flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nuevo Proveedor
        </button>
      </div>
      <div id="proveedores-lista" class="space-y-4"></div>
      <div id="proveedor-form-modal" class="modal-overlay hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('proveedores-lista');
  const modal = document.getElementById('proveedor-form-modal');

  async function cargarProveedores() {
    const { data, error } = await supabase.from('proveedores').select('*').order('nombre');
    if (error) {
      listaDiv.innerHTML = `<div class="text-error p-4 text-center">Error al cargar proveedores: ${error.message}</div>`;
      return;
    }
    if (!data || data.length === 0) {
      listaDiv.innerHTML = '<p class="no-data-placeholder">No hay proveedores registrados. ¡Añade uno nuevo!</p>';
      return;
    }
    listaDiv.innerHTML = data.map(prov => `
      <div class="list-item-card">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 class="item-title">${prov.nombre}</h3>
            <p class="item-subtitle"><span class="font-semibold">CUIT:</span> ${prov.cuit || '-'} | <span class="font-semibold">Rubro:</span> ${prov.rubro || '-'}</p>
            <p class="item-subtitle text-xs mt-1">
              ${prov.telefono ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${prov.telefono}` : ''}
              ${prov.email ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1 ml-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5l-8-5V6l8 5l8-5v2z"/></svg>${prov.email}` : ''}
            </p>
          </div>
          <div class="item-actions mt-3 sm:mt-0">
            <button data-id="${prov.id}" class="button editar-proveedor" style="background-color: var(--color-advertencia); color:white;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
              Editar
            </button>
            <button data-id="${prov.id}" class="button danger eliminar-proveedor">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.editar-proveedor').forEach(btn => {
      btn.onclick = () => mostrarFormProveedor(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-proveedor').forEach(btn => {
      btn.onclick = () => eliminarProveedor(btn.dataset.id);
    });
  }

  document.getElementById('nuevo-proveedor').onclick = () => mostrarFormProveedor();

  async function mostrarFormProveedor(id) {
    let proveedor = { nombre: '', cuit: '', telefono: '', email: '', rubro: '' };
    if (id) {
      const { data } = await supabase.from('proveedores').select('*').eq('id', id).single();
      proveedor = data;
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="modal-content-inner">
        <button id="cerrar-modal" class="close-modal-btn">&times;</button>
        <h3 class="text-xl font-bold mb-5">${id ? 'Editar' : 'Nuevo'} Proveedor</h3>
        <form id="proveedor-form" class="flex flex-col gap-4">
          <div>
            <label for="nombre_prov" class="block text-sm font-medium mb-1">Nombre del Proveedor</label>
            <input type="text" name="nombre" id="nombre_prov" placeholder="Nombre comercial" value="${proveedor.nombre || ''}" required />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="cuit_prov" class="block text-sm font-medium mb-1">CUIT</label>
              <input type="text" name="cuit" id="cuit_prov" placeholder="Ej: 20-12345678-9" value="${proveedor.cuit || ''}" />
            </div>
            <div>
              <label for="rubro_prov" class="block text-sm font-medium mb-1">Rubro</label>
              <input type="text" name="rubro" id="rubro_prov" placeholder="Ej: Repuestos, Neumáticos" value="${proveedor.rubro || ''}" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="telefono_prov" class="block text-sm font-medium mb-1">Teléfono</label>
              <input type="tel" name="telefono" id="telefono_prov" placeholder="Número de contacto" value="${proveedor.telefono || ''}" />
            </div>
            <div>
              <label for="email_prov" class="block text-sm font-medium mb-1">Correo Electrónico</label>
              <input type="email" name="email" id="email_prov" placeholder="contacto@proveedor.com" value="${proveedor.email || ''}" />
            </div>
          </div>
          <div id="proveedor-form-error" class="text-error text-sm mt-1"></div>
          <div class="flex gap-3 mt-4">
            <button type="submit" class="button primary w-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
              Guardar Proveedor
            </button>
            <button type="button" id="cancelar-proveedor" class="button secondary w-full">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('cancelar-proveedor').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('proveedor-form').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('proveedor-form-error');
      errorDiv.textContent = '';
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        cuit: form.cuit.value,
        telefono: form.telefono.value,
        email: form.email.value,
        rubro: form.rubro.value
      };
      let res;
      if (id) {
        res = await supabase.from('proveedores').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('proveedores').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('proveedor-form-error').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarProveedores();
      }
    };
  }

  async function eliminarProveedor(id) {
    if (!confirm('¿Eliminar proveedor?')) return;
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (!error) cargarProveedores();
  }

  cargarProveedores();
} 