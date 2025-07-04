import { supabase } from '../supabaseClient.js';

export async function renderInventario(container) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-6 px-4"> {/* Ajustado max-w */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-acento);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>
          Inventario de Productos
        </h2>
        <div class="flex gap-3 w-full sm:w-auto">
          <input type="search" id="buscar-producto" placeholder="Buscar producto por nombre..." class="flex-1 px-3 py-2" />
          <button id="nuevo-producto" class="button primary flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Nuevo Producto
          </button>
        </div>
      </div>
      <div id="productos-lista" class="space-y-4"></div>
      <div id="producto-form-modal" class="modal-overlay hidden"></div> {/* Contenedor para el modal */}
    </div>
  `;
  const listaDiv = document.getElementById('productos-lista');
  const buscarInput = document.getElementById('buscar-producto');
  const modal = document.getElementById('producto-form-modal');

  async function cargarProductos(filtro = '') {
    let query = supabase.from('productos').select('*,proveedores(nombre)').order('nombre', { ascending: true }); // Ordenar por nombre
    if (filtro) {
      query = query.ilike('nombre', `%${filtro}%`);
    }
    const { data, error } = await query;
    if (error) {
      listaDiv.innerHTML = `<div class="text-error p-4 text-center">Error al cargar productos: ${error.message}</div>`;
      return;
    }
    if (!data || data.length === 0) {
      listaDiv.innerHTML = '<p class="no-data-placeholder">No hay productos en el inventario. ¡Añade uno nuevo!</p>';
      return;
    }
    listaDiv.innerHTML = data.map(prod => `
      <div class="list-item-card">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 class="item-title flex items-center gap-2">
              ${prod.nombre}
              ${prod.stock < 5 ? `<span class='badge badge-warning'>Stock bajo</span>` : ''}
              ${prod.stock === 0 ? `<span class='badge badge-danger'>Agotado</span>` : ''}
            </h3>
            <p class="item-subtitle">
              <span class="font-semibold">Tipo:</span> ${prod.tipo || '-'}
              ${prod.marca ? `| <span class="font-semibold">Marca:</span> ${prod.marca}` : ''}
            </p>
            <p class="item-subtitle"><span class="font-semibold">Compatibilidad:</span> ${prod.compatible_con || '-'}</p>
            <p class="item-subtitle"><span class="font-semibold">Proveedor:</span> ${prod.proveedores?.nombre || 'No asignado'}</p>
            <div class="mt-2 text-xs space-x-2">
              <span><span class="font-semibold">Stock:</span> ${prod.stock || 0}</span>
              <span><span class="font-semibold">Costo:</span> $${(prod.costo || 0).toFixed(2)}</span>
              <span><span class="font-semibold">Margen:</span> ${((prod.margen || 0) * 100).toFixed(0)}%</span>
              <span class="font-bold text-sm" style="color: var(--color-acento);"><span class="font-semibold">Precio:</span> $${(prod.precio_calculado || 0).toFixed(2)}</span>
            </div>
          </div>
          <div class="item-actions mt-3 sm:mt-0">
            <button data-id="${prod.id}" class="button editar-producto" style="background-color: var(--color-advertencia); color:white;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
              Editar
            </button>
            <button data-id="${prod.id}" class="button danger eliminar-producto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.editar-producto').forEach(btn => {
      btn.onclick = () => mostrarFormProducto(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
      btn.onclick = () => eliminarProducto(btn.dataset.id);
    });
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
    const { data: proveedoresData } = await supabase.from('proveedores').select('id,nombre').order('nombre');
    const proveedores = proveedoresData || []; // Asegurar que sea un array
    modal.classList.remove('hidden');
    modal.innerHTML = `
    <div class="modal-content-inner max-w-lg"> {/* Un poco más ancho para el formulario */}
      <button id="cerrar-modal" class="close-modal-btn">&times;</button>
      <h3 class="text-xl font-bold mb-5">${id ? 'Editar' : 'Nuevo'} Producto</h3>
      <form id="producto-form" class="flex flex-col gap-4">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium mb-1">Nombre del producto</label>
            <input type="text" name="nombre" id="nombre" value="${producto.nombre || ''}" required />
          </div>
          <div>
            <label for="tipo" class="block text-sm font-medium mb-1">Tipo</label>
            <select name="tipo" id="tipo" required>
              <option value="">Seleccionar tipo</option>
              <option value="neumático" ${producto.tipo === 'neumático' ? 'selected' : ''}>Neumático</option>
              <option value="repuesto" ${producto.tipo === 'repuesto' ? 'selected' : ''}>Repuesto</option>
              <option value="aceite" ${producto.tipo === 'aceite' ? 'selected' : ''}>Aceite</option>
              <option value="servicio" ${producto.tipo === 'servicio' ? 'selected' : ''}>Servicio</option>
              <option value="otro" ${producto.tipo === 'otro' ? 'selected' : ''}>Otro</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="marca" class="block text-sm font-medium mb-1">Marca</label>
            <input type="text" name="marca" id="marca" value="${producto.marca || ''}" />
          </div>
          <div>
            <label for="proveedor_id" class="block text-sm font-medium mb-1">Proveedor</label>
            <select name="proveedor_id" id="proveedor_id">
              <option value="">Seleccionar proveedor</option>
              ${proveedores.map(p => `<option value="${p.id}" ${producto.proveedor_id === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <label for="compatible_con" class="block text-sm font-medium mb-1">Compatible con (ej: Toyota Hilux 2019)</label>
          <input type="text" name="compatible_con" id="compatible_con" value="${producto.compatible_con || ''}" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="stock" class="block text-sm font-medium mb-1">Stock actual</label>
            <input type="number" name="stock" id="stock" value="${producto.stock || 0}" min="0" />
          </div>
          <div>
            <label for="costo" class="block text-sm font-medium mb-1">Costo ($)</label>
            <input type="number" name="costo" id="costo" step="0.01" value="${producto.costo || 0}" min="0" />
          </div>
          <div>
            <label for="margen" class="block text-sm font-medium mb-1">Margen (ej: 0.3 para 30%)</label>
            <input type="number" name="margen" id="margen" step="0.01" value="${producto.margen || 0.3}" min="0" max="2" /> {/* Max 200% */}
          </div>
        </div>

        <div id="producto-form-error" class="text-error text-sm mt-1"></div>
        <div class="flex gap-3 mt-4">
          <button type="submit" class="button primary w-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
            Guardar Producto
          </button>
          <button type="button" id="cancelar-producto" class="button secondary w-full">Cancelar</button>
        </div>
      </form>
    </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('cancelar-producto').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('producto-form').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('producto-form-error');
      errorDiv.textContent = '';
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        tipo: form.tipo.value,
        marca: form.marca.value,
        compatible_con: form.compatible_con.value,
        proveedor_id: form.proveedor_id.value || null,
        stock: parseInt(form.stock.value, 10),
        costo: parseFloat(form.costo.value),
        margen: parseFloat(form.margen.value)
      };
      let res;
      if (id) {
        res = await supabase.from('productos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('productos').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('producto-form-error').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarProductos(buscarInput.value);
      }
    };
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Eliminar producto?')) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) cargarProductos(buscarInput.value);
  }

  cargarProductos();
} 