import { supabase } from '../supabaseClient.js';

export async function renderVehiculos(container, cliente_id, onClose) {
  container.innerHTML = `
    <div class="max-w-lg mx-auto p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vehículos</h3>
        <button id="nuevo-vehiculo" class="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl shadow transition flex items-center gap-2">
          <span class="relative z-10">+ Nuevo vehículo</span>
          <span class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
        </button>
      </div>
      <div id="vehiculos-lista" class="space-y-4"></div>
      <button id="cerrar-vehiculos" class="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl transition">Cerrar</button>
      <div id="vehiculo-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden"></div>
    </div>`;
  const listaDiv = document.getElementById('vehiculos-lista');
  const modal = document.getElementById('vehiculo-form-modal');

  async function cargarVehiculos() {
    const { data, error } = await supabase.from('vehiculos').select('*').eq('cliente_id', cliente_id).order('created_at', { ascending: false });
    if (error) {
      listaDiv.innerHTML = 'Error al cargar vehículos';
      return;
    }
    listaDiv.innerHTML = data.map(v => `
      <div class="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow border border-white/20 hover:shadow-md hover:scale-[1.01] transition-all">
        <div class="font-bold text-blue-800">${v.marca || ''} ${v.modelo || ''} <span class='text-gray-500'>(${v.patente || ''})</span></div>
        <div class="text-gray-600 text-sm">Año: ${v.año || '-'}</div>
        <div class="flex gap-2 mt-3">
          <button data-id="${v.id}" class="editar-vehiculo bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg font-semibold text-sm transition">Editar</button>
          <button data-id="${v.id}" class="eliminar-vehiculo bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<div class="text-center text-gray-500 py-6">No hay vehículos registrados</div>';
    document.querySelectorAll('.editar-vehiculo').forEach(btn => {
      btn.onclick = () => mostrarFormVehiculo(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-vehiculo').forEach(btn => {
      btn.onclick = () => eliminarVehiculo(btn.dataset.id);
    });
  }

  document.getElementById('nuevo-vehiculo').onclick = () => mostrarFormVehiculo();
  document.getElementById('cerrar-vehiculos').onclick = onClose;

  async function mostrarFormVehiculo(id) {
    let vehiculo = { marca: '', modelo: '', patente: '', año: '' };
    if (id) {
      const { data } = await supabase.from('vehiculos').select('*').eq('id', id).single();
      vehiculo = data;
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Cerrar">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <h3 class="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">${id ? 'Editar' : 'Nuevo'} vehículo</h3>
        <form id="vehiculo-form" class="flex flex-col gap-3">
          <input name="marca" placeholder="Marca" value="${vehiculo.marca || ''}" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input name="modelo" placeholder="Modelo" value="${vehiculo.modelo || ''}" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input name="patente" placeholder="Patente" value="${vehiculo.patente || ''}" required class="uppercase tracking-wider px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input name="año" placeholder="Año" type="number" min="1900" max="${new Date().getFullYear()+1}" value="${vehiculo.año || ''}" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div class="flex gap-2 mt-2">
            <button type="submit" class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition">Guardar</button>
            <button type="button" id="cancelar-vehiculo" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl transition">Cancelar</button>
          </div>
        </form>
        <div id="vehiculo-form-error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
      </div>
    `;
    document.getElementById('cancelar-vehiculo').onclick = () => { modal.classList.add('hidden'); };
    // Cerrar con clic fuera
    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
    // Cerrar con Escape
    const onKey = (e) => { if (e.key === 'Escape') { modal.classList.add('hidden'); } };
    document.addEventListener('keydown', onKey, { once: true });
    document.getElementById('vehiculo-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        marca: form.marca.value.trim(),
        modelo: form.modelo.value.trim(),
        patente: form.patente.value.trim().toUpperCase(),
        año: parseInt(form.año.value, 10),
        cliente_id
      };
      let res;
      if (id) {
        res = await supabase.from('vehiculos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('vehiculos').insert([nuevo]);
      }
      if (res.error) {
        const err = document.getElementById('vehiculo-form-error');
        err.textContent = res.error.message;
        err.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
        cargarVehiculos();
      }
    };
    // Uppercase en vivo para patente
    const patenteInput = document.querySelector('#vehiculo-form input[name="patente"]');
    if (patenteInput) {
      patenteInput.addEventListener('input', () => {
        patenteInput.value = patenteInput.value.toUpperCase();
      });
    }
  }

  async function eliminarVehiculo(id) {
    if (!confirm('¿Eliminar vehículo?')) return;
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (!error) cargarVehiculos();
  }

  cargarVehiculos();
}

export async function renderVehiculosGlobal(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div class="max-w-5xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-2v13"/></svg>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vehículos</h2>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <input type="text" id="buscar-vehiculo" placeholder="Buscar por patente, marca, modelo o cliente..." class="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm" />
            <button id="nuevo-vehiculo-global" class="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl shadow transition flex-shrink-0">
              <span class="relative z-10">+ Nuevo vehículo</span>
              <span class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>
          </div>
        </div>
        <div id="vehiculos-lista-global" class="space-y-4"></div>
        <div id="vehiculo-form-modal-global" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden"></div>
      </div>
    </div>
  `;
  const listaDiv = document.getElementById('vehiculos-lista-global');
  const buscarInput = document.getElementById('buscar-vehiculo');
  const modal = document.getElementById('vehiculo-form-modal-global');

  async function cargarVehiculos(filtro = '') {
    let query = supabase.from('vehiculos').select('*,clientes(nombre)').order('created_at', { ascending: false });
    if (filtro) {
      query = query.or(`patente.ilike.%${filtro}%,marca.ilike.%${filtro}%,modelo.ilike.%${filtro}%,clientes.nombre.ilike.%${filtro}%`);
    }
    const { data, error } = await query;
    if (error) {
      listaDiv.innerHTML = '<div class="text-red-600">Error al cargar vehículos</div>';
      return;
    }
    listaDiv.innerHTML = (data || []).map(v => `
      <div class="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-white/20 shadow hover:shadow-md hover:scale-[1.01] transition-all">
        <div>
          <div class="text-lg font-bold text-blue-800">${v.marca || ''} ${v.modelo || ''} <span class='text-gray-500'>(${v.patente || ''})</span></div>
          <div class="text-gray-600 text-sm">Año: ${v.año || '-'} · Cliente: ${v.clientes?.nombre || '-'}</div>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button data-id="${v.id}" class="editar-vehiculo-global bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg font-semibold text-sm transition">Editar</button>
          <button data-id="${v.id}" class="eliminar-vehiculo-global bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<div class="text-center text-gray-500 py-8">No hay vehículos registrados</div>';
    document.querySelectorAll('.editar-vehiculo-global').forEach(btn => {
      btn.onclick = () => mostrarFormVehiculo(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-vehiculo-global').forEach(btn => {
      btn.onclick = () => eliminarVehiculo(btn.dataset.id);
    });
  }

  // Debounce de búsqueda
  const debounce = (fn, delay = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  };
  buscarInput.oninput = debounce(() => cargarVehiculos(buscarInput.value), 300);
  document.getElementById('nuevo-vehiculo-global').onclick = () => mostrarFormVehiculo();

  async function mostrarFormVehiculo(id) {
    let vehiculo = { marca: '', modelo: '', patente: '', año: '', cliente_id: '' };
    if (id) {
      const { data } = await supabase.from('vehiculos').select('*').eq('id', id).single();
      vehiculo = data;
    }
    // Cargar clientes para el select
    const { data: clientes } = await supabase.from('clientes').select('id,nombre').order('nombre');
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal-global" class="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Cerrar">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <h3 class="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">${id ? 'Editar' : 'Nuevo'} vehículo</h3>
        <form id="vehiculo-form-global" class="flex flex-col gap-3">
          <input name="marca" placeholder="Marca" value="${vehiculo.marca || ''}" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input name="modelo" placeholder="Modelo" value="${vehiculo.modelo || ''}" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input name="patente" placeholder="Patente" value="${vehiculo.patente || ''}" required class="uppercase tracking-wider px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input name="año" placeholder="Año" type="number" min="1900" max="${new Date().getFullYear()+1}" value="${vehiculo.año || ''}" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <div class="flex gap-2 items-center">
            <select name="cliente_id" required class="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Seleccionar cliente</option>
              ${clientes.map(c => `<option value="${c.id}" ${vehiculo.cliente_id===c.id?'selected':''}>${c.nombre}</option>`).join('')}
            </select>
            <button type="button" id="nuevo-cliente-desde-vehiculo" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-xl transition" title="Nuevo cliente">+</button>
          </div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition">Guardar</button>
            <button type="button" id="cancelar-vehiculo-global" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl transition">Cancelar</button>
          </div>
        </form>
        <div id="vehiculo-form-error-global" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
        <div id="modal-nuevo-cliente-desde-vehiculo" class="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden"></div>
      </div>
    `;
    document.getElementById('cerrar-modal-global').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('cancelar-vehiculo-global').onclick = () => { modal.classList.add('hidden'); };
    // Cerrar con clic fuera
    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.classList.add('hidden'); }, { once: true });
    document.getElementById('vehiculo-form-global').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        marca: form.marca.value.trim(),
        modelo: form.modelo.value.trim(),
        patente: form.patente.value.trim().toUpperCase(),
        año: parseInt(form.año.value, 10),
        cliente_id: form.cliente_id.value
      };
      let res;
      if (id) {
        res = await supabase.from('vehiculos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('vehiculos').insert([nuevo]);
      }
      if (res.error) {
        const err = document.getElementById('vehiculo-form-error-global');
        err.textContent = res.error.message;
        err.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
        cargarVehiculos(buscarInput.value);
      }
    };
    // Uppercase en vivo para patente (global)
    const patenteInput = document.querySelector('#vehiculo-form-global input[name="patente"]');
    if (patenteInput) {
      patenteInput.addEventListener('input', () => {
        patenteInput.value = patenteInput.value.toUpperCase();
      });
    }
    // Lógica para crear cliente desde el modal de vehículo
    document.getElementById('nuevo-cliente-desde-vehiculo').onclick = () => mostrarFormNuevoCliente();
    function mostrarFormNuevoCliente() {
      const modalCliente = document.getElementById('modal-nuevo-cliente-desde-vehiculo');
      modalCliente.classList.remove('hidden');
      modalCliente.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
          <button id="cerrar-modal-nuevo-cliente" class="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Cerrar">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <h3 class="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nuevo cliente</h3>
          <form id="form-nuevo-cliente" class="flex flex-col gap-3">
            <input name="nombre" placeholder="Nombre" required class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="telefono" placeholder="Teléfono" class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="email" placeholder="Email" class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <input name="direccion" placeholder="Dirección" class="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <div class="flex gap-2 mt-2">
              <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl transition">Guardar</button>
              <button type="button" id="cancelar-nuevo-cliente" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl transition">Cancelar</button>
            </div>
          </form>
          <div id="nuevo-cliente-error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm hidden"></div>
        </div>
      `;
      document.getElementById('cerrar-modal-nuevo-cliente').onclick = () => { modalCliente.classList.add('hidden'); };
      document.getElementById('cancelar-nuevo-cliente').onclick = () => { modalCliente.classList.add('hidden'); };
      modalCliente.onclick = (e) => { if (e.target === modalCliente) modalCliente.classList.add('hidden'); };
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modalCliente.classList.add('hidden'); }, { once: true });
      document.getElementById('form-nuevo-cliente').onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const nuevoCliente = {
          nombre: form.nombre.value.trim(),
          telefono: form.telefono.value.trim(),
          email: form.email.value.trim(),
          direccion: form.direccion.value.trim()
        };
        const { data, error } = await supabase.from('clientes').insert([nuevoCliente]).select().single();
        if (error) {
          const err = document.getElementById('nuevo-cliente-error');
          err.textContent = error.message;
          err.classList.remove('hidden');
        } else {
          // Agregar el nuevo cliente al select y seleccionarlo
          const select = document.querySelector('select[name="cliente_id"]');
          const option = document.createElement('option');
          option.value = data.id;
          option.textContent = data.nombre;
          select.appendChild(option);
          select.value = data.id;
          modalCliente.classList.add('hidden');
        }
      };
    }
  }

  async function eliminarVehiculo(id) {
    if (!confirm('¿Eliminar vehículo?')) return;
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (!error) cargarVehiculos(buscarInput.value);
  }

  cargarVehiculos();
} 