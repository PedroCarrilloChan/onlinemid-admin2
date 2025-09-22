
import { Env } from '../types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (request.method === 'GET') {
      // Get all customers from D1 database
      const result = await env.DB.prepare('SELECT * FROM Clientes').all();
      
      return new Response(JSON.stringify(result.results), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
    
    if (request.method === 'POST') {
      const body = await request.json();
      const { nombre, email_contacto, fecha_creacion } = body;
      
      // Insert new customer
      const result = await env.DB.prepare(
        'INSERT INTO Clientes (nombre, email_contacto, fecha_creacion) VALUES (?, ?, ?)'
      ).bind(nombre, email_contacto, fecha_creacion || new Date().toISOString()).run();
      
      if (result.success) {
        return new Response(JSON.stringify({ 
          id: result.meta.last_row_id,
          nombre,
          email_contacto,
          fecha_creacion: fecha_creacion || new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } else {
        throw new Error('Failed to insert customer');
      }
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};
