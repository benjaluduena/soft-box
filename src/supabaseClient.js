import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Obtener configuración de Supabase
const SUPABASE_URL = import.meta.env?.SUPABASE_URL || window.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;

// Validar que las credenciales estén disponibles
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Faltan las credenciales de Supabase');
  console.error('Asegúrate de que SUPABASE_URL y SUPABASE_ANON_KEY estén configurados');
  throw new Error('Credenciales de Supabase no configuradas');
}

// Crear cliente de Supabase con configuración optimizada
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Función helper para manejar errores de Supabase
export const handleSupabaseError = (error, context = '') => {
  if (error) {
    console.error(`Error de Supabase ${context}:`, error);
    
    // Mapear errores comunes a mensajes más amigables
    const errorMessages = {
      'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
      'Email not confirmed': 'Email no confirmado',
      'User not found': 'Usuario no encontrado',
      'Too many requests': 'Demasiadas solicitudes, intenta más tarde',
      'Network error': 'Error de conexión, verifica tu internet'
    };
    
    return {
      error: true,
      message: errorMessages[error.message] || error.message,
      originalError: error
    };
  }
  
  return { error: false };
};

// Función helper para validar respuestas de Supabase
export const validateSupabaseResponse = (response, context = '') => {
  if (response.error) {
    return handleSupabaseError(response.error, context);
  }
  
  return { error: false, data: response.data };
}; 