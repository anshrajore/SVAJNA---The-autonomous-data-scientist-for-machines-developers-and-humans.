import { euclideanDistance } from './utils';

export interface KMeansResult {
  k: number; centroids: number[][];
  assignments: number[]; clusterSizes: number[];
  inertia: number; iterations: number;
  featureNames: string[];
  predict: (features: number[]) => number;
}

export function trainKMeans(
  data: Record<string, unknown>[],
  featureNames: string[],
  k: number,
  maxIterations: number = 100
): KMeansResult {
  const points = data
    .filter(row => featureNames.every(f => typeof row[f] === 'number'))
    .map(row => featureNames.map(f => row[f] as number));

  if (points.length === 0) {
    throw new Error('No valid numeric data found for K-Means');
  }
  if (k <= 0 || k > points.length) {
    throw new Error(`Invalid k: ${k}`);
  }

  // K-Means++ initialization
  const centroids: number[][] = [];
  centroids.push([...points[Math.floor(Math.random() * points.length)]]);

  for (let i = 1; i < k; i++) {
    const distances = points.map(p => {
      let minDist = Infinity;
      for (const c of centroids) {
        const d = euclideanDistance(p, c);
        if (d < minDist) minDist = d;
      }
      return minDist * minDist; // D(x)^2
    });
    
    const sum = distances.reduce((a, b) => a + b, 0);
    let target = Math.random() * sum;
    
    for (let j = 0; j < points.length; j++) {
      target -= distances[j];
      if (target <= 0) {
        centroids.push([...points[j]]);
        break;
      }
    }
    if (centroids.length <= i) {
      centroids.push([...points[points.length - 1]]);
    }
  }

  let assignments = new Array(points.length).fill(-1);
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (let i = 0; i < points.length; i++) {
      let bestCluster = 0;
      let minDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = euclideanDistance(points[i], centroids[c]);
        if (d < minDist) {
          minDist = d;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    if (changed) {
      const newCentroids = Array.from({ length: k }, () => new Array(featureNames.length).fill(0));
      const counts = new Array(k).fill(0);

      for (let i = 0; i < points.length; i++) {
        const c = assignments[i];
        counts[c]++;
        for (let j = 0; j < featureNames.length; j++) {
          newCentroids[c][j] += points[i][j];
        }
      }

      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let j = 0; j < featureNames.length; j++) {
            centroids[c][j] = newCentroids[c][j] / counts[c];
          }
        }
      }
    }
  }

  let inertia = 0;
  const clusterSizes = new Array(k).fill(0);
  for (let i = 0; i < points.length; i++) {
    const c = assignments[i];
    clusterSizes[c]++;
    const d = euclideanDistance(points[i], centroids[c]);
    inertia += d * d;
  }

  const predict = (features: number[]) => {
    let bestCluster = 0;
    let minDist = Infinity;
    for (let c = 0; c < k; c++) {
      const d = euclideanDistance(features, centroids[c]);
      if (d < minDist) {
        minDist = d;
        bestCluster = c;
      }
    }
    return bestCluster;
  };

  return { k, centroids, assignments, clusterSizes, inertia, iterations, featureNames, predict };
}
