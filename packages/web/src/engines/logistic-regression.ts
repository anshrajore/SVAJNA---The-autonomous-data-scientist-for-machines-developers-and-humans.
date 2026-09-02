import { trainTestSplit, standardizeColumn } from './utils';

export interface LogisticRegressionResult {
  weights: number[]; bias: number;
  accuracy: number; precision: number; recall: number; f1: number;
  confusionMatrix: { tp: number; fp: number; tn: number; fn: number };
  featureNames: string[]; targetName: string;
  classes: [string | number, string | number];
  lossHistory: number[];
  predict: (features: number[]) => { label: string | number; probability: number };
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function trainLogisticRegression(
  data: Record<string, unknown>[],
  featureNames: string[],
  targetName: string,
  options?: { learningRate?: number; epochs?: number; testRatio?: number }
): LogisticRegressionResult {
  const lr = options?.learningRate || 0.01;
  const epochs = options?.epochs || 500;
  const testRatio = options?.testRatio ?? 0.2;

  const validData = data.filter(row => {
    if (row[targetName] === undefined || row[targetName] === null) return false;
    for (const f of featureNames) {
      if (typeof row[f] !== 'number') return false;
    }
    return true;
  });

  const uniqueClasses = Array.from(new Set(validData.map(r => r[targetName] as string | number)));
  if (uniqueClasses.length !== 2) {
    throw new Error(`Logistic regression requires exactly 2 classes. Found: ${uniqueClasses.length}`);
  }

  const class0 = uniqueClasses[0];
  const class1 = uniqueClasses[1];

  let rawX: number[][] = [];
  let yAll: number[] = [];
  
  for (const row of validData) {
    rawX.push(featureNames.map(f => row[f] as number));
    yAll.push(row[targetName] === class1 ? 1 : 0);
  }

  // Normalize features
  const featureMeans: number[] = [];
  const featureStds: number[] = [];
  const X_norm = Array.from({ length: validData.length }, () => Array(featureNames.length).fill(0));

  for (let j = 0; j < featureNames.length; j++) {
    const col = rawX.map(row => row[j]);
    const { standardized, mean, std } = standardizeColumn(col);
    featureMeans.push(mean);
    featureStds.push(std);
    for (let i = 0; i < validData.length; i++) {
      X_norm[i][j] = standardized[i];
    }
  }

  const paired = X_norm.map((x, i) => ({ x, y: yAll[i] }));
  const { train, test } = trainTestSplit(paired, testRatio);

  const X_train = train.map(t => t.x);
  const y_train = train.map(t => t.y);

  let weights = Array(featureNames.length).fill(0);
  let bias = 0;
  const lossHistory: number[] = [];
  const m = X_train.length;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let dw = Array(featureNames.length).fill(0);
    let db = 0;
    let cost = 0;

    for (let i = 0; i < m; i++) {
      let z = bias;
      for (let j = 0; j < weights.length; j++) {
        z += weights[j] * X_train[i][j];
      }
      const a = sigmoid(z);
      
      const y = y_train[i];
      cost += -(y * Math.log(Math.max(a, 1e-15)) + (1 - y) * Math.log(Math.max(1 - a, 1e-15)));
      
      const dz = a - y;
      for (let j = 0; j < weights.length; j++) {
        dw[j] += X_train[i][j] * dz;
      }
      db += dz;
    }

    cost /= m;
    if (epoch % 10 === 0) {
      lossHistory.push(cost);
    }

    for (let j = 0; j < weights.length; j++) {
      weights[j] -= lr * (dw[j] / m);
    }
    bias -= lr * (db / m);
  }

  const X_test = test.map(t => t.x);
  const y_test = test.map(t => t.y);

  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < X_test.length; i++) {
    let z = bias;
    for (let j = 0; j < weights.length; j++) {
      z += weights[j] * X_test[i][j];
    }
    const pred = sigmoid(z) >= 0.5 ? 1 : 0;
    const actual = y_test[i];

    if (pred === 1 && actual === 1) tp++;
    else if (pred === 1 && actual === 0) fp++;
    else if (pred === 0 && actual === 1) fn++;
    else tn++;
  }

  const accuracy = (tp + tn) / (tp + tn + fp + fn || 1);
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = 2 * (precision * recall) / (precision + recall || 1);

  const predict = (features: number[]) => {
    let z = bias;
    for (let j = 0; j < features.length; j++) {
      const val = featureStds[j] === 0 ? 0 : (features[j] - featureMeans[j]) / featureStds[j];
      z += weights[j] * val;
    }
    const prob = sigmoid(z);
    return {
      label: prob >= 0.5 ? class1 : class0,
      probability: prob >= 0.5 ? prob : 1 - prob
    };
  };

  return {
    weights, bias, accuracy, precision, recall, f1,
    confusionMatrix: { tp, fp, tn, fn },
    featureNames, targetName,
    classes: [class0, class1],
    lossHistory, predict
  };
}
