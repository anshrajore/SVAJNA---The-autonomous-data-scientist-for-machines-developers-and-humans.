import { trainTestSplit } from './utils';

export interface LinearRegressionResult {
  coefficients: number[]; intercept: number;
  r2: number; adjustedR2: number; mse: number; rmse: number; mae: number;
  featureNames: string[]; targetName: string;
  predictions: number[]; residuals: number[];
  equation: string;
}

function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  let a = matrix.map(row => [...row]);
  let iMat = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => i === j ? 1 : 0));

  for (let i = 0; i < n; i++) {
    let pivot = a[i][i];
    if (pivot === 0) {
      let swapRow = i + 1;
      while (swapRow < n && a[swapRow][i] === 0) swapRow++;
      if (swapRow === n) return iMat; // Pseudo-fail
      let temp = a[i]; a[i] = a[swapRow]; a[swapRow] = temp;
      temp = iMat[i]; iMat[i] = iMat[swapRow]; iMat[swapRow] = temp;
      pivot = a[i][i];
    }
    for (let j = 0; j < n; j++) {
      a[i][j] /= pivot;
      iMat[i][j] /= pivot;
    }
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let factor = a[j][i];
        for (let k = 0; k < n; k++) {
          a[j][k] -= factor * a[i][k];
          iMat[j][k] -= factor * iMat[i][k];
        }
      }
    }
  }
  return iMat;
}

function multiplyMatrixVector(m: number[][], v: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < m.length; i++) {
    let sum = 0;
    for (let j = 0; j < v.length; j++) {
      sum += m[i][j] * v[j];
    }
    result.push(sum);
  }
  return result;
}

function multiplyMatrix(a: number[][], b: number[][]): number[][] {
  const aRows = a.length;
  const aCols = a[0].length;
  const bCols = b[0].length;
  const res = Array.from({ length: aRows }, () => Array(bCols).fill(0));
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        res[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return res;
}

function transpose(m: number[][]): number[][] {
  const res = Array.from({ length: m[0].length }, () => Array(m.length).fill(0));
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[0].length; j++) {
      res[j][i] = m[i][j];
    }
  }
  return res;
}

function computeMetrics(predictions: number[], actuals: number[], numFeatures: number) {
  let mse = 0, mae = 0, sumActual = 0;
  const n = actuals.length;
  for (let i = 0; i < n; i++) {
    const diff = actuals[i] - predictions[i];
    mse += diff * diff;
    mae += Math.abs(diff);
    sumActual += actuals[i];
  }
  mse /= n;
  mae /= n;
  const rmse = Math.sqrt(mse);
  const meanActual = sumActual / n;

  let sst = 0;
  for (let i = 0; i < n; i++) {
    sst += Math.pow(actuals[i] - meanActual, 2);
  }
  const r2 = sst === 0 ? 1 : 1 - (mse * n) / sst;
  const adjustedR2 = n > numFeatures + 1 ? 1 - ((1 - r2) * (n - 1)) / (n - numFeatures - 1) : r2;

  return { mse, rmse, mae, r2, adjustedR2 };
}

export function trainLinearRegression(
  data: Record<string, unknown>[],
  featureNames: string[],
  targetName: string,
  testRatio: number = 0.2
): { train: LinearRegressionResult; test: { r2: number; mse: number; rmse: number; mae: number; predictions: number[]; actuals: number[] } } {
  
  const validData = data.filter(row => {
    if (typeof row[targetName] !== 'number') return false;
    for (const f of featureNames) {
      if (typeof row[f] !== 'number') return false;
    }
    return true;
  });

  const { train, test } = trainTestSplit(validData, testRatio);

  // X train: add intercept
  const X_train = train.map(row => [1, ...featureNames.map(f => row[f] as number)]);
  const y_train = train.map(row => row[targetName] as number);

  // Normal Equation: (X^T X)^-1 X^T y
  const Xt = transpose(X_train);
  const XtX = multiplyMatrix(Xt, X_train);
  const XtX_inv = invertMatrix(XtX);
  const XtY = multiplyMatrixVector(Xt, y_train);
  
  const beta = multiplyMatrixVector(XtX_inv, XtY);
  const intercept = beta[0];
  const coefficients = beta.slice(1);

  const trainPredictions = X_train.map(row => {
    let p = 0;
    for(let i=0; i<beta.length; i++) p+= row[i]*beta[i];
    return p;
  });

  const trainResiduals = trainPredictions.map((p, i) => y_train[i] - p);
  const trainMetrics = computeMetrics(trainPredictions, y_train, featureNames.length);

  const equationTerms = coefficients.map((c, i) => `${c.toFixed(4)} * ${featureNames[i]}`);
  const equation = `y = ${equationTerms.join(' + ')} + ${intercept.toFixed(4)}`;

  const X_test = test.map(row => [1, ...featureNames.map(f => row[f] as number)]);
  const y_test = test.map(row => row[targetName] as number);

  const testPredictions = X_test.map(row => {
    let p = 0;
    for(let i=0; i<beta.length; i++) p+= row[i]*beta[i];
    return p;
  });

  const testMetrics = computeMetrics(testPredictions, y_test, featureNames.length);

  return {
    train: {
      coefficients, intercept,
      r2: trainMetrics.r2, adjustedR2: trainMetrics.adjustedR2,
      mse: trainMetrics.mse, rmse: trainMetrics.rmse, mae: trainMetrics.mae,
      featureNames, targetName,
      predictions: trainPredictions, residuals: trainResiduals,
      equation
    },
    test: {
      r2: testMetrics.r2,
      mse: testMetrics.mse,
      rmse: testMetrics.rmse,
      mae: testMetrics.mae,
      predictions: testPredictions,
      actuals: y_test
    }
  };
}
