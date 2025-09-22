import { Env } from '../../types'; // Ajusta la ruta a tus tipos si es necesario

// Headers de CORS para reutilizar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Se encarga de GET (para todos los clientes) y POST (para crear un cliente)
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Maneja la petición pre-vuelo de CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Método para OBTENER la lista de todos los clientes
    if (request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM Clientes ORDER BY fecha_creacion DESC').all();
      return new Response(JSON.stringify(result.results ?? []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Método para CREAR un nuevo cliente
    if (request.method === 'POST') {
      const body = await request.json<{ nombre?: string; email_contacto?: string }>();
      if (!body.nombre || !body.email_contacto) {
        throw new Error('El nombre y el email son requeridos');
      }

      const now = new Date().toISOString();
      const result = await env.DB.prepare(
        'INSERT INTO Clientes (nombre, email_contacto, fecha_creacion) VALUES (?, ?, ?)'
      ).bind(body.nombre, body.email_contacto, now).run();

      return new Response(JSON.stringify({ id: result.meta.last_row_id, ...body, fecha_creacion: now }), {
        status: 201, // 201 Created
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Si se usa otro método (PUT, DELETE, etc.), devuelve un error
    return new Response('Método no permitido', { status: 405, headers: corsHeaders });

  } catch (error: any) {
    console.error('Error en API:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};