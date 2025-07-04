import { supabase } from '../supabaseClient.js';

export async function renderCompras(container, usuario_id) {
  let carrito = [];
  let proveedores = [];
  let productos = [];
  let proveedorSeleccionado = null;

  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <h2 class="text-2xl font-bold text-blue-700 mb-6">Compras</h2>
      <div class="bg-white shadow rounded-xl p-6 mb-6">
        <form id="compras-form" class="flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <label class="flex-1">
              <span class="block text-sm font-semibold text-gray-700 mb-1">Proveedor</span>
              <select id="select-proveedor" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"></select>
            </label>
            <label class="flex-1">
              <span class="block text-sm font-semibold text-gray-700 mb-1">Producto</span>
              <div class="flex gap-2">
                <select id="select-producto" class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"></select>
                <button type="button" id="agregar-producto" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Agregar</button>
              </div>
            </label>
          </div>
          <div id="carrito-lista" class="mt-2"></div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-lg font-bold text-gray-700">Total: $<span id="total-compra">0.00</span></span>
            <button type="button" id="confirmar-compra" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded transition">Confirmar compra</button>
          </div>
          <div id="compra-error" class="text-red-600 text-sm text-center"></div>
          <div id="compra-ok" class="text-green-600 text-sm text-center"></div>
        </form>
      </div>
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
      div.innerHTML = '<p class="text-gray-500">Carrito vacío.</p>';
      return;
    }
    div.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead class="bg-blue-50">
            <tr>
              <th class="px-3 py-2 text-left">Producto</th>
              <th class="px-3 py-2">Cant.</th>
              <th class="px-3 py-2">Costo</th>
              <th class="px-3 py-2">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${carrito.map((item, i) => `
              <tr>
                <td class="px-3 py-2">${item.nombre}</td>
                <td class="px-3 py-2"><input type="number" min="1" value="${item.cantidad}" data-idx="${i}" class="input-cantidad w-16 px-2 py-1 border border-gray-300 rounded" /></td>
                <td class="px-3 py-2">$${item.costo_unitario.toFixed(2)}</td>
                <td class="px-3 py-2">$${(item.costo_unitario * item.cantidad).toFixed(2)}</td>
                <td class="px-3 py-2"><button data-idx="${i}" class="eliminar-item text-red-600 hover:text-red-800 font-bold text-lg">×</button></td>
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
    let query = supabase.from('compras').select('*,proveedores(nombre)').gte('created_at', desde).lte('created_at', hasta).order('created_at', { ascending: false });
    if (filtroProveedor) query = query.ilike('proveedores.nombre', `%${filtroProveedor}%`);
    const { data, error } = await query;
    if (error) {
      historialDiv.innerHTML = '<div class="text-red-600">Error al cargar historial de compras</div>';
      return;
    }
    historialDiv.innerHTML = `
      <div class="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <h3 class="text-xl font-bold text-blue-700">Historial de compras (mes actual)</h3>
        <input id="buscar-compra-proveedor" type="text" placeholder="Buscar por proveedor..." class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div id="compras-lista-historial">
        ${(data||[]).map(c => `
          <div class="bg-white shadow rounded-xl p-4 mb-2 border border-gray-100">
            <div class="flex items-center justify-between cursor-pointer" data-id="${c.id}">
              <div>
                <span class="font-bold text-blue-800">${c.proveedores?.nombre || ''}</span>
                <span class="text-gray-500 text-sm ml-2">${new Date(c.created_at).toLocaleString('es-AR')}</span>
              </div>
              <span class="font-bold text-green-700">$${c.total?.toFixed(2)}</span>
            </div>
            <div class="detalle-compra hidden mt-2" id="detalle-compra-${c.id}"></div>
          </div>
        `).join('') || '<p class="text-gray-500">No hay compras este mes.</p>'}
      </div>
    `;
    // Buscar por proveedor
    document.getElementById('buscar-compra-proveedor').oninput = (e) => cargarHistorialCompras(e.target.value);
    // Expandir detalle
    (data||[]).forEach(c => {
      const row = historialDiv.querySelector(`[data-id="${c.id}"]`);
      row.onclick = () => toggleDetalleCompra(c.id);
    });
  }

  async function toggleDetalleCompra(compraId) {
    const detalleDiv = document.getElementById(`detalle-compra-${compraId}`);
    if (!detalleDiv.classList.contains('hidden')) {
      detalleDiv.classList.add('hidden');
      detalleDiv.innerHTML = '';
      return;
    }
    // Traer detalle de compra
    const { data: detalles } = await supabase.from('compra_detalle').select('*,productos(nombre)').eq('compra_id', compraId);
    detalleDiv.innerHTML = detalles && detalles.length ? `
      <table class="w-full text-sm mt-2">
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${detalles.map(d => `<tr><td>${d.productos?.nombre || ''}</td><td>${d.cantidad}</td><td>$${d.precio_unitario?.toFixed(2)}</td><td>$${d.subtotal?.toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
    ` : '<p class="text-gray-500">Sin detalle.</p>';
    detalleDiv.classList.remove('hidden');
  }

  // Cargar historial al iniciar
  cargarHistorialCompras();
} 