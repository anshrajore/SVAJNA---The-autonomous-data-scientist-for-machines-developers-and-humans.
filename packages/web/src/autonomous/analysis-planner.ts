export interface PlannedAnalysisItem {
  stepNumber: number;
  title: string;
  category: 'quality' | 'distribution' | 'correlation' | 'segmentation' | 'predictive_modeling' | 'root_cause';
  informationValueScore: number;
  description: string;
  recommendedVisual: string;
}

export function generateAutonomousAnalysisPlan(
  filename: string,
  rowCount: number,
  columnCount: number
): PlannedAnalysisItem[] {
  return [
    {
      stepNumber: 1,
      title: 'Ingestion & Data Health Audit',
      category: 'quality',
      informationValueScore: 99,
      description: 'Profile missing values, duplicate entries, and statistical distribution parameters.',
      recommendedVisual: 'Schema Scorecard Table',
    },
    {
      stepNumber: 2,
      title: 'Target Candidate Suitability Evaluation',
      category: 'distribution',
      informationValueScore: 95,
      description: 'Identify potential numerical and binary classification target variables.',
      recommendedVisual: 'Target Scorecard',
    },
    {
      stepNumber: 3,
      title: 'Bivariate Correlation & Feature Collinearity',
      category: 'correlation',
      informationValueScore: 91,
      description: 'Compute Pearson R correlation matrix to discover feature dependencies.',
      recommendedVisual: 'N×N Correlation Heatmap',
    },
    {
      stepNumber: 4,
      title: 'Autonomous Root-Cause Investigation Tree',
      category: 'root_cause',
      informationValueScore: 88,
      description: 'Decompose revenue and metric variances into regional and customer entity branches.',
      recommendedVisual: 'Interactive Investigation Tree',
    },
    {
      stepNumber: 5,
      title: 'Candidate ML Pipeline Construction',
      category: 'predictive_modeling',
      informationValueScore: 84,
      description: 'Fit Linear Regression, Logistic Regression, KNN, K-Means++, and Decision Trees.',
      recommendedVisual: 'Model Comparison Matrix',
    },
    {
      stepNumber: 6,
      title: 'Live Inference & Prediction Counterfactuals',
      category: 'predictive_modeling',
      informationValueScore: 81,
      description: 'Run interactive prediction queries with probability confidence intervals.',
      recommendedVisual: 'Prediction Gauge & Form',
    },
  ];
}
