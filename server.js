// CarbonTrack AI - Main Server
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import predictRoute from "./routes/predict.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "CarbonTrack AI Server Running",
    message: "Smart Carbon Emission Prediction System",
    version: "1.0.0",
    features: [
      "ml_emission_prediction",
      "model_training",
      "forecast_generation",
      "accuracy_comparison",
      "sample_datasets"
    ],
    endpoints: {
      train: "POST /api/predict/train",
      forecast: "POST /api/predict/forecast",
      compare: "POST /api/predict/compare",
      models: "GET /api/predict/models",
      sampleData: "GET /api/predict/sample-data"
    }
  });
});

// API Status endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    services: {
      prediction: "available",
      training: "available",
      comparison: "available"
    },
    version: "1.0.0"
  });
});

// ML Prediction routes
app.use("/api/predict", predictRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🌍 CarbonTrack AI Server Running                 ║
║                                                            ║
║   Smart Carbon Emission Prediction System v1.0.0          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📊 Features:
   • ML Emission Prediction
   • Model Training
   • Forecast Generation
   • Accuracy Comparison
   • 15+ Sample Datasets

📡 Endpoints:
   • POST /api/predict/train       - Train prediction model
   • POST /api/predict/forecast    - Generate forecasts
   • POST /api/predict/compare     - Compare with actuals
   • GET  /api/predict/models      - List trained models
   • GET  /api/predict/sample-data - Get sample data

🌐 Open http://localhost:${PORT} in your browser

📁 Sample datasets available in /data folder:
   • Tesla, Apple, Microsoft, Amazon
   • Tata Steel, Reliance, Infosys, Wipro
   • HDFC Bank, ICICI Bank, SBI
   • Adani, Larsen & Toubro, Maruti Suzuki
  `);
});

export default app;
