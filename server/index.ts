import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { connectDB } from "./db";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

// ... (middleware setup remains same) ...
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await connectDB(); // Connect to Mongo

    console.log("👉 Registering routes...");
    await registerRoutes(httpServer, app);
    console.log("✅ Routes registered");
  } catch (err) {
    console.error("❌ Error during startup:", err);
    process.exit(1);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // Vite setup for dev
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  console.log(`🚀 Starting server on port ${port}...`);

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
})();
