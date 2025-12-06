# Prompt Guide & AI Developer Instructions

This document serves as a guide for any AI model or developer working on the **AppChahiye** project. It outlines the specific workflows, constraints, and deployment strategies used in this repository.

## 1. Deployment & Infrastructure
- **Platform**: Cloudflare Workers (Backend) and Cloudflare Pages (Frontend).
- **Deployment Method**: **Continuous Deployment (CD)** via GitHub.
  - Changes pushed to the GitHub repository are automatically deployed to Cloudflare.
- **Code Compatibility**: The entire codebase is designed and structured to be **Cloudflare-compatible**. Ensure all new code (especially backend/worker code) adheres to Cloudflare Workers runtime constraints (e.g., no Node.js native modules unless polyfilled/compatible).

## 2. Version Control & Commits
- **Tool**: **GitHub Desktop**.
- **Workflow**: 
  - We use GitHub Desktop to stage, commit, and push changes to the repository.
  - **DO NOT** use terminal commands (like `git add`, `git commit`, `git push`) to manage version control unless explicitly instructed for a specific edge case.

## 3. Terminal Usage Rules
- **General Rule**: Avoid using the terminal for general project tasks or git operations.
- **Exception - Database (D1)**: The terminal **IS** used for Cloudflare D1 Database operations.
  - **Allowed Commands**: `wrangler d1 execute ...` or similar commands required to push schema changes, run migrations, or update database rows/data on the Cloudflare network.
  - If a database change is made (e.g., modifying `worker/schema.sql`), you may need to provide the specific `wrangler` command to apply these changes to the remote D1 database.

## 4. Project Structure
- **Root**: Contains configuration (`wrangler.jsonc`, `package.json`) and project documentation.
- **src/**: React Frontend (Vite).
- **worker/**: Cloudflare Worker Backend (Hono, D1, Durable Objects).
- **shared/**: Shared TypeScript types.

## Summary for AI
When generating code or suggesting changes:
1.  **Write code** that works within the Cloudflare ecosystem.
2.  **Do not suggest** git commands for the terminal; assume the user handles commits via GUI.
3.  **Do suggest** `wrangler` commands if database schema changes need to be applied.
