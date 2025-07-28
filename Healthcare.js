const fetch = require("node-fetch");

const API_KEY = "ak_3b746fd198ef88b87f586932bf76d60ca6f4318287c14320";
const BASE_URL = "https://assessment.ksensetech.com/api";

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDataWithRetries(url, maxRetries = 3) {
  for (let tries = 0; tries <= maxRetries; tries++) {
    try {
      const response = await fetch(url, {
        headers: { "x-api-key": API_KEY },
      });

      if ([429, 500, 503].includes(response.status)) {
        if (tries < maxRetries) {
          await pause(1000 * (tries + 1));
          continue;
        } else {
          throw new Error(
            `Failed after retries with status ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (tries === maxRetries) {
        throw error;
      }
      await pause(1000 * (tries + 1));
    }
  }
}

function parseBP(bpString) {
  if (!bpString || typeof bpString !== "string") return [null, null];

  const parts = bpString.split("/");
  if (parts.length !== 2) return [null, null];

  const sys = parseInt(parts[0], 10);
  const dia = parseInt(parts[1], 10);

  if (isNaN(sys) || isNaN(dia)) return [null, null];

  return [sys, dia];
}

function getBloodPressureScore(sys, dia) {
  if (sys === null || dia === null) return 0;

  let sysScore = 0;
  let diaScore = 0;

  if (sys < 120) sysScore = 1;
  else if (sys <= 129) sysScore = 2;
  else if (sys <= 139) sysScore = 3;
  else sysScore = 4;

  if (dia < 80) diaScore = 1;
  else if (dia <= 89) diaScore = 3;
  else diaScore = 4;

  return Math.max(sysScore, diaScore);
}

function getTemperatureScore(temp) {
  if (temp === null || isNaN(temp)) return 0;

  if (temp <= 99.5) return 0;
  else if (temp <= 100.9) return 1;
  else if (temp >= 101) return 2;

  return 0;
}

function getAgeScore(age) {
  if (age === null || isNaN(age)) return 0;

  if (age < 40) return 1;
  else if (age <= 65) return 1;
  else return 2;
}

async function runAssessment() {
  let currentPage = 1;
  let lastPage = 1;

  const highRisk = [];
  const fever = [];
  const badData = [];

  while (currentPage <= lastPage) {
    const url = `${BASE_URL}/patients?page=${currentPage}&limit=20`;
    const response = await getDataWithRetries(url);

    lastPage = response.pagination.totalPages;

    for (const patient of response.data) {
      const id = patient.patient_id;

      // Get BP parts
      const [sys, dia] = parseBP(patient.blood_pressure);
      const temp = patient.temperature;
      const age = patient.age;

      const invalidBP = sys === null || dia === null;
      const invalidTemp = temp === null || isNaN(temp);
      const invalidAge = age === null || isNaN(age);

      if (invalidBP || invalidTemp || invalidAge) {
        badData.push(id);
        continue;
      }

      const bpScore = getBloodPressureScore(sys, dia);
      const tempScore = getTemperatureScore(parseFloat(temp));
      const ageScore = getAgeScore(parseInt(age, 10));

      const totalScore = bpScore + tempScore + ageScore;

      if (totalScore >= 4) highRisk.push(id);
      if (temp >= 99.6) fever.push(id);
    }

    currentPage++;
  }

  const results = {
    high_risk_patients: highRisk,
    fever_patients: fever,
    data_quality_issues: badData,
  };

  const submitResponse = await fetch(`${BASE_URL}/submit-assessment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(results),
  });

  const resultData = await submitResponse.json();
  console.log("Submission result:", resultData);
}

runAssessment().catch((error) => console.error("Error:", error.message));
