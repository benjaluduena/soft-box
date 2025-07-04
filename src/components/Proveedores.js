import { supabase } from '../supabaseClient.js';

export async function renderProveedores(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-blue-700">Proveedores</h2>
        <button id="nuevo-proveedor" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition">+ Nuevo proveedor</button>
      </div>
      <div id="proveedores-lista" class="space-y-4"></div>
      <div id="proveedor-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('proveedores-lista');
  const modal = document.getElementById('proveedor-form-modal');

  async function cargarProveedores() {
    const { data, error } = await supabase.from('proveedores').select('*').order('nombre');
    if (error) {
      listaDiv.innerHTML = '<div class="text-red-600">Error al cargar proveedores</div>';
      return;
    }
    listaDiv.innerHTML = (data || []).map(prov => `
      <div class="bg-white shadow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-100">
        <div>
          <div class="text-lg font-bold text-blue-800">${prov.nombre}</div>
          <div class="text-gray-600 text-sm">CUIT: ${prov.cuit || '-'} · Rubro: ${prov.rubro || '-'}</div>
          <div class="text-gray-400 text-xs">Tel: ${prov.telefono || '-'} · Email: ${prov.email || '-'}</div>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button data-id="${prov.id}" class="editar-proveedor bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-semibold text-sm transition">Editar</button>
          <button data-id="${prov.id}" class="eliminar-proveedor bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500">No hay proveedores.</p>';
    document.querySelectorAll('.editar-proveedor').forEach(btn => {
      btn.onclick = () => mostrarFormProveedor(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-proveedor').forEach(btn => {
      btn.onclick = () => eliminarProveedor(btn.dataset.id);
    });
  }

  document.getElementById('nuevo-proveedor').onclick = () => mostrarFormProveedor();

  async function mostrarFormProveedor(id) {
    let proveedor = { nombre: '', cuit: '', telefono: '', email: '', rubro: '' };
    if (id) {
      const { data } = await supabase.from('proveedores').select('*').eq('id', id).single();
      proveedor = data;
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">${id ? 'Editar' : 'Nuevo'} proveedor</h3>
        <form id="proveedor-form" class="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre" value="${proveedor.nombre || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="cuit" placeholder="CUIT" value="${proveedor.cuit || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="telefono" placeholder="Teléfono" value="${proveedor.telefono || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="email" placeholder="Email" value="${proveedor.email || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="rubro" placeholder="Rubro" value="${proveedor.rubro || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-proveedor" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="proveedor-form-error" class="text-red-600 text-sm mt-2"></div>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('cancelar-proveedor').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('proveedor-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        cuit: form.cuit.value,
        telefono: form.telefono.value,
        email: form.email.value,
        rubro: form.rubro.value
      };
      let res;
      if (id) {
        res = await supabase.from('proveedores').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('proveedores').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('proveedor-form-error').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarProveedores();
      }
    };
  }

  async function eliminarProveedor(id) {
    if (!confirm('¿Eliminar proveedor?')) return;
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (!error) cargarProveedores();
  }

  cargarProveedores();
} 