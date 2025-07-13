import { supabase, handleSupabaseError } from '../supabaseClient.js';

/**
 * Renderiza el componente de login
 * @param {HTMLElement} container - Contenedor donde renderizar el login
 * @param {Function} onSuccess - Callback ejecutado al login exitoso
 */
export function renderLogin(container, onSuccess) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div class="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 w-full max-w-sm border border-white/20">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">TireTask</h2>
          <p class="text-gray-600 text-sm">Taller Mecánico</p>
        </div>
        
        <!-- Formulario -->
        <form id="login-form" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              placeholder="tu@email.com" 
              required 
              autocomplete="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
            />
          </div>
          
          <button 
            type="submit" 
            id="login-btn"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span id="btn-text">Iniciar sesión</span>
            <span id="btn-loading" class="hidden">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando...
            </span>
          </button>
          
          <!-- Mensaje de error -->
          <div id="login-error" class="hidden text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3"></div>
        </form>
        
        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            Sistema de gestión para talleres mecánicos
          </p>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('login-error');
  const btnText = document.getElementById('btn-text');
  const btnLoading = document.getElementById('btn-loading');
  const loginBtn = document.getElementById('login-btn');

  // Función para mostrar/ocultar estado de carga
  const setLoading = (loading) => {
    loginBtn.disabled = loading;
    if (loading) {
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
    } else {
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
    }
  };

  // Función para mostrar errores
  const showError = (message) => {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  };

  // Función para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar contraseña
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ocultar errores previos
    errorDiv.classList.add('hidden');
    
    const email = form.email.value.trim();
    const password = form.password.value;

    // Validaciones del lado del cliente
    if (!email) {
      showError('Por favor ingresa tu correo electrónico');
      form.email.focus();
      return;
    }

    if (!validateEmail(email)) {
      showError('Por favor ingresa un correo electrónico válido');
      form.email.focus();
      return;
    }

    if (!password) {
      showError('Por favor ingresa tu contraseña');
      form.password.focus();
      return;
    }

    if (!validatePassword(password)) {
      showError('La contraseña debe tener al menos 6 caracteres');
      form.password.focus();
      return;
    }

    // Mostrar estado de carga
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        const errorInfo = handleSupabaseError(error, 'en login');
        showError(errorInfo.message);
        return;
      }

      if (data?.user) {
        // Login exitoso
        onSuccess(data.user);
      } else {
        showError('Error inesperado durante el inicio de sesión');
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      showError('Error de conexión. Verifica tu internet e intenta nuevamente');
    } finally {
      setLoading(false);
    }
  });

  // Auto-focus en el primer campo
  setTimeout(() => {
    form.email.focus();
  }, 100);
} 