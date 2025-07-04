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
    <div class="max-w-4xl mx-auto py-6 px-4">
      <h2 class="text-2xl font-bold mb-6" style="color: var(--color-acento);">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z"/></svg>
        Registrar Venta
      </h2>
      <div class="list-item-card p-6 mb-8"> {/* Usando list-item-card para el formulario */}
        <form id="ventas-form" class="flex flex-col gap-5">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="select-cliente" class="block text-sm font-medium mb-1">Cliente</label>
              <select id="select-cliente" required></select>
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="metodo-pago" class="block text-sm font-medium mb-1">Método de pago</label>
              <select id="metodo-pago">
                <option value="efectivo">Efectivo</option>
                <option value="crédito">Tarjeta de Crédito</option>
                <option value="débito">Tarjeta de Débito</option>
                <option value="cheque">Cheque</option>
                {/* <option value="transferencia">Transferencia</option> */}
              </select>
            </div>
            <div id="plazo-cheque-label" style="display:none;">
              <label for="plazo-cheque" class="block text-sm font-medium mb-1">Plazo del Cheque (días)</label>
              <select id="plazo-cheque">
                <option value="30">30 días</option>
                <option value="60">60 días</option>
                <option value="90">90 días</option>
              </select>
            </div>
            <div>
              <label for="input-descuento" class="block text-sm font-medium mb-1">Descuento (%)</label>
              <input type="number" id="input-descuento" value="0" min="0" max="100" step="0.01" />
            </div>
          </div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-borde)]">
            <span class="text-xl font-bold" style="color: var(--color-texto-oscuro);">Total:
              <span id="total-venta" style="color: var(--color-acento);">$0.00</span>
            </span>
            <button type="button" id="confirmar-venta" class="button primary py-3 px-6"> {/* Botón más grande */}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              Confirmar Venta
            </button>
          </div>
          <div id="venta-error" class="text-error text-sm text-center mt-2"></div>
          <div id="venta-ok" class="text-success text-sm text-center mt-2"></div>
        </form>
      </div>
      {/* Aquí irá el Historial de Ventas */}
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
      div.innerHTML = '<p class="no-data-placeholder py-4">El carrito está vacío.</p>'; // Usar placeholder
      document.getElementById('total-venta').textContent = '0.00'; // Asegurar que total se actualice
      return;
    }
    // Usar estilos de tabla de new_styles.css
    div.innerHTML = `
      <div class="overflow-x-auto rounded-lg border border-[var(--color-borde)]">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
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
                <td class="text-right">$${item.precio_unitario.toFixed(2)}</td>
                <td class="text-right">$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
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
      total
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

    let query = supabase.from('ventas').select('*,clientes(nombre)')
      .gte('created_at', desde)
      .lte('created_at', `${hasta}T23:59:59`) // Incluir todo el día hasta
      .order('created_at', { ascending: false });

    if (filtroCliente) query = query.ilike('clientes.nombre', `%${filtroCliente}%`);
    // filtroFecha no se usa actualmente en la UI, pero se mantiene la lógica
    if (filtroFecha) query = query.gte('created_at', filtroFecha).lte('created_at', `${filtroFecha}T23:59:59`);

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
            Historial de Ventas (Mes Actual)
          </h3>
          <input id="buscar-venta-cliente" type="search" placeholder="Buscar por cliente..." class="px-3 py-2"/>
        </div>
        <div id="ventas-lista-historial" class="space-y-3">
          ${(!data || data.length === 0)
            ? '<p class="no-data-placeholder">No hay ventas registradas este mes.</p>'
            : data.map(v => `
              <div class="list-item-card">
                <div class="flex items-center justify-between cursor-pointer" data-id="${v.id}">
                  <div>
                    <div class="item-title">${v.clientes?.nombre || 'Cliente Desconocido'}</div>
                    <div class="item-subtitle text-xs">${new Date(v.created_at).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-lg" style="color: var(--color-exito);">$${v.total?.toFixed(2)}</span>
                    <div class="text-xs item-subtitle">Método: ${v.metodo_pago}</div>
                  </div>
                </div>
                <div class="detalle-venta hidden mt-3 pt-3 border-t border-[var(--color-borde)]" id="detalle-venta-${v.id}"></div>
              </div>
            `).join('')
          }
        </div>
      </div>`;

    document.getElementById('buscar-venta-cliente').oninput = (e) => cargarHistorialVentas(e.target.value, filtroFecha);

    historialDiv.querySelectorAll('.list-item-card [data-id]').forEach(header => {
      header.onclick = () => toggleDetalleVenta(header.dataset.id);
    });
  }

  async function toggleDetalleVenta(ventaId) {
    const detalleDiv = document.getElementById(`detalle-venta-${ventaId}`);
    if (!detalleDiv.classList.contains('hidden')) {
      detalleDiv.classList.add('hidden');
      detalleDiv.innerHTML = ''; // Limpiar para recargar si se vuelve a abrir
      return;
    }

    const { data: detalles, error } = await supabase
      .from('venta_detalle')
      .select('cantidad, precio_unitario, subtotal, productos(nombre)')
      .eq('venta_id', ventaId);

    if (error) {
      detalleDiv.innerHTML = `<p class="text-error">Error al cargar detalle: ${error.message}</p>`;
      detalleDiv.classList.remove('hidden');
      return;
    }

    if (detalles && detalles.length) {
      detalleDiv.innerHTML = `
        <h4 class="text-sm font-semibold mb-2" style="color: var(--color-texto-oscuro);">Detalle de la Venta:</h4>
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
      detalleDiv.innerHTML = '<p class="no-data-placeholder text-xs">No hay detalles para esta venta.</p>';
    }
    detalleDiv.classList.remove('hidden');
  }

  // Cargar historial al iniciar
  cargarHistorialVentas();
} 