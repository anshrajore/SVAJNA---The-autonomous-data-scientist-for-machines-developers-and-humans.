import { trainTestSplit } from './utils';

export interface DecisionTreeResult {
  accuracy: number;
  featureNames: string[]; targetName: string;
  depth: number; nodeCount: number;
  classes: (string | number)[];
  featureImportance: { feature: string; importance: number }[];
  rules: string[];
  testPredictions: { actual: string | number; predicted: string | number }[];
  predict: (row: Record<string, unknown>) => string | number;
}

type TreeNode = {
  isLeaf: boolean;
  label?: string | number;
  feature?: string;
  isNumeric?: boolean;
  threshold?: number;
  children?: Record<string, TreeNode>;
  left?: TreeNode;
  right?: TreeNode;
  samples?: number;
};

function calculateEntropy(labels: (string | number)[]): number {
  const counts = new Map<string | number, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / labels.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function majorityClass(labels: (string | number)[]): string | number {
  const counts = new Map<string | number, number>();
  let maxCount = 0;
  let bestLabel: string | number = labels[0];
  for (const label of labels) {
    const c = (counts.get(label) || 0) + 1;
    counts.set(label, c);
    if (c > maxCount) {
      maxCount = c;
      bestLabel = label;
    }
  }
  return bestLabel;
}

export function trainDecisionTree(
  data: Record<string, unknown>[],
  featureNames: string[],
  targetName: string,
  maxDepth: number = 5,
  testRatio: number = 0.2
): DecisionTreeResult {
  const validData = data.filter(row => row[targetName] !== undefined && row[targetName] !== null);
  const uniqueClasses = Array.from(new Set(validData.map(r => r[targetName] as string | number)));

  const { train, test } = trainTestSplit(validData, testRatio);

  const featureImportanceMap = new Map<string, number>();
  let nodeCount = 0;
  let maxActualDepth = 0;

  function buildTree(subset: Record<string, unknown>[], depth: number): TreeNode {
    nodeCount++;
    if (depth > maxActualDepth) maxActualDepth = depth;

    const labels = subset.map(r => r[targetName] as string | number);
    const uniqueSubsetClasses = new Set(labels);

    if (uniqueSubsetClasses.size === 1) {
      return { isLeaf: true, label: Array.from(uniqueSubsetClasses)[0], samples: subset.length };
    }
    if (depth >= maxDepth || subset.length < 2) {
      return { isLeaf: true, label: majorityClass(labels), samples: subset.length };
    }

    const currentEntropy = calculateEntropy(labels);
    let bestGain = 0;
    let bestSplit: any = null;

    for (const feature of featureNames) {
      const isNumeric = typeof subset[0][feature] === 'number';
      
      if (isNumeric) {
        const sortedVals = Array.from(new Set(subset.map(r => r[feature] as number))).sort((a, b) => a - b);
        for (let i = 0; i < sortedVals.length - 1; i++) {
          const threshold = (sortedVals[i] + sortedVals[i + 1]) / 2;
          const leftSubset = subset.filter(r => (r[feature] as number) <= threshold);
          const rightSubset = subset.filter(r => (r[feature] as number) > threshold);
          
          if (leftSubset.length === 0 || rightSubset.length === 0) continue;

          const pLeft = leftSubset.length / subset.length;
          const pRight = rightSubset.length / subset.length;
          const newEntropy = pLeft * calculateEntropy(leftSubset.map(r => r[targetName] as string | number)) +
                             pRight * calculateEntropy(rightSubset.map(r => r[targetName] as string | number));
          const gain = currentEntropy - newEntropy;
          
          if (gain > bestGain) {
            bestGain = gain;
            bestSplit = { feature, isNumeric: true, threshold, leftSubset, rightSubset };
          }
        }
      } else {
        const categories = Array.from(new Set(subset.map(r => String(r[feature]))));
        const partitions: Record<string, Record<string, unknown>[]> = {};
        for (const cat of categories) {
          partitions[cat] = subset.filter(r => String(r[feature]) === cat);
        }
        
        let newEntropy = 0;
        for (const cat of categories) {
          const p = partitions[cat].length / subset.length;
          newEntropy += p * calculateEntropy(partitions[cat].map(r => r[targetName] as string | number));
        }
        
        const gain = currentEntropy - newEntropy;
        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = { feature, isNumeric: false, partitions };
        }
      }
    }

    if (bestGain === 0 || !bestSplit) {
      return { isLeaf: true, label: majorityClass(labels), samples: subset.length };
    }

    featureImportanceMap.set(bestSplit.feature, (featureImportanceMap.get(bestSplit.feature) || 0) + bestGain * subset.length);

    const node: TreeNode = {
      isLeaf: false,
      feature: bestSplit.feature,
      isNumeric: bestSplit.isNumeric,
      samples: subset.length
    };

    if (bestSplit.isNumeric) {
      node.threshold = bestSplit.threshold;
      node.left = buildTree(bestSplit.leftSubset, depth + 1);
      node.right = buildTree(bestSplit.rightSubset, depth + 1);
    } else {
      node.children = {};
      for (const [cat, part] of Object.entries(bestSplit.partitions)) {
        node.children[cat] = buildTree(part as Record<string, unknown>[], depth + 1);
      }
    }

    return node;
  }

  const root = buildTree(train, 0);

  function predictRow(row: Record<string, unknown>, node: TreeNode): string | number {
    if (node.isLeaf) return node.label!;
    const val = row[node.feature!];
    if (node.isNumeric) {
      if ((val as number) <= node.threshold!) return predictRow(row, node.left!);
      return predictRow(row, node.right!);
    } else {
      const child = node.children![String(val)];
      if (child) return predictRow(row, child);
      return majorityClass(train.map(r => r[targetName] as string | number)); // fallback
    }
  }

  const testPredictions = test.map(row => ({
    actual: row[targetName] as string | number,
    predicted: predictRow(row, root)
  }));

  let correct = 0;
  for (const p of testPredictions) {
    if (p.actual === p.predicted) correct++;
  }
  const accuracy = testPredictions.length > 0 ? correct / testPredictions.length : 0;

  const totalImportance = Array.from(featureImportanceMap.values()).reduce((a, b) => a + b, 0);
  const featureImportance = Array.from(featureImportanceMap.entries())
    .map(([feature, imp]) => ({ feature, importance: totalImportance > 0 ? imp / totalImportance : 0 }))
    .sort((a, b) => b.importance - a.importance);

  const rules: string[] = [];
  function extractRules(node: TreeNode, currentPath: string[]) {
    if (node.isLeaf) {
      rules.push(`IF ${currentPath.join(' AND ')} THEN ${targetName} = ${node.label}`);
      return;
    }
    if (node.isNumeric) {
      extractRules(node.left!, [...currentPath, `${node.feature} <= ${node.threshold!.toFixed(4)}`]);
      extractRules(node.right!, [...currentPath, `${node.feature} > ${node.threshold!.toFixed(4)}`]);
    } else {
      for (const [cat, child] of Object.entries(node.children!)) {
        extractRules(child, [...currentPath, `${node.feature} == "${cat}"`]);
      }
    }
  }
  if (!root.isLeaf) {
    extractRules(root, []);
  } else {
    rules.push(`ALWAYS ${targetName} = ${root.label}`);
  }

  return {
    accuracy, featureNames, targetName,
    depth: maxActualDepth, nodeCount,
    classes: uniqueClasses,
    featureImportance, rules, testPredictions,
    predict: (row) => predictRow(row, root)
  };
}
