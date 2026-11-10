import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { primeArchiveDocuments } from '../lib/archive-client';
import type { ArchiveDocument } from '../lib/archive-types';

export function readCommittedArchiveDocuments(): ArchiveDocument[] {
  const directory = join(process.cwd(), 'public/api/v1/archive');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(join(directory, name), 'utf8')) as ArchiveDocument);
}

export function primeCommittedArchives(): void {
  primeArchiveDocuments(readCommittedArchiveDocuments());
}
