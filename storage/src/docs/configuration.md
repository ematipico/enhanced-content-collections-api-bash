---
title: Configuration
order: 2
---

To keep a collection in a database instead of inside your site, give it a `storage` option. Here, the docs are saved in a SQLite file:

```ts
storage: sqlite({ url: 'file:./collections.db' })
```

Collections without `storage` work like they always have: Astro packs them into your site.
