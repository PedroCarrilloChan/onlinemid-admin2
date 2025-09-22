import { Env } from '../../types'; // Ajusta la ruta a tus tipos si es necesario

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  // params.path será un array. Ej: para /customers/123, path es ['123']
  // Para /customers, path estará vacío o será undefined.
  const path = params.path as string[] || [];
  const id = path[0];

  // Manejo de CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- RUTAS SIN ID (/api/customers) ----
    if (!id) {
      if (request.method === 'GET') {
        const result = await env.DB.prepare('SELECT * FROM Clientes ORDER BY fecha_creacion DESC').all();
        return new Response(JSON.stringify(result.results ?? []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (request.method === 'POST') {
        const body = await request.json<{ nombre?: string; email_contacto?: string }>();
        if (!body.nombre || !body.email_contacto) throw new Error('Nombre y email son requeridos');

        const now = new Date().toISOString();
        const result = await env.DB.prepare(
          'INSERT INTO Clientes (nombre, email_contacto, fecha_creacion) VALUES (?, ?, ?)'
        ).bind(body.nombre, body.email_contacto, now).run();

        return new Response(JSON.stringify({ id: result.meta.last_row_id, ...body, fecha_creacion: now }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ---- RUTAS CON ID (/api/customers/123) ----
    if (id) {
      if (request.method === 'GET') {
        const result = await env.DB.prepare('SELECT * FROM Clientes WHERE id = ?').bind(id).first();
        if (!result) return new Response('Cliente no encontrado', { status: 404 });
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }

      if (request.method === 'PUT') {
        const body = await request.json<{ nombre?: string; email_contacto?: string }>();
        if (!body.nombre || !body.email_contacto) throw new Error('Nombre y email son requeridos');

        await env.DB.prepare('UPDATE Clientes SET nombre = ?, email_contacto = ? WHERE id = ?')
          .bind(body.nombre, body.email_contacto, id).run();

        return new Response(JSON.stringify({ id, ...body }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }

      if (request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM Clientes WHERE id = ?').bind(id).run();
        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }

    return new Response('Método no permitido', { status: 405, headers: corsHeaders });

  } catch (error: any) {
    console.error('Error en API de clientes:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};