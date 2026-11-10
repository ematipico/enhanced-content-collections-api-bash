---
title: Snapshots
order: 3
---

A snapshot is a saved copy of a collection's entries. Astro keeps one copy for each build, and one for development.

## When you build

Each build saves a fresh copy of all your entries, from scratch. The site that build creates only ever reads its own copy. So if you change your content and build again, a site that's already online keeps showing what it was built with, until you deploy the new build.

Each copy gets a name. The JSON files driver in this project names them after the date, like `build-2026-11-09…`. Other drivers may use random names.

## In development

There's only ever one copy, called `dev`. Every time you start `pnpm dev`, and every time you change something, Astro overwrites it. It never piles up.

## `astro sync` and `astro check`

These commands read your collections to generate TypeScript types, but they don't save any copy, because nothing would use it.

## Cleaning up

Astro never deletes copies by itself: it can't know which ones a site that's online still needs. Old build copies stay until something deletes them. In this project, `keep-snapshots` keeps the last 3 builds and deletes older ones at the end of each build. It never touches `dev`.
