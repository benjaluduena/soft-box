const links = [
  { href: '#dashboard', label: 'Dashboard', icon: '📊' },
  { href: '#clientes', label: 'Clientes', icon: '👥' },
  { href: '#inventario', label: 'Inventario', icon: '🛒' },
  { href: '#ventas', label: 'Ventas', icon: '💰' },
  { href: '#compras', label: 'Compras', icon: '📦' },
  { href: '#turnos', label: 'Turnos', icon: '📅' },
  { href: '#proveedores', label: 'Proveedores', icon: '🏢' },
  { href: '#usuarios', label: 'Usuarios', icon: '👤' },
  { href: '#vehiculos', label: 'Vehículos', icon: '🚗' },
  // { href: '#reportes', label: 'Reportes', icon: '📈' }, // Comentado temporalmente si no está implementado
];

export function renderSidebar(container, user) {
  // Limpiar el contenedor de la app antes de renderizar el sidebar y el main
  // Esto es importante si el login estaba ocupando todo el container.
  container.innerHTML = '';

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
      <img src="/img/logo-light.png" alt="Logo" class="w-8 h-8"/> {/* Logo para sidebar */}
      <span class="link-text">TireTask</span>
    </div>
    <nav class="flex flex-col gap-2">
      ${links.map(link => `
        <a href="${link.href}" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">
          <span class="text-xl">${link.icon}</span>
          <span class="link-text">${link.label}</span>
        </a>
      `).join('')}
    </nav>
    <button id="logout-btn" class="button danger mt-auto w-full"> {/* mt-auto para empujar al fondo, w-full y clases de botón */}
      <span class="text-xl">🚪</span> {/* Ícono de salir */}
      <span class="link-text">Cerrar sesión</span>
    </button>
  `;
  container.appendChild(sidebar);

  const mainContent = document.createElement('main');
  // El contenido inicial de main se cargará por renderDashboard o la ruta activa.
  // No es necesario poner el saludo aquí, main.js lo maneja.
  container.appendChild(mainContent);

  document.getElementById('logout-btn').onclick = async () => {
    await import('../supabaseClient.js').then(m => m.supabase.auth.signOut());
    window.location.reload();
  };

  // Activar el link actual
  function setActiveLink() {
    const currentHash = window.location.hash || '#dashboard';
    sidebar.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === currentHash) {
        a.classList.add('active'); // 'active' class definida en new_styles.css
      } else {
        a.classList.remove('active');
      }
    });
  }
  window.addEventListener('hashchange', setActiveLink);
  setActiveLink(); // Set initial active link
} 