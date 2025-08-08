# Configuración del MCP Server en Cursor

## Pasos para Configurar el Servidor MCP de Supabase en Cursor

### 1. Obtener Credenciales de Supabase

Primero, necesitas obtener tus credenciales de Supabase:

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings > API**
4. Copia la **URL** y la **anon public key**

### 2. Configurar Variables de Entorno

**Opción A: Usar archivo .env**
1. Crea un archivo `.env` en el directorio `mcp-supabase`
2. Agrega tus credenciales:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**Opción B: Usar script wrapper**
1. Edita el archivo `start-server.bat`
2. Reemplaza las credenciales de ejemplo con las tuyas

### 3. Configurar en Cursor

1. **Abrir Configuración de Cursor**
   - Presiona `Ctrl + ,` o ve a **File > Preferences > Settings**
   - Busca "MCP" en la barra de búsqueda
   - Ve a **Features > MCP**

2. **Agregar Nuevo Servidor MCP**
   - Haz clic en **"+ Add New MCP Server"**

3. **Configurar el Servidor**
   - **Name**: `Supabase MCP Server`
   - **Type**: `stdio`
   - **Command**: 
     ```
     node C:\Users\benja\Escritorio\Soft-Box\soft-box-main\mcp-supabase\dist\index.js
     ```
   
   **Alternativa usando el script wrapper:**
   ```
   C:\Users\benja\Escritorio\Soft-Box\soft-box-main\mcp-supabase\start-server.bat
   ```

4. **Guardar Configuración**
   - Haz clic en **"Save"**
   - Reinicia Cursor si es necesario

### 4. Verificar la Instalación

1. Abre **Cursor Composer** (Ctrl + Shift + I)
2. Escribe un prompt como: "Lista todas las tablas en mi base de datos"
3. El agente debería usar automáticamente las herramientas del MCP

### 5. Comandos de Ejemplo

Una vez configurado, puedes usar comandos como:

```
"Lista todas las tablas en mi base de datos"
"Obtén el esquema de la tabla 'usuarios'"
"Inserta un nuevo cliente con nombre 'Juan Pérez' y email 'juan@ejemplo.com'"
"Ejecuta la consulta: SELECT * FROM ventas WHERE fecha >= '2024-01-01'"
"Actualiza el cliente con ID 1 para cambiar su email a 'nuevo@email.com'"
"Elimina el registro con ID 5 de la tabla 'clientes'"
```

### 6. Solución de Problemas

**Error: "Faltan las credenciales de Supabase"**
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el archivo `.env` esté en el directorio correcto

**Error: "Herramienta desconocida"**
- Verifica que el servidor esté compilado: `npm run build`
- Reinicia Cursor después de agregar el servidor MCP

**Error de conexión**
- Verifica que tu URL de Supabase sea correcta
- Asegúrate de que tu clave anónima sea válida
- Verifica tu conexión a internet

### 7. Herramientas Disponibles

- `query_database`: Ejecuta consultas SQL personalizadas
- `list_tables`: Lista todas las tablas disponibles
- `get_table_schema`: Obtiene el esquema de una tabla
- `insert_record`: Inserta un nuevo registro
- `update_record`: Actualiza registros existentes
- `delete_record`: Elimina registros

### 8. Seguridad

- El servidor usa la clave anónima de Supabase (permisos limitados)
- Todas las consultas se ejecutan a través de la API de Supabase
- Se recomienda configurar RLS (Row Level Security) en Supabase
- Nunca compartas tu archivo `.env` con credenciales reales 