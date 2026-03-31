# MCP Setup

This folder is optional for local app runtime.

The current application does not read `mcp/mcp.json` when running `npm run dev`, `npm run build`, or `npm run start`.
The admin and public UI use the checked-in exported Stitch assets under `public/stitch/` and `stitch/exports/`.

Use `mcp/mcp.json` only if you want to reconnect VS Code or other tooling to the Stitch MCP server for future design export work.

To enable that workflow, replace `YOUR_STITCH_API_KEY` in `mcp/mcp.json` with your own Stitch API key.