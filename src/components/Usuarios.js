import { supabase } from '../supabaseClient.js';

export async function renderUsuarios(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-6 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold" style="color: var(--color-acento);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4S8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          Gestión de Usuarios
        </h2>
        <button id="nuevo-usuario" class="button primary flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4S11 5.79 11 8s1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          Invitar Usuario
        </button>
      </div>
      <div id="usuarios-lista" class="space-y-4"></div>
      <div id="usuario-form-modal" class="modal-overlay hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('usuarios-lista');
  const modal = document.getElementById('usuario-form-modal');

  async function cargarUsuarios() {
    // Primero, obtener los perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nombre, apellido, rol, created_at') // Asegúrate de que created_at esté en la tabla profiles
      .order('created_at', { ascending: false }); // O por nombre: .order('nombre')

    if (profilesError) {
      listaDiv.innerHTML = `<div class="text-error p-4 text-center">Error al cargar perfiles: ${profilesError.message}</div>`;
      return;
    }

    // Luego, obtener todos los usuarios de auth para mapear emails
    // Esto requiere permisos de admin en las RLS de Supabase o llamar a una edge function con service_role
    let emailMap = {};
    try {
        const { data: usersList, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;
        (usersList?.users || []).forEach(u => { emailMap[u.id] = u.email; });
    } catch (e) {
        console.warn("No se pudieron cargar los emails de los usuarios (requiere privilegios de admin):", e.message);
        // Continuar sin emails si falla, o mostrar un mensaje parcial.
    }

    if (!profiles || profiles.length === 0) {
      listaDiv.innerHTML = '<p class="no-data-placeholder">No hay usuarios registrados. ¡Invita al primero!</p>';
      return;
    }

    listaDiv.innerHTML = profiles.map(user => {
      let rolBadgeClass = 'badge-neutral';
      if (user.rol === 'admin') rolBadgeClass = 'badge-danger'; // Admin en rojo para destacar
      else if (user.rol === 'contador') rolBadgeClass = 'badge-info';

      return `
      <div class="list-item-card">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 class="item-title">${user.nombre || 'Usuario'} ${user.apellido || ''}</h3>
            <p class="item-subtitle">${emailMap[user.id] || 'Email no disponible'}</p>
            <p class="item-subtitle mt-1">Rol: <span class="badge ${rolBadgeClass}">${user.rol}</span></p>
          </div>
          <div class="item-actions mt-3 sm:mt-0">
            <button data-id="${user.id}" class="button editar-usuario" style="background-color: var(--color-advertencia); color:white;">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"/></svg>
              Editar
            </button>
            <button data-id="${user.id}" class="button danger eliminar-usuario">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `}).join('');
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
      <div class="modal-content-inner max-w-lg">
        <button id="cerrar-modal" class="close-modal-btn">&times;</button>
        <h3 class="text-xl font-bold mb-5">${esNuevo ? 'Invitar Nuevo Usuario' : 'Editar Usuario'}</h3>
        <form id="usuario-form" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="nombre_usr" class="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" name="nombre" id="nombre_usr" value="${usuario.nombre || ''}" required />
            </div>
            <div>
              <label for="apellido_usr" class="block text-sm font-medium mb-1">Apellido</label>
              <input type="text" name="apellido" id="apellido_usr" value="${usuario.apellido || ''}" />
            </div>
          </div>
          <div>
            <label for="email_usr" class="block text-sm font-medium mb-1">Correo Electrónico ${esNuevo ? '(Se enviará una invitación)' : '(No editable)'}</label>
            <input type="email" name="email" id="email_usr" value="${usuario.email || ''}" required ${esNuevo ? '' : 'readonly style="background-color: var(--color-fondo); cursor: not-allowed;"'} />
          </div>
          <div>
            <label for="rol_usr" class="block text-sm font-medium mb-1">Rol del Usuario</label>
            <select name="rol" id="rol_usr" required>
              <option value="admin" ${usuario.rol === 'admin' ? 'selected' : ''}>Administrador</option>
              <option value="empleado" ${usuario.rol === 'empleado' ? 'selected' : ''}>Empleado</option>
              <option value="contador" ${usuario.rol === 'contador' ? 'selected' : ''}>Contador</option>
            </select>
          </div>
          <div id="usuario-form-error" class="text-error text-sm mt-1"></div>
          <div class="flex gap-3 mt-4">
            <button type="submit" class="button primary w-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3zM6 6h9v4H6z"/></svg>
              ${esNuevo ? 'Enviar Invitación' : 'Actualizar Usuario'}
            </button>
            <button type="button" id="cancelar-usuario" class="button secondary w-full">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('cancelar-usuario').onclick = () => { modal.classList.add('hidden'); modal.innerHTML = ''; };
    document.getElementById('usuario-form').onsubmit = async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('usuario-form-error');
      errorDiv.textContent = '';
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