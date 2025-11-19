/**
 * Correlation matrix utilities for factor analysis
 */

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr) {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n <= 1) return 0;
  
  const meanX = mean(x.slice(0, n));
  const meanY = mean(y.slice(0, n));
  
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }
  
  if (sumX2 === 0 || sumY2 === 0) return 0;
  
  return sumXY / Math.sqrt(sumX2 * sumY2);
}

function computeCorrelationMatrix(data, variables) {
  const numVars = variables.length;
  const correlation = Array(numVars).fill(null).map(() => Array(numVars).fill(0));
  
  for (let i = 0; i < numVars; i++) {
    for (let j = 0; j < numVars; j++) {
      if (i === j) {
        correlation[i][j] = 1.0;
      } else {
        correlation[i][j] = pearsonCorrelation(data[i], data[j]);
      }
    }
  }
  
  return correlation;
}

function computeCovarianceMatrix(data, variables) {
  const numVars = variables.length;
  const means = data.map(col => mean(col));
  
  const covariance = Array(numVars).fill(null).map(() => Array(numVars).fill(0));
  
  const n = data[0].length;
  
  for (let i = 0; i < numVars; i++) {
    for (let j = 0; j < numVars; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += (data[i][k] - means[i]) * (data[j][k] - means[j]);
      }
      covariance[i][j] = sum / (n - 1);
    }
  }
  
  return covariance;
}

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  if (type === 'computeCorrelation') {
    try {
      const correlation = computeCorrelationMatrix(data.data, data.variables);
      
      self.postMessage({
        type: 'correlationResult',
        data: { correlation }
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  } else if (type === 'computeCovariance') {
    try {
      const covariance = computeCovarianceMatrix(data.data, data.variables);
      
      self.postMessage({
        type: 'covarianceResult',
        data: { covariance }
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  }
};
