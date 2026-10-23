export const CURATED_BENCHMARKS = {
  sales: [
    { id: 1, country: "USA", sales: 125000, profit: 34000, active: true, region: "North America", score: 88, churn: false },
    { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true, region: "Asia Pacific", score: 92, churn: false },
    { id: 3, country: "Germany", sales: 87000, profit: 21000, active: true, region: "Europe", score: 85, churn: false },
    { id: 4, country: "UK", sales: 65000, profit: 16000, active: false, region: "Europe", score: 79, churn: true },
    { id: 5, country: "India", sales: 142000, profit: 41000, active: true, region: "Asia Pacific", score: 95, churn: false },
    { id: 6, country: "Canada", sales: 54000, profit: 13000, active: true, region: "North America", score: 81, churn: false },
    { id: 7, country: "Australia", sales: 76000, profit: 19500, active: true, region: "Asia Pacific", score: 84, churn: false },
    { id: 8, country: "France", sales: 91000, profit: 23000, active: true, region: "Europe", score: 89, churn: false },
    { id: 9, country: "Brazil", sales: 62000, profit: 14000, active: false, region: "South America", score: 75, churn: true },
    { id: 10, country: "Singapore", sales: 115000, profit: 31000, active: true, region: "Asia Pacific", score: 94, churn: false },
  ],
  fintech: [
    { txn_id: 101, user: "usr_991", amount: 14500, velocity_score: 94, device_trust: 35, foreign_ip: true, fraud_flag: true, region: "North America" },
    { txn_id: 102, user: "usr_412", amount: 240, velocity_score: 12, device_trust: 98, foreign_ip: false, fraud_flag: false, region: "Europe" },
    { txn_id: 103, user: "usr_823", amount: 3900, velocity_score: 45, device_trust: 85, foreign_ip: false, fraud_flag: false, region: "Asia Pacific" },
    { txn_id: 104, user: "usr_105", amount: 18200, velocity_score: 99, device_trust: 20, foreign_ip: true, fraud_flag: true, region: "Europe" },
    { txn_id: 105, user: "usr_631", amount: 550, velocity_score: 18, device_trust: 95, foreign_ip: false, fraud_flag: false, region: "North America" },
    { txn_id: 106, user: "usr_782", amount: 7200, velocity_score: 78, device_trust: 42, foreign_ip: true, fraud_flag: true, region: "Asia Pacific" },
    { txn_id: 107, user: "usr_334", amount: 890, velocity_score: 22, device_trust: 91, foreign_ip: false, fraud_flag: false, region: "South America" },
    { txn_id: 108, user: "usr_519", amount: 120, velocity_score: 8, device_trust: 99, foreign_ip: false, fraud_flag: false, region: "Asia Pacific" },
  ],
  healthcare: [
    { patient_id: 201, age: 62, bmi: 31.4, glucose: 178, blood_pressure: 142, insulin_level: 210, risk_score: 88, high_risk: true, region: "North America" },
    { patient_id: 202, age: 34, bmi: 22.1, glucose: 89, blood_pressure: 118, insulin_level: 72, risk_score: 24, high_risk: false, region: "Europe" },
    { patient_id: 203, age: 48, bmi: 28.5, glucose: 135, blood_pressure: 130, insulin_level: 145, risk_score: 62, high_risk: false, region: "Asia Pacific" },
    { patient_id: 204, age: 71, bmi: 33.2, glucose: 195, blood_pressure: 155, insulin_level: 240, risk_score: 95, high_risk: true, region: "Europe" },
    { patient_id: 205, age: 29, bmi: 24.0, glucose: 94, blood_pressure: 115, insulin_level: 68, risk_score: 19, high_risk: false, region: "North America" },
    { patient_id: 206, age: 55, bmi: 30.1, glucose: 162, blood_pressure: 138, insulin_level: 185, risk_score: 81, high_risk: true, region: "Asia Pacific" },
    { patient_id: 207, age: 42, bmi: 26.3, glucose: 110, blood_pressure: 122, insulin_level: 95, risk_score: 42, high_risk: false, region: "South America" },
    { patient_id: 208, age: 67, bmi: 32.8, glucose: 184, blood_pressure: 148, insulin_level: 225, risk_score: 91, high_risk: true, region: "North America" },
  ],
};

export type BenchmarkKey = keyof typeof CURATED_BENCHMARKS;
