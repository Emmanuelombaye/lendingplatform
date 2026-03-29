// Vercel Serverless Function entry point
export default async function (req: any, res: any) {
  try {
    const { default: app } = await import('./_src/app.js');
    
    // Ensure we log pathing for debugging
    console.log(`[VERCEL-API] Request: ${req.method} ${req.url} (Forwarding to Express)`);
    
    // Check if app is correctly imported
    if (!app) {
      throw new Error("Express app failed to import correctly");
    }

    // Hand over to Express
    return app(req, res);
  } catch (error: any) {
    console.error("[VERCEL-API-CRASH]", error);
    res.status(500).json({
      success: false,
      message: "Vercel API Entry Point Crash",
      error: error.message,
      stack: error.stack,
      env_check: {
        has_db_url: !!process.env.DATABASE_URL,
        has_supabase_url: !!process.env.SUPABASE_URL,
        node_env: process.env.NODE_ENV
      }
    });
  }
}
