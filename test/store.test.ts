import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { AIMemoryStore } from '../src/store.js';
import { tokenize, cosineSimilarity } from '../src/vector.js';
import fs from 'node:fs';
import path from 'node:path';

describe('AI Memory Store Suite', () => {
  let store: AIMemoryStore;
  const tempFile = path.join(__dirname, 'temp_memory.json');

  beforeEach(() => {
    store = new AIMemoryStore();
  });

  afterEach(() => {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });

  test('addMemory stores memory entry correctly', () => {
    const item = store.addMemory({
      id: 'mem_1',
      category: 'architecture',
      content: 'We use PostgreSQL for main database and Redis for caching.',
      tags: ['database', 'backend'],
    });

    expect(store.size()).toBe(1);
    expect(store.getMemory('mem_1')).toEqual(item);
  });

  test('searchMemory performs semantic vector similarity search', () => {
    store.addMemory({
      id: 'mem_db',
      category: 'backend',
      content: 'PostgreSQL database connection pool handles multi-tenant queries.',
      tags: ['postgres', 'db'],
    });
    store.addMemory({
      id: 'mem_ui',
      category: 'frontend',
      content: 'Tailwind CSS utility classes are used for responsive UI components.',
      tags: ['css', 'ui'],
    });

    const results = store.searchMemory('PostgreSQL database query');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].memory.id).toBe('mem_db');
    expect(results[0].score).toBeGreaterThan(0.1);
  });

  test('exportXML formats stored entries into LLM prompt XML', () => {
    store.addMemory({
      id: 'rule_1',
      category: 'convention',
      content: 'Always use strict TypeScript types and avoid any.',
      tags: ['ts', 'rules'],
    });

    const xml = store.exportXML();
    expect(xml).toContain('<project_memory>');
    expect(xml).toContain('<entry id="rule_1" category="convention" tags="ts,rules">');
    expect(xml).toContain('Always use strict TypeScript types');
  });

  test('saveToFile and loadFromFile persist state to local JSON file', () => {
    store.addMemory({
      id: 'mem_persist',
      category: 'test',
      content: 'Persistent memory entry test data.',
    });

    store.saveToFile(tempFile);
    expect(fs.existsSync(tempFile)).toBe(true);

    const newStore = new AIMemoryStore();
    newStore.loadFromFile(tempFile);
    expect(newStore.size()).toBe(1);
    expect(newStore.getMemory('mem_persist')?.content).toBe('Persistent memory entry test data.');
  });
});
