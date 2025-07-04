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
import { renderUsuarios } from './components/Usuarios.js';
import { renderVehiculosGlobal } from './components/Vehiculos.js';
import { renderReportes } from './components/Reportes.js';

const app = document.getElementById('app');

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    renderLogin(app, onLoginSuccess);
  } else {
    renderSidebar(app, session.user);
    bindSidebarNavigation(session.user);
    renderDashboard(document.querySelector('main'));
  }
}

function onLoginSuccess(user) {
  app.innerHTML = '';
  renderSidebar(app, user);
  bindSidebarNavigation(user);
  renderDashboard(document.querySelector('main'));
}

function bindSidebarNavigation(user) {
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      if (link.getAttribute('href') === '#dashboard') {
        document.querySelector('main').innerHTML = '';
        renderDashboard(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#clientes') {
        document.querySelector('main').innerHTML = '';
        renderClientes(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#inventario') {
        document.querySelector('main').innerHTML = '';
        renderInventario(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#ventas') {
        document.querySelector('main').innerHTML = '';
        renderVentas(document.querySelector('main'), user.id);
      }
      if (link.getAttribute('href') === '#compras') {
        document.querySelector('main').innerHTML = '';
        renderCompras(document.querySelector('main'), user.id);
      }
      if (link.getAttribute('href') === '#turnos') {
        document.querySelector('main').innerHTML = '';
        renderTurnos(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#proveedores') {
        document.querySelector('main').innerHTML = '';
        renderProveedores(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#usuarios') {
        document.querySelector('main').innerHTML = '';
        renderUsuarios(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#vehiculos') {
        document.querySelector('main').innerHTML = '';
        renderVehiculosGlobal(document.querySelector('main'));
      }
      if (link.getAttribute('href') === '#reportes') {
        document.querySelector('main').innerHTML = '';
        renderReportes(document.querySelector('main'));
      }
      // Aquí puedes agregar más rutas para otros módulos
    };
  });
}

checkAuth(); 