import { supabase } from '../supabaseClient.js';
import { renderVehiculos } from './Vehiculos.js';

export async function renderClientes(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-blue-700">Clientes</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <input type="text" id="buscar-cliente" placeholder="Buscar cliente..." class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button id="nuevo-cliente" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition flex-shrink-0">+ Nuevo cliente</button>
        </div>
      </div>
      <div id="clientes-lista" class="space-y-4"></div>
      <div id="cliente-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
      <div id="vehiculos-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('clientes-lista');
  const buscarInput = document.getElementById('buscar-cliente');
  const modal = document.getElementById('cliente-form-modal');
  const vehiculosModal = document.getElementById('vehiculos-modal');

  async function cargarClientes(filtro = '') {
    let query = supabase.from('clientes').select('*').order('created_at', { ascending: false });
    if (filtro) {
      query = query.ilike('nombre', `%${filtro}%`);
    }
    const { data, error } = await query;
    if (error) {
      listaDiv.innerHTML = '<div class="text-red-600">Error al cargar clientes</div>';
      return;
    }
    listaDiv.innerHTML = data.map(cliente => `
      <div class="bg-white shadow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-100">
        <div>
          <div class="text-lg font-bold text-blue-800">${cliente.nombre}</div>
          <div class="text-gray-600 text-sm">${cliente.email || ''} ${cliente.telefono ? '· ' + cliente.telefono : ''}</div>
          <div class="text-gray-400 text-xs">${cliente.direccion || ''}</div>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button data-id="${cliente.id}" class="ver-vehiculos bg-gray-100 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded font-semibold text-sm transition">Vehículos</button>
          <button data-id="${cliente.id}" class="editar-cliente bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-semibold text-sm transition">Editar</button>
          <button data-id="${cliente.id}" class="eliminar-cliente bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500">No hay clientes.</p>';
    document.querySelectorAll('.ver-vehiculos').forEach(btn => {
      btn.onclick = () => mostrarVehiculos(btn.dataset.id);
    });
    document.querySelectorAll('.editar-cliente').forEach(btn => {
      btn.onclick = () => mostrarFormCliente(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-cliente').forEach(btn => {
      btn.onclick = () => eliminarCliente(btn.dataset.id);
    });
  }

  buscarInput.oninput = () => cargarClientes(buscarInput.value);
  document.getElementById('nuevo-cliente').onclick = () => mostrarFormCliente();

  async function mostrarFormCliente(id) {
    let cliente = { nombre: '', telefono: '', email: '', direccion: '' };
    if (id) {
      const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
      cliente = data;
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">${id ? 'Editar' : 'Nuevo'} cliente</h3>
        <form id="cliente-form" class="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre" value="${cliente.nombre || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="telefono" placeholder="Teléfono" value="${cliente.telefono || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="email" placeholder="Email" value="${cliente.email || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="direccion" placeholder="Dirección" value="${cliente.direccion || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-cliente" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="cliente-form-error" class="text-red-600 text-sm mt-2"></div>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('cancelar-cliente').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('cliente-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        telefono: form.telefono.value,
        email: form.email.value,
        direccion: form.direccion.value
      };
      let res;
      if (id) {
        res = await supabase.from('clientes').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('clientes').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('cliente-form-error').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarClientes(buscarInput.value);
      }
    };
  }

  async function eliminarCliente(id) {
    if (!confirm('¿Eliminar cliente?')) return;
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (!error) cargarClientes(buscarInput.value);
  }

  async function mostrarVehiculos(cliente_id) {
    vehiculosModal.classList.remove('hidden');
    renderVehiculos(vehiculosModal, cliente_id, () => vehiculosModal.classList.add('hidden'));
  }

  cargarClientes();
} 