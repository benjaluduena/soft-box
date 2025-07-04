import { supabase } from '../supabaseClient.js';

export async function renderUsuarios(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto py-8 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-blue-700">Usuarios</h2>
        <button id="nuevo-usuario" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition">+ Nuevo usuario</button>
      </div>
      <div id="usuarios-lista" class="space-y-4"></div>
      <div id="usuario-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('usuarios-lista');
  const modal = document.getElementById('usuario-form-modal');

  async function cargarUsuarios() {
    const { data, error } = await supabase.from('profiles').select('id, nombre, apellido, rol').order('created_at');
    if (error) {
      listaDiv.innerHTML = '<div class="text-red-600">Error al cargar usuarios</div>';
      return;
    }
    // Obtener emails desde auth.users
    const { data: users } = await supabase.auth.admin.listUsers();
    const emailMap = {};
    (users?.users || []).forEach(u => { emailMap[u.id] = u.email; });
    listaDiv.innerHTML = (data || []).map(user => `
      <div class="bg-white shadow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-100">
        <div>
          <div class="text-lg font-bold text-blue-800">${user.nombre || ''} ${user.apellido || ''}</div>
          <div class="text-gray-600 text-sm">${emailMap[user.id] || ''}</div>
          <div class="text-gray-400 text-xs">Rol: <b>${user.rol}</b></div>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button data-id="${user.id}" class="editar-usuario bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-semibold text-sm transition">Editar</button>
          <button data-id="${user.id}" class="eliminar-usuario bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500">No hay usuarios.</p>';
    document.querySelectorAll('.editar-usuario').forEach(btn => {
      btn.onclick = () => mostrarFormUsuario(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-usuario').forEach(btn => {
      btn.onclick = () => eliminarUsuario(btn.dataset.id);
    });
  }

  document.getElementById('nuevo-usuario').onclick = () => mostrarFormUsuario();

  async function mostrarFormUsuario(id) {
    let usuario = { nombre: '', apellido: '', rol: 'empleado', email: '' };
    let esNuevo = true;
    if (id) {
      esNuevo = false;
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      usuario = data;
      // Obtener email
      const { data: userData } = await supabase.auth.admin.getUserById(id);
      usuario.email = userData?.user?.email || '';
    }
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">${esNuevo ? 'Invitar' : 'Editar'} usuario</h3>
        <form id="usuario-form" class="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre" value="${usuario.nombre || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="apellido" placeholder="Apellido" value="${usuario.apellido || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="email" type="email" placeholder="Email" value="${usuario.email || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" ${esNuevo ? '' : 'readonly'} />
          <select name="rol" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="admin" ${usuario.rol==='admin'?'selected':''}>Admin</option>
            <option value="empleado" ${usuario.rol==='empleado'?'selected':''}>Empleado</option>
            <option value="contador" ${usuario.rol==='contador'?'selected':''}>Contador</option>
          </select>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-usuario" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="usuario-form-error" class="text-red-600 text-sm mt-2"></div>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('cancelar-usuario').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('usuario-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        rol: form.rol.value
      };
      if (esNuevo) {
        // Invitar usuario (enviar email de invitación)
        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email: form.email.value,
          email_confirm: true
        });
        if (signUpError) {
          document.getElementById('usuario-form-error').textContent = signUpError.message;
          return;
        }
        // Crear profile
        await supabase.from('profiles').insert({
          id: signUpData.user.id,
          ...nuevo
        });
      } else {
        // Editar profile
        await supabase.from('profiles').update(nuevo).eq('id', id);
      }
      modal.classList.add('hidden');
      cargarUsuarios();
    };
  }

  async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar usuario?')) return;
    // Eliminar de profiles y de auth
    await supabase.from('profiles').delete().eq('id', id);
    await supabase.auth.admin.deleteUser(id);
    cargarUsuarios();
  }

  cargarUsuarios();
} 