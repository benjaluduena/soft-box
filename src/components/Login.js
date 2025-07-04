import { supabase } from '../supabaseClient.js';

export function renderLogin(container, onSuccess) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center text-blue-700">Iniciar sesión</h2>
        <form id="login-form" class="flex flex-col gap-4">
          <input type="email" id="email" placeholder="Correo" required autofocus class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="password" id="password" placeholder="Contraseña" required class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition">Ingresar</button>
          <div id="login-error" class="text-red-600 text-sm text-center"></div>
        </form>
      </div>
    </div>
  `;
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  form.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const email = form.email.value;
    const password = form.password.value;
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      errorDiv.textContent = error.message;
    } else {
      onSuccess(data.user);
    }
  };
} 