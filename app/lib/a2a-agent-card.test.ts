import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildA2aAgentCard, readPackageVersion } from './a2a-agent-card';

describe('a2a-agent-card', () => {
  const publicDir = resolve(process.cwd(), 'public');
  const outRoot = resolve(process.cwd(), 'dist');

  it('synchronizes version with package.json', () => {
    const { card } = buildA2aAgentCard(publicDir, outRoot);
    expect(card.version).toBe(readPackageVersion());
  });

  it('identifies the agent as o-sumo with a non-empty name and description', () => {
    const { card } = buildA2aAgentCard(publicDir, outRoot);
    expect(card.name.length).toBeGreaterThan(0);
    expect(card.description.length).toBeGreaterThan(0);
    expect(card.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('declares at least one HTTP+JSON interface for discovery validators', () => {
    const { card } = buildA2aAgentCard(publicDir, outRoot);
    expect(card.supportedInterfaces.length).toBeGreaterThan(0);
    const first = card.supportedInterfaces[0];
    expect(first.url.length).toBeGreaterThan(0);
    expect(first.protocolBinding).toBeTruthy();
    expect(first.protocolVersion.length).toBeGreaterThan(0);
  });

  it('declares all A2A capabilities as false', () => {
    const { card } = buildA2aAgentCard(publicDir, outRoot);
    expect(card.capabilities.streaming).toBe(false);
    expect(card.capabilities.pushNotifications).toBe(false);
    expect(card.capabilities.extendedAgentCard).toBe(false);
  });

  it('advertises default input and output modes', () => {
    const { card } = buildA2aAgentCard(publicDir, outRoot);
    expect(card.defaultInputModes.length).toBeGreaterThan(0);
    expect(card.defaultOutputModes.length).toBeGreaterThan(0);
  });

  it('lists at least one skill with required fields', () => {
    const { card } = buildA2aAgentCard(publicDir, outRoot);
    expect(card.skills.length).toBeGreaterThan(0);
    for (const skill of card.skills) {
      expect(skill.id.length).toBeGreaterThan(0);
      expect(skill.name.length).toBeGreaterThan(0);
      expect(skill.description.length).toBeGreaterThan(0);
      expect(Array.isArray(skill.tags)).toBe(true);
      expect(skill.tags.length).toBeGreaterThan(0);
    }
  });

  it('writes the card to dist/.well-known/agent-card.json', () => {
    buildA2aAgentCard(publicDir, outRoot);
    const path = resolve(outRoot, '.well-known/agent-card.json');
    expect(existsSync(path)).toBe(true);
  });
});
