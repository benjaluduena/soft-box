# MCP Server para Supabase

Este es un servidor MCP (Model Context Protocol) que permite a los LLMs realizar consultas y operaciones en bases de datos de Supabase/PostgREST.

## Características

- **Consultas SQL personalizadas**: Ejecuta consultas SQL directamente en tu base de datos
- **Listado de tablas**: Obtén todas las tablas disponibles en tu base de datos
- **Esquemas de tabla**: Consulta la estructura de columnas de cualquier tabla
- **Operaciones CRUD**: Inserta, actualiza y elimina registros de forma segura
- **Manejo de errores**: Respuestas de error amigables y detalladas

## Herramientas Disponibles

### 1. `query_database`
Ejecuta una consulta SQL personalizada en la base de datos.

**Parámetros:**
- `query` (string): La consulta SQL a ejecutar

### 2. `list_tables`
Lista todas las tablas disponibles en la base de datos.

### 3. `get_table_schema`
Obtiene el esquema de una tabla específica.

**Parámetros:**
- `table_name` (string): Nombre de la tabla

### 4. `insert_record`
Inserta un registro en una tabla específica.

**Parámetros:**
- `table` (string): Nombre de la tabla
- `data` (object): Datos a insertar

### 5. `update_record`
Actualiza registros en una tabla específica.

**Parámetros:**
- `table` (string): Nombre de la tabla
- `data` (object): Datos a actualizar
- `filter` (object): Filtros para la actualización

### 6. `delete_record`
Elimina registros de una tabla específica.

**Parámetros:**
- `table` (string): Nombre de la tabla
- `filter` (object): Filtros para la eliminación

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Compilar el proyecto
```bash
npm run build
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en el directorio raíz del proyecto:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## Configuración en Cursor

### 1. Abrir Configuración de Cursor
- Ve a **Cursor Settings > Features > MCP**
- Haz clic en **"+ Add New MCP Server"**

### 2. Configurar el Servidor
- **Name**: `Supabase MCP Server`
- **Type**: `stdio`
- **Command**: `node C:\Users\benja\Escritorio\Soft-Box\soft-box-main\mcp-supabase\dist\index.js`

### 3. Variables de Entorno (Opcional)
Si prefieres no usar un archivo `.env`, puedes crear un script wrapper:

**Crear archivo `start-server.bat`:**
```batch
@echo off
set SUPABASE_URL=tu_url_de_supabase
set SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
node dist\index.js
```

Y usar este comando en Cursor:
```
C:\Users\benja\Escritorio\Soft-Box\soft-box-main\mcp-supabase\start-server.bat
```

## Uso

Una vez configurado, el servidor MCP estará disponible en Cursor Composer. Puedes:

1. **Hacer referencia a las herramientas por nombre** en tus prompts
2. **Describir la funcionalidad** que necesitas
3. **El agente automáticamente usará las herramientas** cuando sea relevante

### Ejemplos de Uso

```
"Lista todas las tablas en mi base de datos"
"Obtén el esquema de la tabla 'usuarios'"
"Inserta un nuevo usuario con nombre 'Juan' y email 'juan@ejemplo.com'"
"Ejecuta la consulta: SELECT * FROM ventas WHERE fecha >= '2024-01-01'"
```

## Seguridad

- El servidor usa la clave anónima de Supabase, que tiene permisos limitados
- Todas las consultas SQL se ejecutan a través de la API de Supabase
- Se recomienda configurar RLS (Row Level Security) en Supabase para mayor seguridad

## Solución de Problemas

### Error: "Faltan las credenciales de Supabase"
- Verifica que las variables de entorno `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén configuradas
- Asegúrate de que el archivo `.env` esté en el directorio correcto

### Error: "Herramienta desconocida"
- Verifica que el servidor esté compilado correctamente con `npm run build`
- Reinicia Cursor después de agregar el servidor MCP

### Error de conexión
- Verifica que tu URL de Supabase sea correcta
- Asegúrate de que tu clave anónima sea válida
- Verifica tu conexión a internet

## Desarrollo

### Compilar cambios
```bash
npm run build
```

### Ejecutar en modo desarrollo
```bash
npm run dev
```

## Licencia

MIT 