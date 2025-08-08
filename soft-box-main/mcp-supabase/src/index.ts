import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Faltan las credenciales de Supabase');
  console.error('Asegúrate de que SUPABASE_URL y SUPABASE_ANON_KEY estén configurados');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Definir las herramientas disponibles
const tools = [
  {
    name: "query_database",
    description: "Ejecuta una consulta SQL en la base de datos de Supabase",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "La consulta SQL a ejecutar"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "list_tables",
    description: "Lista todas las tablas disponibles en la base de datos",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_table_schema",
    description: "Obtiene el esquema de una tabla específica",
    inputSchema: {
      type: "object",
      properties: {
        table_name: {
          type: "string",
          description: "Nombre de la tabla"
        }
      },
      required: ["table_name"]
    }
  },
  {
    name: "insert_record",
    description: "Inserta un registro en una tabla específica",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "Nombre de la tabla"
        },
        data: {
          type: "object",
          description: "Datos a insertar"
        }
      },
      required: ["table", "data"]
    }
  },
  {
    name: "update_record",
    description: "Actualiza registros en una tabla específica",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "Nombre de la tabla"
        },
        data: {
          type: "object",
          description: "Datos a actualizar"
        },
        filter: {
          type: "object",
          description: "Filtros para la actualización"
        }
      },
      required: ["table", "data", "filter"]
    }
  },
  {
    name: "delete_record",
    description: "Elimina registros de una tabla específica",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "Nombre de la tabla"
        },
        filter: {
          type: "object",
          description: "Filtros para la eliminación"
        }
      },
      required: ["table", "filter"]
    }
  }
];

// Función para manejar errores de Supabase
const handleSupabaseError = (error: any, context: string = '') => {
  console.error(`Error de Supabase ${context}:`, error);
  
  const errorMessages: { [key: string]: string } = {
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
};

// Función para ejecutar consultas SQL personalizadas
const executeQuery = async (query: string) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      return handleSupabaseError(error, 'en consulta SQL');
    }
    
    return { error: false, data };
  } catch (error) {
    return handleSupabaseError(error, 'en consulta SQL');
  }
};

// Función para listar tablas
const listTables = async () => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      return handleSupabaseError(error, 'al listar tablas');
    }
    
    return { error: false, data: data.map((table: any) => table.table_name) };
  } catch (error) {
    return handleSupabaseError(error, 'al listar tablas');
  }
};

// Función para obtener esquema de tabla
const getTableSchema = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      return handleSupabaseError(error, 'al obtener esquema');
    }
    
    return { error: false, data };
  } catch (error) {
    return handleSupabaseError(error, 'al obtener esquema');
  }
};

// Función para insertar registro
const insertRecord = async (table: string, data: any) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      return handleSupabaseError(error, 'al insertar registro');
    }
    
    return { error: false, data: result };
  } catch (error) {
    return handleSupabaseError(error, 'al insertar registro');
  }
};

// Función para actualizar registro
const updateRecord = async (table: string, data: any, filter: any) => {
  try {
    let query = supabase.from(table).update(data);
    
    // Aplicar filtros
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data: result, error } = await query.select();
    
    if (error) {
      return handleSupabaseError(error, 'al actualizar registro');
    }
    
    return { error: false, data: result };
  } catch (error) {
    return handleSupabaseError(error, 'al actualizar registro');
  }
};

// Función para eliminar registro
const deleteRecord = async (table: string, filter: any) => {
  try {
    let query = supabase.from(table).delete();
    
    // Aplicar filtros
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data: result, error } = await query.select();
    
    if (error) {
      return handleSupabaseError(error, 'al eliminar registro');
    }
    
    return { error: false, data: result };
  } catch (error) {
    return handleSupabaseError(error, 'al eliminar registro');
  }
};

// Crear el servidor MCP
const server = new Server(
  {
    name: "supabase-mcp-server",
    version: "1.0.0",
  }
);

// Registrar el handler para listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Registrar el handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "query_database":
        const queryResult = await executeQuery(args?.query as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(queryResult, null, 2),
            },
          ],
        };

      case "list_tables":
        const tablesResult = await listTables();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tablesResult, null, 2),
            },
          ],
        };

      case "get_table_schema":
        const schemaResult = await getTableSchema(args?.table_name as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(schemaResult, null, 2),
            },
          ],
        };

      case "insert_record":
        const insertResult = await insertRecord(args?.table as string, args?.data as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(insertResult, null, 2),
            },
          ],
        };

      case "update_record":
        const updateResult = await updateRecord(args?.table as string, args?.data as any, args?.filter as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updateResult, null, 2),
            },
          ],
        };

      case "delete_record":
        const deleteResult = await deleteRecord(args?.table as string, args?.filter as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(deleteResult, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error ejecutando herramienta ${name}: ${error}`,
        },
      ],
      isError: true,
    };
  }
});

// Iniciar el servidor
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Servidor MCP de Supabase iniciado"); 