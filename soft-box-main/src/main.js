import { supabase } from './supabaseClient.js';
import { renderLogin } from './components/Login.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderClientes } from './components/Clientes.js';
import { renderInventario } from './components/Inventario.js';
import { renderVentas } from './components/Ventas.js';
import { renderCompras } from './components/Compras.js';
import { renderTurnos } from './components/Turnos.js';
import { renderDashboard } from './components/Dashboard.js';
import { renderProveedores } from './components/Proveedores.js';
import { renderVehiculosGlobal } from './components/Vehiculos.js';

// Elemento principal de la aplicación
const app = document.getElementById('app');

// Verificar si el elemento app existe
if (!app) {
  console.error('Elemento #app no encontrado en el DOM');
  throw new Error('Elemento #app no encontrado');
}

/**
 * Oculta la pantalla de carga
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.transition = 'opacity 0.3s ease-out';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }
}

/**
 * Verifica la autenticación del usuario
 * Si no hay sesión activa, muestra el login
 * Si hay sesión, renderiza la aplicación principal
 */
async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error al verificar sesión:', error);
      renderLogin(app, onLoginSuccess);
      hideLoadingScreen();
      return;
    }
    
    if (!session) {
      renderLogin(app, onLoginSuccess);
    } else {
      renderSidebar(app, session.user);
      bindSidebarNavigation(session.user);
      renderDashboard(document.querySelector('main'));
    }
    
    // Ocultar pantalla de carga después de verificar auth
    hideLoadingScreen();
  } catch (error) {
    console.error('Error inesperado en checkAuth:', error);
    renderLogin(app, onLoginSuccess);
    hideLoadingScreen();
  }
}

/**
 * Callback ejecutado después de un login exitoso
 * @param {Object} user - Usuario autenticado
 */
function onLoginSuccess(user) {
  try {
    app.innerHTML = '';
    renderSidebar(app, user);
    bindSidebarNavigation(user);
    renderDashboard(document.querySelector('main'));
    hideLoadingScreen();
  } catch (error) {
    console.error('Error al renderizar después del login:', error);
    hideLoadingScreen();
  }
}

/**
 * Configura la navegación del sidebar
 * @param {Object} user - Usuario autenticado
 */
function bindSidebarNavigation(user) {
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remover estado activo de todos los enlaces
      navLinks.forEach(l => {
        l.classList.remove('bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'text-blue-600', 'shadow-md');
        const indicator = l.querySelector('.absolute');
        if (indicator) {
          indicator.classList.remove('opacity-100');
          indicator.classList.add('opacity-0');
        }
      });
      
      // Agregar estado activo al enlace clickeado
      link.classList.add('bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'text-blue-600', 'shadow-md');
      const activeIndicator = link.querySelector('.absolute');
      if (activeIndicator) {
        activeIndicator.classList.remove('opacity-0');
        activeIndicator.classList.add('opacity-100');
      }
      
      const mainContent = document.querySelector('main');
      if (!mainContent) {
        console.error('Elemento main no encontrado');
        return;
      }
      
      mainContent.innerHTML = '';
      
      // Mapeo de rutas a componentes
      const routeHandlers = {
        '#dashboard': () => renderDashboard(mainContent),
        '#clientes': () => renderClientes(mainContent),
        '#inventario': () => renderInventario(mainContent),
        '#ventas': () => renderVentas(mainContent, user.id),
        '#compras': () => renderCompras(mainContent, user.id),
        '#turnos': () => renderTurnos(mainContent),
        '#proveedores': () => renderProveedores(mainContent),
        '#vehiculos': () => renderVehiculosGlobal(mainContent)
      };
      
      const href = link.getAttribute('href');
      const handler = routeHandlers[href];
      
      if (handler) {
        try {
          handler();
        } catch (error) {
          console.error(`Error al renderizar ${href}:`, error);
          mainContent.innerHTML = `
            <div class="p-8 text-center">
              <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p class="text-gray-600">No se pudo cargar el módulo solicitado</p>
            </div>
          `;
        }
      }
    });
  });
}

// Inicializar la aplicación
checkAuth(); 