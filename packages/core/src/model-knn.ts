import type { DataRow } from "./types.js";

export interface KNNClassifierModel {
  k: number;
  predict(sample: DataRow, featureCols: string[]): string | number;
}

/**
 * Deterministic K-Nearest Neighbors (KNN) Classifier implementation.
 */
export function trainKNNClassifier(trainRows: DataRow[], labelCol: string, k = 3): KNNClassifierModel {
  return {
    k,
    predict: (sample: DataRow, featureCols: string[]) => {
      const distances = trainRows.map((tr) => {
        let sumSq = 0;
        featureCols.forEach((col) => {
          const v1 = parseFloat(String(sample[col] ?? 0));
          const v2 = parseFloat(String(tr[col] ?? 0));
          sumSq += (v1 - v2) ** 2;
        });
        return { label: tr[labelCol]!, dist: Math.sqrt(sumSq) };
      });

      distances.sort((a, b) => a.dist - b.dist);
      const topK = distances.slice(0, k);

      const counts = new Map<string | number, number>();
      topK.forEach((item) => {
        counts.set(item.label, (counts.get(item.label) ?? 0) + 1);
      });

      let bestLabel: string | number = topK[0]!.label;
      let maxCount = 0;
      for (const [lbl, count] of counts) {
        if (count > maxCount) {
          maxCount = count;
          bestLabel = lbl;
        }
      }

      return bestLabel;
    },
  };
}
