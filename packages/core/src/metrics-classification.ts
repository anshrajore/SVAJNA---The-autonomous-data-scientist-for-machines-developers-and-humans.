export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

/**
 * Computes binary classification Confusion Matrix and metrics.
 */
export function calculateConfusionMatrix(actuals: number[], predictions: number[]): ConfusionMatrix {
  let tp = 0,
    fp = 0,
    tn = 0,
    fn = 0;

  actuals.forEach((act, i) => {
    const pred = predictions[i];
    if (act === 1 && pred === 1) tp++;
    else if (act === 0 && pred === 1) fp++;
    else if (act === 0 && pred === 0) tn++;
    else if (act === 1 && pred === 0) fn++;
  });

  const total = actuals.length || 1;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1Score = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return { tp, fp, tn, fn, accuracy, precision, recall, f1Score };
}
