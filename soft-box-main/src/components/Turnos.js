import { supabase } from '../supabaseClient.js';

export async function renderTurnos(container) {
  let fechaActual = new Date();
  let turnosPorDia = {};

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Gestión de Turnos
            </h1>
          </div>
          <p class="text-gray-600 text-lg">Administra la agenda de turnos y citas de tus clientes</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Turnos Hoy</p>
                <p class="text-2xl font-bold text-cyan-600" id="turnos-hoy">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Pendientes</p>
                <p class="text-2xl font-bold text-yellow-600" id="turnos-pendientes">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Confirmados</p>
                <p class="text-2xl font-bold text-blue-600" id="turnos-confirmados">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Completados</p>
                <p class="text-2xl font-bold text-green-600" id="turnos-completados">0</p>
              </div>
              <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar Header -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button id="mes-anterior" class="p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Anterior
              </button>
              <div class="text-center">
                <h3 id="mes-actual" class="text-2xl font-bold text-gray-800"></h3>
                <p class="text-sm text-gray-500">Calendario de turnos</p>
              </div>
              <button id="mes-siguiente" class="p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-300 flex items-center gap-2">
                Siguiente
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            <div class="flex gap-2">
              <button id="nuevo-turno" class="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nuevo Turno
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div id="calendario-mensual" class="space-y-4"></div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-800">Próximos Turnos</h3>
            </div>
            <div id="proximos-turnos" class="space-y-3"></div>
          </div>

          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-800">Hoy</h3>
            </div>
            <div id="turnos-hoy-lista" class="space-y-3"></div>
          </div>

          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-800">Completados</h3>
            </div>
            <div id="turnos-completados-lista" class="space-y-3"></div>
          </div>
        </div>

        <!-- Modal -->
        <div id="turno-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden">
          <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 transform transition-all duration-300 scale-95 opacity-0" id="modal-content">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800" id="modal-title">Turnos del Día</h3>
              </div>
              <button id="cerrar-modal" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div id="turnos-del-dia" class="space-y-4 mb-6"></div>
            
            <div class="flex gap-3">
              <button id="nuevo-turno-dia" class="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nuevo Turno
              </button>
            </div>
            
            <div id="turno-form-dia"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const calendarioDiv = document.getElementById('calendario-mensual');
  const modal = document.getElementById('turno-form-modal');
  const modalContent = document.getElementById('modal-content');
  const mesActualSpan = document.getElementById('mes-actual');

  function getDiasDelMes(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const dias = [];
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(year, month, i));
    }
    return dias;
  }

  function getNombreMes(date) {
    return date.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  }

  function getEstadoColor(estado) {
    const colores = {
      'pendiente': 'from-yellow-500 to-orange-500',
      'confirmado': 'from-blue-500 to-indigo-500',
      'realizado': 'from-green-500 to-emerald-500',
      'cancelado': 'from-red-500 to-pink-500'
    };
    return colores[estado] || 'from-gray-500 to-gray-600';
  }

  function getEstadoTextColor(estado) {
    const colores = {
      'pendiente': 'text-yellow-700',
      'confirmado': 'text-blue-700',
      'realizado': 'text-green-700',
      'cancelado': 'text-red-700'
    };
    return colores[estado] || 'text-gray-700';
  }

  async function cargarEstadisticas() {
    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().slice(0, 10);
    const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().slice(0, 10);
    
    // Turnos del mes
    const { data: turnosMes } = await supabase
      .from('turnos')
      .select('estado,fecha')
      .gte('fecha', inicioMes)
      .lte('fecha', finMes);
    
    // Turnos de hoy
    const { data: turnosHoy } = await supabase
      .from('turnos')
      .select('estado')
      .eq('fecha', hoy);
    
    const estadisticas = {
      hoy: turnosHoy?.length || 0,
      pendientes: turnosMes?.filter(t => t.estado === 'pendiente').length || 0,
      confirmados: turnosMes?.filter(t => t.estado === 'confirmado').length || 0,
      completados: turnosMes?.filter(t => t.estado === 'realizado').length || 0
    };
    
    document.getElementById('turnos-hoy').textContent = estadisticas.hoy;
    document.getElementById('turnos-pendientes').textContent = estadisticas.pendientes;
    document.getElementById('turnos-confirmados').textContent = estadisticas.confirmados;
    document.getElementById('turnos-completados').textContent = estadisticas.completados;
  }

  function renderCalendario() {
    const dias = getDiasDelMes(fechaActual);
    const primerDiaSemana = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).getDay();
    const offset = (primerDiaSemana === 0 ? 6 : primerDiaSemana - 1); // Lunes=0
    
    mesActualSpan.textContent = getNombreMes(fechaActual).charAt(0).toUpperCase() + getNombreMes(fechaActual).slice(1);
    
    let html = `
      <div class="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700 mb-4">
        <div class="p-3">Lun</div>
        <div class="p-3">Mar</div>
        <div class="p-3">Mié</div>
        <div class="p-3">Jue</div>
        <div class="p-3">Vie</div>
        <div class="p-3">Sáb</div>
        <div class="p-3">Dom</div>
      </div>
      <div class="grid grid-cols-7 gap-2">
    `;
    
    // Espacios vacíos al inicio
    for (let i = 0; i < offset; i++) {
      html += `<div class="h-24"></div>`;
    }
    
    // Días del mes
    dias.forEach(dia => {
      const fechaStr = dia.toISOString().slice(0, 10);
      const tieneTurnos = turnosPorDia[fechaStr] && turnosPorDia[fechaStr].length > 0;
      const esHoy = fechaStr === new Date().toISOString().slice(0, 10);
      const turnosCount = tieneTurnos ? turnosPorDia[fechaStr].length : 0;
      
      html += `
        <button class="h-24 rounded-xl border-2 border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-300 relative p-2 ${tieneTurnos ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300' : ''} ${esHoy ? 'ring-2 ring-cyan-500' : ''}" data-fecha="${fechaStr}">
          <div class="flex flex-col items-center justify-center h-full">
            <span class="font-bold text-lg ${esHoy ? 'text-cyan-600' : 'text-gray-800'}">${dia.getDate()}</span>
            ${tieneTurnos ? `
              <div class="flex items-center gap-1 mt-1">
                <div class="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span class="text-xs font-medium text-cyan-600">${turnosCount}</span>
              </div>
            ` : ''}
          </div>
        </button>
      `;
    });
    
    html += `</div>`;
    calendarioDiv.innerHTML = html;
    
    calendarioDiv.querySelectorAll('button[data-fecha]').forEach(btn => {
      btn.onclick = () => mostrarTurnosDelDia(btn.dataset.fecha);
    });
  }

  async function cargarTurnosMes() {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const desde = new Date(year, month, 1).toISOString().slice(0, 10);
    const hasta = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    
    const { data, error } = await supabase
      .from('turnos')
      .select('*,clientes(nombre),vehiculos(marca,modelo,patente)')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: true });
    
    turnosPorDia = {};
    (data || []).forEach(t => {
      const fecha = t.fecha.slice(0, 10);
      if (!turnosPorDia[fecha]) turnosPorDia[fecha] = [];
      turnosPorDia[fecha].push(t);
    });
    
    renderCalendario();
    await cargarEstadisticas();
    await cargarTurnosRapidos();
  }

  async function cargarTurnosRapidos() {
    const hoy = new Date().toISOString().slice(0, 10);
    const proximos = new Date();
    proximos.setDate(proximos.getDate() + 7);
    
    // Próximos turnos
    const { data: proximosTurnos } = await supabase
      .from('turnos')
      .select('*,clientes(nombre),vehiculos(marca,modelo,patente)')
      .gte('fecha', hoy)
      .lte('fecha', proximos.toISOString().slice(0, 10))
      .eq('estado', 'pendiente')
      .order('fecha', { ascending: true })
      .limit(5);
    
    // Turnos de hoy
    const { data: turnosHoy } = await supabase
      .from('turnos')
      .select('*,clientes(nombre),vehiculos(marca,modelo,patente)')
      .eq('fecha', hoy)
      .order('fecha', { ascending: true });
    
    // Turnos completados recientes
    const { data: turnosCompletados } = await supabase
      .from('turnos')
      .select('*,clientes(nombre),vehiculos(marca,modelo,patente)')
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false })
      .limit(5);
    
    // Renderizar próximos turnos
    const proximosDiv = document.getElementById('proximos-turnos');
    if (!proximosTurnos || proximosTurnos.length === 0) {
      proximosDiv.innerHTML = `
        <div class="text-center py-4">
          <p class="text-gray-500 text-sm">No hay turnos pendientes</p>
        </div>
      `;
    } else {
      proximosDiv.innerHTML = proximosTurnos.map(t => `
        <div class="p-3 bg-white/50 rounded-lg border-l-4 border-yellow-400">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-gray-800 text-sm">${t.clientes?.nombre || ''}</span>
            <span class="text-xs text-gray-500">${new Date(t.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
          </div>
          <p class="text-xs text-gray-600">${t.vehiculos ? `${t.vehiculos.marca} ${t.vehiculos.modelo}` : ''}</p>
          <p class="text-xs text-gray-500">${new Date(t.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      `).join('');
    }
    
    // Renderizar turnos de hoy
    const hoyDiv = document.getElementById('turnos-hoy-lista');
    if (!turnosHoy || turnosHoy.length === 0) {
      hoyDiv.innerHTML = `
        <div class="text-center py-4">
          <p class="text-gray-500 text-sm">No hay turnos hoy</p>
        </div>
      `;
    } else {
      hoyDiv.innerHTML = turnosHoy.map(t => `
        <div class="p-3 bg-white/50 rounded-lg border-l-4 border-${t.estado === 'pendiente' ? 'yellow' : t.estado === 'confirmado' ? 'blue' : t.estado === 'realizado' ? 'green' : 'red'}-400">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-gray-800 text-sm">${t.clientes?.nombre || ''}</span>
            <span class="text-xs ${getEstadoTextColor(t.estado)} font-medium">${t.estado}</span>
          </div>
          <p class="text-xs text-gray-600">${t.vehiculos ? `${t.vehiculos.marca} ${t.vehiculos.modelo}` : ''}</p>
          <p class="text-xs text-gray-500">${new Date(t.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      `).join('');
    }
    
    // Renderizar turnos completados
    const completadosDiv = document.getElementById('turnos-completados-lista');
    if (!turnosCompletados || turnosCompletados.length === 0) {
      completadosDiv.innerHTML = `
        <div class="text-center py-4">
          <p class="text-gray-500 text-sm">No hay turnos completados</p>
        </div>
      `;
    } else {
      completadosDiv.innerHTML = turnosCompletados.map(t => `
        <div class="p-3 bg-white/50 rounded-lg border-l-4 border-green-400">
          <div class="flex justify-between items-start mb-1">
            <span class="font-semibold text-gray-800 text-sm">${t.clientes?.nombre || ''}</span>
            <span class="text-xs text-gray-500">${new Date(t.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
          </div>
          <p class="text-xs text-gray-600">${t.vehiculos ? `${t.vehiculos.marca} ${t.vehiculos.modelo}` : ''}</p>
          <p class="text-xs text-gray-500">${new Date(t.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      `).join('');
    }
  }

  async function mostrarTurnosDelDia(fecha) {
    const turnos = turnosPorDia[fecha] || [];
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    document.getElementById('modal-title').textContent = `Turnos del ${fechaFormateada}`;
    
    const turnosDiv = document.getElementById('turnos-del-dia');
    
    if (turnos.length === 0) {
      turnosDiv.innerHTML = `
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No hay turnos programados</p>
          <p class="text-gray-400 text-sm">Agrega un nuevo turno para este día</p>
        </div>
      `;
    } else {
      turnosDiv.innerHTML = turnos.map(t => `
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800">${t.clientes?.nombre || 'Sin cliente'}</h4>
              <p class="text-sm text-gray-600">${t.vehiculos ? `${t.vehiculos.marca} ${t.vehiculos.modelo} (${t.vehiculos.patente})` : 'Sin vehículo'}</p>
              <p class="text-xs text-gray-500">${t.motivo || 'Sin motivo especificado'}</p>
            </div>
            <div class="text-right">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getEstadoColor(t.estado)} text-white">
                ${t.estado}
              </span>
              <p class="text-sm font-medium text-gray-800 mt-1">
                ${new Date(t.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button data-id="${t.id}" class="editar-turno flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-3 py-2 rounded-lg transition-all duration-300 text-sm">
              Editar
            </button>
            <button data-id="${t.id}" class="cancelar-turno flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-3 py-2 rounded-lg transition-all duration-300 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      `).join('');
    }
    
    // Mostrar modal con animación
    modal.classList.remove('hidden');
    setTimeout(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    // Event listeners
    document.getElementById('cerrar-modal').onclick = cerrarModal;
    document.getElementById('nuevo-turno-dia').onclick = () => mostrarFormTurno(null, fecha);
    
    turnosDiv.querySelectorAll('.editar-turno').forEach(btn => {
      btn.onclick = () => mostrarFormTurno(btn.dataset.id);
    });
    
    turnosDiv.querySelectorAll('.cancelar-turno').forEach(btn => {
      btn.onclick = () => cambiarEstadoTurno(btn.dataset.id, 'cancelado');
    });
  }

  function cerrarModal() {
    modalContent.classList.add('scale-95', 'opacity-0');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }

  // Cerrar modal al hacer clic fuera
  modal.onclick = (e) => {
    if (e.target === modal) cerrarModal();
  };
  // Cerrar con Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); }, { once: true });

  async function mostrarFormTurno(id, fechaFija) {
    let turno = { 
      cliente_id: '', 
      vehiculo_id: '', 
      fecha: fechaFija ? fechaFija + 'T09:00' : '', 
      motivo: '', 
      estado: 'pendiente' 
    };
    
    if (id) {
      const { data } = await supabase.from('turnos').select('*').eq('id', id).single();
      turno = data;
    }
    
    // Cargar clientes y vehículos
    const { data: clientes } = await supabase.from('clientes').select('id,nombre').order('nombre');
    let vehiculos = [];
    if (turno.cliente_id) {
      const { data: v } = await supabase.from('vehiculos').select('id,marca,modelo,patente').eq('cliente_id', turno.cliente_id);
      vehiculos = v || [];
    }
    
    const formDiv = document.getElementById('turno-form-dia');
    formDiv.innerHTML = `
      <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h4 class="text-lg font-bold text-gray-800">${id ? 'Editar' : 'Nuevo'} Turno</h4>
        </div>
        
        <form id="turno-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select name="cliente_id" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200">
                <option value="">Seleccionar cliente</option>
                ${clientes.map(c => `<option value="${c.id}" ${turno.cliente_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Vehículo *</label>
              <select name="vehiculo_id" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200">
                <option value="">Seleccionar vehículo</option>
                ${vehiculos.map(v => `<option value="${v.id}" ${turno.vehiculo_id === v.id ? 'selected' : ''}>${v.marca} ${v.modelo} (${v.patente})</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora *</label>
              <input name="fecha" type="datetime-local" value="${turno.fecha ? turno.fecha.slice(0, 16) : (fechaFija ? fechaFija + 'T09:00' : '')}" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select name="estado" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200">
                <option value="pendiente" ${turno.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="confirmado" ${turno.estado === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                <option value="realizado" ${turno.estado === 'realizado' ? 'selected' : ''}>Realizado</option>
                <option value="cancelado" ${turno.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
            <input name="motivo" placeholder="Motivo del turno" value="${turno.motivo || ''}" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200" />
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Guardar
            </button>
            <button type="button" id="cancelar-turno-form" class="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200">
              Cancelar
            </button>
          </div>
        </form>
        
        <div id="turno-form-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
      </div>
    `;
    
    // Event listeners
    formDiv.querySelector('select[name="cliente_id"]').onchange = async (e) => {
      const cliente_id = e.target.value;
      const { data: v } = await supabase.from('vehiculos').select('id,marca,modelo,patente').eq('cliente_id', cliente_id);
      const vehiculoSelect = formDiv.querySelector('select[name="vehiculo_id"]');
      vehiculoSelect.innerHTML = '<option value="">Seleccionar vehículo</option>' + (v || []).map(v => `<option value="${v.id}">${v.marca} ${v.modelo} (${v.patente})</option>`).join('');
    };
    
    formDiv.querySelector('#cancelar-turno-form').onclick = () => { 
      formDiv.innerHTML = ''; 
    };
    
    formDiv.querySelector('#turno-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const errorDiv = formDiv.querySelector('#turno-form-error');
      
      const nuevo = {
        cliente_id: form.cliente_id.value,
        vehiculo_id: form.vehiculo_id.value,
        fecha: form.fecha.value,
        motivo: form.motivo.value,
        estado: form.estado.value
      };
      
      let res;
      if (id) {
        res = await supabase.from('turnos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('turnos').insert([nuevo]);
      }
      
      if (res.error) {
        errorDiv.textContent = res.error.message;
        errorDiv.classList.remove('hidden');
      } else {
        formDiv.innerHTML = '';
        cerrarModal();
        await cargarTurnosMes();
        errorDiv.classList.add('hidden');
      }
    };
  }

  async function cambiarEstadoTurno(id, estado) {
    await supabase.from('turnos').update({ estado }).eq('id', id);
    cerrarModal();
    await cargarTurnosMes();
  }

  // Event listeners
  document.getElementById('mes-anterior').onclick = async () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    await cargarTurnosMes();
  };
  
  document.getElementById('mes-siguiente').onclick = async () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    await cargarTurnosMes();
  };

  document.getElementById('nuevo-turno').onclick = () => {
    mostrarFormTurno();
  };

  // Inicialización
  await cargarTurnosMes();
} 