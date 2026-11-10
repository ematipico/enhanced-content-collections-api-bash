---
title: Snapshots
order: 3
---

A snapshot is the set of entries one storage driver keeps for a build, or for development.

## Builds

Every build writes a new snapshot, which doesn't rely on any earlier one: it holds every entry of the collections kept with the driver. The server a build produces only reads that snapshot, so a later build never changes what a deployed server shows.

The driver names build snapshots with `createSnapshotId()` when it implements it, like the JSON files driver's `build-…` IDs, or Astro gives them a random ID.

## Development

Development has a single snapshot, called `dev`. Every `astro dev` session writes to it, and writes it again after each change, so it never piles up.

## `astro sync` and `astro check`

They load your collections to generate types, but write no snapshot: nothing would read it.

## Deleting snapshots

Astro never deletes snapshots, as it can't know which ones deployed servers still read. Build snapshots stay in the storage until an integration deletes them: `keep-snapshots` keeps the 3 most recent ones of each driver, in the `astro:build:done` hook. It never deletes `dev`.
