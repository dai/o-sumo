import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('rikishi profile data contract', () => {
  it('does not store rank strings in shusshin', () => {
    const profileDir = path.resolve(process.cwd(), 'public/api/v1/rikishi');
    const rankLikeShusshin = /^(東|西)(横綱|大関|関脇|小結|前頭|十両)/;
    const files = fs.readdirSync(profileDir).filter((file) => file.endsWith('.json'));

    const invalidProfiles = files
      .map((file) => JSON.parse(fs.readFileSync(path.join(profileDir, file), 'utf8')) as { id: number; shusshin?: string })
      .filter((profile) => rankLikeShusshin.test(profile.shusshin ?? ''));

    expect(invalidProfiles).toEqual([]);
  });
});
