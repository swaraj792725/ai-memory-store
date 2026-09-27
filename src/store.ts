import fs from 'node:fs';
import { tokenize, buildTFIDFVector, cosineSimilarity } from './vector.js';

export interface MemoryItem {
  id: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  topK?: number;
  category?: string;
  tags?: string[];
  minScore?: number;
}

export interface SearchResult {
  memory: MemoryItem;
  score: number;
}

export class AIMemoryStore {
  private memories: Map<string, MemoryItem> = new Map();

  /**
   * Add or update a memory entry in the store.
   */
  addMemory(entry: {
    id?: string;
    category?: string;
    content: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): MemoryItem {
    const id = entry.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const item: MemoryItem = {
      id,
      category: entry.category || 'general',
      content: entry.content.trim(),
      tags: entry.tags || [],
      createdAt: new Date().toISOString(),
      metadata: entry.metadata,
    };
    this.memories.set(id, item);
    return item;
  }

  /**
   * Retrieve a memory entry by its ID.
   */
  getMemory(id: string): MemoryItem | undefined {
    return this.memories.get(id);
  }

  /**
   * Remove a memory entry by its ID.
   */
  deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  /**
   * Search memory entries by semantic/keyword query with tag and category filtering.
   */
  searchMemory(query: string, opts: SearchOptions = {}): SearchResult[] {
    const { topK = 5, category, tags = [], minScore = 0.05 } = opts;

    const allItems = Array.from(this.memories.values());
    if (allItems.length === 0) return [];

    // Filter by category and tags if provided
    const filtered = allItems.filter((item) => {
      if (category && item.category !== category) return false;
      if (tags.length > 0 && !tags.some((t) => item.tags.includes(t))) return false;
      return true;
    });

    if (filtered.length === 0) return [];

    const queryTokens = tokenize(query);
    const docTokensList = filtered.map((item) => tokenize(`${item.category} ${item.tags.join(' ')} ${item.content}`));

    const queryVector = buildTFIDFVector(queryTokens, docTokensList);

    const results: SearchResult[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const docVector = buildTFIDFVector(docTokensList[i], docTokensList);
      const score = cosineSimilarity(queryVector, docVector);
      if (score >= minScore) {
        results.push({ memory: filtered[i], score: Number(score.toFixed(4)) });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Export all or top K memories formatted into AI prompt XML context (<project_memory>).
   */
  exportXML(topK?: number): string {
    const items = Array.from(this.memories.values()).slice(0, topK || this.memories.size);
    if (items.length === 0) return '<project_memory></project_memory>';

    const memoryBlocks = items.map((item) => {
      const tagsAttr = item.tags.length > 0 ? ` tags="${item.tags.join(',')}"` : '';
      return `  <entry id="${item.id}" category="${item.category}"${tagsAttr}>\n    ${item.content}\n  </entry>`;
    });

    return `<project_memory>\n${memoryBlocks.join('\n')}\n</project_memory>`;
  }

  /**
   * Persist the memory store state to a local JSON file.
   */
  saveToFile(filePath: string): void {
    const data = JSON.stringify(Array.from(this.memories.values()), null, 2);
    fs.writeFileSync(filePath, data, 'utf8');
  }

  /**
   * Load the memory store state from a local JSON file.
   */
  loadFromFile(filePath: string): void {
    if (!fs.existsSync(filePath)) return;
    const data = fs.readFileSync(filePath, 'utf8');
    const items: MemoryItem[] = JSON.parse(data);
    this.memories.clear();
    for (const item of items) {
      this.memories.set(item.id, item);
    }
  }

  /**
   * Get total number of stored memory entries.
   */
  size(): number {
    return this.memories.size;
  }
}
