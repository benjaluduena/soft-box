import { supabase } from '../supabaseClient.js';

export async function renderVentas(container, usuario_id) {
  let carrito = [];
  let clientes = [];
  let productos = [];
  let clienteSeleccionado = null;
  let metodoPago = 'efectivo';
  let descuento = 0;
  let plazoCheque = 30;

  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <h2 class="text-2xl font-bold text-blue-700 mb-6">Ventas</h2>
      <div class="bg-white shadow rounded-xl p-6 mb-6">
        <form id="ventas-form" class="flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <label class="flex-1">
              <span class="block text-sm font-semibold text-gray-700 mb-1">Cliente</span>
              <select id="select-cliente" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"></select>
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
          <div class="flex flex-col sm:flex-row gap-4">
            <label class="flex-1">
              <span class="block text-sm font-semibold text-gray-700 mb-1">Método de pago</span>
              <select id="metodo-pago" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="efectivo">Efectivo</option>
                <option value="crédito">Crédito</option>
                <option value="débito">Débito</option>
                <option value="cheque">Cheque</option>
              </select>
            </label>
            <label class="flex-1" id="plazo-cheque-label" style="display:none;">
              <span class="block text-sm font-semibold text-gray-700 mb-1">Plazo (días)</span>
              <select id="plazo-cheque" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
              </select>
            </label>
            <label class="flex-1">
              <span class="block text-sm font-semibold text-gray-700 mb-1">Descuento (%)</span>
              <input type="number" id="input-descuento" value="0" min="0" max="100" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </label>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-lg font-bold text-gray-700">Total: $<span id="total-venta">0.00</span></span>
            <button type="button" id="confirmar-venta" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded transition">Confirmar venta</button>
          </div>
          <div id="venta-error" class="text-red-600 text-sm text-center"></div>
          <div id="venta-ok" class="text-green-600 text-sm text-center"></div>
        </form>
      </div>
    </div>
  `;

  async function cargarClientes() {
    const { data } = await supabase.from('clientes').select('id,nombre').order('nombre');
    clientes = data || [];
    const select = document.getElementById('select-cliente');
    select.innerHTML = '<option value="">Seleccionar cliente</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    select.onchange = () => {
      clienteSeleccionado = select.value;
    };
  }

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    productos = data || [];
    const select = document.getElementById('select-producto');
    select.innerHTML = '<option value="">Seleccionar producto</option>' + productos.map(p => `<option value="${p.id}">${p.nombre} ($${p.precio_calculado?.toFixed(2)})</option>`).join('');
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
              <th class="px-3 py-2">Precio</th>
              <th class="px-3 py-2">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${carrito.map((item, i) => `
              <tr>
                <td class="px-3 py-2">${item.nombre}</td>
                <td class="px-3 py-2"><input type="number" min="1" value="${item.cantidad}" data-idx="${i}" class="input-cantidad w-16 px-2 py-1 border border-gray-300 rounded" /></td>
                <td class="px-3 py-2">$${item.precio_unitario.toFixed(2)}</td>
                <td class="px-3 py-2">$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
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
    let total = carrito.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0);
    descuento = parseFloat(document.getElementById('input-descuento').value) || 0;
    total = total * (1 - descuento / 100);
    document.getElementById('total-venta').textContent = total.toFixed(2);
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
        precio_unitario: prod.precio_calculado,
        cantidad: 1
      });
    }
    renderCarrito();
    calcularTotal();
  };

  document.getElementById('input-descuento').oninput = calcularTotal;
  document.getElementById('metodo-pago').onchange = (e) => {
    metodoPago = e.target.value;
    const labelPlazo = document.getElementById('plazo-cheque-label');
    if (metodoPago === 'cheque') {
      labelPlazo.style.display = '';
    } else {
      labelPlazo.style.display = 'none';
    }
  };
  document.getElementById('plazo-cheque').onchange = (e) => { plazoCheque = parseInt(e.target.value, 10); };

  document.getElementById('confirmar-venta').onclick = async () => {
    const errorDiv = document.getElementById('venta-error');
    const okDiv = document.getElementById('venta-ok');
    errorDiv.textContent = '';
    okDiv.textContent = '';
    if (!clienteSeleccionado) {
      errorDiv.textContent = 'Selecciona un cliente.';
      return;
    }
    if (!carrito.length) {
      errorDiv.textContent = 'El carrito está vacío.';
      return;
    }
    const total = calcularTotal();
    // Guardar venta
    const { data: venta, error } = await supabase.from('ventas').insert([{
      cliente_id: clienteSeleccionado,
      usuario_id,
      metodo_pago: metodoPago,
      descuento,
      total,
      plazo_cheque: metodoPago === 'cheque' ? plazoCheque : null
    }]).select().single();
    if (error) {
      errorDiv.textContent = error.message;
      return;
    }
    // Guardar detalle
    for (const item of carrito) {
      await supabase.from('venta_detalle').insert({
        venta_id: venta.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      });
      // Actualizar stock correctamente
      const { data: prod } = await supabase.from('productos').select('stock').eq('id', item.id).single();
      const nuevoStock = (prod?.stock || 0) - item.cantidad;
      await supabase.from('productos').update({ stock: nuevoStock }).eq('id', item.id);
    }
    okDiv.textContent = '¡Venta registrada!';
    carrito = [];
    renderCarrito();
    calcularTotal();
  };

  await cargarClientes();
  await cargarProductos();
  renderCarrito();
  calcularTotal();

  // Historial de ventas
  const historialDiv = document.createElement('div');
  historialDiv.className = 'mt-10';
  container.appendChild(historialDiv);

  async function cargarHistorialVentas(filtroCliente = '', filtroFecha = '') {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let desde = new Date(year, month, 1).toISOString().slice(0, 10);
    let hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    let query = supabase.from('ventas').select('*,clientes(nombre)').gte('created_at', desde).lte('created_at', hasta).order('created_at', { ascending: false });
    if (filtroCliente) query = query.ilike('clientes.nombre', `%${filtroCliente}%`);
    if (filtroFecha) query = query.eq('created_at', filtroFecha);
    const { data, error } = await query;
    if (error) {
      historialDiv.innerHTML = '<div class="text-red-600">Error al cargar historial de ventas</div>';
      return;
    }
    historialDiv.innerHTML = `
      <div class="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <h3 class="text-xl font-bold text-blue-700">Historial de ventas (mes actual)</h3>
        <input id="buscar-venta-cliente" type="text" placeholder="Buscar por cliente..." class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div id="ventas-lista-historial">
        ${(data||[]).map(v => `
          <div class="bg-white shadow rounded-xl p-4 mb-2 border border-gray-100">
            <div class="flex items-center justify-between cursor-pointer" data-id="${v.id}">
              <div>
                <span class="font-bold text-blue-800">${v.clientes?.nombre || ''}</span>
                <span class="text-gray-500 text-sm ml-2">${new Date(v.created_at).toLocaleString('es-AR')}</span>
              </div>
              <span class="font-bold text-green-700">$${v.total?.toFixed(2)}</span>
            </div>
            <div class="detalle-venta hidden mt-2" id="detalle-venta-${v.id}"></div>
          </div>
        `).join('') || '<p class="text-gray-500">No hay ventas este mes.</p>'}
      </div>
    `;
    // Buscar por cliente
    document.getElementById('buscar-venta-cliente').oninput = (e) => cargarHistorialVentas(e.target.value);
    // Expandir detalle
    (data||[]).forEach(v => {
      const row = historialDiv.querySelector(`[data-id="${v.id}"]`);
      row.onclick = () => toggleDetalleVenta(v.id);
    });
  }

  async function toggleDetalleVenta(ventaId) {
    const detalleDiv = document.getElementById(`detalle-venta-${ventaId}`);
    if (!detalleDiv.classList.contains('hidden')) {
      detalleDiv.classList.add('hidden');
      detalleDiv.innerHTML = '';
      return;
    }
    // Traer detalle de venta
    const { data: detalles } = await supabase.from('venta_detalle').select('*,productos(nombre)').eq('venta_id', ventaId);
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
  cargarHistorialVentas();
} 