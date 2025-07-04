import { supabase } from '../supabaseClient.js';

export async function renderTurnos(container) {
  let fechaActual = new Date();
  let turnosPorDia = {};

  container.innerHTML = `
    <div class="max-w-5xl mx-auto py-6 px-4">
      <div class="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h2 class="text-2xl font-bold" style="color: var(--color-acento);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
          Agenda de Turnos
        </h2>
        <div class="flex items-center gap-3">
          <button id="mes-anterior" class="button secondary p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z"/></svg>
          </button>
          <span id="mes-actual" class="text-lg font-semibold" style="color: var(--color-texto-oscuro); min-width: 180px; text-align: center;"></span>
          <button id="mes-siguiente" class="button secondary p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      </div>
      <div id="calendario-mensual" class="list-item-card p-4 sm:p-6"></div> {/* Aplicando card */}
      <div id="turno-form-modal" class="modal-overlay hidden"></div> {/* Contenedor para el modal */}
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
    const offset = (primerDiaSemana === 0 ? 6 : primerDiaSemana - 1); // Lunes=0 (0 Domingo, 1 Lunes .. 6 Sábado)

    mesActualSpan.textContent = getNombreMes(fechaActual).charAt(0).toUpperCase() + getNombreMes(fechaActual).slice(1);

    let html = `<div class='grid grid-cols-7 gap-1 text-center font-semibold mb-2' style="color: var(--color-texto-oscuro);">
      <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
    </div><div class='grid grid-cols-7 gap-1'>`; // gap-1 para menos espacio entre días

    for (let i = 0; i < offset; i++) {
      html += `<div class="border border-transparent"></div>`; // Espacios vacíos al inicio
    }

    dias.forEach(dia => {
      const fechaStr = dia.toISOString().slice(0, 10);
      const tieneTurnos = turnosPorDia[fechaStr] && turnosPorDia[fechaStr].length > 0;
      const esHoy = dia.toDateString() === new Date().toDateString();

      let classes = 'py-2 flex flex-col items-center justify-center transition relative ';
      classes += esHoy ? 'border-2 border-[var(--color-acento)] ' : 'border border-[var(--color-borde)] ';
      classes += tieneTurnos ? 'has-events ' : ''; // 'has-events' definida en new_styles.css

      html += `<button class="${classes}" data-fecha="${fechaStr}" style="min-height: 5rem;"> {/* Ajustar min-height si es necesario */}
        <span class="day-number">${dia.getDate()}</span>
        ${tieneTurnos ? '<span class="event-indicator"></span>' : ''}
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
    <div class="modal-content-inner max-w-xl"> {/* Un poco más ancho para la lista de turnos */}
      <button id="cerrar-modal" class="close-modal-btn">&times;</button>
      <h3 class="text-xl font-bold mb-5">Turnos del ${new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}</h3>
      <div class="space-y-3 mb-5 max-h-80 overflow-y-auto pr-2"> {/* Scroll para muchos turnos */}
        ${turnos.length ? turnos.map(t => {
          let estadoClass = 'badge-neutral';
          let borderColor = 'var(--color-borde)';
          if (t.estado === 'pendiente') { estadoClass = 'badge-warning'; borderColor = 'var(--color-advertencia)';}
          else if (t.estado === 'confirmado') { estadoClass = 'badge-info'; borderColor = 'var(--color-acento)';}
          else if (t.estado === 'realizado') { estadoClass = 'badge-success'; borderColor = 'var(--color-exito)';}
          else if (t.estado === 'cancelado') { estadoClass = 'badge-danger'; borderColor = 'var(--color-error)';}

          return `
          <div class="list-item-card p-3" style="border-left: 5px solid ${borderColor};">
            <div class="flex items-start justify-between">
              <div>
                <div class="item-title text-base">${t.clientes?.nombre || 'Cliente no especificado'}</div>
                <div class="item-subtitle text-xs">
                  ${t.vehiculos ? `${t.vehiculos.marca || ''} ${t.vehiculos.modelo || ''} (${t.vehiculos.patente || ''})` : 'Vehículo no especificado'}
                </div>
                <div class="item-subtitle text-xs mt-1">${t.motivo || 'Sin motivo específico'}</div>
              </div>
              <div class="text-right flex-shrink-0 ml-2">
                <div class="font-semibold text-sm" style="color: var(--color-texto-oscuro);">${new Date(t.fecha).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })} hs</div>
                <div class="mt-1"><span class="badge ${estadoClass}">${t.estado}</span></div>
              </div>
            </div>
            <div class="item-actions mt-3 pt-2 border-t border-[var(--color-borde)]">
              <button data-id="${t.id}" class="button editar-turno text-xs" style="background-color: var(--color-advertencia); color:white;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
                Editar
              </button>
              ${t.estado !== 'cancelado' && t.estado !== 'realizado' ? `
                <button data-id="${t.id}" class="button danger cancelar-turno text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
                  Cancelar Turno
                </button>` : ''}
              ${t.estado === 'confirmado' ? `
                <button data-id="${t.id}" class="button success marcar-realizado-turno text-xs" style="background-color: var(--color-exito); color:white;">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  Marcar Realizado
                </button>` : ''}
            </div>
          </div>
        `}).join('') : '<p class="no-data-placeholder text-sm text-center my-4">No hay turnos para este día.</p>'}
      </div>
      <button id="nuevo-turno-dia" class="button primary w-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Agendar Nuevo Turno para este Día
      </button>
      <div id="turno-form-dia" class="mt-4"></div> {/* Contenedor para el formulario de nuevo turno */}
    </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('nuevo-turno-dia').onclick = () => mostrarFormTurno(null, fecha);

    modal.querySelectorAll('.editar-turno').forEach(btn => {
      btn.onclick = () => mostrarFormTurno(btn.dataset.id, fecha); // Pasar fecha para preseleccionar en edición
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
    const { data: clientesData } = await supabase.from('clientes').select('id,nombre').order('nombre');
    const clientes = clientesData || [];
    let vehiculos = [];
    if (turno.cliente_id) {
      const { data: vData } = await supabase.from('vehiculos').select('id,marca,modelo,patente').eq('cliente_id', turno.cliente_id);
      vehiculos = vData || [];
    }

    // Determinar la fecha para el input datetime-local
    // Si es un nuevo turno (no hay 'id') y se pasó 'fechaFija', usarla.
    // Si es edición (hay 'id'), usar turno.fecha.
    // Si es nuevo y no hay fechaFija (ej. desde un botón global de "nuevo turno"), dejar que el navegador ponga la fecha actual.
    let fechaInputVal = '';
    if (id && turno.fecha) { // Editando
        fechaInputVal = turno.fecha.slice(0,16);
    } else if (!id && fechaFija) { // Nuevo, con fecha del día del calendario
        fechaInputVal = fechaFija + 'T09:00'; // Default a las 09:00 hs
    }


    const formDiv = document.getElementById('turno-form-dia'); // Siempre renderizar el form aquí
    formDiv.innerHTML = `
      <div class="list-item-card p-5 mt-4"> {/* Usando card para el form */}
        <h4 class="text-lg font-semibold mb-4" style="color: var(--color-texto-oscuro);">${id ? 'Editar' : 'Nuevo'} Turno</h4>
        <form id="turno-form" class="flex flex-col gap-4">
          <div>
            <label for="cliente_id_turno" class="block text-sm font-medium mb-1">Cliente</label>
            <select name="cliente_id" id="cliente_id_turno" required>
              <option value="">Seleccionar cliente</option>
              ${clientes.map(c => `<option value="${c.id}" ${turno.cliente_id === c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="vehiculo_id_turno" class="block text-sm font-medium mb-1">Vehículo</label>
            <select name="vehiculo_id" id="vehiculo_id_turno" required>
              <option value="">Seleccionar vehículo</option>
              ${vehiculos.map(v => `<option value="${v.id}" ${turno.vehiculo_id === v.id ? 'selected' : ''}>${v.marca || ''} ${v.modelo || ''} (${v.patente || ''})</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="fecha_turno" class="block text-sm font-medium mb-1">Fecha y Hora</label>
            <input name="fecha" id="fecha_turno" type="datetime-local" value="${fechaInputVal}" required />
          </div>
          <div>
            <label for="motivo_turno" class="block text-sm font-medium mb-1">Motivo</label>
            <input name="motivo" id="motivo_turno" placeholder="Ej: Cambio de aceite, Revisión" value="${turno.motivo || ''}" />
          </div>
          <div>
            <label for="estado_turno" class="block text-sm font-medium mb-1">Estado</label>
            <select name="estado" id="estado_turno">
              <option value="pendiente" ${turno.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="confirmado" ${turno.estado === 'confirmado' ? 'selected' : ''}>Confirmado</option>
              <option value="realizado" ${turno.estado === 'realizado' ? 'selected' : ''}>Realizado</option>
              <option value="cancelado" ${turno.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
          <div id="turno-form-error" class="text-error text-sm mt-1"></div>
          <div class="flex gap-3 mt-3">
            <button type="submit" class="button primary w-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
              ${id ? 'Actualizar' : 'Guardar'} Turno
            </button>
            <button type="button" id="cancelar-turno-form" class="button secondary w-full">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    const clienteSelect = formDiv.querySelector('select[name="cliente_id"]');
    if(clienteSelect) {
        clienteSelect.onchange = async (e) => {
        const cliente_id = e.target.value;
        const vehiculoSelect = formDiv.querySelector('select[name="vehiculo_id"]');
        vehiculoSelect.innerHTML = '<option value="">Cargando vehículos...</option>'; // Feedback visual
        if (cliente_id) {
            const { data: vData } = await supabase.from('vehiculos').select('id,marca,modelo,patente').eq('cliente_id', cliente_id);
            vehiculos = vData || [];
            vehiculoSelect.innerHTML = '<option value="">Seleccionar vehículo</option>' + vehiculos.map(v => `<option value="${v.id}">${v.marca || ''} ${v.modelo || ''} (${v.patente || ''})</option>`).join('');
        } else {
            vehiculos = [];
            vehiculoSelect.innerHTML = '<option value="">Seleccione un cliente primero</option>';
        }
      };
    }

    formDiv.querySelector('#cancelar-turno-form').onclick = () => {
      formDiv.innerHTML = ''; // Limpiar el div del formulario
      // No ocultar el modal principal aquí, solo el form. El modal de lista de turnos sigue visible.
    };
    formDiv.querySelector('#turno-form').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = formDiv.querySelector('#turno-form-error');
      errorDiv.textContent = '';
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