# Directory monetization roadmap - raw source

**Captured:** 2026-04-30
**Source:** User-pasted ChatGPT plan during bow-in
**Status:** Raw planning input. Do not edit in place; synthesize into wiki/architecture pages instead.
**Synthesized at:** `docs/knowledge/wiki/content-engine/directory-monetization-roadmap.md`

---

## SESSION_0029 - Ronin Dojo Baseline Petey Plan

### Overview

In this session we will extend the ronin-dojo-baseline repository to build a functional martial-arts directory using the Dirstarter template. The goal of SESSION_0029 is to bootstrap a local development environment, seed it with initial data, and configure content automation, monetization and content management features in alignment with Dirstarter's documentation.

### Key references

Setup & Installation - Dirstarter's getting-started guide outlines prerequisites (Node.js 22+, Git and a package manager) and describes how to clone the repository, set up environment variables, install dependencies and initialize the database.

Content Management - The content workflow covers how users submit tools, how admins review drafts, schedule publication and optionally automate processing and publication.

Monetization - Dirstarter supports premium listings and a built-in advertising system. Selecting a premium listing notifies administrators and automatically features the listing.

Automation - Automation uses Jina AI for scraping and Vercel AI Gateway for content generation. Environment variables such as JINA_API_KEY, AI_GATEWAY_API_KEY, AI_CHAT_MODEL and AI_COMPLETION_MODEL enable these integrations.

### Agents & Assignments

| Role | Assigned agent | Responsibilities |
| --- | --- | --- |
| Environment Architect | [Agent Kensho] | Ensure prerequisites (Node.js 22+, Git, package manager) are installed and clone the Dirstarter repository if not already present. Set up a new Postgres database and capture the connection string. Copy .env.example to .env and populate variables for the database, automation keys (JINA_API_KEY, AI_GATEWAY_API_KEY, AI_CHAT_MODEL, AI_COMPLETION_MODEL) as described in the Automation setup. Install dependencies (npm install) and initialize the database with Prisma (npm run db:generate, npm run db:migrate deploy, npm run db:seed). Start the dev server (npm run dev) so other agents can test features. |
| Data Seeder | [Agent Mizuno] | Review the default seed data and extend it to include martial-arts tools relevant to the Ronin Dojo context. Use the provided seed files or create a custom CSV to import new entries. Ensure that each entry contains name, description, URL and relevant metadata. This prepares content for the directory and allows the Content team to validate listing workflows. |
| Content Manager | [Agent Tatsu] | Using the admin dashboard (/admin), test user submission and admin-review workflows. Submit a new tool, verify it appears as a draft and exercise the admin actions: approve, schedule publication and delete. Ensure the scheduling interface supports selecting a future publication date and sending notification emails. Document any issues for the developer team. |
| Automation Engineer | [Agent Yori] | Integrate automation by configuring Jina AI and Vercel AI Gateway. Verify that when a new tool with a URL is approved, automation triggers scraping (Jina AI) and generates structured content and media via Vercel AI models. Adjust the CONTENT_SYSTEM_PROMPT in lib/ai.ts to produce consistent descriptions and experiment with model parameters (temperature and model choice). Confirm that screenshots and favicons are generated automatically. |
| Monetization Specialist | [Agent Rei] | Implement premium listing tiers (Free, Standard, Premium) and verify that the listing plan selection page appears after submission. Ensure that selecting Premium triggers admin notifications and sets the listing as featured. Configure the built-in advertising system by defining ad placements (Banner, Tools, ToolPage, BlogPost, Bottom and All) and enabling scheduling and rotation features. Set up Stripe or the chosen payment provider (relying on the Payments guide) and create a test product to validate payment flows. |
| QA & Documentation | [Agent Sakura] | Test the end-to-end workflow across all features: submission, approval, scheduling, automation, publication, premium listing purchase and ad bookings. Record any bugs or UX issues and ensure they are filed with clear reproduction steps. Update the project's SESSION_0027.md or equivalent session log with a summary of tasks completed, decisions made and any deviations from the plan. |

### Deliverables

- A configured Dirstarter instance running locally with environment variables set and database seeded.
- Extended seed data covering multiple martial-arts tools.
- Functional content submission and scheduling workflow verified through admin interface.
- Automation integrated with working AI content generation and media scraping.
- Premium listing and advertising features implemented and tested.
- QA report and session summary documented.

### Alignment notes

This plan adheres to Dirstarter's official documentation: prerequisites and database setup are drawn from the Getting-Started guide, content workflow details come from the Content-Management page, monetization features follow the Monetization guide, and automation configuration comes from the Automation page. Each agent's tasks map directly to these documented processes, ensuring our implementation remains compliant and up-to-date.
