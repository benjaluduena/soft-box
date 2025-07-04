import { supabase } from '../supabaseClient.js';

export async function renderReportes(container) {
  let fechaActual = new Date();
  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <h2 class="text-2xl font-bold text-blue-700 mb-6">Reportes</h2>
      <div class="flex gap-2 mb-6 items-center">
        <button id="mes-anterior" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1 rounded transition">&lt;</button>
        <span id="mes-actual" class="font-bold text-blue-800"></span>
        <button id="mes-siguiente" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1 rounded transition">&gt;</button>
      </div>
      <div id="reporte-resumen" class="space-y-6"></div>
      <div id="reporte-productos" class="space-y-6"></div>
      <div id="reporte-proveedores" class="space-y-6"></div>
    </div>
  `;
  const mesActualSpan = document.getElementById('mes-actual');
  const resumenDiv = document.getElementById('reporte-resumen');
  const productosDiv = document.getElementById('reporte-productos');
  const proveedoresDiv = document.getElementById('reporte-proveedores');

  function getNombreMes(date) {
    return date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  }

  async function cargarResumen() {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const desde = new Date(year, month, 1).toISOString().slice(0, 10);
    const hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    // Ventas
    const { data: ventas } = await supabase
      .from('ventas')
      .select('total,created_at')
      .gte('created_at', desde)
      .lte('created_at', hasta);
    let totalVentas = 0;
    if (ventas) totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    // Compras
    const { data: compras } = await supabase
      .from('compras')
      .select('total,created_at')
      .gte('created_at', desde)
      .lte('created_at', hasta);
    let totalCompras = 0;
    if (compras) totalCompras = compras.reduce((acc, c) => acc + (c.total || 0), 0);
    resumenDiv.innerHTML = `
      <div class="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <span class="text-3xl">💰</span>
          <div>
            <div class="text-lg font-bold text-blue-700">Total ventas del mes</div>
            <div class="text-2xl font-extrabold">$${totalVentas.toFixed(2)}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-3xl">📦</span>
          <div>
            <div class="text-lg font-bold text-green-700">Total compras del mes</div>
            <div class="text-2xl font-extrabold">$${totalCompras.toFixed(2)}</div>
          </div>
        </div>
      </div>
    `;
    mesActualSpan.textContent = getNombreMes(fechaActual).charAt(0).toUpperCase() + getNombreMes(fechaActual).slice(1);
  }

  async function cargarProductosMasVendidos() {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const desde = new Date(year, month, 1).toISOString().slice(0, 10);
    const hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    // Traer detalle de ventas del mes
    const { data: detalles } = await supabase
      .from('venta_detalle')
      .select('producto_id,cantidad,ventas(created_at),productos(nombre)')
      .gte('ventas.created_at', desde)
      .lte('ventas.created_at', hasta);
    // Agrupar por producto
    const productosMap = {};
    (detalles || []).forEach(d => {
      if (!productosMap[d.producto_id]) productosMap[d.producto_id] = { nombre: d.productos?.nombre || 'Sin nombre', cantidad: 0 };
      productosMap[d.producto_id].cantidad += d.cantidad;
    });
    const productos = Object.values(productosMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
    productosDiv.innerHTML = `
      <div class="bg-white rounded-xl shadow p-6">
        <div class="text-lg font-bold text-blue-700 mb-2">Productos más vendidos</div>
        ${productos.length ? `<ol class='list-decimal pl-6 space-y-1'>${productos.map(p => `<li><b>${p.nombre}</b> <span class='text-gray-600'>(vendidos: ${p.cantidad})</span></li>`).join('')}</ol>` : '<p class="text-gray-500">Sin ventas este mes.</p>'}
      </div>
    `;
  }

  async function cargarProveedoresMasUsados() {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const desde = new Date(year, month, 1).toISOString().slice(0, 10);
    const hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    // Traer compras del mes
    const { data: compras } = await supabase
      .from('compras')
      .select('proveedor_id,proveedores(nombre),id,created_at')
      .gte('created_at', desde)
      .lte('created_at', hasta);
    // Agrupar por proveedor
    const proveedoresMap = {};
    (compras || []).forEach(c => {
      if (!proveedoresMap[c.proveedor_id]) proveedoresMap[c.proveedor_id] = { nombre: c.proveedores?.nombre || 'Sin nombre', cantidad: 0 };
      proveedoresMap[c.proveedor_id].cantidad += 1;
    });
    const proveedores = Object.values(proveedoresMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
    proveedoresDiv.innerHTML = `
      <div class="bg-white rounded-xl shadow p-6">
        <div class="text-lg font-bold text-blue-700 mb-2">Proveedores más usados</div>
        ${proveedores.length ? `<ol class='list-decimal pl-6 space-y-1'>${proveedores.map(p => `<li><b>${p.nombre}</b> <span class='text-gray-600'>(compras: ${p.cantidad})</span></li>`).join('')}</ol>` : '<p class="text-gray-500">Sin compras este mes.</p>'}
      </div>
    `;
  }

  document.getElementById('mes-anterior').onclick = async () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    await cargarResumen();
    await cargarProductosMasVendidos();
    await cargarProveedoresMasUsados();
  };
  document.getElementById('mes-siguiente').onclick = async () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    await cargarResumen();
    await cargarProductosMasVendidos();
    await cargarProveedoresMasUsados();
  };

  await cargarResumen();
  await cargarProductosMasVendidos();
  await cargarProveedoresMasUsados();
} 