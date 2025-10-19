# DealSpotter

[![Version](https://img.shields.io/badge/version-0.0.1-blue)](#)  
[![Build Status](https://img.shields.io/github/actions/workflow/status/USERNAME/DealSpotter/ci.yml?branch=main)](#)  
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](#)

A web application for families and retirees to automatically collect and present promotional prices from Biedronka and Lidl PDF flyers. DealSpotter provides secure authentication, scheduled PDF fetching, high-accuracy data extraction, and an interactive UI with filtering, sorting, and performance monitoring.

## Table of Contents

1. [Tech Stack](#tech-stack)  
2. [Getting Started Locally](#getting-started-locally)  
3. [Available Scripts](#available-scripts)  
4. [Project Scope](#project-scope)  
5. [Project Status](#project-status)  
6. [License](#license)  

## Tech Stack

- **Frontend**  
  - Astro 5  
  - React 19  
  - TypeScript 5  
  - Tailwind CSS 4  
  - Shadcn/ui (Radix UI + Lucide React)  
- **Backend**  
  - Supabase (Postgres database, Auth, SDKs)  
- **AI / LLM**  
  - Openrouter.ai (gateway to OpenAI, Anthropic, Google, etc.)  
- **CI/CD & Hosting**  
  - GitHub Actions  
  - Docker on DigitalOcean  

## Getting Started Locally

### Prerequisites

- Node.js v22.14.0 (see `.nvmrc`)  
- nvm or similar Node version manager  
- A Supabase project (URL and API key)  
- Openrouter.ai API key (if using LLM features)  

### Clone & Install

```bash
git clone https://github.com/USERNAME/DealSpotter.git
cd DealSpotter
nvm use
npm install
```

### Environment

Create a `.env` file in the project root with:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Run Development Server

```bash
npm run dev
```

Your site will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev`  
  Start Astro in development mode with hot reloading.  
- `npm run build`  
  Build the production site.  
- `npm run preview`  
  Preview the production build locally.  
- `npm run astro`  
  Run the Astro CLI.  
- `npm run lint`  
  Run ESLint.  
- `npm run lint:fix`  
  Run ESLint with automatic fixes.  
- `npm run format`  
  Format code with Prettier.  

## Project Scope

### In Scope (MVP)

- Secure email/password authentication (registration with activation link, login, reset password)  
- Automated PDF downloads (2×/week) from Biedronka and Lidl  
- PDF parsing & data extraction (products, promo price, conditions) with ≥ 90% accuracy  
- Interactive product list with filter by category/store, sort descending by price, and pagination or lazy loading  
- Monitoring & alerting on parsing errors (> 5% weekly)  
- Logging LLM queries and responses (90-day retention)  
- Performance targets: API < 500 ms, list render of 50 items < 2 s  

### Out of Scope

- Push/email notifications or alerts to end users  
- OAuth or external authentication providers  
- Non-PDF formats (images, HTML)  
- Advanced product taxonomy or automatic category mapping  

## Project Status

**MVP in development:** Core features implemented; ongoing testing, validation, and performance tuning.

## License

This project does not yet have a license. Add a `LICENSE` file and update this section.
