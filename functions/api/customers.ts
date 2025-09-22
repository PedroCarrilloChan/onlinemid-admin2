// functions/api/customers.ts
import { getStorage } from '../shared/storage';

interface Env {
  DB?: D1Database;
  USERS_KV?: KVNamespace;
  USERNAME_INDEX_KV?: KVNamespace;
}

// GET - Obtener todos los clientes
export const onRequestGet = async (context: { env: Env }) => {
  try {
    console.log('🔧 API /customers llamada - conectando a base de datos real');

    const storage = getStorage(context.env);

    // Por ahora, como solo tenemos tabla de users, vamos a mostrar los usuarios
    // En el futuro puedes crear una tabla customers separada
    const result = await storage.getUser('demo-id'); // Esto es solo para probar la conexión

    // Si no hay conexión a DB, usar datos de fallback
    if (!context.env?.DB && !context.env?.USERS_KV) {
      console.log('⚠️ No hay DB configurada, usando datos de fallback');
      const fallbackData = [
        { id: 1, email: 'cliente1@example.com', nombre: 'Juan Pérez', createdAt: '2024-01-15T10:00:00Z' },
        { id: 2, email: 'cliente2@example.com', nombre: 'María García', createdAt: '2024-01-16T11:00:00Z' },
        { id: 3, email: 'admin@example.com', nombre: 'Admin Sistema', createdAt: '2024-01-17T12:00:00Z' }
      ];
      
      return new Response(JSON.stringify(fallbackData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Si hay D1 disponible, intentar obtener datos reales
    if (context.env.DB) {
      console.log('💾 Consultando base de datos D1...');
      
      // Usar la tabla Clientes que ya existe
      console.log('💾 Consultando tabla Clientes existente...');

      // Obtener todos los clientes de la tabla real
      const { results } = await context.env.DB.prepare("SELECT * FROM Clientes ORDER BY fecha_creacion DESC").all();
      
      console.log(`✅ Obtenidos ${results.length} clientes de la base de datos`);
      
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Fallback si algo sale mal
    throw new Error('No se pudo conectar a ninguna base de datos');

  } catch (error) {
    console.error('❌ Error en /api/customers:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener los clientes',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
      hasDB: !!context.env?.DB,
      hasKV: !!context.env?.USERS_KV
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

// POST - Crear nuevo cliente
export const onRequestPost = async (context: { env: Env; request: Request }) => {
  try {
    const { email, nombre } = await context.request.json();

    if (!email || !nombre) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email y nombre son requeridos'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (context.env.DB) {
      const result = await context.env.DB.prepare(`
        INSERT INTO Clientes (nombre, email_contacto) VALUES (?, ?)
      `).bind(nombre, email).run();

      if (result.success) {
        // Obtener el cliente recién creado
        const newCustomer = await context.env.DB.prepare(`
          SELECT * FROM Clientes WHERE id = ?
        `).bind(result.meta.last_row_id).first();

        return new Response(JSON.stringify({
          success: true,
          data: newCustomer
        }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    throw new Error('No se pudo crear el cliente');

  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al crear cliente',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

// Manejar OPTIONS para CORS
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};