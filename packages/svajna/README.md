# SVAJNA — Autonomous Data Science Operating System

Built & Engineered by **ANSH RAJORE**.

SVAJNA is an autonomous data science operating system for machines, developers, and humans. It connects to live data, computes verifiable descriptive and inferential statistics, trains machine learning models, executes reproducible multi-stage pipelines, and monitors continuous drift.

## Quick Start

### Run via npx
```bash
npx svajna analyze ./data.csv
```

### Run MCP Server (Model Context Protocol)
Connect SVAJNA's autonomous analytical engines directly to Claude or Antigravity:
```bash
npx svajna-mcp
```

### Install Globally
```bash
npm install -g svajna
svajna --help
```

### Use as TypeScript / JavaScript Library
```typescript
import { analyze, PipelineEngine, detectDataDrift } from "svajna";

const run = await analyze("./sales.csv");
console.log(run.profile.quality.score);
```

## Live Web App
Experience the interactive 12-stage pipeline and executive BI dashboard:
[https://svajna.vercel.app](https://svajna.vercel.app)
