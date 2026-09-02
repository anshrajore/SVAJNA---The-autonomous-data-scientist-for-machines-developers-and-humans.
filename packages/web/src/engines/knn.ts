import { euclideanDistance, trainTestSplit, standardizeColumn } from './utils';

export interface KNNResult {
  k: number; accuracy: number;
  precision: number; recall: number; f1: number;
  featureNames: string[]; targetName: string;
  classes: (string | number)[];
  testPredictions: { actual: string | number; predicted: string | number }[];
  predict: (features: number[]) => { label: string | number; confidence: number; neighborLabels: (string | number)[] };
}

export function trainKNN(
  data: Record<string, unknown>[],
  featureNames: string[],
  targetName: string,
  k: number = 5,
  testRatio: number = 0.2
): KNNResult {
  const validData = data.filter(row => {
    if (row[targetName] === undefined || row[targetName] === null) return false;
    for (const f of featureNames) {
      if (typeof row[f] !== 'number') return false;
    }
    return true;
  });

  const uniqueClasses = Array.from(new Set(validData.map(r => r[targetName] as string | number)));

  let rawX: number[][] = [];
  let yAll: (string | number)[] = [];
  
  for (const row of validData) {
    rawX.push(featureNames.map(f => row[f] as number));
    yAll.push(row[targetName] as string | number);
  }

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

  const predictRaw = (features: number[], kNum: number) => {
    const distances = train.map(t => ({
      dist: euclideanDistance(features, t.x),
      label: t.y
    }));
    distances.sort((a, b) => a.dist - b.dist);
    const neighbors = distances.slice(0, kNum);
    
    const counts = new Map<string | number, number>();
    for (const n of neighbors) {
      counts.set(n.label, (counts.get(n.label) || 0) + 1);
    }
    
    let bestLabel: string | number = neighbors[0].label;
    let maxCount = 0;
    for (const [lbl, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        bestLabel = lbl;
      }
    }
    return {
      label: bestLabel,
      confidence: maxCount / kNum,
      neighborLabels: neighbors.map(n => n.label)
    };
  };

  const testPredictions = test.map(t => {
    const pred = predictRaw(t.x, k);
    return { actual: t.y, predicted: pred.label };
  });

  let correct = 0;
  for (const p of testPredictions) {
    if (p.actual === p.predicted) correct++;
  }
  const accuracy = testPredictions.length > 0 ? correct / testPredictions.length : 0;
  
  // Micro-average precision/recall logic (simplistic)
  const precision = accuracy; // For multi-class balanced micro-avg, p=r=acc roughly
  const recall = accuracy;
  const f1 = accuracy;

  const predict = (features: number[]) => {
    const normFeatures = features.map((v, j) => featureStds[j] === 0 ? 0 : (v - featureMeans[j]) / featureStds[j]);
    return predictRaw(normFeatures, k);
  };

  return {
    k, accuracy, precision, recall, f1,
    featureNames, targetName,
    classes: uniqueClasses,
    testPredictions,
    predict
  };
}
