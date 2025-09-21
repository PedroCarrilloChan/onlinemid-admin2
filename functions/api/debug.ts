// functions/api/debug.ts
export const onRequestGet = async (context) => {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: 'Replit Development',
      isReplit: !!process.env.REPL_ID,
      nodeEnv: process.env.NODE_ENV || 'development',
      request: {
        url: context.request?.url || 'unknown',
        method: context.request?.method || 'unknown',
      },
      context: {
        hasEnv: !!context.env,
        hasParams: !!context.params,
        hasData: !!context.data
      },
      message: '✅ API funcionando correctamente en Replit'
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Error en debug endpoint',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};