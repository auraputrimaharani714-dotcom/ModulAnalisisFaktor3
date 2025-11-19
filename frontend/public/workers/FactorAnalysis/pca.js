/**
 * Principal Component Analysis (PCA) worker
 * Handles PCA calculations and transformations
 */

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardize(data) {
  const n = data.length;
  const p = data[0].length;
  
  // Remove rows with missing values (NaN)
  const cleanData = data.filter(row => row.every(val => !isNaN(val) && val !== null));
  
  if (cleanData.length === 0) throw new Error('No valid data');
  
  // Compute means and standard deviations
  const means = Array(p).fill(0).map((_, j) => 
    mean(cleanData.map(row => row[j]))
  );
  
  const stds = Array(p).fill(0).map((_, j) => {
    const colData = cleanData.map(row => row[j]);
    const m = means[j];
    const variance = mean(colData.map(x => (x - m) * (x - m)));
    return Math.sqrt(variance);
  });
  
  // Standardize
  const standardized = cleanData.map(row =>
    row.map((val, j) => (val - means[j]) / (stds[j] || 1))
  );
  
  return { standardized, means, stds, cleanData };
}

function computeCorrelationMatrix(standardized) {
  const n = standardized.length;
  const p = standardized[0].length;
  
  const correlation = Array(p).fill(null).map(() => Array(p).fill(0));
  
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += standardized[k][i] * standardized[k][j];
      }
      correlation[i][j] = sum / (n - 1);
    }
  }
  
  return correlation;
}

function computeVarianceExplained(eigenvalues, totalVariance) {
  const varianceExplained = eigenvalues.map(e => Math.max(e, 0) / totalVariance);
  const cumulativeVariance = [];
  
  let cumSum = 0;
  for (let v of varianceExplained) {
    cumSum += v;
    cumulativeVariance.push(cumSum);
  }
  
  return {
    percentVariance: varianceExplained.map(v => v * 100),
    cumulativePercentVariance: cumulativeVariance.map(v => v * 100)
  };
}

function performPCA(data, options = {}) {
  try {
    // Step 1: Standardize data
    const { standardized, means, stds, cleanData } = standardize(data);
    
    // Step 2: Compute correlation matrix
    const correlationMatrix = computeCorrelationMatrix(standardized);
    
    // Step 3: Signal to main thread to compute eigendecomposition
    // This will be done via postMessage to the main eigen.js worker
    
    return {
      correlationMatrix,
      standardizedData: standardized,
      means,
      stds,
      cleanData,
      n: cleanData.length,
      p: standardized[0].length
    };
  } catch (error) {
    throw error;
  }
}

function computeScores(standardized, eigenvectors, numComponents) {
  const n = standardized.length;
  const scores = Array(n).fill(null).map(() => Array(numComponents).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < numComponents; j++) {
      let sum = 0;
      for (let k = 0; k < eigenvectors[j].length; k++) {
        sum += standardized[i][k] * eigenvectors[j][k];
      }
      scores[i][j] = sum;
    }
  }
  
  return scores;
}

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  if (type === 'performPCA') {
    try {
      const result = performPCA(data.data, data.options);
      
      self.postMessage({
        type: 'pcaResult',
        data: {
          correlationMatrix: result.correlationMatrix,
          standardizedData: result.standardizedData,
          means: result.means,
          stds: result.stds,
          n: result.n,
          p: result.p
        }
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  } else if (type === 'computeScores') {
    try {
      const scores = computeScores(data.standardized, data.eigenvectors, data.numComponents);
      
      self.postMessage({
        type: 'scoresResult',
        data: { scores }
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  }
};
