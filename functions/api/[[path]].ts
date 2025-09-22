
import { Env } from '../types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const path = params.path as string[] || [];
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Route: /api/customers
    if (path.length === 1 && path[0] === 'customers') {
      return await handleCustomersRoute(request, env);
    }
    
    // Route: /api/customers/{id}
    if (path.length === 2 && path[0] === 'customers') {
      const customerId = path[1];
      return await handleCustomerByIdRoute(request, env, customerId);
    }

    // Default 404 for unmatched routes
    return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function handleCustomersRoute(request: Request, env: Env) {
  if (request.method === 'GET') {
    // Get all customers
    const result = await env.DB.prepare('SELECT * FROM Clientes ORDER BY fecha_creacion DESC').all();
    return new Response(JSON.stringify(result.results || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    // Create new customer
    const body = await request.json<{ nombre?: string; email_contacto?: string }>();
    
    if (!body.nombre || !body.email_contacto) {
      return new Response(JSON.stringify({ 
        error: 'El nombre y el email son requeridos' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    const result = await env.DB.prepare(
      'INSERT INTO Clientes (nombre, email_contacto, fecha_creacion) VALUES (?, ?, ?)'
    ).bind(body.nombre, body.email_contacto, now).run();

    if (!result.success) {
      throw new Error('No se pudo crear el cliente');
    }

    return new Response(JSON.stringify({ 
      id: result.meta?.last_row_id, 
      nombre: body.nombre,
      email_contacto: body.email_contacto,
      fecha_creacion: now 
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Método no permitido' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCustomerByIdRoute(request: Request, env: Env, customerId: string) {
  if (request.method === 'GET') {
    // Get single customer
    const result = await env.DB.prepare('SELECT * FROM Clientes WHERE id = ?').bind(customerId).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'PUT') {
    // Update customer
    const body = await request.json<{ nombre?: string; email_contacto?: string }>();
    
    if (!body.nombre || !body.email_contacto) {
      return new Response(JSON.stringify({ 
        error: 'El nombre y el email son requeridos' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await env.DB.prepare(
      'UPDATE Clientes SET nombre = ?, email_contacto = ? WHERE id = ?'
    ).bind(body.nombre, body.email_contacto, customerId).run();

    if (!result.success) {
      throw new Error('No se pudo actualizar el cliente');
    }

    return new Response(JSON.stringify({ 
      id: customerId, 
      nombre: body.nombre,
      email_contacto: body.email_contacto
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'DELETE') {
    // Delete customer
    const result = await env.DB.prepare('DELETE FROM Clientes WHERE id = ?').bind(customerId).run();

    if (!result.success) {
      throw new Error('No se pudo eliminar el cliente');
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ error: 'Método no permitido' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
