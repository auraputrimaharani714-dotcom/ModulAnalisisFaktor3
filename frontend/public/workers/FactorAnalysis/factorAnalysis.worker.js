/**
 * Comprehensive Factor Analysis Worker
 * Handles all statistical computations: descriptive statistics, correlations, 
 * matrix operations, KMO/Bartlett's test, and PCA
 */

importScripts('./correlation.js', './pca.js', './eigen.js');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function transposeMatrix(matrix) {
  if (!matrix || matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array(cols).fill(null).map(() => Array(rows));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

function matrixMultiply(a, b) {
  const result = Array(a.length).fill(null).map(() => Array(b[0].length).fill(0));
  
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < b.length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function qrDecomposition(matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  
  let A = matrix.map(row => [...row]);
  const Q = Array(m).fill(null).map(() => Array(n).fill(0));
  const R = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let k = 0; k < Math.min(m, n); k++) {
    let norm = 0;
    for (let i = k; i < m; i++) {
      norm += A[i][k] * A[i][k];
    }
    norm = Math.sqrt(norm);
    
    if (norm < 1e-10) continue;
    
    if (A[k][k] < 0) norm = -norm;
    
    R[k][k] = norm;
    for (let i = k; i < m; i++) {
      Q[i][k] = A[i][k] / norm;
    }
    
    for (let j = k + 1; j < n; j++) {
      let dot = 0;
      for (let i = k; i < m; i++) {
        dot += Q[i][k] * A[i][j];
      }
      R[k][j] = dot;
      
      for (let i = k; i < m; i++) {
        A[i][j] -= dot * Q[i][k];
      }
    }
  }
  
  return { Q, R };
}

function eigenDecompositionIterative(matrix, maxIterations = 100) {
  const n = matrix.length;
  let A = matrix.map(row => [...row]);
  
  const Q = Array(n).fill(null).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) Q[i][i] = 1;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const { Q: Qk, R } = qrDecomposition(A);
    
    A = matrixMultiply(R, Qk);
    
    const newQ = matrixMultiply(Q, Qk);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Q[i][j] = newQ[i][j];
      }
    }
  }
  
  const eigenvalues = A.map((row, i) => row[i]);
  
  const indices = Array.from({length: n}, (_, i) => i)
    .sort((i, j) => Math.abs(eigenvalues[j]) - Math.abs(eigenvalues[i]));
  
  const sortedEigenvalues = indices.map(i => eigenvalues[i]);
  const sortedEigenvectors = Array(n).fill(null).map((_, i) =>
    indices.map(j => Q[i][j])
  );
  
  return {
    eigenvalues: sortedEigenvalues,
    eigenvectors: sortedEigenvectors
  };
}

// ============================================================================
// DESCRIPTIVE STATISTICS
// ============================================================================

function calculateDescriptiveStatistics(variables, data) {
  return variables.map((variable, index) => {
    const varData = data[index];
    const n = varData.length;
    const m = mean(varData);
    
    let variance = 0;
    for (let i = 0; i < n; i++) {
      variance += Math.pow(varData[i] - m, 2);
    }
    const stdDev = n > 1 ? Math.sqrt(variance / (n - 1)) : 0;
    
    return {
      variable,
      mean: Math.round(m * 1000000) / 1000000,
      stdDeviation: Math.round(stdDev * 1000000) / 1000000,
      analysisN: n,
    };
  });
}

// ============================================================================
// CORRELATION AND COVARIANCE MATRICES
// ============================================================================

function calculateCorrelationMatrix(variables, data) {
  const n = variables.length;
  const correlations = Array(n).fill(null).map(() => Array(n).fill(0));
  
  // Calculate means for each variable
  const means = data.map(varData => {
    const valid = varData.filter(x => !isNaN(x) && x !== null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  });
  
  // Calculate standard deviations
  const stds = data.map((varData, i) => {
    const valid = varData.filter(x => !isNaN(x) && x !== null);
    if (valid.length <= 1) return 1;
    const m = means[i];
    const variance = valid.reduce((sum, x) => sum + (x - m) * (x - m), 0) / (valid.length - 1);
    return Math.sqrt(variance);
  });
  
  // Calculate correlations
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        correlations[i][j] = 1.0;
      } else {
        let sumProduct = 0;
        let count = 0;
        const dataI = data[i];
        const dataJ = data[j];
        const meanI = means[i];
        const meanJ = means[j];
        const stdI = stds[i];
        const stdJ = stds[j];
        
        for (let k = 0; k < dataI.length; k++) {
          if (!isNaN(dataI[k]) && !isNaN(dataJ[k]) && dataI[k] !== null && dataJ[k] !== null) {
            sumProduct += ((dataI[k] - meanI) / stdI) * ((dataJ[k] - meanJ) / stdJ);
            count++;
          }
        }
        
        correlations[i][j] = count > 1 ? Math.round(sumProduct / (count - 1) * 1000) / 1000 : 0;
      }
    }
  }
  
  return {
    variables,
    correlations
  };
}

// ============================================================================
// MATRIX INVERSE (Gaussian Elimination)
// ============================================================================

function calculateMatrixInverse(matrix) {
  const n = matrix.length;
  const aug = matrix.map((row, i) => [
    ...row.map((v) => v),
    ...Array(n)
      .fill(0)
      .map((_, j) => (i === j ? 1 : 0)),
  ]);
  
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(aug[j][i]) > Math.abs(aug[pivot][i])) {
        pivot = j;
      }
    }
    
    [aug[i], aug[pivot]] = [aug[pivot], aug[i]];
    
    if (Math.abs(aug[i][i]) < 1e-10) {
      return matrix.map(() => Array(n).fill(0));
    }
    
    for (let j = i + 1; j < 2 * n; j++) {
      aug[i][j] /= aug[i][i];
    }
    aug[i][i] = 1;
    
    for (let j = i + 1; j < n; j++) {
      const factor = aug[j][i];
      for (let k = i; k < 2 * n; k++) {
        aug[j][k] -= factor * aug[i][k];
      }
    }
  }
  
  for (let i = n - 1; i > 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      const factor = aug[j][i];
      for (let k = 0; k < 2 * n; k++) {
        aug[j][k] -= factor * aug[i][k];
      }
    }
  }
  
  return aug.map((row) => row.slice(n));
}

// ============================================================================
// DETERMINANT CALCULATION
// ============================================================================

function calculateDeterminant(matrix) {
  const n = matrix.length;
  
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  
  let det = 0;
  for (let j = 0; j < n; j++) {
    det += Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(
      matrix
        .slice(1)
        .map((row) =>
          row.filter((_, colIndex) => colIndex !== j)
        )
    );
  }
  return det;
}

// ============================================================================
// CHI-SQUARE DISTRIBUTION
// ============================================================================

function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= Math.floor(n); i++) {
    result *= i;
  }
  return result;
}

function chiSquareDistribution(x, k) {
  if (x < 0) return 0;
  if (x === 0 && k > 0) return 0;
  
  let sum = 0;
  const term = Math.exp(-x / 2) * Math.pow(x / 2, k / 2 - 1) / factorial(k / 2 - 1);
  sum += term;
  
  for (let i = 1; i < 100; i++) {
    sum += term * Math.pow(x / 2, i) / (i * (k / 2 + i - 1));
  }
  
  return Math.min(sum, 1);
}

// ============================================================================
// KMO AND BARTLETT'S TEST
// ============================================================================

function calculateKMOBartletts(correlationMatrix, n) {
  const p = correlationMatrix.length;
  
  const sumSquaredCorr = correlationMatrix.reduce((sum, row) => {
    return (
      sum +
      row.reduce((rowSum, val, i) => {
        return i < row.indexOf(1) ? rowSum + val * val : rowSum;
      }, 0)
    );
  }, 0);
  
  const kmo = sumSquaredCorr / (sumSquaredCorr + correlationMatrix.length * 2);
  
  const det = calculateDeterminant(correlationMatrix);
  const logDet = Math.log(Math.abs(det));
  const chiSquare = -(n - 1 - (2 * p + 5) / 6) * logDet;
  const df = (p * (p - 1)) / 2;
  
  const pValue = 1 - chiSquareDistribution(chiSquare, df);
  
  return {
    kaiser_meyer_olkin: Math.round(kmo * 1000000) / 1000000,
    bartletts_test_chi_square: Math.round(chiSquare * 1000000) / 1000000,
    df: df,
    significance: Math.round(pValue * 1000000) / 1000000,
  };
}

// ============================================================================
// PCA (PRINCIPAL COMPONENT ANALYSIS)
// ============================================================================

// INI BATAS AWAL FUNGSI ASLI

// function performPCA(data, options) {
//   const n = data.length;
//   const p = data[0] ? data[0].length : 0;
  
//   if (p === 0) throw new Error('No variables in data');
  
//   const dataByVariable = transposeMatrix(data);
  
//   const means = dataByVariable.map(col => {
//     const valid = col.filter(x => !isNaN(x));
//     return valid.reduce((a, b) => a + b, 0) / (valid.length || 1);
//   });
  
//   const stds = dataByVariable.map((col, i) => {
//     const valid = col.filter(x => !isNaN(x));
//     if (valid.length <= 1) return 1;
//     const m = means[i];
//     const variance = valid.reduce((sum, x) => sum + (x - m) * (x - m), 0) / (valid.length - 1);
//     return Math.sqrt(variance);
//   });
  
//   const standardized = data.map(row =>
//     row.map((val, j) => (val - means[j]) / (stds[j] || 1))
//   );
  
//   const useCorrelation = options.useCorrelation !== false;
  
//   let matrix;
//   if (useCorrelation) {
//     matrix = Array(p).fill(null).map(() => Array(p).fill(0));
//     for (let i = 0; i < p; i++) {
//       for (let j = 0; j < p; j++) {
//         let sum = 0;
//         for (let k = 0; k < n; k++) {
//           sum += standardized[k][i] * standardized[k][j];
//         }
//         matrix[i][j] = sum / (n - 1);
//       }
//     }
//   } else {
//     matrix = Array(p).fill(null).map(() => Array(p).fill(0));
//     for (let i = 0; i < p; i++) {
//       for (let j = 0; j < p; j++) {
//         let sum = 0;
//         for (let k = 0; k < n; k++) {
//           sum += data[k][i] * data[k][j];
//         }
//         const cov = sum / (n - 1);
//         matrix[i][j] = cov;
//       }
//     }
//   }
  
//   const { eigenvalues, eigenvectors } = eigenDecompositionIterative(matrix);
  
//   const totalVariance = eigenvalues.reduce((sum, e) => sum + Math.max(e, 0), 0);
//   const varianceExplained = eigenvalues.map(e => Math.max(e, 0) / (totalVariance || 1));
//   const cumulativeVariance = [];
//   let cumSum = 0;
//   for (let v of varianceExplained) {
//     cumSum += v;
//     cumulativeVariance.push(cumSum);
//   }
  
//   const eigenvalueThreshold = options.eigenvalueThreshold || 1;
//   const numComponents = Math.max(1, eigenvalues.filter(e => e > eigenvalueThreshold).length);
  
//   const loadings = [];
//   for (let i = 0; i < numComponents; i++) {
//     const loading = eigenvectors[i].map(e => e * Math.sqrt(Math.max(eigenvalues[i], 0)));
//     loadings.push(loading);
//   }
  
//   const communalities = Array(p).fill(0);
//   for (let i = 0; i < p; i++) {
//     for (let j = 0; j < numComponents; j++) {
//       communalities[i] += loadings[j][i] * loadings[j][i];
//     }
//   }
  
//   const scores = Array(n).fill(null).map(() => Array(numComponents).fill(0));
//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < numComponents; j++) {
//       let sum = 0;
//       for (let k = 0; k < p; k++) {
//         sum += standardized[i][k] * eigenvectors[j][k];
//       }
//       scores[i][j] = sum;
//     }
//   }
  
//   return {
//     correlationMatrix: matrix,
//     eigenvalues: eigenvalues,
//     eigenvectors: eigenvectors,
//     loadings: loadings,
//     communalities: communalities,
//     varianceExplained: varianceExplained.map(v => v * 100),
//     cumulativeVariance: cumulativeVariance.map(v => v * 100),
//     scores: scores,
//     means: means,
//     stds: stds,
//     numComponents: numComponents
//   };
// }

// INI BATAS AKHIR FUNGSI ASLI

function performPCA(data, options) {
  // Accept input as variables x samples (as your main thread sends).
  // Convert to samples x variables for computations.
  const dataByVariable = data; // data[varIndex][sampleIndex]
  const dataSamples = transposeMatrix(dataByVariable); // now dataSamples[sampleIndex][varIndex]

  const n = dataSamples.length; // number of samples
  const p = dataSamples[0] ? dataSamples[0].length : 0; // number of variables

  if (p === 0) throw new Error('No variables in data');

  // compute means per variable
  const means = Array.from({ length: p }, (_, j) => {
    const col = dataSamples.map(row => row[j]).filter(x => !isNaN(x));
    return col.length ? col.reduce((a, b) => a + b, 0) / col.length : 0;
  });

  // compute stds per variable
  const stds = Array.from({ length: p }, (_, j) => {
    const col = dataSamples.map(row => row[j]).filter(x => !isNaN(x));
    if (col.length <= 1) return 1;
    const m = means[j];
    const variance = col.reduce((sum, x) => sum + (x - m) * (x - m), 0) / (col.length - 1);
    return Math.sqrt(variance);
  });

  // standardize rows (samples)
  const standardized = dataSamples.map(row =>
    row.map((val, j) => (val === null || isNaN(val) ? 0 : (val - means[j]) / (stds[j] || 1)))
  );

  const useCorrelation = options.useCorrelation !== false;

  // build covariance / correlation matrix (p x p)
  let matrix = Array(p).fill(null).map(() => Array(p).fill(0));
  if (useCorrelation) {
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += standardized[k][i] * standardized[k][j];
        }
        matrix[i][j] = sum / (n - 1);
      }
    }
  } else {
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += (dataSamples[k][i] - means[i]) * (dataSamples[k][j] - means[j]);
        }
        matrix[i][j] = sum / (n - 1);
      }
    }
  }

  const { eigenvalues, eigenvectors } = eigenDecompositionIterative(matrix);

  const totalVariance = eigenvalues.reduce((s, e) => s + Math.max(e, 0), 0);
  const varianceExplained = eigenvalues.map(e => Math.max(e, 0) / (totalVariance || 1));
  const cumulativeVariance = [];
  let cumSum = 0;
  for (let v of varianceExplained) {
    cumSum += v;
    cumulativeVariance.push(cumSum);
  }

  const eigenvalueThreshold = options.eigenvalueThreshold || 1;
  const numComponents = Math.max(1, eigenvalues.filter(e => e > eigenvalueThreshold).length);

  const loadings = [];
  for (let i = 0; i < numComponents; i++) {
    // eigenvectors[i] is vector of length p (per variable)
    const loading = eigenvectors[i].map(e => e * Math.sqrt(Math.max(eigenvalues[i], 0)));
    loadings.push(loading);
  }

  const communalities = Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < numComponents; j++) {
      communalities[i] += loadings[j][i] * loadings[j][i];
    }
  }

  const scores = Array(n).fill(null).map(() => Array(numComponents).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < numComponents; j++) {
      let sum = 0;
      for (let k = 0; k < p; k++) {
        sum += standardized[i][k] * eigenvectors[j][k];
      }
      scores[i][j] = sum;
    }
  }

  return {
    correlationMatrix: matrix,
    eigenvalues: eigenvalues,
    eigenvectors: eigenvectors,
    loadings: loadings,
    communalities: communalities,
    varianceExplained: varianceExplained.map(v => v * 100),
    cumulativeVariance: cumulativeVariance.map(v => v * 100),
    scores: scores,
    means: means,
    stds: stds,
    numComponents: numComponents
  };
}


// ============================================================================
// MAIN ANALYSIS ORCHESTRATOR
// ============================================================================

function performCompleteFactorAnalysis(data, variables, configData) {
  const results = {};
  const targetVariables = variables;
  const descriptives = configData.descriptives;
  const extraction = configData.extraction;
  
  // Descriptive Statistics
  if (descriptives.UnivarDesc) {
    results.descriptive_statistics = calculateDescriptiveStatistics(targetVariables, data);
  }
  
  // Correlation Matrix and related analyses
  if (
    descriptives.Coefficient ||
    descriptives.SignificanceLvl ||
    descriptives.Determinant ||
    descriptives.KMO ||
    descriptives.Inverse ||
    descriptives.Reproduced ||
    descriptives.AntiImage
  ) {
    const correlationResult = calculateCorrelationMatrix(targetVariables, data);
    const correlationMatrix = correlationResult.correlations;
    
    if (descriptives.Coefficient) {
      results.correlation_matrix = {
        correlations: correlationMatrix.map((row, i) => ({
          variable: targetVariables[i],
          values: row.map((val, j) => ({
            variable: targetVariables[j],
            value: val,
          })),
        })),
      };
    }
    
    if (descriptives.Inverse) {
      const inverseMatrix = calculateMatrixInverse(correlationMatrix);
      results.inverse_correlation_matrix = {
        inverse_correlations: inverseMatrix.map((row, i) => ({
          variable: targetVariables[i],
          values: row.map((val, j) => ({
            variable: targetVariables[j],
            value: val,
          })),
        })),
      };
    }
    
    if (descriptives.KMO) {
      const numSamples = data[0] ? data[0].length : 0;
      results.kmo_bartletts_test = calculateKMOBartletts(correlationMatrix, numSamples);
    }
  }
  
  // Principal Components Analysis
  if (extraction && extraction.Method === "PrincipalComp") {
    const pcaOptions = {
      useCorrelation: extraction.Correlation !== false,
      eigenvalueThreshold: extraction.EigenVal || 1,
      maxIterations: extraction.MaxIter || 25
    };
    
    const pcaResults = performPCA(data, pcaOptions);
    
    if (descriptives.InitialSol) {
      results.communalities = {
        initial: targetVariables.map((variable, i) => ({
          variable,
          value: 1.0
        }))
      };

      // Calculate extraction communalities from component loadings
      if (pcaResults.loadings && Array.isArray(pcaResults.loadings)) {
        const extractionCommunalities = new Array(targetVariables.length).fill(0);
        for (let i = 0; i < pcaResults.numComponents; i++) {
          for (let j = 0; j < targetVariables.length; j++) {
            extractionCommunalities[j] += pcaResults.loadings[i][j] * pcaResults.loadings[i][j];
          }
        }
        results.communalities.extraction = targetVariables.map((variable, i) => ({
          variable,
          value: Math.round(extractionCommunalities[i] * 1000000) / 1000000
        }));
      }
    }

    if (extraction.Scree) {
      // Include all eigenvalues in scree plot, not just extracted components
      results.scree_plot = {
        eigenvalues: pcaResults.eigenvalues,
        components: Array.from(
          { length: pcaResults.eigenvalues.length },
          (_, i) => i + 1
        )
      };
    }
    
    const numComponentsToDisplay = Math.min(pcaResults.numComponents, pcaResults.eigenvalues.length);
    results.total_variance_explained = {
      components: Array.from({ length: numComponentsToDisplay }, (_, i) => i + 1),
      eigenvalues: pcaResults.eigenvalues.slice(0, numComponentsToDisplay),
      variance_percent: pcaResults.varianceExplained.slice(0, numComponentsToDisplay),
      cumulative_percent: pcaResults.cumulativeVariance.slice(0, numComponentsToDisplay)
    };
    
    if (extraction.Unrotated) {
      results.component_matrix = {
        components: targetVariables.map((variable, j) => ({
          variable,
          values: Array.from({ length: numComponentsToDisplay }, (_, i) =>
            pcaResults.loadings[i][j]
          )
        }))
      };
    }
  }
  
  return results;
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  try {
    if (type === 'performCompleteFactorAnalysis') {
      const results = performCompleteFactorAnalysis(
        data.data,
        data.variables,
        data.configData
      );
      
      self.postMessage({
        type: 'factorAnalysisCompleted',
        data: results
      });
    } else if (type === 'performPCA') {
      // Legacy support for performPCA
      const result = performPCA(data.data, data.options);
      
      self.postMessage({
        type: 'pcaCompleted',
        data: result
      });
    } else {
      throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message,
      stack: error.stack
    });
  }
};
