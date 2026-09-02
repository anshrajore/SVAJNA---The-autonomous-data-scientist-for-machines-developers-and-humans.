export function generateReproducibleCode(
  analysisType: 'profiling' | 'correlation' | 'regression' | 'classification' | 'tree',
  targetVar: string = 'profit',
  featureVars: string[] = ['sales', 'score']
): string {
  if (analysisType === 'regression') {
    return `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error

# 1. Load Dataset
df = pd.read_csv("dataset.csv")

# 2. Select Features and Target
X = df[${JSON.stringify(featureVars)}]
y = df['${targetVar}']

# 3. Train-Test Split (80/20)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Fit OLS Model
model = LinearRegression()
model.fit(X_train, y_train)

# 5. Predictions & Evaluation
preds = model.predict(X_test)
r2 = r2_score(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))

print(f"Model R²: {r2:.4f}")
print(f"Model RMSE: {rmse:.4f}")
print("Coefficients:", dict(zip(X.columns, model.coef_)))
print("Intercept:", model.intercept_)`;
  }

  return `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Load and profile dataset
df = pd.read_csv("dataset.csv")
print("Dataset Shape:", df.shape)
print("Missing Values:\\n", df.isnull().sum())

# Compute correlation matrix
numeric_df = df.select_dtypes(include=[np.number])
corr = numeric_df.corr()
print("Correlation Matrix:\\n", corr)

# Plot Heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(corr, annot=True, cmap="coolwarm")
plt.title("SVAJNA Pearson Correlation Matrix")
plt.show()`;
}
