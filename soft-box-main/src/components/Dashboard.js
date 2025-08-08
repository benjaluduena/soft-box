import { supabase } from '../supabaseClient.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard & Reportes
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Resumen general y análisis de tu taller mecánico</p>
        </div>

        <!-- Main Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Ventas Card -->
          <div class="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-800" id="ventas-mes">$0.00</div>
                  <div class="text-sm text-gray-500">Este mes</div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-1">Total Ventas</h3>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" id="ventas-progress" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <!-- Compras Card -->
          <div class="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-800" id="compras-mes">$0.00</div>
                  <div class="text-sm text-gray-500">Este mes</div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-1">Total Compras</h3>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" id="compras-progress" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <!-- Ganancia Card -->
          <div class="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-800" id="ganancia-mes">$0.00</div>
                  <div class="text-sm text-gray-500" id="margen-ganancia">0% margen</div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-1">Ganancia Neta</h3>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" id="ganancia-progress" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <!-- Turnos Card -->
          <div class="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-800" id="turnos-count">0</div>
                  <div class="text-sm text-gray-500">Próximos</div>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-1">Próximos Turnos</h3>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-500" id="turnos-progress" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Stock Bajo Card -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p class="text-2xl font-bold text-amber-600" id="stock-bajo-count">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Productos Vendidos Card -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Productos Vendidos</p>
                <p class="text-2xl font-bold text-orange-600" id="productos-vendidos">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Proveedores Activos Card -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Proveedores</p>
                <p class="text-2xl font-bold text-emerald-600" id="proveedores-activos">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Clientes Activos Card -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Clientes</p>
                <p class="text-2xl font-bold text-indigo-600" id="clientes-activos">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <!-- Productos Más Vendidos -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Productos Más Vendidos</h3>
            </div>
            <div id="productos-mas-vendidos" class="space-y-4"></div>
          </div>

          <!-- Proveedores Más Usados -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Proveedores Más Usados</h3>
            </div>
            <div id="proveedores-mas-usados" class="space-y-4"></div>
          </div>
        </div>

        <!-- Content Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Stock Bajo Details -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-800">Productos con Stock Bajo</h3>
              </div>
              <button id="refresh-stock" class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
            <div id="stock-bajo" class="space-y-3"></div>
          </div>

          <!-- Próximos Turnos -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-800">Próximos Turnos (3 días)</h3>
              </div>
              <button id="refresh-turnos" class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
            <div id="proximos-turnos" class="space-y-3"></div>
          </div>
        </div>

        <!-- Acciones Diarias -->
        <div class="mt-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800">Acciones Diarias</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button id="daily-nueva-venta" class="daily-action-btn bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span class="font-semibold">Nueva Venta</span>
              </button>
              
              <button id="daily-nuevo-turno" class="daily-action-btn bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="font-semibold">Nuevo Turno</span>
              </button>
              
              <button id="daily-nuevo-cliente" class="daily-action-btn bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                <span class="font-semibold">Nuevo Cliente</span>
              </button>
              
              <button id="daily-reporte" class="daily-action-btn bg-gradient-to-br from-gray-600 to-gray-800 text-white">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span class="font-semibold">Reporte Diario</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  await cargarEstadisticasPrincipales();
  await cargarEstadisticasSecundarias();
  await cargarAnalytics();
  await cargarStockBajo();
  await cargarProximosTurnos();
  
  // Configurar eventos para acciones diarias
  setupDailyActions();
}

async function cargarEstadisticasPrincipales() {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  // Ventas del mes
  const { data: ventas } = await supabase
    .from('ventas')
    .select('total,created_at')
    .gte('created_at', inicioMes.toISOString().slice(0,10))
    .lte('created_at', finMes.toISOString().slice(0,10));
  
  let totalVentas = 0;
  if (ventas) totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
  
  // Compras del mes
  const { data: compras } = await supabase
    .from('compras')
    .select('total,created_at')
    .gte('created_at', inicioMes.toISOString().slice(0,10))
    .lte('created_at', finMes.toISOString().slice(0,10));
  
  let totalCompras = 0;
  if (compras) totalCompras = compras.reduce((acc, c) => acc + (c.total || 0), 0);
  
  // Calcular ganancia neta
  const gananciaNeta = totalVentas - totalCompras;
  const margenGanancia = totalVentas > 0 ? ((gananciaNeta / totalVentas) * 100) : 0;
  
  // Actualizar elementos
  document.getElementById('ventas-mes').textContent = `$${totalVentas.toFixed(2)}`;
  document.getElementById('compras-mes').textContent = `$${totalCompras.toFixed(2)}`;
  document.getElementById('ganancia-mes').textContent = `$${gananciaNeta.toFixed(2)}`;
  document.getElementById('margen-ganancia').textContent = `${margenGanancia.toFixed(1)}% margen`;
  
  // Actualizar barras de progreso
  const maxValor = Math.max(totalVentas, totalCompras, gananciaNeta);
  if (maxValor > 0) {
    document.getElementById('ventas-progress').style.width = `${(totalVentas / maxValor) * 100}%`;
    document.getElementById('compras-progress').style.width = `${(totalCompras / maxValor) * 100}%`;
    document.getElementById('ganancia-progress').style.width = `${(gananciaNeta / maxValor) * 100}%`;
  }
}

async function cargarEstadisticasSecundarias() {
  // Stock bajo
  const { data: productosStockBajo } = await supabase
    .from('productos')
    .select('id')
    .lt('stock', 5);
  
  // Productos vendidos este mes
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
  const { data: detallesVentas } = await supabase
    .from('venta_detalle')
    .select('producto_id,cantidad,ventas(created_at),productos(nombre)')
    .gte('ventas.created_at', inicioMes)
    .lte('ventas.created_at', finMes);
  
  // Proveedores activos
  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('id');
  
  // Clientes activos
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id');
  
  // Próximos turnos
  const hoy = new Date().toISOString().slice(0, 10);
  const proximos = new Date();
  proximos.setDate(proximos.getDate() + 7);
  const { data: turnos } = await supabase
    .from('turnos')
    .select('id')
    .gte('fecha', hoy)
    .lte('fecha', proximos.toISOString().slice(0, 10));
  
  // Actualizar contadores
  document.getElementById('stock-bajo-count').textContent = productosStockBajo?.length || 0;
  document.getElementById('productos-vendidos').textContent = detallesVentas?.length || 0;
  document.getElementById('proveedores-activos').textContent = proveedores?.length || 0;
  document.getElementById('clientes-activos').textContent = clientes?.length || 0;
  document.getElementById('turnos-count').textContent = turnos?.length || 0;
  
  // Actualizar barra de progreso de turnos
  const maxTurnos = 20; // Valor máximo para la barra
  document.getElementById('turnos-progress').style.width = `${Math.min((turnos?.length || 0) / maxTurnos * 100, 100)}%`;
}

async function cargarAnalytics() {
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const finMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
  
  // Productos más vendidos
  const { data: detalles } = await supabase
    .from('venta_detalle')
    .select('producto_id,cantidad,ventas(created_at),productos(nombre)')
    .gte('ventas.created_at', inicioMes)
    .lte('ventas.created_at', finMes);
  
  const productosMap = {};
  (detalles || []).forEach(d => {
    if (!productosMap[d.producto_id]) {
      productosMap[d.producto_id] = { 
        nombre: d.productos?.nombre || 'Sin nombre', 
        cantidad: 0 
      };
    }
    productosMap[d.producto_id].cantidad += d.cantidad;
  });
  
  const productos = Object.values(productosMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  const maxCantidad = productos[0]?.cantidad || 1;
  
  const productosDiv = document.getElementById('productos-mas-vendidos');
  if (productos.length === 0) {
    productosDiv.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Sin ventas este mes</p>
      </div>
    `;
  } else {
    productosDiv.innerHTML = productos.map((p, index) => {
      const porcentaje = (p.cantidad / maxCantidad) * 100;
      const colors = [
        'from-orange-500 to-red-500',
        'from-red-500 to-pink-500', 
        'from-pink-500 to-purple-500',
        'from-purple-500 to-indigo-500',
        'from-indigo-500 to-blue-500'
      ];
      
      return `
        <div class="flex items-center gap-4 p-3 bg-white/50 rounded-lg">
          <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r ${colors[index]} rounded-full flex items-center justify-center text-white font-bold text-sm">
            ${index + 1}
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <h4 class="font-semibold text-gray-800">${p.nombre}</h4>
              <span class="text-sm font-medium text-gray-600">${p.cantidad} unidades</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${colors[index]}" style="width: ${porcentaje}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Proveedores más usados
  const { data: compras } = await supabase
    .from('compras')
    .select('proveedor_id,proveedores(nombre),id,created_at')
    .gte('created_at', inicioMes)
    .lte('created_at', finMes);
  
  const proveedoresMap = {};
  (compras || []).forEach(c => {
    if (!proveedoresMap[c.proveedor_id]) {
      proveedoresMap[c.proveedor_id] = { 
        nombre: c.proveedores?.nombre || 'Sin nombre', 
        cantidad: 0 
      };
    }
    proveedoresMap[c.proveedor_id].cantidad += 1;
  });
  
  const proveedores = Object.values(proveedoresMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  const maxCompras = proveedores[0]?.cantidad || 1;
  
  const proveedoresDiv = document.getElementById('proveedores-mas-usados');
  if (proveedores.length === 0) {
    proveedoresDiv.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Sin compras este mes</p>
      </div>
    `;
  } else {
    proveedoresDiv.innerHTML = proveedores.map((p, index) => {
      const porcentaje = (p.cantidad / maxCompras) * 100;
      const colors = [
        'from-emerald-500 to-teal-500',
        'from-teal-500 to-cyan-500',
        'from-cyan-500 to-blue-500',
        'from-blue-500 to-indigo-500',
        'from-indigo-500 to-purple-500'
      ];
      
      return `
        <div class="flex items-center gap-4 p-3 bg-white/50 rounded-lg">
          <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r ${colors[index]} rounded-full flex items-center justify-center text-white font-bold text-sm">
            ${index + 1}
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <h4 class="font-semibold text-gray-800">${p.nombre}</h4>
              <span class="text-sm font-medium text-gray-600">${p.cantidad} compras</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${colors[index]}" style="width: ${porcentaje}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

async function cargarStockBajo() {
  const { data: productos } = await supabase.from('productos').select('nombre,stock').lt('stock', 5);
  const stockBajoContainer = document.getElementById('stock-bajo');
  
  if (productos && productos.length > 0) {
    stockBajoContainer.innerHTML = productos.map(p => `
      <div class="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span class="font-medium text-gray-800">${p.nombre}</span>
        </div>
        <span class="px-2 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
          Stock: ${p.stock}
        </span>
      </div>
    `).join('');
  } else {
    stockBajoContainer.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Sin alertas de stock</p>
        <p class="text-gray-400 text-sm">Todos los productos tienen stock suficiente</p>
      </div>
    `;
  }
}

async function cargarProximosTurnos() {
  const hoy = new Date();
  const desde = hoy.toISOString().slice(0,10);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3).toISOString().slice(0,10);
  
  const { data: turnos } = await supabase
    .from('turnos')
    .select('fecha,clientes(nombre),vehiculos(marca,modelo,patente),motivo,estado')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: true });
  
  const turnosContainer = document.getElementById('proximos-turnos');
  
  if (turnos && turnos.length > 0) {
    turnosContainer.innerHTML = turnos.map(t => {
      const statusColors = {
        'pendiente': 'bg-yellow-100 border-yellow-300 text-yellow-800',
        'confirmado': 'bg-blue-100 border-blue-300 text-blue-800',
        'realizado': 'bg-green-100 border-green-300 text-green-800',
        'cancelado': 'bg-red-100 border-red-300 text-red-800'
      };
      const statusColor = statusColors[t.estado] || 'bg-gray-100 border-gray-300 text-gray-800';
      
      return `
        <div class="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 ${t.estado==='pendiente' ? 'bg-yellow-500' : t.estado==='confirmado' ? 'bg-blue-500' : t.estado==='realizado' ? 'bg-green-500' : 'bg-red-500'} rounded-full"></div>
              <span class="font-semibold text-gray-800">${new Date(t.fecha).toLocaleString('es-AR', { weekday:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
            </div>
            <span class="px-2 py-1 text-xs font-bold rounded-full ${statusColor}">${t.estado}</span>
          </div>
          <div class="text-sm text-gray-600 mb-1">
            <span class="font-medium">${t.clientes?.nombre || 'Sin cliente'}</span>
          </div>
          <div class="text-sm text-gray-500 mb-2">
            ${t.vehiculos?.marca || ''} ${t.vehiculos?.modelo || ''} ${t.vehiculos?.patente ? `(${t.vehiculos.patente})` : ''}
          </div>
          <div class="text-sm text-gray-700">
            ${t.motivo || 'Sin motivo especificado'}
          </div>
        </div>
      `;
    }).join('');
  } else {
    turnosContainer.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p class="text-gray-500 font-medium">No hay turnos próximos</p>
        <p class="text-gray-400 text-sm">Los próximos 3 días están libres</p>
      </div>
    `;
  }
}

/**
 * Configura los eventos para las acciones diarias del dashboard
 */
function setupDailyActions() {
  // Botones de refresh
  const refreshStock = document.getElementById('refresh-stock');
  const refreshTurnos = document.getElementById('refresh-turnos');
  
  if (refreshStock) {
    refreshStock.addEventListener('click', async () => {
      refreshStock.classList.add('animate-spin');
      await cargarStockBajo();
      setTimeout(() => refreshStock.classList.remove('animate-spin'), 1000);
    });
  }
  
  if (refreshTurnos) {
    refreshTurnos.addEventListener('click', async () => {
      refreshTurnos.classList.add('animate-spin');
      await cargarProximosTurnos();
      setTimeout(() => refreshTurnos.classList.remove('animate-spin'), 1000);
    });
  }

  // Acciones diarias
  const dailyActions = {
    'daily-nueva-venta': () => navigateToSection('#ventas'),
    'daily-nuevo-turno': () => navigateToSection('#turnos'),
    'daily-nuevo-cliente': () => navigateToSection('#clientes'),
    'daily-reporte': () => generateDailyReport()
  };

  Object.entries(dailyActions).forEach(([id, action]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', action);
    }
  });
}

/**
 * Navega a una sección específica
 */
function navigateToSection(hash) {
  const link = document.querySelector(`a[href="${hash}"]`);
  if (link) {
    link.click();
  }
}

/**
 * Genera un reporte diario rápido
 */
async function generateDailyReport() {
  const hoy = new Date().toISOString().slice(0, 10);
  
  try {
    const [ventas, compras, turnos] = await Promise.all([
      supabase.from('ventas').select('total').gte('created_at', hoy),
      supabase.from('compras').select('total').gte('created_at', hoy),
      supabase.from('turnos').select('estado').eq('fecha', hoy)
    ]);

    const totalVentas = ventas.data?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
    const totalCompras = compras.data?.reduce((sum, c) => sum + (c.total || 0), 0) || 0;
    const turnosCompletados = turnos.data?.filter(t => t.estado === 'realizado').length || 0;
    const turnosPendientes = turnos.data?.filter(t => t.estado === 'pendiente').length || 0;

    const reporte = `
📊 REPORTE DIARIO - ${new Date().toLocaleDateString('es-AR')}

💰 Ventas: $${totalVentas.toFixed(2)}
🛒 Compras: $${totalCompras.toFixed(2)}
💵 Ganancia: $${(totalVentas - totalCompras).toFixed(2)}

📅 Turnos:
  ✅ Completados: ${turnosCompletados}
  ⏳ Pendientes: ${turnosPendientes}
    `;

    // Mostrar modal con reporte
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Reporte Diario</h3>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-line">
          ${reporte}
        </div>
        <div class="mt-4 flex gap-2">
          <button class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors" onclick="this.closest('.fixed').remove()">
            Cerrar
          </button>
          <button class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" onclick="navigator.clipboard.writeText(\`${reporte}\`); this.textContent='Copiado!'; setTimeout(() => this.textContent='Copiar', 2000)">
            Copiar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    alert('Error al generar el reporte diario');
  }
} 