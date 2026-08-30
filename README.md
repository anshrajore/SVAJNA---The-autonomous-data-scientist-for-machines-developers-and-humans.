# SVAJNA

**Autonomous data science with verifiable execution.**

SVAJNA turns local data into reproducible evidence: it profiles datasets, detects quality risks, records an event trail, and saves reports and analytical memory for later comparison.

## V1

```bash
npm install
npm run build
node packages/cli/dist/index.js init
node packages/cli/dist/index.js analyze ./sales.csv
node packages/cli/dist/index.js report
```

Analysis never changes the source dataset. It writes reproducible state to `.svajna/`.

## MCP server

Build first, then configure an MCP client to launch the local, project-bounded server:

```bash
node /absolute/path/to/SVAJNA/packages/mcp/dist/index.js
```

The server provides `data_profile`, `analysis_execute`, and `memory_read`, plus a `svajna://capabilities` resource. Dataset paths must be relative to the MCP server's working directory; paths outside that project are rejected.

See [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) for the current phase, dependency list, and continuation notes.
