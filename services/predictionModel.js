// services/predictionModel.js - ML Prediction Engine for Carbon Emissions
// Uses statistical analysis with optional Gemini AI enhancement

import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_MOCK_MODE = !GEMINI_API_KEY || GEMINI_API_KEY === AIzaSyAuylU6nF1pHsMnW2DkiwLWCz_Epsqugow;

// Initialize Gemini API only if key is valid
let genAI = null;
if (!USE_MOCK_MODE) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log("✅ Gemini API initialized successfully");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Gemini API:", error.message);
  }
}

// Model configuration for time-series forecasting
const MODEL_CONFIG = {
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 2000,
    topP: 0.8,
    topK: 40
  }
};

/**
 * Training data structure validator
 */
function validateTrainingData(data) {
  if (!Array.isArray(data) || data.length < 3) {
    throw new Error("Training data must be an array with at least 3 data points");
  }

  const requiredFields = ['year', 'emissions'];

  for (const record of data) {
    for (const field of requiredFields) {
      if (!(field in record)) {
        throw new Error(`Missing required field: ${field} in training data`);
      }
    }

    if (typeof record.year !== 'number' || typeof record.emissions !== 'number') {
      throw new Error("Year and emissions must be numeric values");
    }

    if (record.emissions < 0) {
      throw new Error("Emissions cannot be negative");
    }
  }

  return data.sort((a, b) => a.year - b.year);
}

/**
 * Calculate statistical features from historical data
 */
function calculateFeatures(data) {
  const emissions = data.map(d => d.emissions);
  const years = data.map(d => d.year);

  const mean = emissions.reduce((a, b) => a + b, 0) / emissions.length;
  const min = Math.min(...emissions);
  const max = Math.max(...emissions);

  const growthRates = [];
  for (let i = 1; i < emissions.length; i++) {
    const rate = ((emissions[i] - emissions[i-1]) / emissions[i-1]) * 100;
    growthRates.push(rate);
  }

  const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

  // Linear regression slope
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = emissions.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((total, year, i) => total + year * emissions[i], 0);
  const sumX2 = years.reduce((total, year) => total + year * year, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const variance = growthRates.reduce((total, rate) => {
    return total + Math.pow(rate - avgGrowthRate, 2);
  }, 0) / growthRates.length;
  const volatility = Math.sqrt(variance);

  const recentAvg = emissions.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, emissions.length);
  const olderAvg = emissions.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, emissions.length - 3);
  const recentTrend = ((recentAvg - olderAvg) / olderAvg) * 100;

  return {
    mean,
    min,
    max,
    avgGrowthRate,
    slope,
    volatility,
    recentTrend,
    dataPoints: emissions.length,
    firstYear: years[0],
    lastYear: years[years.length - 1]
  };
}

/**
 * Statistical prediction without Gemini API
 * Uses linear regression + trend analysis
 */
function generateStatisticalPredictions(historicalData, features, yearsToPredict) {
  const lastYear = historicalData[historicalData.length - 1].year;
  const lastEmission = historicalData[historicalData.length - 1].emissions;

  const predictions = [];

  // Use trend slope for prediction
  const annualChange = features.slope;

  // Calculate volatility-based confidence interval
  const volatilityFactor = features.volatility / 100;
  const baseConfidenceRange = lastEmission * volatilityFactor * 0.5;

  for (let i = 1; i <= yearsToPredict; i++) {
    const year = lastYear + i;

    // Linear projection with slight decay factor (assuming efficiency improvements)
    const decayFactor = Math.pow(0.98, i); // 2% efficiency gain per year
    const predictedEmissions = (lastEmission + annualChange * i) * decayFactor;

    // Ensure non-negative
    const finalPrediction = Math.max(0, predictedEmissions);

    // Confidence interval widens with time
    const confidenceRange = baseConfidenceRange * (1 + i * 0.2);

    predictions.push({
      year,
      predicted_emissions: Math.round(finalPrediction),
      confidence_lower: Math.round(Math.max(0, finalPrediction - confidenceRange)),
      confidence_upper: Math.round(finalPrediction + confidenceRange),
      reasoning: generateReasoning(features, i, annualChange)
    });
  }

  return predictions;
}

function generateReasoning(features, yearOffset, slope) {
  const reasons = [];

  if (features.slope < 0) {
    reasons.push("Historical declining trend indicates continued emission reductions");
  } else if (features.slope > 0) {
    reasons.push("Historical growth trend suggests emissions may continue rising");
  } else {
    reasons.push("Stable historical trend suggests emissions will remain consistent");
  }

  if (features.volatility > 10) {
    reasons.push("High historical volatility creates uncertainty in predictions");
  }

  if (features.recentTrend < -5) {
    reasons.push("Recent acceleration in reductions expected to continue");
  }

  reasons.push(`Assumes ${(2 * yearOffset).toFixed(0)}% cumulative efficiency improvements`);

  return reasons.join(". ") + ".";
}

/**
 * Generate mock model context
 */
function generateMockModelContext(features, companyInfo) {
  const trendDirection = features.slope > 0 ? 'increasing' : features.slope < 0 ? 'decreasing' : 'stable';

  return {
    pattern_analysis: `Historical data shows a ${trendDirection} trend with ${features.volatility.toFixed(1)}% volatility. ` +
      `Average annual change is ${features.slope.toFixed(0)} tons CO₂. ` +
      `Recent 3-year trend shows ${features.recentTrend > 0 ? 'growth' : 'decline'} of ${Math.abs(features.recentTrend).toFixed(1)}%.`,
    key_factors: [
      "Historical emission trends",
      "Year-over-year growth rates",
      "Recent performance patterns",
      features.volatility > 10 ? "High volatility indicates external factors" : "Stable trajectory",
      "Industry-standard decarbonization assumptions"
    ],
    confidence_level: features.dataPoints >= 5 ? 'high' : features.dataPoints >= 3 ? 'medium' : 'low',
    expected_trend: trendDirection,
    note: USE_MOCK_MODE ? "Running in STATISTICAL MODE (no Gemini API). For AI-powered predictions, add a valid GEMINI_API_KEY." : "AI-powered analysis enabled"
  };
}

/**
 * Train the prediction model
 */
export async function trainPredictionModel(trainingData, companyInfo = {}) {
  try {
    // Validate and prepare data
    const validatedData = validateTrainingData(trainingData);

    // Calculate features
    const features = calculateFeatures(validatedData);

    // Generate model ID
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let modelContext;

    // Try to use Gemini API if available
    if (!USE_MOCK_MODE && genAI) {
      try {
        const trainingPrompt = buildTrainingPrompt(validatedData, companyInfo, features);
        const model = genAI.getGenerativeModel(MODEL_CONFIG);
        const result = await model.generateContent(trainingPrompt);
        const response = result.response.text();

        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          modelContext = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          modelContext = { raw_analysis: response };
        }
      } catch (apiError) {
        console.warn("⚠️ Gemini API call failed, using fallback:", apiError.message);
        modelContext = generateMockModelContext(features, companyInfo);
      }
    } else {
      // Use mock mode
      modelContext = generateMockModelContext(features, companyInfo);
    }

    return {
      success: true,
      model_id: modelId,
      trained_at: new Date().toISOString(),
      company_info: companyInfo,
      training_data_summary: {
        years_covered: `${features.firstYear}-${features.lastYear}`,
        data_points: features.dataPoints,
        average_emissions: features.mean,
        trend_direction: features.slope > 0 ? 'increasing' : features.slope < 0 ? 'decreasing' : 'stable'
      },
      statistical_features: features,
      model_context: modelContext,
      raw_training_data: validatedData,
      mode: USE_MOCK_MODE ? 'statistical' : 'gemini-ai'
    };

  } catch (error) {
    console.error("❌ Model Training Error:", error);
    throw new Error(`Failed to train prediction model: ${error.message}`);
  }
}

/**
 * Predict future emissions
 */
export async function predictEmissions(modelData, yearsToPredict = 5) {
  try {
    if (!modelData || !modelData.raw_training_data) {
      throw new Error("Invalid model data. Please train the model first.");
    }

    const { raw_training_data, statistical_features, model_context, company_info } = modelData;

    let predictions;
    let methodology;
    let riskFactors;
    let accuracyEstimate;

    // Try Gemini API first if available
    if (!USE_MOCK_MODE && genAI) {
      try {
        const predictionPrompt = buildPredictionPrompt(
          raw_training_data,
          statistical_features,
          yearsToPredict,
          company_info || {},
          model_context
        );

        const model = genAI.getGenerativeModel(MODEL_CONFIG);
        const result = await model.generateContent(predictionPrompt);
        const response = result.response.text();

        let predictionResult;
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          predictionResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          console.warn("⚠️ Failed to parse Gemini response, using fallback");
        }

        if (predictionResult && predictionResult.predictions) {
          predictions = predictionResult.predictions;
          methodology = predictionResult.methodology;
          riskFactors = predictionResult.risk_factors;
          accuracyEstimate = predictionResult.model_accuracy_estimate;
        } else {
          throw new Error("Invalid prediction format");
        }
      } catch (apiError) {
        console.warn("⚠️ Gemini prediction failed, using statistical fallback:", apiError.message);
        predictions = generateStatisticalPredictions(raw_training_data, statistical_features, yearsToPredict);
        methodology = "Statistical linear regression with efficiency decay factor (fallback mode)";
        riskFactors = ["API unavailable - using statistical approximation"];
        accuracyEstimate = 70;
      }
    } else {
      // Use statistical prediction
      predictions = generateStatisticalPredictions(raw_training_data, statistical_features, yearsToPredict);
      methodology = "Statistical linear regression with efficiency decay factor";
      riskFactors = [
        "Regulatory changes",
        "Economic conditions",
        "Technology adoption rates",
        "Energy price fluctuations"
      ];
      accuracyEstimate = statistical_features.dataPoints >= 5 ? 75 : 65;
    }

    // Enrich predictions
    const enrichedPredictions = predictions.map(pred => ({
      ...pred,
      predicted_at: new Date().toISOString(),
      model_id: modelData.model_id
    }));

    return {
      success: true,
      model_id: modelData.model_id,
      company_name: company_info?.name || 'Unknown',
      predictions: enrichedPredictions,
      model_accuracy_estimate: accuracyEstimate,
      methodology: methodology,
      risk_factors: riskFactors,
      statistical_basis: {
        historical_mean: statistical_features.mean,
        trend_slope: statistical_features.slope,
        volatility: statistical_features.volatility
      },
      mode: USE_MOCK_MODE ? 'statistical' : 'gemini-ai'
    };

  } catch (error) {
    console.error("❌ Prediction Error:", error);
    throw new Error(`Failed to generate predictions: ${error.message}`);
  }
}

/**
 * Compare predictions with actual values
 */
export async function comparePredictionsWithActual(predictions, actualData) {
  try {
    const comparisonResults = [];
    let totalError = 0;
    let totalPercentageError = 0;
    let withinRangeCount = 0;

    for (const actual of actualData) {
      const prediction = predictions.find(p => p.year === actual.year);

      if (prediction) {
        const error = Math.abs(actual.emissions - prediction.predicted_emissions);
        const percentageError = (error / actual.emissions) * 100;

        const withinConfidence =
          actual.emissions >= prediction.confidence_lower &&
          actual.emissions <= prediction.confidence_upper;

        if (withinConfidence) withinRangeCount++;

        totalError += error;
        totalPercentageError += percentageError;

        comparisonResults.push({
          year: actual.year,
          predicted: prediction.predicted_emissions,
          actual: actual.emissions,
          error: error,
          percentage_error: percentageError,
          within_confidence_range: withinConfidence,
          confidence_lower: prediction.confidence_lower,
          confidence_upper: prediction.confidence_upper
        });
      }
    }

    const n = comparisonResults.length;
    if (n === 0) {
      throw new Error("No matching years found between predictions and actual data");
    }

    const mae = totalError / n;
    const mape = totalPercentageError / n;
    const accuracyScore = Math.max(0, 100 - mape);
    const confidenceAccuracy = (withinRangeCount / n) * 100;

    return {
      success: true,
      comparison_results: comparisonResults,
      accuracy_metrics: {
        mae: mae,
        mape: mape,
        accuracy_score: accuracyScore,
        confidence_interval_accuracy: confidenceAccuracy,
        predictions_within_range: `${withinRangeCount}/${n}`
      },
      model_performance: {
        rating: accuracyScore >= 90 ? 'Excellent' :
                accuracyScore >= 70 ? 'Good' :
                accuracyScore >= 50 ? 'Fair' : 'Poor',
        recommendation: mape > 20 ? 'Model needs retraining with more data' :
                        mape > 10 ? 'Model accuracy acceptable, consider fine-tuning' :
                        'Model performing well'
      }
    };

  } catch (error) {
    console.error("❌ Comparison Error:", error);
    throw new Error(`Failed to compare predictions: ${error.message}`);
  }
}

/**
 * Generate improvement suggestions
 */
export async function generateImprovementSuggestions(comparisonResult) {
  const { accuracy_metrics, comparison_results } = comparisonResult;

  const suggestions = [];

  if (accuracy_metrics.mape > 20) {
    suggestions.push({
      priority: 'high',
      area: 'data_quality',
      suggestion: 'Collect more granular data (quarterly instead of annual)',
      expected_improvement: '15-25% accuracy gain'
    });
  }

  if (accuracy_metrics.confidence_interval_accuracy < 70) {
    suggestions.push({
      priority: 'medium',
      area: 'volatility_modeling',
      suggestion: 'Include external factors like energy prices, regulations, and economic indicators',
      expected_improvement: '10-15% confidence accuracy'
    });
  }

  const overPredictions = comparison_results.filter(r => r.predicted > r.actual).length;
  const underPredictions = comparison_results.length - overPredictions;

  if (Math.abs(overPredictions - underPredictions) > comparison_results.length * 0.3) {
    suggestions.push({
      priority: 'high',
      area: 'bias_correction',
      suggestion: overPredictions > underPredictions ?
        'Model consistently over-predicts; adjust downward trend factor' :
        'Model consistently under-predicts; adjust upward trend factor',
      expected_improvement: '10-20% bias reduction'
    });
  }

  suggestions.push({
    priority: 'low',
    area: 'continuous_learning',
    suggestion: 'Retrain model monthly with new actual data for continuous improvement',
    expected_improvement: '5-10% long-term accuracy gain'
  });

  return suggestions;
}

/**
 * Build the training prompt for Gemini
 */
function buildTrainingPrompt(historicalData, companyInfo, features) {
  const dataString = historicalData.map(d =>
    `Year ${d.year}: ${d.emissions.toLocaleString()} tons CO₂`
  ).join('\n');

  return `
You are a Carbon Emission Prediction Model trained on historical sustainability data.

COMPANY PROFILE:
- Name: ${companyInfo.name || 'Unknown Company'}
- Industry: ${companyInfo.industry || 'General'}
- Region: ${companyInfo.region || 'Global'}
- Reporting Standard: ${companyInfo.standard || 'GHG Protocol'}

HISTORICAL EMISSION DATA (${features.dataPoints} years):
${dataString}

STATISTICAL ANALYSIS:
- Average Emissions: ${features.mean.toLocaleString()} tons CO₂
- Emission Range: ${features.min.toLocaleString()} - ${features.max.toLocaleString()} tons CO₂
- Average YoY Growth Rate: ${features.avgGrowthRate.toFixed(2)}%
- Trend Slope: ${features.slope.toFixed(2)} tons/year
- Volatility: ${features.volatility.toFixed(2)}%
- Recent Trend (3-year): ${features.recentTrend.toFixed(2)}%

Based on this historical data, analyze the patterns and be ready to predict future emissions.
Consider:
1. Historical growth/decline trends
2. Seasonal patterns if any
3. Industry benchmarks
4. Regulatory impacts
5. Technological improvements
6. Economic factors

Respond with your understanding of the data patterns in JSON format:
{
  "pattern_analysis": "description of observed patterns",
  "key_factors": ["factor1", "factor2", ...],
  "confidence_level": "high|medium|low",
  "expected_trend": "increasing|decreasing|stable"
}`;
}

/**
 * Build prediction prompt
 */
function buildPredictionPrompt(historicalData, features, yearsToPredict, companyInfo, modelContext) {
  const dataString = historicalData.map(d =>
    `${d.year}: ${d.emissions.toLocaleString()}`
  ).join(', ');

  const lastYear = historicalData[historicalData.length - 1].year;
  const lastEmission = historicalData[historicalData.length - 1].emissions;

  return `
You are a Carbon Emission Prediction Model. Predict future carbon emissions based on historical data.

HISTORICAL DATA:
${dataString}

STATISTICAL FEATURES:
- Mean: ${features.mean.toLocaleString()}
- Trend Slope: ${features.slope.toFixed(2)} tons/year
- Avg Growth Rate: ${features.avgGrowthRate.toFixed(2)}%
- Volatility: ${features.volatility.toFixed(2)}%

MODEL CONTEXT:
${modelContext ? JSON.stringify(modelContext, null, 2) : 'No prior training context'}

PREDICTION REQUEST:
Predict emissions for the next ${yearsToPredict} years starting from ${lastYear + 1}.
Last known emission (${lastYear}): ${lastEmission.toLocaleString()} tons CO₂

Company: ${companyInfo.name || 'Unknown'}
Industry: ${companyInfo.industry || 'General'}

Instructions:
1. Use statistical trend analysis
2. Apply industry-appropriate growth/decline factors
3. Consider decarbonization trends
4. Account for volatility in your confidence intervals
5. Provide reasoning for each prediction

Respond STRICTLY in this JSON format:
{
  "predictions": [
    {"year": number, "predicted_emissions": number, "confidence_lower": number, "confidence_upper": number, "reasoning": "string"}
  ],
  "model_accuracy_estimate": number (0-100),
  "methodology": "string explaining prediction approach",
  "risk_factors": ["string"]
}`;
}

/**
 * Sample training data generator for testing
 */
export function generateSampleTrainingData(companyName = "Sample Corp") {
  const baseYear = 2018;
  const baseEmission = 50000;

  return {
    company_info: {
      name: companyName,
      industry: "Technology",
      region: "North America",
      standard: "GHG Protocol"
    },
    training_data: [
      { year: baseYear, emissions: baseEmission },
      { year: baseYear + 1, emissions: baseEmission * 1.05 },
      { year: baseYear + 2, emissions: baseEmission * 1.08 },
      { year: baseYear + 3, emissions: baseEmission * 1.06 },
      { year: baseYear + 4, emissions: baseEmission * 1.03 },
      { year: baseYear + 5, emissions: baseEmission * 0.98 },
      { year: baseYear + 6, emissions: baseEmission * 0.95 }
    ]
  };
}

/**
 * Analyze dataset discrepancies using Gemini API
 * This function uses AI to find anomalies, outliers, and data quality issues
 */
export async function analyzeDiscrepancies(dataset, companyInfo = {}) {
  try {
    // Calculate basic statistics first
    const features = calculateFeatures(dataset);

    // Find statistical anomalies
    const anomalies = findStatisticalAnomalies(dataset, features);

    let aiAnalysis = null;
    let discrepancies = [];

    // Try to use Gemini API for AI-powered analysis
    if (!USE_MOCK_MODE && genAI) {
      try {
        const discrepancyPrompt = buildDiscrepancyPrompt(dataset, features, companyInfo, anomalies);
        const model = genAI.getGenerativeModel(MODEL_CONFIG);
        const result = await model.generateContent(discrepancyPrompt);
        const response = result.response.text();

        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          aiAnalysis = { raw_analysis: response };
        }
      } catch (apiError) {
        console.warn("⚠️ Gemini API discrepancy analysis failed:", apiError.message);
      }
    }

    // Build discrepancy report
    discrepancies = buildDiscrepancyReport(dataset, features, anomalies, aiAnalysis);

    return {
      success: true,
      company_name: companyInfo.name || 'Unknown Company',
      analysis_timestamp: new Date().toISOString(),
      gemini_api_used: !USE_MOCK_MODE && genAI && aiAnalysis !== null,
      mode: (!USE_MOCK_MODE && genAI && aiAnalysis !== null) ? 'gemini-ai' : 'statistical',
      summary: {
        total_data_points: dataset.length,
        anomalies_detected: anomalies.length,
        data_quality_score: calculateDataQualityScore(dataset, anomalies),
        trend_consistency: features.volatility < 10 ? 'consistent' : features.volatility < 20 ? 'moderate' : 'volatile'
      },
      statistical_analysis: {
        mean: features.mean,
        volatility: features.volatility,
        growth_rate: features.avgGrowthRate,
        trend_direction: features.slope > 0 ? 'increasing' : features.slope < 0 ? 'decreasing' : 'stable'
      },
      discrepancies: discrepancies,
      ai_insights: aiAnalysis || {
        note: "AI analysis not available. Running in statistical mode. Add GEMINI_API_KEY for AI-powered insights."
      },
      recommendations: generateDiscrepancyRecommendations(discrepancies, features)
    };

  } catch (error) {
    console.error("❌ Discrepancy Analysis Error:", error);
    throw new Error(`Failed to analyze discrepancies: ${error.message}`);
  }
}

/**
 * Find statistical anomalies in the dataset
 */
function findStatisticalAnomalies(dataset, features) {
  const anomalies = [];
  const emissions = dataset.map(d => d.emissions);
  const mean = features.mean;
  const stdDev = Math.sqrt(emissions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / emissions.length);

  // Z-score method for outlier detection
  const threshold = 1.5; // Z-score threshold

  dataset.forEach((dataPoint, index) => {
    const zScore = Math.abs((dataPoint.emissions - mean) / stdDev);

    if (zScore > threshold) {
      anomalies.push({
        year: dataPoint.year,
        emissions: dataPoint.emissions,
        z_score: zScore,
        type: 'outlier',
        severity: zScore > 2.5 ? 'high' : 'medium',
        description: `Emission value ${dataPoint.emissions.toLocaleString()} is ${zScore > 2.5 ? 'significantly' : 'moderately'} different from the mean`
      });
    }

    // Check for sudden spikes/drops (year-over-year change > 30%)
    if (index > 0) {
      const prevEmission = dataset[index - 1].emissions;
      const changePercent = ((dataPoint.emissions - prevEmission) / prevEmission) * 100;

      if (Math.abs(changePercent) > 30) {
        anomalies.push({
          year: dataPoint.year,
          emissions: dataPoint.emissions,
          change_percent: changePercent,
          type: 'sudden_change',
          severity: Math.abs(changePercent) > 50 ? 'high' : 'medium',
          description: `Sudden ${changePercent > 0 ? 'increase' : 'decrease'} of ${Math.abs(changePercent).toFixed(1)}% from previous year`
        });
      }
    }
  });

  return anomalies;
}

/**
 * Build discrepancy report combining statistical and AI analysis
 */
function buildDiscrepancyReport(dataset, features, anomalies, aiAnalysis) {
  const discrepancies = [];

  // Add statistical anomalies
  anomalies.forEach(anomaly => {
    discrepancies.push({
      type: anomaly.type,
      year: anomaly.year,
      severity: anomaly.severity,
      description: anomaly.description,
      value: anomaly.emissions,
      detected_by: 'statistical_analysis'
    });
  });

  // Check for missing years
  const years = dataset.map(d => d.year).sort((a, b) => a - b);
  for (let i = 1; i < years.length; i++) {
    if (years[i] - years[i - 1] > 1) {
      discrepancies.push({
        type: 'missing_data',
        year: `${years[i - 1] + 1}-${years[i] - 1}`,
        severity: 'medium',
        description: `Missing data for years ${years[i - 1] + 1} to ${years[i] - 1}`,
        detected_by: 'statistical_analysis'
      });
    }
  }

  // Check for trend inconsistency
  if (features.volatility > 20) {
    discrepancies.push({
      type: 'trend_inconsistency',
      year: 'multiple',
      severity: 'medium',
      description: `High volatility (${features.volatility.toFixed(1)}%) indicates inconsistent emission patterns`,
      detected_by: 'statistical_analysis'
    });
  }

  // Add AI-detected discrepancies if available
  if (aiAnalysis && aiAnalysis.discrepancies) {
    aiAnalysis.discrepancies.forEach(d => {
      discrepancies.push({
        ...d,
        detected_by: 'gemini_ai'
      });
    });
  }

  return discrepancies.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Calculate data quality score
 */
function calculateDataQualityScore(dataset, anomalies) {
  const baseScore = 100;
  const anomalyPenalty = anomalies.filter(a => a.severity === 'high').length * 15 +
                         anomalies.filter(a => a.severity === 'medium').length * 8;
  return Math.max(0, Math.min(100, baseScore - anomalyPenalty));
}

/**
 * Generate recommendations based on discrepancies
 */
function generateDiscrepancyRecommendations(discrepancies, features) {
  const recommendations = [];

  const highSeverityCount = discrepancies.filter(d => d.severity === 'high').length;
  const outlierCount = discrepancies.filter(d => d.type === 'outlier').length;
  const suddenChangeCount = discrepancies.filter(d => d.type === 'sudden_change').length;

  if (highSeverityCount > 0) {
    recommendations.push({
      priority: 'high',
      category: 'data_validation',
      message: 'Review high-severity discrepancies - verify data accuracy with source documents',
      action: 'Cross-check emission values for flagged years with official reports'
    });
  }

  if (outlierCount > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'outlier_investigation',
      message: 'Investigate outliers - they may indicate data entry errors or real anomalies',
      action: 'Check if outliers correspond to known events (mergers, divestments, methodology changes)'
    });
  }

  if (suddenChangeCount > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'trend_analysis',
      message: 'Sudden changes detected - understand the underlying causes',
      action: 'Document any business changes, acquisitions, or reporting methodology updates'
    });
  }

  if (features.volatility > 20) {
    recommendations.push({
      priority: 'low',
      category: 'data_consistency',
      message: 'High volatility suggests inconsistent reporting practices',
      action: 'Consider standardizing data collection and reporting procedures'
    });
  }

  recommendations.push({
    priority: 'low',
    category: 'continuous_monitoring',
    message: 'Set up regular data quality checks',
    action: 'Implement automated anomaly detection for future data submissions'
  });

  return recommendations;
}

/**
 * Build discrepancy analysis prompt for Gemini API
 */
function buildDiscrepancyPrompt(dataset, features, companyInfo, anomalies) {
  const dataString = dataset.map(d =>
    `Year ${d.year}: ${d.emissions.toLocaleString()} tons CO₂`
  ).join('\n');

  const anomalyString = anomalies.length > 0
    ? anomalies.map(a => `- ${a.year}: ${a.description}`).join('\n')
    : 'No statistical anomalies detected';

  return `
You are an expert Carbon Emission Data Analyst. Analyze the following emission dataset for discrepancies, anomalies, and data quality issues.

COMPANY PROFILE:
- Name: ${companyInfo.name || 'Unknown Company'}
- Industry: ${companyInfo.industry || 'General'}
- Region: ${companyInfo.region || 'Global'}

EMISSION DATA (${dataset.length} years):
${dataString}

STATISTICAL SUMMARY:
- Average Emissions: ${features.mean.toLocaleString()} tons CO₂
- Volatility: ${features.volatility.toFixed(2)}%
- Growth Rate: ${features.avgGrowthRate.toFixed(2)}%
- Trend: ${features.slope > 0 ? 'increasing' : features.slope < 0 ? 'decreasing' : 'stable'}

STATISTICAL ANOMALIES DETECTED:
${anomalyString}

Your task:
1. Identify any additional discrepancies not caught by statistical analysis
2. Look for patterns that suggest data quality issues
3. Consider industry context and realistic emission patterns
4. Flag any years that seem suspicious or inconsistent
5. Provide insights on data reliability

Respond in JSON format:
{
  "overall_assessment": "Brief summary of data quality",
  "data_reliability_score": number (0-100),
  "discrepancies": [
    {
      "type": "outlier|sudden_change|missing_data|trend_inconsistency|suspicious_value",
      "year": number or "multiple",
      "severity": "high|medium|low",
      "description": "Detailed explanation of the issue"
    }
  ],
  "insights": [
    "Key insight about the data"
  ],
  "potential_causes": [
    "Possible explanation for discrepancies"
  ]
}`;
}

export default {
  trainPredictionModel,
  predictEmissions,
  comparePredictionsWithActual,
  generateImprovementSuggestions,
  generateSampleTrainingData,
  analyzeDiscrepancies
};
