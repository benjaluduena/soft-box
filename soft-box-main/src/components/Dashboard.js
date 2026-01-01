import { supabase } from '../supabaseClient.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard Soft-Box
                </h1>
                <p class="text-gray-600 text-lg">Métricas clave de tu taller mecánico</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button id="period-dia" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Día</button>
              <button id="period-semana" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">Semana</button>
              <button id="period-mes" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">Mes</button>
            </div>
          </div>
        </div>

        <!-- Main KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          
          <!-- Ventas del Período -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800" id="ventas-total">$0</div>
                <div class="text-sm text-gray-500" id="ventas-cantidad">0 transacciones</div>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Ventas del Período</h3>
            <div class="flex items-center gap-2">
              <span class="text-sm" id="ventas-comparacion">+0%</span>
              <span class="text-xs text-gray-500">vs período anterior</span>
            </div>
          </div>

          <!-- Ticket Promedio -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800" id="ticket-promedio">$0</div>
                <div class="text-sm text-gray-500">por venta</div>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Ticket Promedio</h3>
            <div class="flex items-center gap-2">
              <span class="text-sm" id="ticket-comparacion">+0%</span>
              <span class="text-xs text-gray-500">vs período anterior</span>
            </div>
          </div>

          <!-- Margen de Ganancia -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800" id="margen-promedio">0%</div>
                <div class="text-sm text-gray-500">ganancia</div>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Margen Promedio</h3>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" id="margen-progress" style="width: 0%"></div>
            </div>
          </div>

          <!-- Turnos del Día -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800" id="turnos-total">0</div>
                <div class="text-sm text-gray-500">turnos hoy</div>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Turnos</h3>
            <div class="flex gap-1 text-xs">
              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">P: <span id="turnos-pendientes">0</span></span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">C: <span id="turnos-confirmados">0</span></span>
              <span class="px-2 py-1 bg-green-100 text-green-800 rounded">R: <span id="turnos-realizados">0</span></span>
            </div>
          </div>

          <!-- Stock Crítico Alert -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-800" id="stock-critico-count">0</div>
                <div class="text-sm text-gray-500">productos</div>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Stock Crítico</h3>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse" id="stock-alert-indicator"></div>
              <span class="text-xs text-gray-500">< 5 unidades</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          
          <!-- Ventas Chart -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Ventas por Período</h3>
              <div class="flex gap-1">
                <button id="chart-ventas-monto" class="px-3 py-1 bg-blue-500 text-white text-xs rounded">Monto</button>
                <button id="chart-ventas-cantidad" class="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">Cantidad</button>
              </div>
            </div>
            <div id="chart-ventas" class="h-64"></div>
          </div>

          <!-- Top Productos Chart (by Quantity) -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Top 10 Productos</h3>
              <div class="flex gap-1">
                <button id="chart-productos-cantidad" class="px-3 py-1 bg-green-500 text-white text-xs rounded">Cantidad</button>
                <button id="chart-productos-monto" class="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded">Monto</button>
              </div>
            </div>
            <div id="chart-productos" class="h-64"></div>
          </div>

          <!-- Margen de Ganancia Trend -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Tendencia Margen de Ganancia</h3>
            <div id="chart-margen-trend" class="h-64"></div>
          </div>

          <!-- Métodos de Pago Chart -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Métodos de Pago</h3>
            <div id="chart-metodos-pago" class="h-64"></div>
          </div>

          <!-- Clientes Chart -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Clientes Nuevos vs Recurrentes</h3>
            <div id="chart-clientes" class="h-64"></div>
          </div>

          <!-- Turnos Calendar View -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Vista Calendario Turnos</h3>
            <div id="calendar-turnos" class="h-64"></div>
          </div>
        </div>

        <!-- Critical Alerts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Stock Crítico -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-red-100 rounded-lg">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-800">Stock Crítico</h3>
              </div>
              <div class="flex gap-2 text-xs">
                <span class="px-2 py-1 bg-red-100 text-red-800 rounded">Crítico (≤1)</span>
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Bajo (≤3)</span>
                <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded">Alerta (≤5)</span>
              </div>
            </div>
            <div id="stock-critico-list" class="space-y-2 max-h-72 overflow-y-auto">
              <div class="text-center text-gray-500 py-8">Cargando productos...</div>
            </div>
          </div>

          <!-- Productos Sin Movimiento -->
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-orange-100 rounded-lg">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-800">Productos Sin Movimiento</h3>
              </div>
              <div class="text-xs text-gray-500">
                +30 días sin ventas
              </div>
            </div>
            <div id="productos-sin-movimiento-list" class="space-y-2 max-h-72 overflow-y-auto">
              <div class="text-center text-gray-500 py-8">Cargando productos...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Inicializar funcionalidad
  setupPeriodFilters();
  setupChartToggleButtons();
  await loadDashboardData();
  await loadHighchartsAndCharts();
}

function setupPeriodFilters() {
  const periodButtons = ['dia', 'semana', 'mes'];
  
  periodButtons.forEach(period => {
    const button = document.getElementById(`period-${period}`);
    if (button) {
      button.addEventListener('click', () => {
        // Reset all buttons
        periodButtons.forEach(p => {
          const btn = document.getElementById(`period-${p}`);
          if (btn) {
            btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors';
          }
        });
        
        // Activate current button
        button.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors';
        
        // Reload data for selected period
        loadDashboardData(period);
        loadHighchartsAndCharts(period);
      });
    }
  });
}

function setupChartToggleButtons() {
  // Ventas chart toggle
  const ventasMontoBtn = document.getElementById('chart-ventas-monto');
  const ventasCantidadBtn = document.getElementById('chart-ventas-cantidad');
  
  if (ventasMontoBtn && ventasCantidadBtn) {
    ventasMontoBtn.addEventListener('click', () => {
      ventasMontoBtn.className = 'px-3 py-1 bg-blue-500 text-white text-xs rounded';
      ventasCantidadBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded';
      createVentasChart('monto');
    });
    
    ventasCantidadBtn.addEventListener('click', () => {
      ventasCantidadBtn.className = 'px-3 py-1 bg-blue-500 text-white text-xs rounded';
      ventasMontoBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded';
      createVentasChart('cantidad');
    });
  }
  
  // Productos chart toggle
  const productosCantidadBtn = document.getElementById('chart-productos-cantidad');
  const productosMontoBtn = document.getElementById('chart-productos-monto');
  
  if (productosCantidadBtn && productosMontoBtn) {
    productosCantidadBtn.addEventListener('click', () => {
      productosCantidadBtn.className = 'px-3 py-1 bg-green-500 text-white text-xs rounded';
      productosMontoBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded';
      createProductosChart('cantidad');
    });
    
    productosMontoBtn.addEventListener('click', () => {
      productosMontoBtn.className = 'px-3 py-1 bg-green-500 text-white text-xs rounded';
      productosCantidadBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded';
      createProductosChart('monto');
    });
  }
}

async function loadDashboardData(period = 'dia') {
  try {
    const dateRange = getDateRange(period);
    
    // Load all metrics in parallel
    const [
      ventasData,
      ticketData,
      margenData,
      turnosData,
      stockCritico,
      productosSinMovimiento
    ] = await Promise.all([
      loadVentasData(dateRange),
      loadTicketPromedio(dateRange),
      loadMargenGanancia(dateRange),
      loadTurnosData(dateRange),
      loadStockCritico(),
      loadProductosSinMovimiento()
    ]);

    // Update UI with loaded data
    updateVentasUI(ventasData);
    updateTicketUI(ticketData);
    updateMargenUI(margenData);
    updateTurnosUI(turnosData);
    updateStockCriticoUI(stockCritico);
    updateStockCriticoCount(stockCritico.length);
    updateProductosSinMovimientoUI(productosSinMovimiento);

  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'dia':
      start.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      start.setDate(now.getDate() - 7);
      break;
    case 'mes':
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }
  
  return { start, end: now };
}

async function loadVentasData(dateRange) {
  try {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('total, created_at')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    if (error) throw error;

    const total = ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    const cantidad = ventas.length;

    // Calculate comparison with previous period
    const previousDateRange = getPreviousDateRange(dateRange);
    const { data: ventasPrevias } = await supabase
      .from('ventas')
      .select('total')
      .gte('created_at', previousDateRange.start.toISOString())
      .lte('created_at', previousDateRange.end.toISOString());

    const totalPrevio = ventasPrevias?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
    const comparacion = totalPrevio ? ((total - totalPrevio) / totalPrevio * 100).toFixed(1) : 0;

    return { total, cantidad, comparacion };
  } catch (error) {
    console.error('Error loading ventas data:', error);
    return { total: 0, cantidad: 0, comparacion: 0 };
  }
}

async function loadTicketPromedio(dateRange) {
  try {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('total')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    if (error) throw error;

    const total = ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    const promedio = ventas.length ? total / ventas.length : 0;

    // Calculate comparison
    const previousDateRange = getPreviousDateRange(dateRange);
    const { data: ventasPrevias } = await supabase
      .from('ventas')
      .select('total')
      .gte('created_at', previousDateRange.start.toISOString())
      .lte('created_at', previousDateRange.end.toISOString());

    const totalPrevio = ventasPrevias?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
    const promedioPrevio = ventasPrevias?.length ? totalPrevio / ventasPrevias.length : 0;
    const comparacion = promedioPrevio ? ((promedio - promedioPrevio) / promedioPrevio * 100).toFixed(1) : 0;

    return { promedio, comparacion };
  } catch (error) {
    console.error('Error loading ticket promedio:', error);
    return { promedio: 0, comparacion: 0 };
  }
}

async function loadMargenGanancia(dateRange) {
  try {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select(`
        total,
        venta_detalle(
          cantidad,
          precio_unitario,
          productos(costo)
        )
      `)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    if (error) throw error;

    let totalVentas = 0;
    let totalCostos = 0;

    ventas.forEach(venta => {
      totalVentas += venta.total || 0;
      
      venta.venta_detalle?.forEach(detalle => {
        const cantidad = detalle.cantidad || 0;
        const costo = detalle.productos?.costo || 0;
        totalCostos += cantidad * costo;
      });
    });

    const margen = totalVentas ? ((totalVentas - totalCostos) / totalVentas * 100).toFixed(1) : 0;

    return { margen };
  } catch (error) {
    console.error('Error loading margen ganancia:', error);
    return { margen: 0 };
  }
}

async function loadTurnosData(dateRange) {
  try {
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('estado')
      .gte('fecha', dateRange.start.toISOString())
      .lte('fecha', dateRange.end.toISOString());

    if (error) throw error;

    const total = turnos.length;
    const pendientes = turnos.filter(t => t.estado === 'pendiente').length;
    const confirmados = turnos.filter(t => t.estado === 'confirmado').length;
    const realizados = turnos.filter(t => t.estado === 'realizado').length;

    return { total, pendientes, confirmados, realizados };
  } catch (error) {
    console.error('Error loading turnos data:', error);
    return { total: 0, pendientes: 0, confirmados: 0, realizados: 0 };
  }
}

async function loadStockCritico() {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('nombre, stock, precio_calculado')
      .lt('stock', 5)
      .order('stock', { ascending: true });

    if (error) throw error;
    return productos || [];
  } catch (error) {
    console.error('Error loading stock crítico:', error);
    return [];
  }
}

async function loadProductosSinMovimiento() {
  try {
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

    // Get all products
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, stock, costo');

    if (productosError) throw productosError;

    // Get products that have been sold in last 30 days
    const { data: ventasRecientes, error: ventasError } = await supabase
      .from('venta_detalle')
      .select(`
        producto_id,
        ventas!inner(created_at)
      `)
      .gte('ventas.created_at', fecha30DiasAtras.toISOString());

    if (ventasError) throw ventasError;

    const productosVendidos = new Set(ventasRecientes?.map(v => v.producto_id) || []);
    
    const productosSinMovimiento = productos?.filter(p => !productosVendidos.has(p.id)) || [];
    
    return productosSinMovimiento.map(p => ({
      ...p,
      valor_inmovilizado: p.stock * (p.costo || 0)
    }));
  } catch (error) {
    console.error('Error loading productos sin movimiento:', error);
    return [];
  }
}

function getPreviousDateRange(currentRange) {
  const duration = currentRange.end - currentRange.start;
  return {
    start: new Date(currentRange.start.getTime() - duration),
    end: new Date(currentRange.start.getTime())
  };
}

function updateVentasUI(data) {
  const totalElement = document.getElementById('ventas-total');
  const cantidadElement = document.getElementById('ventas-cantidad');
  const comparacionElement = document.getElementById('ventas-comparacion');

  if (totalElement) totalElement.textContent = `$${data.total.toLocaleString()}`;
  if (cantidadElement) cantidadElement.textContent = `${data.cantidad} transacciones`;
  if (comparacionElement) {
    comparacionElement.textContent = `${data.comparacion > 0 ? '+' : ''}${data.comparacion}%`;
    comparacionElement.className = `text-sm ${data.comparacion >= 0 ? 'text-green-600' : 'text-red-600'}`;
  }
}

function updateTicketUI(data) {
  const promedioElement = document.getElementById('ticket-promedio');
  const comparacionElement = document.getElementById('ticket-comparacion');

  if (promedioElement) promedioElement.textContent = `$${data.promedio.toLocaleString()}`;
  if (comparacionElement) {
    comparacionElement.textContent = `${data.comparacion > 0 ? '+' : ''}${data.comparacion}%`;
    comparacionElement.className = `text-sm ${data.comparacion >= 0 ? 'text-green-600' : 'text-red-600'}`;
  }
}

function updateMargenUI(data) {
  const margenElement = document.getElementById('margen-promedio');
  const progressElement = document.getElementById('margen-progress');

  if (margenElement) margenElement.textContent = `${data.margen}%`;
  if (progressElement) progressElement.style.width = `${Math.min(data.margen, 100)}%`;
}

function updateTurnosUI(data) {
  const totalElement = document.getElementById('turnos-total');
  const pendientesElement = document.getElementById('turnos-pendientes');
  const confirmadosElement = document.getElementById('turnos-confirmados');
  const realizadosElement = document.getElementById('turnos-realizados');

  if (totalElement) totalElement.textContent = data.total;
  if (pendientesElement) pendientesElement.textContent = data.pendientes;
  if (confirmadosElement) confirmadosElement.textContent = data.confirmados;
  if (realizadosElement) realizadosElement.textContent = data.realizados;
}

function updateStockCriticoCount(count) {
  const countElement = document.getElementById('stock-critico-count');
  const alertIndicator = document.getElementById('stock-alert-indicator');
  
  if (countElement) countElement.textContent = count;
  
  if (alertIndicator) {
    if (count > 0) {
      alertIndicator.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
    } else {
      alertIndicator.className = 'w-2 h-2 rounded-full bg-green-500';
    }
  }
}

function updateStockCriticoUI(productos) {
  const container = document.getElementById('stock-critico-list');
  if (!container) return;

  if (productos.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-8">✅ No hay productos con stock crítico</div>';
    return;
  }

  container.innerHTML = productos.map(producto => {
    const nivel = producto.stock <= 1 ? 'red' : producto.stock <= 3 ? 'yellow' : 'green';
    const colorClass = {
      red: 'bg-red-50 border-red-200 text-red-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      green: 'bg-green-50 border-green-200 text-green-800'
    }[nivel];

    return `
      <div class="flex items-center justify-between p-3 border rounded-lg ${colorClass}">
        <div>
          <div class="font-medium">${producto.nombre}</div>
          <div class="text-sm opacity-75">Stock: ${producto.stock} unidades</div>
        </div>
        <div class="text-right">
          <div class="font-medium">$${(producto.precio_calculado || 0).toLocaleString()}</div>
          <div class="text-xs opacity-75">por unidad</div>
        </div>
      </div>
    `;
  }).join('');
}

function updateProductosSinMovimientoUI(productos) {
  const container = document.getElementById('productos-sin-movimiento-list');
  if (!container) return;

  if (productos.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-8">✅ Todos los productos tienen movimiento reciente</div>';
    return;
  }

  container.innerHTML = productos.slice(0, 10).map(producto => `
    <div class="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
      <div>
        <div class="font-medium text-orange-800">${producto.nombre}</div>
        <div class="text-sm text-orange-600">Stock: ${producto.stock} unidades</div>
      </div>
      <div class="text-right">
        <div class="font-medium text-orange-800">$${(producto.valor_inmovilizado || 0).toLocaleString()}</div>
        <div class="text-xs text-orange-600">valor inmovilizado</div>
      </div>
    </div>
  `).join('');
}

async function loadHighchartsAndCharts(period = 'dia') {
  // Load Highcharts if not already loaded
  if (typeof Highcharts === 'undefined') {
    await loadHighchartsLibrary();
  }
  
  // Initialize all charts
  await Promise.all([
    createVentasChart('monto'),
    createProductosChart('cantidad'),
    createMargenTrendChart(),
    createMetodosPagoChart(),
    createClientesChart(),
    createTurnosCalendar()
  ]);
}

function loadHighchartsLibrary() {
  return new Promise((resolve, reject) => {
    if (typeof Highcharts !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://code.highcharts.com/highcharts.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function createVentasChart(type = 'monto') {
  const chartContainer = document.getElementById('chart-ventas');
  if (!chartContainer || !chartContainer.offsetParent) {
    console.warn('Contenedor chart-ventas no disponible o no visible');
    return;
  }

  try {
    const chartData = await loadVentasChartData(type);
    
    Highcharts.chart('chart-ventas', {
      chart: {
        type: 'line',
        backgroundColor: 'transparent'
      },
      title: {
        text: null
      },
      xAxis: {
        categories: chartData.categories,
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb'
      },
      yAxis: {
        title: {
          text: type === 'monto' ? 'Ventas ($)' : 'Cantidad de Ventas'
        },
        gridLineColor: '#f3f4f6'
      },
      series: [{
        name: type === 'monto' ? 'Monto' : 'Cantidad',
        data: chartData.data,
        color: '#3b82f6',
        marker: {
          fillColor: '#ffffff',
          lineWidth: 2,
          lineColor: '#3b82f6'
        }
      }],
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            formatter: function() {
              return type === 'monto' ? `$${this.y.toLocaleString()}` : this.y;
            }
          }
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    });
  } catch (error) {
    console.error('Error creating ventas chart:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Error cargando gráfico</div>';
  }
}

async function createProductosChart(type = 'cantidad') {
  const chartContainer = document.getElementById('chart-productos');
  if (!chartContainer) return;

  try {
    const chartData = await loadTopProductosData(type);
    
    Highcharts.chart('chart-productos', {
      chart: {
        type: 'bar',
        backgroundColor: 'transparent'
      },
      title: {
        text: null
      },
      xAxis: {
        categories: chartData.categories,
        lineColor: '#e5e7eb'
      },
      yAxis: {
        title: {
          text: type === 'cantidad' ? 'Cantidad Vendida' : 'Monto Total ($)'
        },
        gridLineColor: '#f3f4f6'
      },
      series: [{
        name: type === 'cantidad' ? 'Cantidad' : 'Monto',
        data: chartData.data,
        color: '#10b981'
      }],
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            formatter: function() {
              return type === 'monto' ? `$${this.y.toLocaleString()}` : this.y;
            }
          }
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    });
  } catch (error) {
    console.error('Error creating productos chart:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Error cargando gráfico</div>';
  }
}

async function createMargenTrendChart() {
  const chartContainer = document.getElementById('chart-margen-trend');
  if (!chartContainer || !chartContainer.offsetParent) {
    console.warn('Contenedor chart-margen-trend no disponible o no visible');
    return;
  }

  try {
    const chartData = await loadMargenTrendData();
    
    Highcharts.chart('chart-margen-trend', {
      chart: {
        type: 'line',
        backgroundColor: 'transparent'
      },
      title: {
        text: null
      },
      xAxis: {
        categories: chartData.categories,
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb'
      },
      yAxis: {
        title: {
          text: 'Margen (%)'
        },
        gridLineColor: '#f3f4f6',
        min: 0,
        max: 100
      },
      series: [{
        name: 'Margen de Ganancia',
        data: chartData.data,
        color: '#8b5cf6',
        marker: {
          fillColor: '#ffffff',
          lineWidth: 2,
          lineColor: '#8b5cf6'
        }
      }],
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            formatter: function() {
              return `${this.y.toFixed(1)}%`;
            }
          }
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    });
  } catch (error) {
    console.error('Error creating margen trend chart:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Error cargando gráfico</div>';
  }
}

async function createTurnosCalendar() {
  const chartContainer = document.getElementById('calendar-turnos');
  if (!chartContainer) return;

  try {
    const turnosData = await loadTurnosCalendarData();
    
    chartContainer.innerHTML = `
      <div class="grid grid-cols-7 gap-1 text-xs">
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Dom</div>
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Lun</div>
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Mar</div>
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Mié</div>
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Jue</div>
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Vie</div>
        <div class="text-center font-semibold p-2 bg-gray-100 rounded">Sáb</div>
        ${turnosData.map(day => `
          <div class="p-1 border rounded ${day.hasAppointments ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}">
            <div class="text-center ${day.isToday ? 'font-bold text-blue-600' : ''}">${day.day}</div>
            ${day.hasAppointments ? `
              <div class="flex gap-1 mt-1">
                ${day.pendientes > 0 ? `<div class="w-2 h-2 bg-yellow-400 rounded-full" title="${day.pendientes} pendientes"></div>` : ''}
                ${day.confirmados > 0 ? `<div class="w-2 h-2 bg-blue-400 rounded-full" title="${day.confirmados} confirmados"></div>` : ''}
                ${day.realizados > 0 ? `<div class="w-2 h-2 bg-green-400 rounded-full" title="${day.realizados} realizados"></div>` : ''}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error creating turnos calendar:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Error cargando calendario</div>';
  }
}

async function createMetodosPagoChart() {
  const chartContainer = document.getElementById('chart-metodos-pago');
  if (!chartContainer) return;

  try {
    const chartData = await loadMetodosPagoData();
    
    Highcharts.chart('chart-metodos-pago', {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: {
        text: null
      },
      series: [{
        name: 'Monto',
        data: chartData,
        colorByPoint: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      }],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: ${point.y:,.0f}'
          }
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    });
  } catch (error) {
    console.error('Error creating métodos pago chart:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Error cargando gráfico</div>';
  }
}

async function createClientesChart() {
  const chartContainer = document.getElementById('chart-clientes');
  if (!chartContainer) return;

  try {
    const chartData = await loadClientesData();
    
    Highcharts.chart('chart-clientes', {
      chart: {
        type: 'column',
        backgroundColor: 'transparent'
      },
      title: {
        text: null
      },
      xAxis: {
        categories: ['Últimos 30 días'],
        lineColor: '#e5e7eb'
      },
      yAxis: {
        title: {
          text: 'Cantidad de Clientes'
        },
        gridLineColor: '#f3f4f6'
      },
      series: [{
        name: 'Nuevos',
        data: [chartData.nuevos],
        color: '#3b82f6'
      }, {
        name: 'Recurrentes',
        data: [chartData.recurrentes],
        color: '#10b981'
      }],
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    });
  } catch (error) {
    console.error('Error creating clientes chart:', error);
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Error cargando gráfico</div>';
  }
}

async function loadVentasChartData(type = 'monto') {
  try {
    const last7Days = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const { data: ventas } = await supabase
        .from('ventas')
        .select('total')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      let value;
      if (type === 'monto') {
        value = ventas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
      } else {
        value = ventas?.length || 0;
      }
      
      last7Days.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
      data.push(value);
    }
    
    return { categories: last7Days, data };
  } catch (error) {
    console.error('Error loading ventas chart data:', error);
    return { categories: [], data: [] };
  }
}

async function loadTopProductosData(type = 'cantidad') {
  try {
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

    const { data: ventas } = await supabase
      .from('ventas')
      .select(`
        venta_detalle(
          productos(nombre, precio_calculado),
          cantidad,
          precio_unitario
        )
      `)
      .gte('created_at', fecha30DiasAtras.toISOString());

    const productosMap = new Map();
    
    ventas?.forEach(venta => {
      venta.venta_detalle?.forEach(detalle => {
        if (detalle.productos?.nombre) {
          const nombre = detalle.productos.nombre;
          const cantidad = detalle.cantidad || 0;
          const precio = detalle.precio_unitario || detalle.productos.precio_calculado || 0;
          
          if (!productosMap.has(nombre)) {
            productosMap.set(nombre, { cantidad: 0, monto: 0 });
          }
          
          const current = productosMap.get(nombre);
          current.cantidad += cantidad;
          current.monto += cantidad * precio;
        }
      });
    });

    const sortedProductos = Array.from(productosMap.entries())
      .sort(([,a], [,b]) => type === 'cantidad' ? b.cantidad - a.cantidad : b.monto - a.monto)
      .slice(0, 10);

    return {
      categories: sortedProductos.map(([nombre]) => nombre),
      data: sortedProductos.map(([, data]) => type === 'cantidad' ? data.cantidad : data.monto)
    };
  } catch (error) {
    console.error('Error loading top productos data:', error);
    return { categories: [], data: [] };
  }
}

async function loadMetodosPagoData() {
  try {
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

    const { data: ventas } = await supabase
      .from('ventas')
      .select('metodo_pago, total')
      .gte('created_at', fecha30DiasAtras.toISOString());

    const metodosMap = new Map();
    
    ventas?.forEach(venta => {
      const metodo = venta.metodo_pago || 'efectivo';
      const total = venta.total || 0;
      metodosMap.set(metodo, (metodosMap.get(metodo) || 0) + total);
    });

    return Array.from(metodosMap.entries()).map(([name, y]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      y 
    }));
  } catch (error) {
    console.error('Error loading métodos pago data:', error);
    return [];
  }
}

async function loadClientesData() {
  try {
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

    // Get all clients with purchases in last 30 days
    const { data: ventasRecientes } = await supabase
      .from('ventas')
      .select('cliente_id')
      .gte('created_at', fecha30DiasAtras.toISOString());

    const clientesRecientes = new Set(ventasRecientes?.map(v => v.cliente_id).filter(id => id));

    // Get all clients with previous purchases (before 30 days)
    const { data: ventasAnteriores } = await supabase
      .from('ventas')
      .select('cliente_id')
      .lt('created_at', fecha30DiasAtras.toISOString());

    const clientesAnteriores = new Set(ventasAnteriores?.map(v => v.cliente_id).filter(id => id));

    const nuevos = Array.from(clientesRecientes).filter(id => !clientesAnteriores.has(id)).length;
    const recurrentes = Array.from(clientesRecientes).filter(id => clientesAnteriores.has(id)).length;

    return { nuevos, recurrentes };
  } catch (error) {
    console.error('Error loading clientes data:', error);
    return { nuevos: 0, recurrentes: 0 };
  }
}

async function loadMargenTrendData() {
  try {
    const data = [];
    const categories = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const { data: ventas } = await supabase
        .from('ventas')
        .select(`
          total,
          venta_detalle(
            cantidad,
            precio_unitario,
            productos(costo)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      let totalVentas = 0;
      let totalCostos = 0;

      ventas?.forEach(venta => {
        totalVentas += venta.total || 0;
        
        venta.venta_detalle?.forEach(detalle => {
          const cantidad = detalle.cantidad || 0;
          const costo = detalle.productos?.costo || 0;
          totalCostos += cantidad * costo;
        });
      });

      const margen = totalVentas ? ((totalVentas - totalCostos) / totalVentas * 100) : 0;
      
      categories.push(date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }));
      data.push(parseFloat(margen.toFixed(1)));
    }
    
    return { categories, data };
  } catch (error) {
    console.error('Error loading margen trend data:', error);
    return { categories: [], data: [] };
  }
}

async function loadTurnosCalendarData() {
  try {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Get appointments for current month
    const { data: turnos } = await supabase
      .from('turnos')
      .select('fecha, estado')
      .gte('fecha', firstDay.toISOString())
      .lte('fecha', lastDay.toISOString());
    
    const turnosMap = new Map();
    turnos?.forEach(turno => {
      const date = new Date(turno.fecha).getDate();
      if (!turnosMap.has(date)) {
        turnosMap.set(date, { pendientes: 0, confirmados: 0, realizados: 0 });
      }
      const day = turnosMap.get(date);
      day[turno.estado]++;
    });
    
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    const calendarData = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarData.push({ day: '', hasAppointments: false });
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = turnosMap.get(day);
      calendarData.push({
        day,
        hasAppointments: !!dayData,
        isToday: day === today.getDate(),
        pendientes: dayData?.pendientes || 0,
        confirmados: dayData?.confirmados || 0,
        realizados: dayData?.realizados || 0
      });
    }
    
    return calendarData;
  } catch (error) {
    console.error('Error loading turnos calendar data:', error);
    return [];
  }
}