import { describe, expect, it } from 'vitest';
import { getBashoStatus } from './basho-status';
import { torikumiArchive } from './torikumi-data';

describe('getBashoStatus', () => {
  it('treats dates before the published schedule as upcoming', () => {
    expect(getBashoStatus(torikumiArchive, new Date('2026-07-01T00:00:00.000Z')).kind).toBe('upcoming');
  });

  it('treats an in-basho JST date as live and exposes the day number', () => {
    const status = getBashoStatus(torikumiArchive, new Date('2026-07-15T03:00:00.000Z'));
    expect(status.kind).toBe('live');
    expect(status.day).toBe(4);
  });

  it('treats dates after senshuraku as final', () => {
    expect(getBashoStatus(torikumiArchive, new Date('2026-08-15T00:00:00.000Z')).kind).toBe('final');
  });
});
