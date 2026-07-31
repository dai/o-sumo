# renovate-aug SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add crawler-visible default social metadata, route-aware SPA metadata, all published rikishi profile URLs in the build-time sitemap, and repeatable delivery verification.

**Architecture:** Keep URL normalization in `app/lib/site-url.ts`, resolve page metadata in a pure helper, and reconcile document head elements from one Router-level component. Read and validate the public rikishi index during the Vite build, inject its entries into the existing sitemap renderer, and extend delivery verification without making production deployment a local completion requirement.

**Tech Stack:** React 19, React Router 7, TypeScript, Vite 7, Vitest, Testing Library, Playwright, Cloudflare Wrangler, PowerShell

## Global Constraints

- Work only in `C:\Users\dai\.codex\worktrees\renovate-aug\o-sumo` on branch `renovate-aug` based on the latest `origin/main`.
- Do not modify the original checkout or `C:\Users\dai\.buzz\OUTBOX\todo.md`.
- Use `C:\2026\08\ogp.jpg` unchanged as `public/og-default.jpg`.
- Keep canonical ownership in `CanonicalUrl`; `MetaHead` owns title, description, OGP, and Twitter tags.
- Do not add dependencies, JSON-LD, feed generation, deployment, push, or PR work.
- Use TDD for runtime behavior and helper interfaces.

## Tasks

- [x] Add failing route metadata and document-head tests, verify RED, then implement the pure resolver and `MetaHead` until GREEN.
- [x] Add default OGP/Twitter tags to `index.html`, mount `MetaHead`, and add the supplied image asset with exact hash verification.
- [x] Add failing sitemap tests for injected rikishi items and invalid index data, verify RED, then implement validated build-time profile URL generation until GREEN.
- [x] Add behavior-first tests for environment verification outputs, then extend the delivery verifier and report format until GREEN.
- [x] Run focused tests, typecheck, full Vitest, build, artifact checks, external Impeccable detection, local Wrangler HTTP checks, Playwright head checks, and diff review.
- [x] Record RED/GREEN evidence and final results in `tasks/todo.md` and `tasks/reports/`.
