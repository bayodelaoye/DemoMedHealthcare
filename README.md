# Ksense Technology Group – Take-Home Assessment

## Project Overview

This project is a solution to the take-home coding challenge from **Ksense Technology Group**.

The goal is to:
- Integrate with a simulated healthcare API,
- Retrieve and process patient data,
- Calculate health risk scores,
- Identify patients who meet specific criteria,
- Submit the results back to the API.

The challenge simulates real-world conditions such as rate limits, intermittent failures, and inconsistent data — making robust data handling an important part of the solution.

## Features

- ✅ API integration with authentication headers
- 🔁 Automatic retries for 429/500/503 errors
- 📄 Pagination handling for ~50 patients
- 🔍 Risk scoring based on:
  - Blood Pressure
  - Temperature
  - Age
- 🧠 Categorization of:
  - High-risk patients (total risk score ≥ 4)
  - Fever patients (temperature ≥ 99.6°F)
  - Patients with data quality issues (invalid/missing BP, age, or temp)
- 📤 Submission of results to the API

## Technologies Used

- JavaScript (Node.js)
- [node-fetch](https://www.npmjs.com/package/node-fetch)

## How to Run the Code

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ksense-assessment.git
cd ksense-assessment
```

### 2. Install Dependencies

```bash
npm install node-fetch@2
```

### 3. Run the Script

```bash
node index.js
```

## API Authentication

- The script uses the following API key (provided by Ksense for this assessment):

```bash
x-api-key: ak_3b746fd198ef88b87f586932bf76d60ca6f4318287c14320
```

## Output Format

- The script automatically submits results in this format:

```bash
{
  "high_risk_patients": ["DEMO002", "DEMO031"],
  "fever_patients": ["DEMO005", "DEMO021"],
  "data_quality_issues": ["DEMO004", "DEMO007"]
}
```

## Example Response

```bash
{
  "success": true,
  "message": "Assessment submitted successfully",
  "results": {
    "score": 91.94,
    "status": "PASS",
    "breakdown": {
      "high_risk": { "correct": 20 },
      "fever": { "correct": 9 },
      "data_quality": { "correct": 8 }
    }
  }
}
```
