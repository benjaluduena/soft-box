import { supabase } from '../supabaseClient.js';

export function renderLogin(container, onSuccess) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center" style="background-color: var(--color-fondo);">
      <div class="shadow-lg rounded-xl p-8 w-full max-w-sm modal-content-inner"> {/* Usando modal-content-inner para consistencia */}
        <img src="/img/logo.png" alt="TireTask Logo" class="w-24 h-24 mx-auto mb-4"/> {/* Asumiendo que tienes un logo */}
        <h2 class="text-2xl font-bold mb-6 text-center" style="color: var(--color-acento);">Iniciar sesión</h2>
        <form id="login-form" class="flex flex-col gap-4">
          <input type="email" id="email" placeholder="Correo electrónico" required autofocus />
          <input type="password" id="password" placeholder="Contraseña" required />
          <button type="submit" class="primary">Ingresar</button> {/* Usando clase de botón primario */}
          <div id="login-error" class="text-error text-sm text-center"></div> {/* Usando clase text-error */}
        </form>
      </div>
    </div>
  `;
  // Crear carpeta public/img y añadir un logo logo.png si no existe.
  // Por ahora, si no existe, el alt text se mostrará.
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