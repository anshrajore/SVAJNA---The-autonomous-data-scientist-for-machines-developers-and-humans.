export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return num / den;
}

export function correlationMatrix(data: Record<string, unknown>[], numericCols: string[]): { cols: string[]; matrix: number[][] } {
  const arrays: number[][] = numericCols.map(col => 
    data.map(row => {
      const val = row[col];
      return typeof val === 'number' ? val : 0;
    })
  );

  const n = numericCols.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const corr = pearsonCorrelation(arrays[i], arrays[j]);
        matrix[i][j] = corr;
        matrix[j][i] = corr;
      }
    }
  }

  return { cols: numericCols, matrix };
}
