import { supabase } from '../supabaseClient.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-8 px-4">
      <h2 class="text-4xl font-extrabold mb-10 text-blue-800 text-center tracking-tight flex items-center justify-center gap-2">
        <span class="inline-block">Dashboard</span>
        <span class="inline-block text-blue-400">🚗</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div class="bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg rounded-2xl p-8 flex flex-col items-center border border-blue-200">
          <div class="text-5xl mb-2 text-blue-500">💰</div>
          <h3 class="text-lg font-semibold text-gray-700 mb-1">Total ventas del mes</h3>
          <div id="ventas-mes" class="text-4xl font-extrabold text-blue-700">$0.00</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-50 to-white shadow-lg rounded-2xl p-8 border border-yellow-200">
          <div class="text-5xl mb-2 text-yellow-500">⚠️</div>
          <h3 class="text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">Stock bajo <span class="inline-block bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">Alerta</span></h3>
          <div id="stock-bajo"></div>
        </div>
        <div class="bg-gradient-to-br from-green-50 to-white shadow-lg rounded-2xl p-8 border border-green-200">
          <div class="text-5xl mb-2 text-green-500">📅</div>
          <h3 class="text-lg font-semibold text-gray-700 mb-1">Próximos turnos (3 días)</h3>
          <div id="proximos-turnos"></div>
        </div>
      </div>
    </div>
  `;

  // Total ventas del mes
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const { data: ventas } = await supabase
    .from('ventas')
    .select('total,created_at')
    .gte('created_at', inicioMes.toISOString().slice(0,10))
    .lte('created_at', finMes.toISOString().slice(0,10));
  let totalMes = 0;
  if (ventas) totalMes = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
  document.getElementById('ventas-mes').textContent = `$${totalMes.toFixed(2)}`;

  // Productos con stock bajo
  const { data: productos } = await supabase.from('productos').select('nombre,stock').lt('stock', 5);
  document.getElementById('stock-bajo').innerHTML =
    (productos && productos.length)
      ? `<ul class='list-disc pl-5 space-y-1'>${productos.map(p => `<li class='flex items-center gap-2'><span class='inline-block w-2 h-2 rounded-full bg-yellow-400'></span><span class='font-semibold text-yellow-800'>${p.nombre}</span> <span class='text-gray-500'>(stock: ${p.stock})</span></li>`).join('')}</ul>`
      : '<p class="text-gray-500">Sin alertas de stock.</p>';

  // Próximos turnos (3 días)
  const desde = hoy.toISOString().slice(0,10);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3).toISOString().slice(0,10);
  const { data: turnos } = await supabase
    .from('turnos')
    .select('fecha,clientes(nombre),vehiculos(marca,modelo,patente),motivo,estado')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: true });
  document.getElementById('proximos-turnos').innerHTML =
    (turnos && turnos.length)
      ? `<ul class='space-y-2'>${turnos.map(t => `<li class='flex items-center gap-2 p-2 rounded-lg ${t.estado==='pendiente' ? 'bg-yellow-100' : t.estado==='confirmado' ? 'bg-blue-100' : t.estado==='realizado' ? 'bg-green-100' : 'bg-red-100'}'>
        <span class='inline-block w-2 h-2 rounded-full ${t.estado==='pendiente' ? 'bg-yellow-400' : t.estado==='confirmado' ? 'bg-blue-500' : t.estado==='realizado' ? 'bg-green-500' : 'bg-red-500'}'></span>
        <span class='font-semibold'>${new Date(t.fecha).toLocaleString('es-AR', { weekday:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
        <span class='text-gray-700'>${t.clientes?.nombre || ''}</span>
        <span class='text-gray-500'>(${t.vehiculos?.marca || ''} ${t.vehiculos?.modelo || ''})</span>
        <span>${t.motivo || '-'}</span>
        <span class='text-xs font-bold ml-auto ${t.estado==='pendiente' ? 'text-yellow-700' : t.estado==='confirmado' ? 'text-blue-700' : t.estado==='realizado' ? 'text-green-700' : 'text-red-700'}'>[${t.estado}]</span>
      </li>`).join('')}</ul>`
      : '<p class="text-gray-500">No hay turnos próximos.</p>';
} 