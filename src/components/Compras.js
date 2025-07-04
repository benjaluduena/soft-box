import { supabase } from '../supabaseClient.js';

export async function renderCompras(container, usuario_id) {
  let carrito = [];
  let proveedores = [];
  let productos = [];
  let proveedorSeleccionado = null;

  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-6 px-4">
      <h2 class="text-2xl font-bold mb-6" style="color: var(--color-acento);">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
        Registrar Compra
      </h2>
      <div class="list-item-card p-6 mb-8">
        <form id="compras-form" class="flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="select-proveedor" class="block text-sm font-medium mb-1">Proveedor</label>
              <select id="select-proveedor" required></select>
            </div>
            <div>
              <label for="select-producto" class="block text-sm font-medium mb-1">Producto</label>
              <div class="flex gap-2">
                <select id="select-producto" class="flex-1"></select>
                <button type="button" id="agregar-producto" class="button secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <div id="carrito-lista" class="mt-2"></div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-borde)]">
            <span class="text-xl font-bold" style="color: var(--color-texto-oscuro);">Total:
              <span id="total-compra" style="color: var(--color-acento);">$0.00</span>
            </span>
            <button type="button" id="confirmar-compra" class="button primary py-3 px-6">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              Confirmar Compra
            </button>
          </div>
          <div id="compra-error" class="text-error text-sm text-center mt-2"></div>
          <div id="compra-ok" class="text-success text-sm text-center mt-2"></div>
        </form>
      </div>
      {/* Aquí irá el Historial de Compras */}
    </div>
  `;

  async function cargarProveedores() {
    const { data } = await supabase.from('proveedores').select('id,nombre').order('nombre');
    proveedores = data || [];
    const select = document.getElementById('select-proveedor');
    select.innerHTML = '<option value="">Seleccionar proveedor</option>' + proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    select.onchange = () => {
      proveedorSeleccionado = select.value;
    };
  }

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    productos = data || [];
    const select = document.getElementById('select-producto');
    select.innerHTML = '<option value="">Seleccionar producto</option>' + productos.map(p => `<option value="${p.id}">${p.nombre} ($${p.costo?.toFixed(2)})</option>`).join('');
  }

  function renderCarrito() {
    const div = document.getElementById('carrito-lista');
    if (!carrito.length) {
      div.innerHTML = '<p class="no-data-placeholder py-4">El carrito de compras está vacío.</p>';
      document.getElementById('total-compra').textContent = '0.00';
      return;
    }
    div.innerHTML = `
      <div class="overflow-x-auto rounded-lg border border-[var(--color-borde)]">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th>Cantidad</th>
              <th class="text-right">Costo Unit.</th>
              <th class="text-right">Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${carrito.map((item, i) => `
              <tr>
                <td>${item.nombre}</td>
                <td class="text-center">
                  <input type="number" min="1" value="${item.cantidad}" data-idx="${i}"
                         class="input-cantidad w-20 text-center py-1" />
                </td>
                <td class="text-right">$${item.costo_unitario.toFixed(2)}</td>
                <td class="text-right">$${(item.costo_unitario * item.cantidad).toFixed(2)}</td>
                <td class="text-center">
                  <button data-idx="${i}" class="button danger eliminar-item p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
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
    let total = carrito.reduce((acc, item) => acc + item.costo_unitario * item.cantidad, 0);
    document.getElementById('total-compra').textContent = total.toFixed(2);
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
        costo_unitario: prod.costo,
        cantidad: 1
      });
    }
    renderCarrito();
    calcularTotal();
  };

  document.getElementById('confirmar-compra').onclick = async () => {
    const errorDiv = document.getElementById('compra-error');
    const okDiv = document.getElementById('compra-ok');
    errorDiv.textContent = '';
    okDiv.textContent = '';
    if (!proveedorSeleccionado) {
      errorDiv.textContent = 'Selecciona un proveedor.';
      return;
    }
    if (!carrito.length) {
      errorDiv.textContent = 'El carrito está vacío.';
      return;
    }
    const total = calcularTotal();
    // Guardar compra
    const { data: compra, error } = await supabase.from('compras').insert([{
      proveedor_id: proveedorSeleccionado,
      usuario_id,
      total
    }]).select().single();
    if (error) {
      errorDiv.textContent = error.message;
      return;
    }
    // Guardar detalle
    for (const item of carrito) {
      await supabase.from('compra_detalle').insert({
        compra_id: compra.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.costo_unitario,
        subtotal: item.costo_unitario * item.cantidad
      });
      // Actualizar stock
      await supabase.from('productos').update({ stock: supabase.literal('stock + ' + item.cantidad) }).eq('id', item.id);
    }
    okDiv.textContent = '¡Compra registrada!';
    carrito = [];
    renderCarrito();
    calcularTotal();
  };

  await cargarProveedores();
  await cargarProductos();
  renderCarrito();
  calcularTotal();

  // Historial de compras
  const historialDiv = document.createElement('div');
  historialDiv.className = 'mt-10';
  container.appendChild(historialDiv);

  async function cargarHistorialCompras(filtroProveedor = '') {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let desde = new Date(year, month, 1).toISOString().slice(0, 10);
    let hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    let query = supabase.from('compras').select('*,proveedores(nombre)')
      .gte('created_at', desde)
      .lte('created_at', `${hasta}T23:59:59`)
      .order('created_at', { ascending: false });

    if (filtroProveedor) query = query.ilike('proveedores.nombre', `%${filtroProveedor}%`);

    const { data, error } = await query;

    if (error) {
      historialDiv.innerHTML = `<div class="text-error p-4 text-center">Error al cargar historial: ${error.message}</div>`;
      return;
    }

    historialDiv.innerHTML = `
      <div class="mt-10">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 class="text-xl font-bold" style="color: var(--color-acento);">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            Historial de Compras (Mes Actual)
          </h3>
          <input id="buscar-compra-proveedor" type="search" placeholder="Buscar por proveedor..." class="px-3 py-2"/>
        </div>
        <div id="compras-lista-historial" class="space-y-3">
          ${(!data || data.length === 0)
            ? '<p class="no-data-placeholder">No hay compras registradas este mes.</p>'
            : data.map(c => `
              <div class="list-item-card">
                <div class="flex items-center justify-between cursor-pointer" data-id="${c.id}">
                  <div>
                    <div class="item-title">${c.proveedores?.nombre || 'Proveedor Desconocido'}</div>
                    <div class="item-subtitle text-xs">${new Date(c.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-lg" style="color: var(--color-exito);">$${c.total?.toFixed(2)}</span>
                  </div>
                </div>
                <div class="detalle-compra hidden mt-3 pt-3 border-t border-[var(--color-borde)]" id="detalle-compra-${c.id}"></div>
              </div>`).join('')
          }
        </div>
      </div>`;

    document.getElementById('buscar-compra-proveedor').oninput = (e) => cargarHistorialCompras(e.target.value);

    historialDiv.querySelectorAll('.list-item-card [data-id]').forEach(header => {
      header.onclick = () => toggleDetalleCompra(header.dataset.id);
    });
  }

  async function toggleDetalleCompra(compraId) {
    const detalleDiv = document.getElementById(`detalle-compra-${compraId}`);
    if (!detalleDiv.classList.contains('hidden')) {
      detalleDiv.classList.add('hidden');
      detalleDiv.innerHTML = '';
      return;
    }

    const { data: detalles, error } = await supabase
      .from('compra_detalle')
      .select('cantidad, precio_unitario, subtotal, productos(nombre)')
      .eq('compra_id', compraId);

    if (error) {
      detalleDiv.innerHTML = `<p class="text-error">Error al cargar detalle: ${error.message}</p>`;
      detalleDiv.classList.remove('hidden');
      return;
    }

    if (detalles && detalles.length) {
      detalleDiv.innerHTML = `
        <h4 class="text-sm font-semibold mb-2" style="color: var(--color-texto-oscuro);">Detalle de la Compra:</h4>
        <div class="overflow-x-auto rounded-md border border-[var(--color-borde)]">
          <table class="w-full text-xs">
            <thead>
              <tr><th class="text-left">Producto</th><th>Cant.</th><th class="text-right">P. Unit.</th><th class="text-right">Subtotal</th></tr>
            </thead>
            <tbody>
              ${detalles.map(d => `
                <tr>
                  <td>${d.productos?.nombre || 'Producto no encontrado'}</td>
                  <td class="text-center">${d.cantidad}</td>
                  <td class="text-right">$${d.precio_unitario?.toFixed(2)}</td>
                  <td class="text-right">$${d.subtotal?.toFixed(2)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } else {
      detalleDiv.innerHTML = '<p class="no-data-placeholder text-xs">No hay detalles para esta compra.</p>';
    }
    detalleDiv.classList.remove('hidden');
  }

  // Cargar historial al iniciar
  cargarHistorialCompras();
} 