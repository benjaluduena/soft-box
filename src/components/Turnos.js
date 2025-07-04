import { supabase } from '../supabaseClient.js';

export async function renderTurnos(container) {
  let fechaActual = new Date();
  let turnosPorDia = {};

  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-8 px-2 sm:px-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-blue-700">Agenda mensual</h2>
        <div class="flex gap-2">
          <button id="mes-anterior" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1 rounded transition">&lt;</button>
          <span id="mes-actual" class="font-bold text-blue-800"></span>
          <button id="mes-siguiente" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1 rounded transition">&gt;</button>
        </div>
      </div>
      <div id="calendario-mensual" class="bg-white rounded-xl shadow p-4"></div>
      <div id="turno-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
    </div>
  `;
  const calendarioDiv = document.getElementById('calendario-mensual');
  const modal = document.getElementById('turno-form-modal');
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

  function renderCalendario() {
    const dias = getDiasDelMes(fechaActual);
    const primerDiaSemana = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).getDay();
    const offset = (primerDiaSemana === 0 ? 6 : primerDiaSemana - 1); // Lunes=0
    mesActualSpan.textContent = getNombreMes(fechaActual).charAt(0).toUpperCase() + getNombreMes(fechaActual).slice(1);
    let html = `<div class='grid grid-cols-7 gap-2 text-center font-semibold text-blue-700 mb-2'>
      <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
    </div><div class='grid grid-cols-7 gap-2'>`;
    for (let i = 0; i < offset; i++) {
      html += `<div></div>`;
    }
    dias.forEach(dia => {
      const fechaStr = dia.toISOString().slice(0, 10);
      const tieneTurnos = turnosPorDia[fechaStr] && turnosPorDia[fechaStr].length > 0;
      html += `<button class="rounded-lg h-20 flex flex-col items-center justify-center border border-gray-200 hover:bg-blue-100 transition relative ${tieneTurnos ? 'bg-blue-50 ring-2 ring-blue-300' : ''}" data-fecha="${fechaStr}">
        <span class="font-bold text-lg">${dia.getDate()}</span>
        ${tieneTurnos ? '<span class="w-2 h-2 rounded-full bg-blue-500 absolute bottom-2"></span>' : ''}
      </button>`;
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
  }

  async function mostrarTurnosDelDia(fecha) {
    const turnos = turnosPorDia[fecha] || [];
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">Turnos del ${new Date(fecha).toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}</h3>
        <div class="space-y-3 mb-4">
          ${turnos.length ? turnos.map(t => `
            <div class="rounded-lg p-3 shadow border-l-4 ${t.estado==='pendiente' ? 'border-yellow-400 bg-yellow-50' : t.estado==='confirmado' ? 'border-blue-400 bg-blue-50' : t.estado==='realizado' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}">
              <div class="flex items-center justify-between">
                <span class="font-bold text-blue-800 text-sm">${t.clientes?.nombre || ''}</span>
                <span class="text-xs text-gray-500">${new Date(t.fecha).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}</span>
              </div>
              <div class="text-xs text-gray-600">${t.vehiculos ? `${t.vehiculos.marca || ''} ${t.vehiculos.modelo || ''} (${t.vehiculos.patente || ''})` : ''}</div>
              <div class="text-xs text-gray-400">${t.motivo || '-'} <span class="font-bold ml-2 ${t.estado==='pendiente' ? 'text-yellow-700' : t.estado==='confirmado' ? 'text-blue-700' : t.estado==='realizado' ? 'text-green-700' : 'text-red-700'}">${t.estado}</span></div>
              <div class="flex gap-2 mt-2">
                <button data-id="${t.id}" class="editar-turno bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-semibold text-xs transition">Editar</button>
                <button data-id="${t.id}" class="cancelar-turno bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded font-semibold text-xs transition">Cancelar</button>
              </div>
            </div>
          `).join('') : '<div class="text-gray-400 text-xs text-center mt-4">Sin turnos</div>'}
        </div>
        <button id="nuevo-turno-dia" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition w-full">+ Nuevo turno</button>
        <div id="turno-form-dia"></div>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('nuevo-turno-dia').onclick = () => mostrarFormTurno(null, fecha);
    modal.querySelectorAll('.editar-turno').forEach(btn => {
      btn.onclick = () => mostrarFormTurno(btn.dataset.id);
    });
    modal.querySelectorAll('.cancelar-turno').forEach(btn => {
      btn.onclick = () => cambiarEstadoTurno(btn.dataset.id, 'cancelado');
    });
  }

  async function mostrarFormTurno(id, fechaFija) {
    let turno = { cliente_id: '', vehiculo_id: '', fecha: fechaFija ? fechaFija + 'T09:00' : '', motivo: '', estado: 'pendiente' };
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
    const formDiv = document.getElementById('turno-form-dia') || modal;
    formDiv.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fade-in mt-4 border border-blue-100">
        <h4 class="text-lg font-bold mb-2 text-blue-700">${id ? 'Editar' : 'Nuevo'} turno</h4>
        <form id="turno-form" class="flex flex-col gap-3">
          <label class="font-semibold text-gray-700">Cliente
            <select name="cliente_id" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Seleccionar cliente</option>
              ${clientes.map(c => `<option value="${c.id}" ${turno.cliente_id===c.id?'selected':''}>${c.nombre}</option>`).join('')}
            </select>
          </label>
          <label class="font-semibold text-gray-700">Vehículo
            <select name="vehiculo_id" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Seleccionar vehículo</option>
              ${vehiculos.map(v => `<option value="${v.id}" ${turno.vehiculo_id===v.id?'selected':''}>${v.marca} ${v.modelo} (${v.patente})</option>`).join('')}
            </select>
          </label>
          <label class="font-semibold text-gray-700">Fecha y hora
            <input name="fecha" type="datetime-local" value="${turno.fecha ? turno.fecha.slice(0,16) : (fechaFija ? fechaFija + 'T09:00' : '')}" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </label>
          <input name="motivo" placeholder="Motivo" value="${turno.motivo || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <label class="font-semibold text-gray-700">Estado
            <select name="estado" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="pendiente" ${turno.estado==='pendiente'?'selected':''}>Pendiente</option>
              <option value="confirmado" ${turno.estado==='confirmado'?'selected':''}>Confirmado</option>
              <option value="realizado" ${turno.estado==='realizado'?'selected':''}>Realizado</option>
              <option value="cancelado" ${turno.estado==='cancelado'?'selected':''}>Cancelado</option>
            </select>
          </label>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-turno-form" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="turno-form-error" class="text-red-600 text-sm mt-2"></div>
      </div>
    `;
    formDiv.querySelector('select[name="cliente_id"]').onchange = async (e) => {
      const cliente_id = e.target.value;
      const { data: v } = await supabase.from('vehiculos').select('id,marca,modelo,patente').eq('cliente_id', cliente_id);
      const vehiculoSelect = formDiv.querySelector('select[name="vehiculo_id"]');
      vehiculoSelect.innerHTML = '<option value="">Seleccionar vehículo</option>' + (v||[]).map(v => `<option value="${v.id}">${v.marca} ${v.modelo} (${v.patente})</option>`).join('');
    };
    formDiv.querySelector('#cancelar-turno-form').onclick = () => { formDiv.innerHTML = ''; };
    formDiv.querySelector('#turno-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
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
        formDiv.querySelector('#turno-form-error').textContent = res.error.message;
      } else {
        formDiv.innerHTML = '';
        modal.classList.add('hidden');
        await cargarTurnosMes();
      }
    };
  }

  async function cambiarEstadoTurno(id, estado) {
    await supabase.from('turnos').update({ estado }).eq('id', id);
    modal.classList.add('hidden');
    await cargarTurnosMes();
  }

  document.getElementById('mes-anterior').onclick = async () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    await cargarTurnosMes();
  };
  document.getElementById('mes-siguiente').onclick = async () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    await cargarTurnosMes();
  };

  await cargarTurnosMes();
} 