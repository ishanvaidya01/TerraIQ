// TerraIQ - Frontend Application
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let trainedModels = [];
let currentForecast = null;
let predictionChart = null;
let comparisonChart = null;

// Sample datasets
const sampleDatasets = {
  tesla: {
    name: 'Tesla Inc',
    industry: 'Manufacturing',
    region: 'North America',
    data: [
      { year: 2018, emissions: 2500000 },
      { year: 2019, emissions: 2800000 },
      { year: 2020, emissions: 2100000 },
      { year: 2021, emissions: 2300000 },
      { year: 2022, emissions: 2400000 },
      { year: 2023, emissions: 2200000 }
    ]
  },
  apple: {
    name: 'Apple Inc',
    industry: 'Technology',
    region: 'North America',
    data: [
      { year: 2018, emissions: 250000 },
      { year: 2019, emissions: 226000 },
      { year: 2020, emissions: 185000 },
      { year: 2021, emissions: 175000 },
      { year: 2022, emissions: 155000 },
      { year: 2023, emissions: 140000 }
    ]
  },
  microsoft: {
    name: 'Microsoft Corp',
    industry: 'Technology',
    region: 'North America',
    data: [
      { year: 2018, emissions: 320000 },
      { year: 2019, emissions: 295000 },
      { year: 2020, emissions: 260000 },
      { year: 2021, emissions: 240000 },
      { year: 2022, emissions: 210000 },
      { year: 2023, emissions: 190000 }
    ]
  },
  amazon: {
    name: 'Amazon.com Inc',
    industry: 'Retail',
    region: 'North America',
    data: [
      { year: 2018, emissions: 44000000 },
      { year: 2019, emissions: 51000000 },
      { year: 2020, emissions: 60000000 },
      { year: 2021, emissions: 71000000 },
      { year: 2022, emissions: 62000000 },
      { year: 2023, emissions: 55000000 }
    ]
  },
  tata_steel: {
    name: 'Tata Steel Ltd',
    industry: 'Manufacturing',
    region: 'Asia Pacific',
    data: [
      { year: 2018, emissions: 28000000 },
      { year: 2019, emissions: 27500000 },
      { year: 2020, emissions: 26000000 },
      { year: 2021, emissions: 28500000 },
      { year: 2022, emissions: 27000000 },
      { year: 2023, emissions: 26500000 }
    ]
  },
  shell: {
    name: 'Shell plc',
    industry: 'Energy',
    region: 'Europe',
    data: [
      { year: 2018, emissions: 72000000 },
      { year: 2019, emissions: 71000000 },
      { year: 2020, emissions: 68000000 },
      { year: 2021, emissions: 69000000 },
      { year: 2022, emissions: 70000000 },
      { year: 2023, emissions: 68500000 }
    ]
  },
  infosys: {
    name: 'Infosys Ltd',
    industry: 'Technology',
    region: 'Asia Pacific',
    data: [
      { year: 2018, emissions: 85000 },
      { year: 2019, emissions: 78000 },
      { year: 2020, emissions: 65000 },
      { year: 2021, emissions: 58000 },
      { year: 2022, emissions: 52000 },
      { year: 2023, emissions: 48000 }
    ]
  },
  hdfc: {
    name: 'HDFC Bank',
    industry: 'Financial',
    region: 'Asia Pacific',
    data: [
      { year: 2018, emissions: 45000 },
      { year: 2019, emissions: 42000 },
      { year: 2020, emissions: 38000 },
      { year: 2021, emissions: 35000 },
      { year: 2022, emissions: 32000 },
      { year: 2023, emissions: 29000 }
    ]
  },
  google: {
    name: 'Google LLC',
    industry: 'Technology',
    region: 'North America',
    data: [
      { year: 2018, emissions: 280000 },
      { year: 2019, emissions: 265000 },
      { year: 2020, emissions: 240000 },
      { year: 2021, emissions: 220000 },
      { year: 2022, emissions: 195000 },
      { year: 2023, emissions: 175000 }
    ]
  },
  toyota: {
    name: 'Toyota Motor',
    industry: 'Manufacturing',
    region: 'Asia Pacific',
    data: [
      { year: 2018, emissions: 8500000 },
      { year: 2019, emissions: 8200000 },
      { year: 2020, emissions: 7500000 },
      { year: 2021, emissions: 7800000 },
      { year: 2022, emissions: 7600000 },
      { year: 2023, emissions: 7400000 }
    ]
  },
  siemens: {
    name: 'Siemens AG',
    industry: 'Manufacturing',
    region: 'Europe',
    data: [
      { year: 2018, emissions: 3200000 },
      { year: 2019, emissions: 3100000 },
      { year: 2020, emissions: 2900000 },
      { year: 2021, emissions: 2800000 },
      { year: 2022, emissions: 2700000 },
      { year: 2023, emissions: 2600000 }
    ]
  },
  coca_cola: {
    name: 'Coca-Cola',
    industry: 'Manufacturing',
    region: 'North America',
    data: [
      { year: 2018, emissions: 5500000 },
      { year: 2019, emissions: 5300000 },
      { year: 2020, emissions: 5000000 },
      { year: 2021, emissions: 4900000 },
      { year: 2022, emissions: 4800000 },
      { year: 2023, emissions: 4700000 }
    ]
  }
};

// ============================================
// NAVIGATION
// ============================================

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.getElementById(`${sectionId}-section`).classList.add('active');
  event.target.classList.add('active');

  if (sectionId === 'models') {
    loadTrainedModels();
  } else if (sectionId === 'forecast') {
    refreshModelList();
  }
}

function goToDashboard() {
  window.location.href = 'dashboard.html';
}

// ============================================
// FILE HANDLING
// ============================================

function handleFileSelect(input) {
  const file = input.files[0];
  if (file) {
    const uploadDiv = document.getElementById('fileUpload');
    const fileText = document.getElementById('fileText');

    uploadDiv.classList.add('has-file');
    fileText.innerHTML = `<strong>${file.name}</strong><br><small>${(file.size / 1024).toFixed(1)} KB</small>`;
  }
}

function loadSampleData(companyKey) {
  const dataset = sampleDatasets[companyKey];
  if (!dataset) return;

  document.getElementById('companyName').value = dataset.name;
  document.getElementById('industry').value = dataset.industry;
  document.getElementById('region').value = dataset.region;
  document.getElementById('manualData').value = JSON.stringify(dataset.data, null, 2);

  document.getElementById('trainingFile').value = '';
  document.getElementById('fileUpload').classList.remove('has-file');
  document.getElementById('fileText').innerHTML = 'Click to upload file<br><small>Format: year, emissions (tons CO2)</small>';

  document.querySelectorAll('.sample-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.sample-btn').classList.add('active');

  showStatus('trainResults', `Loaded ${dataset.name} data. Click "Train Model" to proceed.`, 'success');
}

function clearForm() {
  document.getElementById('companyName').value = '';
  document.getElementById('industry').value = 'Technology';
  document.getElementById('region').value = 'North America';
  document.getElementById('standard').value = 'GHG Protocol';
  document.getElementById('manualData').value = '';
  document.getElementById('trainingFile').value = '';
  document.getElementById('fileUpload').classList.remove('has-file');
  document.getElementById('fileText').innerHTML = 'Click to upload file<br><small>Format: year, emissions (tons CO2)</small>';
  document.querySelectorAll('.sample-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('trainResults').innerHTML = '';
}

// ============================================
// MODEL TRAINING
// ============================================

async function trainModel() {
  const companyName = document.getElementById('companyName').value;
  const industry = document.getElementById('industry').value;
  const region = document.getElementById('region').value;
  const standard = document.getElementById('standard').value;
  const manualData = document.getElementById('manualData').value;
  const fileInput = document.getElementById('trainingFile');

  if (!companyName) {
    showStatus('trainResults', 'Please enter a company name', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('company_name', companyName);
  formData.append('industry', industry);
  formData.append('region', region);
  formData.append('standard', standard);

  if (fileInput.files[0]) {
    formData.append('dataset', fileInput.files[0]);
  } else if (manualData.trim()) {
    try {
      JSON.parse(manualData);
      formData.append('training_data', manualData);
    } catch (e) {
      showStatus('trainResults', 'Invalid JSON format in manual data', 'error');
      return;
    }
  } else {
    showStatus('trainResults', 'Please provide training data (file or manual entry)', 'error');
    return;
  }

  showStatus('trainResults', 'Training model... This may take a moment.', 'loading');

  try {
    const response = await fetch(`${API_BASE_URL}/predict/train`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Training failed');
    }

    trainedModels.push(data.model);
    displayTrainingResults(data.model);

  } catch (error) {
    showStatus('trainResults', `Error: ${error.message}`, 'error');
  }
}

function displayTrainingResults(model) {
  const resultsDiv = document.getElementById('trainResults');
  const trendColor = model.training_summary.trend_direction === 'decreasing' ? '#5a8a5a' : 
                     model.training_summary.trend_direction === 'increasing' ? '#b85c5c' : '#9c9588';
  const trendArrow = model.training_summary.trend_direction === 'decreasing' ? '↓' : 
                     model.training_summary.trend_direction === 'increasing' ? '↑' : '→';

  const html = `
    <div class="card">
      <div class="status-message success">
        <span>Model trained successfully</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${model.training_summary.data_points}</div>
          <div class="kpi-label">Data Points</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${model.training_summary.years_covered}</div>
          <div class="kpi-label">Years Covered</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round(model.statistical_features.mean).toLocaleString()}</div>
          <div class="kpi-label">Avg Emissions (tCO2)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value" style="color: ${trendColor}">${trendArrow}</div>
          <div class="kpi-label">Trend: ${model.training_summary.trend_direction}</div>
        </div>
      </div>

      <div class="two-column" style="margin-top: 20px;">
        <div>
          <h4 style="color: var(--charcoal); margin-bottom: 12px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Statistical Features</h4>
          <div class="json-preview">${JSON.stringify(model.statistical_features, null, 2)}</div>
        </div>
        <div>
          <h4 style="color: var(--charcoal); margin-bottom: 12px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Model Analysis</h4>
          <div class="json-preview">${JSON.stringify(model.model_context, null, 2)}</div>
        </div>
      </div>

      <div class="btn-group" style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="useModelForForecast('${model.model_id}')">
          Generate Forecast with this Model
        </button>
      </div>
    </div>
  `;

  resultsDiv.innerHTML = html;
}

function useModelForForecast(modelId) {
  showSection('forecast');
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tab')[1].classList.add('active');

  refreshModelList().then(() => {
    document.getElementById('forecastModel').value = modelId;
  });
}

// ============================================
// FORECAST GENERATION
// ============================================

async function refreshModelList() {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/models`);
    const data = await response.json();

    const select = document.getElementById('forecastModel');
    select.innerHTML = '<option value="">-- Select a trained model --</option>';

    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.model_id;
        option.textContent = `${model.company_name} (${model.industry}) - ${model.data_points} points`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Failed to load models:', error);
  }
}

async function generateForecast() {
  const modelId = document.getElementById('forecastModel').value;
  const years = parseInt(document.getElementById('yearsToPredict').value);

  if (!modelId) {
    showStatus('forecastResults', 'Please select a trained model', 'error');
    return;
  }

  showStatus('forecastResults', 'Generating forecast...', 'loading');

  try {
    const response = await fetch(`${API_BASE_URL}/predict/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_id: modelId,
        years_to_predict: years
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Forecast failed');
    }

    currentForecast = data.forecast;
    displayForecastResults(data.forecast);

  } catch (error) {
    showStatus('forecastResults', `Error: ${error.message}`, 'error');
  }
}

function displayForecastResults(forecast) {
  const resultsDiv = document.getElementById('forecastResults');
  const predictions = forecast.predictions;
  const firstValue = predictions[0].predicted_emissions;
  const lastValue = predictions[predictions.length - 1].predicted_emissions;
  const trend = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
  const trendColor = trend < 0 ? '#5a8a5a' : '#b85c5c';
  const trendArrow = trend < 0 ? '↓' : '↑';

  const html = `
    <div class="card">
      <div class="status-message success">
        <span>Forecast generated for ${forecast.company_name}</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${forecast.model_accuracy_estimate}%</div>
          <div class="kpi-label">Model Confidence</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value" style="color: ${trendColor}">${trendArrow} ${Math.abs(trend)}%</div>
          <div class="kpi-label">Projected Change</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round(firstValue).toLocaleString()}</div>
          <div class="kpi-label">Starting (tCO2)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round(lastValue).toLocaleString()}</div>
          <div class="kpi-label">Ending (tCO2)</div>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="predictionChart"></canvas>
      </div>

      <h4 style="color: var(--forest); margin: 24px 0 16px 0; font-family: 'Playfair Display', serif; font-size: 1rem;">Detailed Predictions</h4>
      <div class="prediction-cards">
        ${predictions.map(pred => `
          <div class="prediction-card">
            <div class="prediction-year">Year ${pred.year}</div>
            <div class="prediction-value">${Math.round(pred.predicted_emissions).toLocaleString()} tCO2</div>
            <div class="prediction-range">
              ${Math.round(pred.confidence_lower).toLocaleString()} - ${Math.round(pred.confidence_upper).toLocaleString()}
            </div>
            <div class="prediction-reasoning">${pred.reasoning}</div>
          </div>
        `).join('')}
      </div>

      <div class="card" style="margin-top: 24px;">
        <h4 style="color: var(--charcoal); margin-bottom: 12px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Methodology</h4>
        <p style="color: var(--stone); font-size: 0.8125rem; line-height: 1.7;">${forecast.methodology}</p>

        ${forecast.risk_factors.length > 0 ? `
          <h4 style="color: var(--charcoal); margin: 16px 0 12px 0; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Risk Factors</h4>
          <ul style="color: var(--stone); padding-left: 20px; font-size: 0.8125rem; line-height: 1.7;">
            ${forecast.risk_factors.map(rf => `<li>${rf}</li>`).join('')}
          </ul>
        ` : ''}
      </div>

      <div class="card" style="margin-top: 20px;">
        <h4 style="color: var(--charcoal); margin-bottom: 12px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Raw Prediction Data</h4>
        <textarea class="form-textarea" readonly onclick="this.select()" style="min-height: 100px;">${JSON.stringify(predictions, null, 2)}</textarea>
      </div>
    </div>
  `;

  resultsDiv.innerHTML = html;
  renderPredictionChart(forecast);
}

function renderPredictionChart(forecast) {
  const ctx = document.getElementById('predictionChart')?.getContext('2d');
  if (!ctx) return;

  if (predictionChart) {
    predictionChart.destroy();
  }

  const predictions = forecast.predictions;
  const labels = predictions.map(p => p.year.toString());
  const data = predictions.map(p => p.predicted_emissions);
  const lowerBounds = predictions.map(p => p.confidence_lower);
  const upperBounds = predictions.map(p => p.confidence_upper);

  predictionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Predicted Emissions',
          data: data,
          borderColor: '#1a3d2e',
          backgroundColor: 'rgba(26, 61, 46, 0.08)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1a3d2e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          label: 'Confidence Lower',
          data: lowerBounds,
          borderColor: 'rgba(143, 166, 142, 0.6)',
          borderWidth: 1,
          borderDash: [4, 4],
          fill: false,
          pointRadius: 0
        },
        {
          label: 'Confidence Upper',
          data: upperBounds,
          borderColor: 'rgba(143, 166, 142, 0.6)',
          borderWidth: 1,
          borderDash: [4, 4],
          fill: '-1',
          backgroundColor: 'rgba(143, 166, 142, 0.1)',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Emission Forecast for ${forecast.company_name}`,
          color: '#1a3d2e',
          font: { family: 'Playfair Display', size: 15, weight: '600' }
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 11 } }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.03)' },
          ticks: { font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.03)' },
          ticks: {
            font: { family: 'Inter', size: 11 },
            callback: function(value) {
              return value.toLocaleString() + ' t';
            }
          }
        }
      }
    }
  });
}

// ============================================
// COMPARISON
// ============================================

function loadSampleComparison() {
  const samplePredictions = [
    { year: 2024, predicted_emissions: 47000, confidence_lower: 45000, confidence_upper: 49000 },
    { year: 2025, predicted_emissions: 45000, confidence_lower: 42000, confidence_upper: 48000 },
    { year: 2026, predicted_emissions: 43000, confidence_lower: 39000, confidence_upper: 47000 }
  ];

  const sampleActual = [
    { year: 2024, emissions: 46500 },
    { year: 2025, emissions: 44800 },
    { year: 2026, emissions: 43500 }
  ];

  document.getElementById('predictionsData').value = JSON.stringify(samplePredictions, null, 2);
  document.getElementById('actualData').value = JSON.stringify(sampleActual, null, 2);

  showStatus('compareResults', 'Sample comparison data loaded. Click "Compare & Evaluate" to proceed.', 'success');
}

async function comparePredictions() {
  const predictionsJson = document.getElementById('predictionsData').value;
  const actualJson = document.getElementById('actualData').value;

  if (!predictionsJson.trim() || !actualJson.trim()) {
    showStatus('compareResults', 'Please provide both predictions and actual data', 'error');
    return;
  }

  let predictions, actualData;

  try {
    predictions = JSON.parse(predictionsJson);
    actualData = JSON.parse(actualJson);
  } catch (e) {
    showStatus('compareResults', 'Invalid JSON format', 'error');
    return;
  }

  showStatus('compareResults', 'Comparing predictions with actual data...', 'loading');

  try {
    const response = await fetch(`${API_BASE_URL}/predict/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        predictions_json: predictions,
        actual_data: actualData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Comparison failed');
    }

    displayComparisonResults(data.comparison);

  } catch (error) {
    showStatus('compareResults', `Error: ${error.message}`, 'error');
  }
}

function displayComparisonResults(comparison) {
  const resultsDiv = document.getElementById('compareResults');
  const metrics = comparison.accuracy_metrics;
  const rating = comparison.model_performance.rating;

  let accuracyClass = 'poor';
  if (metrics.accuracy_score >= 90) accuracyClass = 'excellent';
  else if (metrics.accuracy_score >= 70) accuracyClass = 'good';
  else if (metrics.accuracy_score >= 50) accuracyClass = 'fair';

  const html = `
    <div class="card">
      <div class="status-message success">
        <span>Comparison complete. Model performance: ${rating}</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${metrics.accuracy_score.toFixed(1)}%</div>
          <div class="kpi-label">Accuracy Score</div>
          <div class="accuracy-bar">
            <div class="accuracy-fill ${accuracyClass}" style="width: ${metrics.accuracy_score}%"></div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${metrics.mape.toFixed(1)}%</div>
          <div class="kpi-label">MAPE (Error %)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round(metrics.mae).toLocaleString()}</div>
          <div class="kpi-label">MAE (Mean Error)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${metrics.confidence_interval_accuracy.toFixed(1)}%</div>
          <div class="kpi-label">Within Confidence Range</div>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="comparisonChart"></canvas>
      </div>

      <div class="card" style="margin-top: 24px;">
        <h4 style="color: var(--charcoal); margin-bottom: 16px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Detailed Comparison</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Predicted</th>
              <th>Actual</th>
              <th>Error</th>
              <th>% Error</th>
              <th>Within Range</th>
            </tr>
          </thead>
          <tbody>
            ${comparison.comparison_results.map(r => `
              <tr>
                <td>${r.year}</td>
                <td>${Math.round(r.predicted).toLocaleString()}</td>
                <td>${Math.round(r.actual).toLocaleString()}</td>
                <td>${Math.round(r.error).toLocaleString()}</td>
                <td>${r.percentage_error.toFixed(1)}%</td>
                <td>${r.within_confidence_range ? 'Yes' : 'No'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h4 style="color: var(--charcoal); margin-bottom: 12px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Recommendation</h4>
        <p style="color: var(--stone); font-size: 0.8125rem; line-height: 1.7;">${comparison.model_performance.recommendation}</p>
      </div>

      ${comparison.improvement_suggestions ? `
        <div class="card" style="margin-top: 20px;">
          <h4 style="color: var(--charcoal); margin-bottom: 16px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Improvement Suggestions</h4>
          ${comparison.improvement_suggestions.map(s => `
            <div style="background: var(--cream); border-left: 3px solid ${s.priority === 'high' ? '#b85c5c' : s.priority === 'medium' ? '#c4705a' : '#8fa68e'}; padding: 14px 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${s.priority === 'high' ? '#b85c5c' : s.priority === 'medium' ? '#c4705a' : '#8fa68e'};">${s.priority}</span>
                <strong style="color: var(--charcoal); font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em;">${s.area.replace('_', ' ')}</strong>
              </div>
              <p style="color: var(--charcoal-light); margin: 0; font-size: 0.8125rem; line-height: 1.6;">${s.suggestion}</p>
              <p style="color: #5a8a5a; font-size: 0.6875rem; margin-top: 6px; font-family: 'JetBrains Mono', monospace;">Expected: ${s.expected_improvement}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  resultsDiv.innerHTML = html;
  renderComparisonChart(comparison.comparison_results);
}

function renderComparisonChart(results) {
  const ctx = document.getElementById('comparisonChart')?.getContext('2d');
  if (!ctx) return;

  if (comparisonChart) {
    comparisonChart.destroy();
  }

  const labels = results.map(r => r.year.toString());
  const predicted = results.map(r => r.predicted);
  const actual = results.map(r => r.actual);

  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Predicted',
          data: predicted,
          backgroundColor: '#1a3d2e',
          borderColor: '#1a3d2e',
          borderWidth: 1
        },
        {
          label: 'Actual',
          data: actual,
          backgroundColor: '#c4705a',
          borderColor: '#c4705a',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Predicted vs Actual Emissions',
          color: '#1a3d2e',
          font: { family: 'Playfair Display', size: 15, weight: '600' }
        },
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 11 } }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.03)' },
          ticks: { font: { family: 'Inter', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.03)' },
          ticks: {
            font: { family: 'Inter', size: 11 },
            callback: function(value) {
              return value.toLocaleString() + ' t';
            }
          }
        }
      }
    }
  });
}

// ============================================
// MODELS LIST
// ============================================

async function loadTrainedModels() {
  const listDiv = document.getElementById('modelsList');
  listDiv.innerHTML = '<p style="color: var(--stone); text-align: center; padding: 40px;">Loading models...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/predict/models`);
    const data = await response.json();

    if (!data.models || data.models.length === 0) {
      listDiv.innerHTML = '<p style="color: var(--stone); text-align: center; padding: 40px;">No trained models yet. Train a model to see it here.</p>';
      return;
    }

    const html = data.models.map(model => `
      <div class="model-item">
        <div class="model-info">
          <h4>${model.company_name}</h4>
          <p>${model.industry} • ${model.data_points} data points • ${model.trend_direction} trend</p>
        </div>
        <div class="model-actions">
          <button class="btn btn-primary btn-small" onclick="useModelForForecast('${model.model_id}')">Forecast</button>
          <button class="btn btn-secondary btn-small" onclick="viewModelDetails('${model.model_id}')">Details</button>
        </div>
      </div>
    `).join('');

    listDiv.innerHTML = html;

  } catch (error) {
    listDiv.innerHTML = `<p style="color: #b85c5c; text-align: center; padding: 40px;">Error loading models: ${error.message}</p>`;
  }
}

async function viewModelDetails(modelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/models/${modelId}`);
    const data = await response.json();

    if (!data.model) {
      alert('Model not found');
      return;
    }

    const model = data.model;

    const details = `
Model ID: ${model.model_id}
Company: ${model.company_info.name}
Industry: ${model.company_info.industry}
Region: ${model.company_info.region}
Trained: ${new Date(model.trained_at).toLocaleString()}

Training Summary:
- Years: ${model.training_data_summary.years_covered}
- Data Points: ${model.training_data_summary.data_points}
- Average Emissions: ${Math.round(model.training_data_summary.average_emissions).toLocaleString()} tCO2
- Trend: ${model.training_data_summary.trend_direction}

Statistical Features:
- Mean: ${Math.round(model.statistical_features.mean).toLocaleString()}
- Min: ${Math.round(model.statistical_features.min).toLocaleString()}
- Max: ${Math.round(model.statistical_features.max).toLocaleString()}
- Avg Growth Rate: ${model.statistical_features.avgGrowthRate.toFixed(2)}%
- Volatility: ${model.statistical_features.volatility.toFixed(2)}%
    `;

    alert(details);

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// ============================================
// DISCREPANCY ANALYSIS (Gemini AI)
// ============================================

function handleAnalyzeFileSelect(input) {
  const file = input.files[0];
  if (file) {
    const uploadDiv = document.getElementById('analyzeFileUpload');
    const fileText = document.getElementById('analyzeFileText');

    uploadDiv.classList.add('has-file');
    fileText.innerHTML = `<strong>${file.name}</strong><br><small>${(file.size / 1024).toFixed(1)} KB</small>`;
  }
}

function clearAnalyzeForm() {
  document.getElementById('analyzeCompanyName').value = '';
  document.getElementById('analyzeIndustry').value = 'Technology';
  document.getElementById('analyzeRegion').value = 'North America';
  document.getElementById('analyzeData').value = '';
  document.getElementById('analyzeFile').value = '';
  document.getElementById('analyzeFileUpload').classList.remove('has-file');
  document.getElementById('analyzeFileText').innerHTML = 'Click to upload dataset<br><small>CSV or JSON format</small>';
  document.getElementById('analyzeResults').innerHTML = '';
}

async function analyzeDiscrepancies() {
  const companyName = document.getElementById('analyzeCompanyName').value;
  const industry = document.getElementById('analyzeIndustry').value;
  const region = document.getElementById('analyzeRegion').value;
  const manualData = document.getElementById('analyzeData').value;
  const fileInput = document.getElementById('analyzeFile');

  const formData = new FormData();
  formData.append('company_name', companyName || 'Unknown Company');
  formData.append('industry', industry);
  formData.append('region', region);

  if (fileInput.files[0]) {
    formData.append('dataset', fileInput.files[0]);
  } else if (manualData.trim()) {
    try {
      JSON.parse(manualData);
      formData.append('dataset', manualData);
    } catch (e) {
      showStatus('analyzeResults', 'Invalid JSON format in manual data', 'error');
      return;
    }
  } else {
    showStatus('analyzeResults', 'Please provide dataset (file or manual entry)', 'error');
    return;
  }

  showStatus('analyzeResults', 'Analyzing discrepancies with Gemini AI... This may take a moment.', 'loading');

  try {
    const response = await fetch(`${API_BASE_URL}/predict/analyze-discrepancies`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Analysis failed');
    }

    displayDiscrepancyResults(data.analysis);

  } catch (error) {
    showStatus('analyzeResults', `Error: ${error.message}`, 'error');
  }
}

function displayDiscrepancyResults(analysis) {
  const resultsDiv = document.getElementById('analyzeResults');
  const summary = analysis.summary;
  const discrepancies = analysis.discrepancies;
  const aiInsights = analysis.ai_insights;
  const recommendations = analysis.recommendations;

  let qualityColor = '#5a8a5a';
  if (summary.data_quality_score < 70) qualityColor = '#c4705a';
  if (summary.data_quality_score < 40) qualityColor = '#b85c5c';

  const html = `
    <div class="card">
      <div class="status-message success">
        <span>Analysis complete. Found ${summary.anomalies_detected} anomalies using ${analysis.mode === 'gemini-ai' ? 'Gemini AI' : 'statistical analysis'}.</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value" style="color: ${qualityColor}">${summary.data_quality_score}</div>
          <div class="kpi-label">Data Quality Score</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${summary.total_data_points}</div>
          <div class="kpi-label">Data Points</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${summary.anomalies_detected}</div>
          <div class="kpi-label">Anomalies Detected</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${summary.trend_consistency}</div>
          <div class="kpi-label">Trend Consistency</div>
        </div>
      </div>

      ${discrepancies.length > 0 ? `
        <div class="card" style="margin-top: 20px;">
          <div class="card-title">
            <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            Detected Discrepancies
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Year</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Detected By</th>
              </tr>
            </thead>
            <tbody>
              ${discrepancies.map(d => `
                <tr>
                  <td><span style="font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; text-transform: uppercase; background: ${d.severity === 'high' ? '#fef2f2' : d.severity === 'medium' ? '#fff7ed' : '#f0fdf4'}; color: ${d.severity === 'high' ? '#b85c5c' : d.severity === 'medium' ? '#c4705a' : '#5a8a5a'}; padding: 2px 8px;">${d.type}</span></td>
                  <td>${d.year}</td>
                  <td><span style="color: ${d.severity === 'high' ? '#b85c5c' : d.severity === 'medium' ? '#c4705a' : '#5a8a5a'}; font-weight: 500;">${d.severity}</span></td>
                  <td>${d.description}</td>
                  <td><span style="font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; text-transform: uppercase;">${d.detected_by === 'gemini_ai' ? 'Gemini AI' : 'Statistical'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${aiInsights && (aiInsights.overall_assessment || aiInsights.insights) ? `
        <div class="card" style="margin-top: 20px;">
          <div class="card-title">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Gemini AI Insights
          </div>
          ${aiInsights.overall_assessment ? `
            <div style="margin-bottom: 16px;">
              <h4 style="color: var(--charcoal); margin-bottom: 8px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Overall Assessment</h4>
              <p style="color: var(--charcoal-light); font-size: 0.875rem; line-height: 1.6;">${aiInsights.overall_assessment}</p>
            </div>
          ` : ''}
          ${aiInsights.data_reliability_score ? `
            <div style="margin-bottom: 16px;">
              <h4 style="color: var(--charcoal); margin-bottom: 8px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">AI Reliability Score</h4>
              <div class="accuracy-bar" style="margin-top: 8px;">
                <div class="accuracy-fill ${aiInsights.data_reliability_score >= 80 ? 'excellent' : aiInsights.data_reliability_score >= 60 ? 'good' : 'fair'}" style="width: ${aiInsights.data_reliability_score}%"></div>
              </div>
              <p style="color: var(--stone); font-size: 0.75rem; margin-top: 4px;">${aiInsights.data_reliability_score}/100</p>
            </div>
          ` : ''}
          ${aiInsights.insights && aiInsights.insights.length > 0 ? `
            <div style="margin-bottom: 16px;">
              <h4 style="color: var(--charcoal); margin-bottom: 8px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Key Insights</h4>
              <ul style="color: var(--charcoal-light); font-size: 0.875rem; line-height: 1.7; padding-left: 20px;">
                ${aiInsights.insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${aiInsights.potential_causes && aiInsights.potential_causes.length > 0 ? `
            <div>
              <h4 style="color: var(--charcoal); margin-bottom: 8px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Potential Causes</h4>
              <ul style="color: var(--charcoal-light); font-size: 0.875rem; line-height: 1.7; padding-left: 20px;">
                ${aiInsights.potential_causes.map(cause => `<li>${cause}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${recommendations && recommendations.length > 0 ? `
        <div class="card" style="margin-top: 20px;">
          <div class="card-title">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Recommendations
          </div>
          ${recommendations.map(r => `
            <div style="background: var(--cream); border-left: 3px solid ${r.priority === 'high' ? '#b85c5c' : r.priority === 'medium' ? '#c4705a' : '#8fa68e'}; padding: 14px 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${r.priority === 'high' ? '#b85c5c' : r.priority === 'medium' ? '#c4705a' : '#8fa68e'};">${r.priority}</span>
                <strong style="color: var(--charcoal); font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em;">${r.category.replace('_', ' ')}</strong>
              </div>
              <p style="color: var(--charcoal-light); margin: 0; font-size: 0.8125rem; line-height: 1.6;">${r.message}</p>
              <p style="color: var(--stone); font-size: 0.75rem; margin-top: 6px;"><strong>Action:</strong> ${r.action}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="card" style="margin-top: 20px;">
        <h4 style="color: var(--charcoal); margin-bottom: 12px; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em;">Statistical Analysis</h4>
        <div class="json-preview">${JSON.stringify(analysis.statistical_analysis, null, 2)}</div>
      </div>
    </div>
  `;

  resultsDiv.innerHTML = html;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showStatus(containerId, message, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div class="status-message ${type}">
      <span>${message}</span>
    </div>
  `;
}

// Check for pre-selected company from dashboard
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const company = urlParams.get('company');

  if (company && sampleDatasets[company]) {
    loadSampleData(company);
  }

  refreshModelList();
});

// Check login status
if (localStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = 'login.html';
}
