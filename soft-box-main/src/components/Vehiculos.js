import { supabase } from '../supabaseClient.js';

export async function renderVehiculos(container, cliente_id, onClose) {
  container.innerHTML = `
    <div class="max-w-lg mx-auto py-6 px-4 bg-white rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-blue-700">Vehículos</h3>
        <button id="nuevo-vehiculo" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">+ Nuevo vehículo</button>
      </div>
      <div id="vehiculos-lista" class="space-y-4"></div>
      <button id="cerrar-vehiculos" class="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cerrar</button>
      <div id="vehiculo-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
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
      <div class="bg-white shadow rounded-xl p-4 border border-gray-100">
        <div class="font-bold text-blue-800">${v.marca || ''} ${v.modelo || ''} <span class='text-gray-500'>(${v.patente || ''})</span></div>
        <div class="text-gray-600 text-sm">Año: ${v.año || '-'}</div>
        <div class="flex gap-2 mt-2">
          <button data-id="${v.id}" class="editar-vehiculo bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-semibold text-sm transition">Editar</button>
          <button data-id="${v.id}" class="eliminar-vehiculo bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p>No hay vehículos.</p>';
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
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">${id ? 'Editar' : 'Nuevo'} vehículo</h3>
        <form id="vehiculo-form" class="flex flex-col gap-3">
          <input name="marca" placeholder="Marca" value="${vehiculo.marca || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="modelo" placeholder="Modelo" value="${vehiculo.modelo || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="patente" placeholder="Patente" value="${vehiculo.patente || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="año" placeholder="Año" type="number" value="${vehiculo.año || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-vehiculo" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="vehiculo-form-error" class="text-red-600 text-sm mt-2"></div>
      </div>
    `;
    document.getElementById('cancelar-vehiculo').onclick = () => { modal.style.display = 'none'; };
    // Cerrar con clic fuera
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    // Cerrar con Escape
    const onKey = (e) => { if (e.key === 'Escape') { modal.style.display = 'none'; } };
    document.addEventListener('keydown', onKey, { once: true });
    document.getElementById('vehiculo-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        marca: form.marca.value,
        modelo: form.modelo.value,
        patente: form.patente.value,
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
        document.getElementById('vehiculo-form-error').textContent = res.error.message;
      } else {
        modal.style.display = 'none';
        cargarVehiculos();
      }
    };
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
    <div class="max-w-4xl mx-auto py-8 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-blue-700">Vehículos</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <input type="text" id="buscar-vehiculo" placeholder="Buscar por patente, marca, modelo o cliente..." class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button id="nuevo-vehiculo-global" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition flex-shrink-0">+ Nuevo vehículo</button>
        </div>
      </div>
      <div id="vehiculos-lista-global" class="space-y-4"></div>
      <div id="vehiculo-form-modal-global" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
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
      <div class="bg-white shadow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-100">
        <div>
          <div class="text-lg font-bold text-blue-800">${v.marca || ''} ${v.modelo || ''} <span class='text-gray-500'>(${v.patente || ''})</span></div>
          <div class="text-gray-600 text-sm">Año: ${v.año || '-'} · Cliente: ${v.clientes?.nombre || '-'}</div>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button data-id="${v.id}" class="editar-vehiculo-global bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-semibold text-sm transition">Editar</button>
          <button data-id="${v.id}" class="eliminar-vehiculo-global bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500">No hay vehículos.</p>';
    document.querySelectorAll('.editar-vehiculo-global').forEach(btn => {
      btn.onclick = () => mostrarFormVehiculo(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-vehiculo-global').forEach(btn => {
      btn.onclick = () => eliminarVehiculo(btn.dataset.id);
    });
  }

  buscarInput.oninput = () => cargarVehiculos(buscarInput.value);
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
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal-global" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">${id ? 'Editar' : 'Nuevo'} vehículo</h3>
        <form id="vehiculo-form-global" class="flex flex-col gap-3">
          <input name="marca" placeholder="Marca" value="${vehiculo.marca || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="modelo" placeholder="Modelo" value="${vehiculo.modelo || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="patente" placeholder="Patente" value="${vehiculo.patente || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="año" placeholder="Año" type="number" value="${vehiculo.año || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <div class="flex gap-2 items-center">
            <select name="cliente_id" required class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Seleccionar cliente</option>
              ${clientes.map(c => `<option value="${c.id}" ${vehiculo.cliente_id===c.id?'selected':''}>${c.nombre}</option>`).join('')}
            </select>
            <button type="button" id="nuevo-cliente-desde-vehiculo" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded transition" title="Nuevo cliente">+</button>
          </div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-vehiculo-global" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="vehiculo-form-error-global" class="text-red-600 text-sm mt-2"></div>
        <div id="modal-nuevo-cliente-desde-vehiculo" class="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
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
        marca: form.marca.value,
        modelo: form.modelo.value,
        patente: form.patente.value,
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
        document.getElementById('vehiculo-form-error-global').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarVehiculos(buscarInput.value);
      }
    };
    // Lógica para crear cliente desde el modal de vehículo
    document.getElementById('nuevo-cliente-desde-vehiculo').onclick = () => mostrarFormNuevoCliente();
    function mostrarFormNuevoCliente() {
      const modalCliente = document.getElementById('modal-nuevo-cliente-desde-vehiculo');
      modalCliente.classList.remove('hidden');
      modalCliente.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
          <button id="cerrar-modal-nuevo-cliente" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
          <h3 class="text-xl font-bold mb-4 text-blue-700">Nuevo cliente</h3>
          <form id="form-nuevo-cliente" class="flex flex-col gap-3">
            <input name="nombre" placeholder="Nombre" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="telefono" placeholder="Teléfono" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="email" placeholder="Email" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="direccion" placeholder="Dirección" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div class="flex gap-2 mt-2">
              <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
              <button type="button" id="cancelar-nuevo-cliente" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
            </div>
          </form>
          <div id="nuevo-cliente-error" class="text-red-600 text-sm mt-2"></div>
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
          nombre: form.nombre.value,
          telefono: form.telefono.value,
          email: form.email.value,
          direccion: form.direccion.value
        };
        const { data, error } = await supabase.from('clientes').insert([nuevoCliente]).select().single();
        if (error) {
          document.getElementById('nuevo-cliente-error').textContent = error.message;
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