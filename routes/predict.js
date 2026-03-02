// routes/predict.js - API routes for ML-based carbon emission prediction
import express from "express";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import {
  trainPredictionModel,
  predictEmissions,
  comparePredictionsWithActual,
  generateImprovementSuggestions,
  generateSampleTrainingData,
  analyzeDiscrepancies
} from "../services/predictionModel.js";

const router = express.Router();

// In-memory storage for trained models
const trainedModels = new Map();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON are allowed.'));
    }
  }
});

/**
 * POST /api/predict/train
 * Train a new prediction model with historical emission data
 */
router.post("/train", upload.single("dataset"), async (req, res) => {
  try {
    const { company_name, industry, region, standard } = req.body;

    let trainingData = [];

    // Parse training data from file or body
    if (req.file) {
      // Parse CSV file
      const fileContent = req.file.buffer.toString('utf-8');
      trainingData = await parseCSV(fileContent);
    } else if (req.body.training_data) {
      // Parse JSON data from body
      trainingData = typeof req.body.training_data === 'string'
        ? JSON.parse(req.body.training_data)
        : req.body.training_data;
    } else if (req.body.use_sample === 'true') {
      // Use sample data for testing
      const sample = generateSampleTrainingData(company_name || "Sample Company");
      trainingData = sample.training_data;
    } else {
      return res.status(400).json({
        error: "No training data provided",
        message: "Please upload a CSV file, provide training_data JSON, or set use_sample=true"
      });
    }

    // Validate minimum data requirements
    if (!Array.isArray(trainingData) || trainingData.length < 3) {
      return res.status(400).json({
        error: "Insufficient training data",
        message: "At least 3 years of historical data is required for accurate predictions"
      });
    }

    // Prepare company info
    const companyInfo = {
      name: company_name || "Unknown Company",
      industry: industry || "General",
      region: region || "Global",
      standard: standard || "GHG Protocol"
    };

    console.log(`🎓 Training model for ${companyInfo.name} with ${trainingData.length} data points...`);

    // Train the model
    const modelResult = await trainPredictionModel(trainingData, companyInfo);

    // Store the trained model
    trainedModels.set(modelResult.model_id, modelResult);

    console.log(`✅ Model trained successfully: ${modelResult.model_id}`);

    res.json({
      success: true,
      message: "Prediction model trained successfully",
      model: {
        model_id: modelResult.model_id,
        trained_at: modelResult.trained_at,
        company_info: modelResult.company_info,
        training_summary: modelResult.training_data_summary,
        statistical_features: modelResult.statistical_features,
        model_context: modelResult.model_context
      }
    });

  } catch (error) {
    console.error("❌ Training Route Error:", error);
    res.status(500).json({
      error: "Training failed",
      message: error.message
    });
  }
});

/**
 * POST /api/predict/forecast
 * Generate future emission predictions using a trained model
 */
router.post("/forecast", async (req, res) => {
  try {
    const { model_id, years_to_predict, company_name } = req.body;

    // Get the trained model
    let modelData;

    if (model_id) {
      modelData = trainedModels.get(model_id);
      if (!modelData) {
        return res.status(404).json({
          error: "Model not found",
          message: `No trained model found with ID: ${model_id}. Please train a model first.`
        });
      }
    } else if (company_name) {
      // Find model by company name
      for (const [id, model] of trainedModels) {
        if (model.company_info?.name === company_name) {
          modelData = model;
          break;
        }
      }

      if (!modelData) {
        return res.status(404).json({
          error: "Model not found",
          message: `No trained model found for company: ${company_name}`
        });
      }
    } else {
      return res.status(400).json({
        error: "Missing parameters",
        message: "Please provide either model_id or company_name"
      });
    }

    const years = parseInt(years_to_predict) || 5;

    if (years < 1 || years > 20) {
      return res.status(400).json({
        error: "Invalid prediction range",
        message: "Years to predict must be between 1 and 20"
      });
    }

    console.log(`🔮 Generating ${years}-year forecast using model: ${modelData.model_id}`);

    // Generate predictions
    const predictionResult = await predictEmissions(modelData, years);

    // Store predictions in model for later comparison
    modelData.last_predictions = predictionResult.predictions;

    res.json({
      success: true,
      message: "Forecast generated successfully",
      forecast: predictionResult
    });

  } catch (error) {
    console.error("❌ Forecast Route Error:", error);
    res.status(500).json({
      error: "Forecast generation failed",
      message: error.message
    });
  }
});

/**
 * POST /api/predict/compare
 * Compare predictions with actual values to evaluate model accuracy
 */
router.post("/compare", async (req, res) => {
  try {
    const { model_id, predictions_json, actual_data } = req.body;

    let actualData = [];
    let predictions = [];

    // Parse actual data
    if (req.file) {
      const fileContent = req.file.buffer.toString('utf-8');
      actualData = await parseCSV(fileContent);
    } else if (actual_data) {
      actualData = typeof actual_data === 'string'
        ? JSON.parse(actual_data)
        : actual_data;
    } else {
      return res.status(400).json({
        error: "Missing actual data",
        message: "Please provide actual emission data for comparison"
      });
    }

    // Get predictions
    if (predictions_json) {
      predictions = typeof predictions_json === 'string'
        ? JSON.parse(predictions_json)
        : predictions_json;
    } else if (model_id) {
      // Retrieve stored predictions for this model
      const modelData = trainedModels.get(model_id);
      if (modelData && modelData.last_predictions) {
        predictions = modelData.last_predictions;
      }
    }

    if (!predictions || predictions.length === 0) {
      return res.status(400).json({
        error: "Missing predictions",
        message: "Please provide predictions or a valid model_id with stored predictions"
      });
    }

    console.log(`📊 Comparing ${predictions.length} predictions with ${actualData.length} actual values...`);

    // Perform comparison
    const comparisonResult = await comparePredictionsWithActual(predictions, actualData);

    // Generate improvement suggestions
    const suggestions = await generateImprovementSuggestions(comparisonResult);

    res.json({
      success: true,
      message: "Comparison completed",
      comparison: {
        ...comparisonResult,
        improvement_suggestions: suggestions
      }
    });

  } catch (error) {
    console.error("❌ Comparison Route Error:", error);
    res.status(500).json({
      error: "Comparison failed",
      message: error.message
    });
  }
});

/**
 * GET /api/predict/models
 * List all trained models
 */
router.get("/models", (req, res) => {
  const models = [];

  for (const [id, model] of trainedModels) {
    models.push({
      model_id: id,
      company_name: model.company_info?.name,
      industry: model.company_info?.industry,
      trained_at: model.trained_at,
      data_points: model.training_data_summary?.data_points,
      trend_direction: model.training_data_summary?.trend_direction
    });
  }

  res.json({
    success: true,
    count: models.length,
    models: models
  });
});

/**
 * GET /api/predict/models/:modelId
 * Get detailed information about a specific model
 */
router.get("/models/:modelId", (req, res) => {
  const { modelId } = req.params;
  const model = trainedModels.get(modelId);

  if (!model) {
    return res.status(404).json({
      error: "Model not found",
      message: `No model found with ID: ${modelId}`
    });
  }

  res.json({
    success: true,
    model: {
      model_id: model.model_id,
      trained_at: model.trained_at,
      company_info: model.company_info,
      training_data_summary: model.training_data_summary,
      statistical_features: model.statistical_features,
      model_context: model.model_context
    }
  });
});

/**
 * DELETE /api/predict/models/:modelId
 * Delete a trained model
 */
router.delete("/models/:modelId", (req, res) => {
  const { modelId } = req.params;

  if (!trainedModels.has(modelId)) {
    return res.status(404).json({
      error: "Model not found",
      message: `No model found with ID: ${modelId}`
    });
  }

  trainedModels.delete(modelId);

  res.json({
    success: true,
    message: `Model ${modelId} deleted successfully`
  });
});

/**
 * GET /api/predict/sample-data
 * Get sample training data for testing
 */
router.get("/sample-data", (req, res) => {
  const { company_name } = req.query;
  const sample = generateSampleTrainingData(company_name || "Demo Company");

  res.json({
    success: true,
    message: "Sample training data generated",
    sample_data: sample
  });
});

/**
 * POST /api/predict/analyze-discrepancies
 * Analyze dataset for discrepancies using Gemini AI
 */
router.post("/analyze-discrepancies", upload.single("dataset"), async (req, res) => {
  try {
    const { company_name, industry, region } = req.body;

    let dataset = [];

    // Parse data from file or body
    if (req.file) {
      const fileContent = req.file.buffer.toString('utf-8');
      dataset = await parseCSV(fileContent);
    } else if (req.body.dataset) {
      dataset = typeof req.body.dataset === 'string'
        ? JSON.parse(req.body.dataset)
        : req.body.dataset;
    } else {
      return res.status(400).json({
        error: "No dataset provided",
        message: "Please upload a CSV file or provide dataset JSON"
      });
    }

    // Validate data
    if (!Array.isArray(dataset) || dataset.length < 2) {
      return res.status(400).json({
        error: "Insufficient data",
        message: "At least 2 years of data is required for discrepancy analysis"
      });
    }

    const companyInfo = {
      name: company_name || "Unknown Company",
      industry: industry || "General",
      region: region || "Global"
    };

    console.log(`🔍 Analyzing discrepancies for ${companyInfo.name} with ${dataset.length} data points...`);

    // Perform discrepancy analysis
    const analysisResult = await analyzeDiscrepancies(dataset, companyInfo);

    console.log(`✅ Discrepancy analysis complete. Found ${analysisResult.discrepancies.length} issues.`);

    res.json({
      success: true,
      message: "Discrepancy analysis completed",
      analysis: analysisResult
    });

  } catch (error) {
    console.error("❌ Discrepancy Analysis Route Error:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message
    });
  }
});

/**
 * GET /api/predict/gemini-status
 * Check if Gemini API is configured and working
 */
router.get("/gemini-status", async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const isConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here' && GEMINI_API_KEY.length > 20;

  let isWorking = false;
  let errorMessage = null;

  if (isConfigured) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Test the API with a simple prompt
      const result = await model.generateContent("Hello");
      isWorking = true;
    } catch (error) {
      errorMessage = error.message;
    }
  }

  res.json({
    success: true,
    gemini_configured: isConfigured,
    gemini_working: isWorking,
    error: errorMessage,
    message: isWorking
      ? "✅ Gemini API is configured and working"
      : isConfigured
        ? "⚠️ Gemini API key is set but not working"
        : "ℹ️ Gemini API not configured - running in statistical mode"
  });
});

/**
 * Helper function to parse CSV data
 */
function parseCSV(csvContent) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from([csvContent]);

    stream
      .pipe(csv())
      .on('data', (data) => {
        // Try to parse year and emissions from various column names
        const year = parseInt(data.year || data.Year || data.YEAR || data.year_reported);
        const emissions = parseFloat(
          data.emissions || data.Emissions || data.EMISSIONS ||
          data.carbon_emissions || data.total_emissions || data.co2
        );

        if (!isNaN(year) && !isNaN(emissions)) {
          results.push({ year, emissions });
        }
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

export default router;
