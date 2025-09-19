// Interfaz para el entorno, incluyendo la base de datos D1
interface Env {
  DB: D1Database;
}

/**
 * Esta es la API PÚBLICA. Su trabajo es recibir el nombre de un dominio,
 * buscar su contenido en la base de datos y devolverlo.
 * Esta función será llamada por los sitios web de tus clientes.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // 1. Obtenemos el dominio del visitante desde los parámetros de la URL
    // Ejemplo: /api/public/content?domain=cliente-prueba.com
    const url = new URL(context.request.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return new Response(JSON.stringify({ error: 'Dominio no especificado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = context.env.DB;

    // 2. Buscamos el sitio web en la base de datos usando el dominio
    const siteQuery = db.prepare("SELECT id FROM SitiosWeb WHERE dominio = ?");
    const site = await siteQuery.bind(domain).first();

    if (!site) {
      return new Response(JSON.stringify({ error: 'Sitio no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sitioId = site.id;

    // 3. Obtenemos todo el contenido asociado a ese sitio
    const contentQuery = db.prepare("SELECT clave, valor FROM ContenidoWeb WHERE sitio_id = ?");
    const { results } = await contentQuery.bind(sitioId).all();

    // 4. Convertimos el resultado en un objeto JSON fácil de usar para el frontend
    const contentObject = results.reduce((obj, item) => {
      obj[item.clave] = item.valor;
      return obj;
    }, {});

    // 5. Devolvemos el contenido
    return new Response(JSON.stringify(contentObject), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        // Añadimos CORS para permitir que otros dominios (los de tus clientes) llamen a esta API
        'Access-Control-Allow-Origin': '*' 
      },
    });

  } catch (error) {
    console.error("Error en API pública:", error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

