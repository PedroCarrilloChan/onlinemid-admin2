import { Env } from '../../types'; // Ajusta la ruta a tus tipos si es necesario

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Se encarga de GET (para un cliente), PUT (actualizar) y DELETE (eliminar)
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = params.id as string; // Obtenemos el ID desde la URL, ej: /api/customers/123

  if (!id) {
    return new Response('ID de cliente no proporcionado', { status: 400 });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Método para OBTENER un solo cliente por su ID
    if (request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM Clientes WHERE id = ?').bind(id).first();
      if (!result) return new Response('Cliente no encontrado', { status: 404 });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // Método para ACTUALIZAR un cliente por su ID
    if (request.method === 'PUT') {
      const body = await request.json<{ nombre?: string; email_contacto?: string }>();
      if (!body.nombre || !body.email_contacto) throw new Error('Nombre y email son requeridos');

      await env.DB.prepare('UPDATE Clientes SET nombre = ?, email_contacto = ? WHERE id = ?')
        .bind(body.nombre, body.email_contacto, id).run();

      return new Response(JSON.stringify({ id, ...body }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // Método para ELIMINAR un cliente por su ID
    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM Clientes WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders }); // 204 No Content
    }

    return new Response('Método no permitido', { status: 405, headers: corsHeaders });

  } catch (error: any) {
    console.error(`Error en API para ID ${id}:`, error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};