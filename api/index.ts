import app from '../backend/src/app';

// Vercel Serverless Function entry point
export default function (req: any, res: any) {
  // Ensure we log pathing for debugging if needed
  console.log(`[VERCEL-API] Request: ${req.method} ${req.url}`);
  
  // Hand over to Express
  return app(req, res);
}
