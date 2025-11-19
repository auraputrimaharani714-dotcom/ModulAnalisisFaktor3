/**
 * Eigenvalue Decomposition for Symmetric Matrices using Power Iteration Method
 */

function transposeMatrix(matrix) {
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

function multiplyMatrices(a, b) {
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

function vectorNorm(v) {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
}

function normalizeVector(v) {
  const norm = vectorNorm(v);
  return v.map(x => x / norm);
}

/**
 * Eigenvalue decomposition using QR algorithm
 */
function eigenDecomposition(matrix, maxIterations = 100) {
  const n = matrix.length;
  let A = matrix.map(row => [...row]);
  
  const Q = Array(n).fill(null).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) Q[i][i] = 1;
  
  // QR Algorithm
  for (let iter = 0; iter < maxIterations; iter++) {
    const { Q: Qk, R } = qrDecomposition(A);
    A = multiplyMatrices(R, Qk);
    
    // Update accumulator Q
    const newQ = multiplyMatrices(Q, Qk);
    Q.forEach((row, i) => row.forEach((_, j) => Q[i][j] = newQ[i][j]));
  }
  
  // Extract eigenvalues (diagonal of A)
  const eigenvalues = A.map((row, i) => row[i]);
  
  // Sort by magnitude (descending)
  const indices = eigenvalues.map((_, i) => i).sort((i, j) => Math.abs(eigenvalues[j]) - Math.abs(eigenvalues[i]));
  
  const sortedEigenvalues = indices.map(i => eigenvalues[i]);
  const eigenvectors = Array(n).fill(null).map((_, i) => 
    indices.map(j => Q[i][j])
  );
  
  return {
    eigenvalues: sortedEigenvalues,
    eigenvectors: eigenvectors
  };
}

/**
 * QR Decomposition using Householder reflections
 */
function qrDecomposition(A) {
  const m = A.length;
  const n = A[0].length;
  
  let Q = A.map(row => [...row]);
  const R = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let k = 0; k < Math.min(m, n); k++) {
    // Get column k from k to end
    const x = Array(m - k).fill(0).map((_, i) => Q[i + k][k]);
    
    // Compute householder vector
    const sigma = vectorNorm(x);
    const u = [...x];
    u[0] = x[0] + (x[0] >= 0 ? sigma : -sigma);
    
    const uNorm = vectorNorm(u);
    if (uNorm < 1e-10) continue;
    
    const v = u.map(x => x / uNorm);
    
    // Apply householder to Q
    for (let j = k; j < n; j++) {
      let dot = 0;
      for (let i = k; i < m; i++) {
        dot += v[i - k] * Q[i][j];
      }
      
      for (let i = k; i < m; i++) {
        Q[i][j] -= 2 * dot * v[i - k];
      }
    }
    
    // Compute R
    for (let j = k; j < n; j++) {
      let dot = 0;
      for (let i = k; i < m; i++) {
        dot += v[i - k] * A[i][j];
      }
      
      R[k][j] = A[k][j] - 2 * dot * v[0];
      for (let i = k + 1; i < m; i++) {
        R[k][j] -= 2 * dot * v[i - k];
      }
    }
  }
  
  // Extract Q from Q
  const Q_out = Array(m).fill(null).map(() => Array(Math.min(m, n)).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < Math.min(m, n); j++) {
      Q_out[i][j] = Q[i][j];
    }
  }
  
  return { Q: Q_out, R: R.map(row => row.slice(0, Math.min(m, n))) };
}

/**
 * Compute principal components (loadings)
 */
function computeLoadings(eigenvectors, eigenvalues, numComponents) {
  const loadings = [];
  
  for (let i = 0; i < numComponents; i++) {
    const loading = eigenvectors[i].map(e => e * Math.sqrt(Math.max(eigenvalues[i], 0)));
    loadings.push(loading);
  }
  
  return loadings;
}

/**
 * Compute communalities from loadings
 */
function computeCommunalities(loadings, numVariables) {
  const communalities = Array(numVariables).fill(0);
  
  for (let i = 0; i < numVariables; i++) {
    for (let j = 0; j < loadings.length; j++) {
      communalities[i] += loadings[j][i] * loadings[j][i];
    }
  }
  
  return communalities;
}

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  if (type === 'eigenDecomposition') {
    try {
      const result = eigenDecomposition(data.matrix, data.maxIterations || 100);
      
      self.postMessage({
        type: 'eigenDecompositionResult',
        data: {
          eigenvalues: result.eigenvalues,
          eigenvectors: result.eigenvectors
        }
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  } else if (type === 'computeLoadings') {
    try {
      const loadings = computeLoadings(data.eigenvectors, data.eigenvalues, data.numComponents);
      const communalities = computeCommunalities(loadings, data.numVariables);
      
      self.postMessage({
        type: 'loadingsResult',
        data: { loadings, communalities }
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  }
};
