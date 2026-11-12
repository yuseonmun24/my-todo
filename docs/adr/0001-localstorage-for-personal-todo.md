# ADR 0001: LocalStorage for initial personal todo persistence

- Status: Replaced by ADR 0002 (deprecated)
- Date: 2026-11-12

## Context

The app was originally designed as a single-user personal todo app with no backend. The simplest and fastest way to make it work was browser localStorage, which allowed tasks, categories, and completion state to be saved directly in the browser without additional infrastructure.

This aligned with the initial goal of creating an easy-to-run app for a beginner developer and kept the implementation small.

## Decision

We used browser localStorage as the initial persistence layer for todos and categories.

## Consequences

- Pros:
  - Zero backend setup required
  - Simple to build and understand for a beginner
  - Works immediately in a browser session
  - Keeps the app easy to run locally

- Cons:
  - Data is tied to one browser/device
  - Data is not portable across devices
  - The app cannot easily scale to multi-user or shared usage
  - The storage layer is not suitable for production deployment beyond a personal local app

## Replacement

This ADR is retired and replaced by ADR 0002, which changes the persistence mechanism to Turso-backed storage using a database URL configured via `TURSO_DATABASE_URL` for deployment flexibility while keeping the UI unchanged.
