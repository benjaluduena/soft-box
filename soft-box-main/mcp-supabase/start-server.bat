@echo off
REM Script para iniciar el servidor MCP de Supabase
REM Configura las variables de entorno y ejecuta el servidor

REM Configura aquí tus credenciales de Supabase
set SUPABASE_URL=https://tu-proyecto.supabase.co
set SUPABASE_ANON_KEY=tu_clave_anonima_aqui

REM Ejecutar el servidor
node dist\index.js 