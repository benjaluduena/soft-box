import { supabase } from '../supabaseClient.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-8 px-4">
      <h2 class="text-3xl md:text-4xl font-bold mb-10 text-center tracking-tight flex items-center justify-center gap-3" style="color: var(--color-texto-oscuro);">
        {/* SVG de Dashboard Icono */}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 md:h-10 md:w-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8h5z"/>
        </svg>
        <span>Panel Principal</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">

        {/* Card Ventas del Mes */}
        <div class="list-item-card p-6 flex flex-col items-center text-center"> {/* Usando list-item-card y ajustando padding */}
          {/* SVG de Dinero */}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3" style="color: var(--color-acento);" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-2-9.5c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v3.5c0 .83-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5v-3.5zm1.5-2.5c-.55 0-1 .45-1 1s.45 1 1 1s1-.45 1-1s-.45-1-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-1" style="color: var(--color-texto-oscuro);">Total ventas del mes</h3>
          <div id="ventas-mes" class="text-3xl font-extrabold" style="color: var(--color-acento);">$0.00</div>
        </div>

        {/* Card Stock Bajo */}
        <div class="list-item-card p-6">
          <div class="flex items-center justify-center mb-3">
            {/* SVG de Alerta */}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" style="color: var(--color-advertencia);" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <h3 class="text-lg font-semibold ml-2" style="color: var(--color-texto-oscuro);">Stock bajo</h3>
          </div>
          <div id="stock-bajo" class="text-sm"></div>
        </div>

        {/* Card Próximos Turnos */}
        <div class="list-item-card p-6">
          <div class="flex items-center justify-center mb-3">
            {/* SVG de Calendario */}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" style="color: var(--color-secundario);" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
            <h3 class="text-lg font-semibold ml-2" style="color: var(--color-texto-oscuro);">Próximos turnos (3 días)</h3>
          </div>
          <div id="proximos-turnos" class="text-sm"></div>
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
  const { data: productos } = await supabase.from('productos').select('nombre,stock').lt('stock', 5).order('stock', { ascending: true });
  const stockBajoDiv = document.getElementById('stock-bajo');
  if (productos && productos.length) {
    stockBajoDiv.innerHTML = `<ul class='space-y-2'>${productos.map(p => `
      <li class='flex items-center justify-between p-2 rounded-md' style="background-color: var(--color-primario);">
        <span class='font-semibold' style="color: var(--color-texto-oscuro);">${p.nombre}</span>
        <span class='badge badge-warning'>Stock: ${p.stock}</span>
      </li>`).join('')}</ul>`;
  } else {
    stockBajoDiv.innerHTML = '<p class="no-data-placeholder">Sin alertas de stock.</p>';
  }

  // Próximos turnos (3 días)
  const desde = hoy.toISOString().slice(0,10);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3).toISOString().slice(0,10);
  const { data: turnos } = await supabase
    .from('turnos')
    .select('fecha,clientes(nombre),vehiculos(marca,modelo,patente),motivo,estado')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: true });
  const proximosTurnosDiv = document.getElementById('proximos-turnos');
  if (turnos && turnos.length) {
    proximosTurnosDiv.innerHTML = `<ul class='space-y-2'>${turnos.map(t => {
      let estadoClass = 'badge-neutral';
      if (t.estado === 'pendiente') estadoClass = 'badge-warning';
      else if (t.estado === 'confirmado') estadoClass = 'badge-info';
      else if (t.estado === 'realizado') estadoClass = 'badge-success';
      else if (t.estado === 'cancelado') estadoClass = 'badge-danger';
      return `
      <li class='p-3 rounded-md' style="background-color: var(--color-superficie); border-left: 4px solid var(--color-secundario);">
        <div class="flex justify-between items-center mb-1">
          <span class='font-semibold text-sm' style="color: var(--color-texto-oscuro);">${new Date(t.fecha).toLocaleString('es-AR', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
          <span class='badge ${estadoClass}'>${t.estado}</span>
        </div>
        <div class='text-xs' style="color: var(--color-texto-oscuro);">${t.clientes?.nombre || 'Cliente no especificado'}</div>
        <div class='text-xs' style="color: #555;">${t.vehiculos ? (t.vehiculos.marca || '') + ' ' + (t.vehiculos.modelo || '') + ' (' + (t.vehiculos.patente || '') + ')' : 'Vehículo no especificado'}</div>
        <div class='text-xs mt-1' style="color: #777;">${t.motivo || 'Sin motivo específico'}</div>
      </li>`;
    }).join('')}</ul>`;
  } else {
    proximosTurnosDiv.innerHTML = '<p class="no-data-placeholder">No hay turnos próximos.</p>';
  }
} 