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
  { href: '#reportes', label: 'Reportes', icon: '📈' },
];

export function renderSidebar(container, user) {
  container.innerHTML = `
    <aside class="sidebar">
      <div style="font-weight:bold; margin-bottom:1em;">TireTask</div>
      ${links.map(link => `<a href="${link.href}">${link.icon} ${link.label}</a>`).join('')}
      <button id="logout-btn" style="margin-top:auto;">Cerrar sesión</button>
    </aside>
    <main style="margin-left:210px; padding:2em;">
      <h1>¡Bienvenido, ${user.email}!</h1>
      <p>Selecciona una opción del menú.</p>
    </main>
  `;
  document.getElementById('logout-btn').onclick = async () => {
    await import('../supabaseClient.js').then(m => m.supabase.auth.signOut());
    window.location.reload();
  };
} 