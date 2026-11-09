import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { createStorageDriverTests } from 'astro/content/storage-driver-tests';
import createDriver from '../src/drivers/json-files/driver.ts';

// The tests every collection storage driver must pass, with a new, empty directory each time
describe('JSON files driver', () => {
  const tests = createStorageDriverTests(() =>
    createDriver({ dir: mkdtempSync(join(tmpdir(), 'json-files-driver-')) }),
  );
  for (const test of tests) {
    it(test.name, test.run);
  }
});
