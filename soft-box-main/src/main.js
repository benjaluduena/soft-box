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
import { notificationSystem } from './components/NotificationSystem.js';
import { quickActions } from './components/QuickActions.js';

// Elemento principal de la aplicación
const app = document.getElementById('app');

// Verificar si el elemento app existe
if (!app) {
  console.error('Elemento #app no encontrado en el DOM');
  throw new Error('Elemento #app no encontrado');
}

// Usuario actual para ruteo
let currentUser = null;
let globalShortcutsBound = false;

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
      currentUser = session.user;
      renderSidebar(app, currentUser);
      bindSidebarNavigation(currentUser);
      renderCurrentRoute();
      
      // Inicializar sistemas de mejora
      initializeEnhancementSystems();
      bindGlobalShortcuts();
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
    currentUser = user;
    renderSidebar(app, currentUser);
    bindSidebarNavigation(currentUser);
    renderCurrentRoute();
    
    // Inicializar sistemas de mejora
    initializeEnhancementSystems();
    bindGlobalShortcuts();
    
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
      const href = link.getAttribute('href');
      if (href) {
        location.hash = href;
      }
    });
  });
}

/**
 * Actualiza el estado visual del enlace activo en el sidebar
 */
function updateActiveNav() {
  const currentHash = window.location.hash || '#dashboard';
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(l => {
    l.classList.remove('bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'text-blue-600', 'shadow-md');
    const indicator = l.querySelector('.absolute');
    if (indicator) {
      indicator.classList.remove('opacity-100');
      indicator.classList.add('opacity-0');
    }
  });
  const active = document.querySelector(`nav a[href="${currentHash}"]`);
  if (active) {
    active.classList.add('bg-gradient-to-r', 'from-blue-50', 'to-indigo-50', 'text-blue-600', 'shadow-md');
    const indicator = active.querySelector('.absolute');
    if (indicator) {
      indicator.classList.remove('opacity-0');
      indicator.classList.add('opacity-100');
    }
  }
}

/**
 * Renderiza la ruta actual basada en location.hash
 */
function renderCurrentRoute() {
  const mainContent = document.querySelector('main');
  if (!mainContent) {
    console.error('Elemento main no encontrado');
    return;
  }
  mainContent.innerHTML = '';
  const hash = window.location.hash || '#dashboard';
  const routeHandlers = {
    '#dashboard': () => renderDashboard(mainContent),
    '#clientes': () => renderClientes(mainContent),
    '#inventario': () => renderInventario(mainContent),
    '#ventas': () => currentUser && renderVentas(mainContent, currentUser.id),
    '#compras': () => currentUser && renderCompras(mainContent, currentUser.id),
    '#turnos': () => renderTurnos(mainContent),
    '#proveedores': () => renderProveedores(mainContent),
    '#vehiculos': () => renderVehiculosGlobal(mainContent)
  };
  const handler = routeHandlers[hash] || routeHandlers['#dashboard'];
  try {
    handler();
  } catch (error) {
    console.error(`Error al renderizar ${hash}:`, error);
    mainContent.innerHTML = `
      <div class="p-8 text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p class="text-gray-600">No se pudo cargar el módulo solicitado</p>
      </div>
    `;
  }
  updateActiveNav();
}

// Escuchar cambios de hash para ruteo
window.addEventListener('hashchange', () => {
  if (currentUser) {
    renderCurrentRoute();
  }
});

/**
 * Inicializa los sistemas de mejora para el uso diario
 */
function initializeEnhancementSystems() {
  try {
    // Inicializar sistema de notificaciones
    notificationSystem.initialize();
    window.notificationSystem = notificationSystem;
    
    // Inicializar panel de acciones rápidas
    const quickActionsPanel = quickActions.render();
    document.body.appendChild(quickActionsPanel);
    
    // Agregar botón flotante para acciones rápidas
    addQuickActionsButton();
    
    console.log('Sistemas de mejora inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar sistemas de mejora:', error);
  }
}

/**
 * Agrega el botón flotante para abrir el panel de acciones rápidas
 */
function addQuickActionsButton() {
  const button = document.createElement('button');
  button.id = 'quick-actions-toggle';
  button.className = `
    fixed bottom-6 right-6 z-30 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 
    text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
    hover:scale-110 flex items-center justify-center
  `;
  button.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    </svg>
  `;
  
  button.addEventListener('click', () => quickActions.toggle());
  document.body.appendChild(button);
}

/**
 * Atajos globales de teclado para uso diario
 * - g d: Dashboard
 * - g c: Clientes
 * - g i: Inventario
 * - g v: Ventas
 * - g p: Compras
 * - g t: Turnos
 * - g r: Proveedores (suppliers)
 * - g h: Vehículos
 * - q: Toggle Acciones Rápidas
 * - Esc: Cierra modales visibles
 */
function bindGlobalShortcuts() {
  if (globalShortcutsBound) return;
  globalShortcutsBound = true;
  let gPressed = false;
  window.addEventListener('keydown', (e) => {
    // Ignorar entradas en formularios
    const tag = (e.target && e.target.tagName) || '';
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key.toLowerCase() === 'g' && !isTyping) {
        gPressed = true;
        setTimeout(() => { gPressed = false; }, 800);
        return;
      }
      if (gPressed) {
        const key = e.key.toLowerCase();
        const map = {
          d: '#dashboard',
          c: '#clientes',
          i: '#inventario',
          v: '#ventas',
          p: '#compras',
          t: '#turnos',
          r: '#proveedores',
          h: '#vehiculos',
        };
        if (map[key]) {
          e.preventDefault();
          location.hash = map[key];
          gPressed = false;
          return;
        }
      }
      // Toggle acciones rápidas
      if (e.key.toLowerCase() === 'q' && !isTyping) {
        e.preventDefault();
        quickActions.toggle();
        return;
      }
      // Cerrar modales con Esc
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.fixed.inset-0');
        openModals.forEach((m) => {
          // Intenta botón de cerrar si existe
          const close = m.querySelector('button[onclick], #cerrar-modal, .text-gray-400');
          if (close && typeof close.click === 'function') {
            close.click();
          } else if (m.parentNode) {
            m.parentNode.removeChild(m);
          }
        });
      }
    }
  });
}

// Inicializar la aplicación
checkAuth(); 