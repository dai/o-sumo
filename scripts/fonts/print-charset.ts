import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectDisplayedCharacters } from '../../app/lib/webfont-charset.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
process.stdout.write(collectDisplayedCharacters(repoRoot));
