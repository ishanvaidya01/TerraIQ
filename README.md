# CarbonTrack AI 🌍

## Smart Carbon Emission Prediction System

CarbonTrack AI is a comprehensive, easy-to-use web application for predicting carbon emissions using machine learning. It features a clean, intuitive interface with beautiful graphs and real-world sample datasets.

![CarbonTrack AI](https://img.shields.io/badge/CarbonTrack-AI-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## ✨ Features

### 🔐 Authentication System
- Secure login page with session management
- Demo credentials: `admin` / `admin123`

### 📊 Dashboard
- Beautiful statistics cards
- Industry emission trends chart
- Quick access to sample datasets
- Feature highlights

### 🎓 Model Training
- Train custom prediction models
- Support for CSV and JSON data upload
- 15+ pre-loaded real-world company datasets
- Manual data entry option
- AI-powered analysis (with Gemini API)
- Statistical fallback mode (without API)

### 📈 Forecast Generation
- Generate 1-20 year emission forecasts
- Confidence intervals for each prediction
- Beautiful line charts with confidence bands
- Detailed prediction cards with reasoning
- Risk factor analysis

### 📊 Accuracy Comparison
- Compare predictions with actual data
- MAE, MAPE, and accuracy score metrics
- Bar charts comparing predicted vs actual
- Improvement suggestions
- Confidence interval accuracy tracking

### 🗂️ Model Management
- View all trained models
- Model details and statistics
- Quick forecast from model list

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- (Optional) Google Gemini API Key for AI-powered predictions

### Installation

1. **Extract the project files**
   ```bash
   cd carbon-emission-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional)**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key (optional)
   # Get your key from: https://makersuite.google.com/app/apikey
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

---

## 📖 User Guide

### Step 1: Login
1. Open `http://localhost:5000`
2. You'll be redirected to the login page
3. Use credentials: **Username:** `admin` | **Password:** `admin123`
4. Click "Sign In to Dashboard"

### Step 2: Explore the Dashboard
- View key statistics
- See industry emission trends
- Browse available sample datasets
- Click "Launch Prediction Model" to start

### Step 3: Train a Model
1. Navigate to "Train Model" tab
2. Either:
   - **Quick Load:** Click any sample company button
   - **Upload CSV:** Click the file upload area
   - **Manual Entry:** Paste JSON data in the textarea
3. Fill in company information
4. Click "Train Prediction Model"
5. View training results and statistics

### Step 4: Generate Forecast
1. Navigate to "Generate Forecast" tab
2. Select your trained model from dropdown
3. Choose years to predict (1-20)
4. Click "Generate Forecast"
5. View beautiful charts and prediction cards

### Step 5: Compare Accuracy
1. Navigate to "Compare Accuracy" tab
2. Paste predictions JSON (from forecast results)
3. Paste actual data JSON
4. Click "Compare & Evaluate"
5. View accuracy metrics and improvement suggestions

---

## 📁 Sample Datasets Included

### Technology Companies
| Company | Industry | Trend |
|---------|----------|-------|
| Apple Inc | Technology | Declining |
| Microsoft | Technology | Declining |
| Infosys | IT Services | Declining |
| Wipro | IT Services | Declining |

### Manufacturing & Energy
| Company | Industry | Trend |
|---------|----------|-------|
| Tesla Inc | Automotive | Declining |
| Tata Steel | Manufacturing | Stable |
| Reliance | Energy | Growing |
| Adani | Energy | Growing |
| Larsen & Toubro | Construction | Stable |
| Maruti Suzuki | Automotive | Stable |

### Financial Services
| Company | Industry | Trend |
|---------|----------|-------|
| HDFC Bank | Financial | Declining |
| ICICI Bank | Financial | Declining |
| SBI | Financial | Declining |

### E-commerce
| Company | Industry | Trend |
|---------|----------|-------|
| Amazon | E-commerce | Variable |

---

## 🔌 API Endpoints

### Train a Model
```http
POST /api/predict/train
Content-Type: multipart/form-data

Parameters:
- company_name: Company name
- industry: Industry type
- region: Geographic region
- standard: Reporting standard
- dataset: CSV file OR training_data: JSON array
```

### Generate Forecast
```http
POST /api/predict/forecast
Content-Type: application/json

{
  "model_id": "model_1234567890",
  "years_to_predict": 5
}
```

### Compare Predictions
```http
POST /api/predict/compare
Content-Type: application/json

{
  "predictions_json": [...],
  "actual_data": [...]
}
```

### List Models
```http
GET /api/predict/models
```

### Get Sample Data
```http
GET /api/predict/sample-data
```

---

## 📊 CSV Format

Your CSV file should have these columns:
```csv
year,emissions
2018,50000
2019,52500
2020,54000
2021,53000
2022,51000
2023,49000
```

---

## 🛠️ Project Structure

```
carbon-emission-system/
├── data/                       # Sample datasets
│   ├── sample_tesla.csv
│   ├── sample_apple.csv
│   ├── sample_microsoft.csv
│   └── ... (15+ datasets)
├── public/                     # Frontend files
│   ├── login.html             # Login page
│   ├── dashboard.html         # Dashboard
│   ├── index.html             # Prediction model
│   └── app.js                 # Frontend logic
├── routes/                     # API routes
│   └── predict.js             # Prediction endpoints
├── services/                   # Business logic
│   └── predictionModel.js     # ML prediction engine
├── server.js                   # Main server
├── package.json               # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🎯 For Invigilators / Evaluators

### What Makes This Project Special?

1. **Complete Authentication Flow**
   - Login → Dashboard → Model Interface
   - Session management with localStorage

2. **Real-World Data**
   - 15+ actual company datasets
   - Various industries and trends

3. **Visual Analytics**
   - Beautiful charts using Chart.js
   - KPI cards and statistics
   - Confidence interval visualization

4. **ML Prediction Engine**
   - Statistical analysis with linear regression
   - Optional Gemini AI enhancement
   - Works without API key (fallback mode)

5. **Complete Workflow**
   - Train → Predict → Compare → Improve

### Key Features to Demo

1. **Login System**
   - Show the login page
   - Enter credentials
   - Dashboard loads

2. **Sample Datasets**
   - Show the dashboard datasets
   - Click any company
   - Data auto-fills in the model

3. **Train Model**
   - Load sample data
   - Click "Train Prediction Model"
   - Show statistics and AI analysis

4. **Generate Forecast**
   - Select trained model
   - Choose 5 years
   - Show the chart and predictions

5. **Compare Accuracy**
   - Load sample comparison
   - Show accuracy metrics
   - Display improvement suggestions

---

## 🔧 Configuration Options

### Without Gemini API (Default)
- Uses statistical linear regression
- 70-75% accuracy estimate
- No API key required
- Works offline

### With Gemini API (Optional)
- AI-powered predictions
- Higher accuracy potential
- Requires API key
- Get key from: https://makersuite.google.com/app/apikey

---

## 📈 Accuracy Metrics

| Metric | Description | Good Range |
|--------|-------------|------------|
| MAE | Mean Absolute Error | < 5% of mean |
| MAPE | Mean Absolute Percentage Error | < 10% |
| Accuracy Score | 100 - MAPE | > 90% |
| Confidence Accuracy | % within CI | > 70% |

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Make sure Node.js is installed
- Check if port 5000 is available
- Try: `PORT=3000 npm run dev`

### "Training failed"
- Ensure at least 3 years of data
- Check CSV format (year, emissions)
- Verify JSON is valid

### "Model not found"
- Train a model first
- Refresh the model list
- Check if server is running

---

## 📜 License

MIT License - Educational Project

---

## 🙏 Credits

- Chart.js for beautiful visualizations
- Google Gemini API for AI enhancement
- Inter font family from Google Fonts

---

## 📧 Support

For questions or issues, please refer to the project documentation or contact your instructor.

---

**Made with ❤️ for Carbon Emission Prediction**
