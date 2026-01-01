import { supabase, handleSupabaseError } from '../supabaseClient.js';

/**
 * Renderiza el componente de registro
 * @param {HTMLElement} container - Contenedor donde renderizar el registro
 * @param {Function} onSuccess - Callback ejecutado al registro exitoso
 * @param {Function} onBackToLogin - Callback para volver al login
 */
export function renderSignup(container, onSuccess, onBackToLogin) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div class="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/20">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
          <p class="text-gray-600 text-sm">Únete a TireTask</p>
        </div>
        
        <!-- Formulario -->
        <form id="signup-form" class="space-y-4">
          <!-- Nombre completo -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName"
              placeholder="Juan Pérez" 
              required 
              autocomplete="name"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
            />
          </div>

          <!-- Email -->
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

          <!-- Teléfono -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Teléfono (opcional)</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              placeholder="+54 9 11 1234-5678" 
              autocomplete="tel"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
            />
          </div>
          
          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div class="relative">
              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder="••••••••" 
                required 
                autocomplete="new-password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
              />
              <button 
                type="button" 
                id="toggle-password"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg id="eye-icon" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <div class="mt-1 text-xs text-gray-500">
              Mínimo 6 caracteres, incluir mayúsculas, minúsculas y números
            </div>
          </div>

          <!-- Confirmar contraseña -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
            <div class="relative">
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                placeholder="••••••••" 
                required 
                autocomplete="new-password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200" 
              />
              <button 
                type="button" 
                id="toggle-confirm-password"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg id="eye-confirm-icon" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Términos y condiciones -->
          <div class="flex items-start space-x-3">
            <input 
              type="checkbox" 
              id="terms" 
              name="terms"
              required
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="terms" class="text-sm text-gray-700">
              Acepto los 
              <a href="#" class="text-blue-600 hover:text-blue-800 underline">términos y condiciones</a> 
              y la 
              <a href="#" class="text-blue-600 hover:text-blue-800 underline">política de privacidad</a>
            </label>
          </div>
          
          <button 
            type="submit" 
            id="signup-btn"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span id="btn-text">Crear cuenta</span>
            <span id="btn-loading" class="hidden">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando cuenta...
            </span>
          </button>
          
          <!-- Mensaje de error -->
          <div id="signup-error" class="hidden text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3"></div>

          <!-- Mensaje de éxito -->
          <div id="signup-success" class="hidden text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded-lg p-3"></div>
        </form>
        
        <!-- Enlace para volver al login -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes una cuenta? 
            <button 
              id="back-to-login"
              class="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            Sistema de gestión para talleres mecánicos
          </p>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('signup-form');
  const errorDiv = document.getElementById('signup-error');
  const successDiv = document.getElementById('signup-success');
  const btnText = document.getElementById('btn-text');
  const btnLoading = document.getElementById('btn-loading');
  const signupBtn = document.getElementById('signup-btn');
  const backToLoginBtn = document.getElementById('back-to-login');

  // Configurar toggle de contraseñas
  setupPasswordToggles();

  // Función para mostrar/ocultar estado de carga
  const setLoading = (loading) => {
    signupBtn.disabled = loading;
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
    successDiv.classList.add('hidden');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  };

  // Función para mostrar éxito
  const showSuccess = (message) => {
    errorDiv.classList.add('hidden');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
  };

  // Función para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar contraseña
  const validatePassword = (password) => {
    // Mínimo 6 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  // Función para validar teléfono
  const validatePhone = (phone) => {
    if (!phone) return true; // Opcional
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Manejar envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ocultar mensajes previos
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const terms = form.terms.checked;

    // Validaciones del lado del cliente
    if (!fullName) {
      showError('Por favor ingresa tu nombre completo');
      form.fullName.focus();
      return;
    }

    if (fullName.length < 2) {
      showError('El nombre debe tener al menos 2 caracteres');
      form.fullName.focus();
      return;
    }

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

    if (phone && !validatePhone(phone)) {
      showError('Por favor ingresa un número de teléfono válido');
      form.phone.focus();
      return;
    }

    if (!password) {
      showError('Por favor ingresa una contraseña');
      form.password.focus();
      return;
    }

    if (!validatePassword(password)) {
      showError('La contraseña debe tener al menos 6 caracteres, incluir mayúsculas, minúsculas y números');
      form.password.focus();
      return;
    }

    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden');
      form.confirmPassword.focus();
      return;
    }

    if (!terms) {
      showError('Debes aceptar los términos y condiciones');
      return;
    }

    // Mostrar estado de carga
    setLoading(true);

    try {
      // Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null
          }
        }
      });

      if (error) {
        const errorInfo = handleSupabaseError(error, 'en el registro');
        showError(errorInfo.message);
        return;
      }

      if (data?.user) {
        // Registro exitoso
        showSuccess('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.');
        
        // Limpiar formulario
        form.reset();
        
        // Opcional: redirigir al login después de 3 segundos
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          }
        }, 3000);
      } else {
        showError('Error inesperado durante el registro');
      }
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      showError('Error de conexión. Verifica tu internet e intenta nuevamente');
    } finally {
      setLoading(false);
    }
  });

  // Manejar botón de volver al login
  backToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (onBackToLogin) {
      onBackToLogin();
    }
  });

  // Auto-focus en el primer campo
  setTimeout(() => {
    form.fullName.focus();
  }, 100);
}

/**
 * Configura los toggles de visibilidad de contraseñas
 */
function setupPasswordToggles() {
  const togglePassword = document.getElementById('toggle-password');
  const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeConfirmIcon = document.getElementById('eye-confirm-icon');

  // Toggle para contraseña principal
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Cambiar icono
    if (type === 'text') {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
      `;
    } else {
      eyeIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      `;
    }
  });

  // Toggle para confirmar contraseña
  toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    
    // Cambiar icono
    if (type === 'text') {
      eyeConfirmIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
      `;
    } else {
      eyeConfirmIcon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      `;
    }
  });
}
