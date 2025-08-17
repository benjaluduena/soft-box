# TireTask - Sistema de Gestión para Talleres Mecánicos

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)


Sistema de gestión integral para talleres mecánicos y gomerías, desarrollado con tecnologías modernas y una interfaz intuitiva.

## 🚀 Características

- **🔐 Autenticación segura** con Supabase Auth
- **👥 Gestión de clientes** y vehículos
- **📦 Control de inventario** con alertas de stock bajo
- **💰 Registro de ventas** y compras
- **📅 Sistema de turnos** y citas
- **📊 Dashboard** con estadísticas en tiempo real
- **🏢 Gestión de proveedores**
- **📱 Diseño responsive** para móviles y tablets
- **⚡ Interfaz moderna** con Tailwind CSS

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados
- **JavaScript ES6+** - Lógica de la aplicación
- **Tailwind CSS** - Framework de utilidades CSS

### Backend
- **Supabase** - Base de datos PostgreSQL
- **Supabase Auth** - Autenticación y autorización
- **Supabase Realtime** - Actualizaciones en tiempo real

## 📦 Instalación

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para Supabase

### Configuración

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/tiretask.git
   cd tiretask
   ```

2. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

3. **Ejecuta la aplicación**
   
   **Opción A: Servidor local (recomendado)**
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx serve public
   
   # Con PHP
   php -S localhost:8000
   ```
   
   **Opción B: Abrir directamente**
   - Abre `public/index.html` en tu navegador
   - ⚠️ Algunas funcionalidades pueden no funcionar por restricciones CORS

4. **Accede a la aplicación**
   - Abre tu navegador y ve a `http://localhost:8000`
   - Inicia sesión con tus credenciales

## 🗂️ Estructura del Proyecto

```
soft-box-main/
├── public/
│   ├── index.html          # Página principal
│   └── styles.css          # Estilos personalizados
├── src/
│   ├── components/         # Componentes de la aplicación
│   │   ├── Login.js        # Componente de autenticación
│   │   ├── Sidebar.js      # Navegación lateral
│   │   ├── Dashboard.js    # Panel principal
│   │   ├── Clientes.js     # Gestión de clientes
│   │   ├── Inventario.js   # Control de inventario
│   │   ├── Ventas.js       # Registro de ventas
│   │   ├── Compras.js      # Gestión de compras
│   │   ├── Turnos.js       # Sistema de citas
│   │   ├── Proveedores.js  # Gestión de proveedores
│   │   └── Vehiculos.js    # Registro de vehículos
│   ├── main.js             # Punto de entrada
│   └── supabaseClient.js   # Cliente de Supabase
├── bd.txt                  # Esquema de base de datos
└── README.md               # Documentación
```

## 🔧 Módulos Principales

### 🔐 Autenticación
- Login seguro con email y contraseña
- Gestión de sesiones
- Protección de rutas

### 📊 Dashboard
- Estadísticas en tiempo real
- Gráficos de ventas y compras
- Alertas de stock bajo
- Próximos turnos

### 👥 Clientes
- Registro de clientes
- Historial de servicios
- Información de vehículos
- Búsqueda y filtros

### 📦 Inventario
- Control de stock
- Alertas automáticas
- Categorización de productos
- Historial de movimientos

### 💰 Ventas
- Registro de transacciones
- Múltiples métodos de pago
- Generación de facturas
- Reportes de ventas

### 🛒 Compras
- Gestión de proveedores
- Órdenes de compra
- Control de costos
- Historial de compras

### 📅 Turnos
- Sistema de citas
- Calendario interactivo
- Notificaciones
- Gestión de horarios

## 🎨 Características de UI/UX

- **Diseño responsive** que se adapta a cualquier dispositivo
- **Interfaz moderna** con gradientes y efectos glassmorphism
- **Navegación intuitiva** con iconos descriptivos
- **Feedback visual** para todas las acciones
- **Accesibilidad** con soporte para navegación por teclado
- **Modo oscuro** (próximamente)

## 🔒 Seguridad

- Autenticación segura con Supabase
- Validación de datos en frontend y backend
- Protección contra inyección SQL
- Manejo seguro de sesiones
- CORS configurado correctamente

