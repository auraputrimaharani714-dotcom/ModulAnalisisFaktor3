/**
 * Utility functions for correlation matrix calculation
 */

export interface CorrelationMatrix {
    variables: string[];
    correlations: number[][];
}

/**
 * Calculate mean of an array
 */
function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n <= 1) return 0;

    const meanX = mean(x);
    const meanY = mean(y);

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

    const correlation = sumXY / Math.sqrt(sumX2 * sumY2);
    return Math.round(correlation * 1000) / 1000;
}

/**
 * Calculate correlation matrix for multiple variables
 */
export function calculateCorrelationMatrix(
    variables: string[],
    data: number[][]
): CorrelationMatrix {
    const n = variables.length;
    const correlations: number[][] = Array(n)
        .fill(null)
        .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) {
                correlations[i][j] = 1;
            } else {
                correlations[i][j] = calculatePearsonCorrelation(
                    data[i],
                    data[j]
                );
            }
        }
    }

    return {
        variables,
        correlations,
    };
}

/**
 * Calculate covariance matrix for multiple variables
 */
export function calculateCovarianceMatrix(
    variables: string[],
    data: number[][]
): CorrelationMatrix {
    const n = variables.length;
    const covariances: number[][] = Array(n)
        .fill(null)
        .map(() => Array(n).fill(0));

    const means = data.map((arr) => mean(arr));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let sumProd = 0;
            const minLength = Math.min(data[i].length, data[j].length);

            for (let k = 0; k < minLength; k++) {
                sumProd += (data[i][k] - means[i]) * (data[j][k] - means[j]);
            }

            covariances[i][j] =
                minLength > 1 ? sumProd / (minLength - 1) : 0;
        }
    }

    return {
        variables,
        correlations: covariances,
    };
}

/**
 * Calculate mean and standard deviation for descriptive statistics
 */
export interface DescriptiveStats {
    variable: string;
    mean: number;
    stdDeviation: number;
    analysisN: number;
}

export function calculateDescriptiveStatistics(
    variables: string[],
    data: number[][]
): DescriptiveStats[] {
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
