import { supabase } from '../supabaseClient.js';

export async function renderInventario(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto py-8 px-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-blue-700">Inventario de productos</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <input type="text" id="buscar-producto" placeholder="Buscar producto..." class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button id="nuevo-producto" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition flex-shrink-0">+ Nuevo producto</button>
        </div>
      </div>
      <div id="productos-lista" class="space-y-4"></div>
      <div id="producto-form-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden"></div>
    </div>
  `;
  const listaDiv = document.getElementById('productos-lista');
  const buscarInput = document.getElementById('buscar-producto');
  const modal = document.getElementById('producto-form-modal');

  async function cargarProductos(filtro = '') {
    let query = supabase.from('productos').select('*,proveedores(nombre)').order('created_at', { ascending: false });
    if (filtro) {
      query = query.ilike('nombre', `%${filtro}%`);
    }
    const { data, error } = await query;
    if (error) {
      listaDiv.innerHTML = '<div class="text-red-600">Error al cargar productos</div>';
      return;
    }
    listaDiv.innerHTML = data.map(prod => `
      <div class="bg-white shadow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-100 ${prod.stock < 5 ? 'ring-2 ring-yellow-400' : ''}">
        <div>
          <div class="text-lg font-bold text-blue-800 flex items-center gap-2">
            ${prod.nombre}
            ${prod.stock < 5 ? '<span class=\'bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded\'>Stock bajo</span>' : ''}
          </div>
          <div class="text-gray-600 text-sm">${prod.tipo} ${prod.marca ? '· ' + prod.marca : ''} ${prod.compatible_con ? '· ' + prod.compatible_con : ''}</div>
          <div class="text-gray-400 text-xs">Proveedor: ${prod.proveedores?.nombre || '-'}</div>
          <div class="text-xs mt-1">Stock: <b>${prod.stock}</b> | Costo: $${prod.costo?.toFixed(2) || '0.00'} | Margen: ${(prod.margen*100)?.toFixed(0) || '0'}%<br> <b>Precio: $${prod.precio_calculado?.toFixed(2) || '0.00'}</b></div>
        </div>
        <div class="flex gap-2 mt-2 sm:mt-0">
          <button data-id="${prod.id}" class="editar-producto bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded font-semibold text-sm transition">Editar</button>
          <button data-id="${prod.id}" class="eliminar-producto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded font-semibold text-sm transition">Eliminar</button>
        </div>
      </div>
    `).join('') || '<p class="text-gray-500">No hay productos.</p>';
    document.querySelectorAll('.editar-producto').forEach(btn => {
      btn.onclick = () => mostrarFormProducto(btn.dataset.id);
    });
    document.querySelectorAll('.eliminar-producto').forEach(btn => {
      btn.onclick = () => eliminarProducto(btn.dataset.id);
    });
  }

  buscarInput.oninput = () => cargarProductos(buscarInput.value);
  document.getElementById('nuevo-producto').onclick = () => mostrarFormProducto();

  async function mostrarFormProducto(id) {
    let producto = { nombre: '', tipo: '', marca: '', compatible_con: '', proveedor_id: '', stock: 0, costo: 0, margen: 0.3 };
    if (id) {
      const { data } = await supabase.from('productos').select('*').eq('id', id).single();
      producto = data;
    }
    // Cargar proveedores para el select
    const { data: proveedores } = await supabase.from('proveedores').select('id,nombre').order('nombre');
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fade-in">
        <button id="cerrar-modal" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-blue-700">${id ? 'Editar' : 'Nuevo'} producto</h3>
        <form id="producto-form" class="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre" value="${producto.nombre || ''}" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select name="tipo" required class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Tipo</option>
            <option value="neumático" ${producto.tipo==='neumático'?'selected':''}>Neumático</option>
            <option value="repuesto" ${producto.tipo==='repuesto'?'selected':''}>Repuesto</option>
            <option value="aceite" ${producto.tipo==='aceite'?'selected':''}>Aceite</option>
            <option value="servicio" ${producto.tipo==='servicio'?'selected':''}>Servicio</option>
          </select>
          <input name="marca" placeholder="Marca" value="${producto.marca || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="compatible_con" placeholder="Compatible con..." value="${producto.compatible_con || ''}" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select name="proveedor_id" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Proveedor</option>
            ${proveedores.map(p => `<option value="${p.id}" ${producto.proveedor_id===p.id?'selected':''}>${p.nombre}</option>`).join('')}
          </select>
          <input name="stock" type="number" placeholder="Stock" value="${producto.stock || 0}" min="0" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="costo" type="number" step="0.01" placeholder="Costo" value="${producto.costo || 0}" min="0" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input name="margen" type="number" step="0.01" placeholder="Margen (ej: 0.30)" value="${producto.margen || 0.3}" min="0" max="1" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition">Guardar</button>
            <button type="button" id="cancelar-producto" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Cancelar</button>
          </div>
        </form>
        <div id="producto-form-error" class="text-red-600 text-sm mt-2"></div>
      </div>
    `;
    document.getElementById('cerrar-modal').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('cancelar-producto').onclick = () => { modal.classList.add('hidden'); };
    document.getElementById('producto-form').onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const nuevo = {
        nombre: form.nombre.value,
        tipo: form.tipo.value,
        marca: form.marca.value,
        compatible_con: form.compatible_con.value,
        proveedor_id: form.proveedor_id.value || null,
        stock: parseInt(form.stock.value, 10),
        costo: parseFloat(form.costo.value),
        margen: parseFloat(form.margen.value)
      };
      let res;
      if (id) {
        res = await supabase.from('productos').update(nuevo).eq('id', id);
      } else {
        res = await supabase.from('productos').insert([nuevo]);
      }
      if (res.error) {
        document.getElementById('producto-form-error').textContent = res.error.message;
      } else {
        modal.classList.add('hidden');
        cargarProductos(buscarInput.value);
      }
    };
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Eliminar producto?')) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) cargarProductos(buscarInput.value);
  }

  cargarProductos();
} 