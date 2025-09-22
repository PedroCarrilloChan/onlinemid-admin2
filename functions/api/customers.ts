// functions/api/customers.ts
// Datos mock para desarrollo en Replit
const MOCK_CUSTOMERS = [
  { id: 1, email: 'cliente1@example.com', nombre: 'Juan Pérez', createdAt: '2024-01-15T10:00:00Z' },
  { id: 2, email: 'cliente2@example.com', nombre: 'María García', createdAt: '2024-01-16T11:00:00Z' },
  { id: 3, email: 'admin@example.com', nombre: 'Admin Sistema', createdAt: '2024-01-17T12:00:00Z' },
  { id: 4, email: 'test@example.com', nombre: 'Usuario Test', createdAt: '2024-01-18T13:00:00Z' },
  { id: 5, email: 'demo@example.com', nombre: 'Usuario Demo', createdAt: '2024-01-19T14:00:00Z' }
];

// Esta función maneja las peticiones GET
export const onRequestGet = async (context) => {
  try {
    console.log('🔧 API /customers llamada - usando datos mock para Replit');

    // Simular un pequeño delay como si fuera una DB real
    await new Promise(resolve => setTimeout(resolve, 100));

    return new Response(JSON.stringify(MOCK_CUSTOMERS), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ Error en /api/customers:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener los clientes',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
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