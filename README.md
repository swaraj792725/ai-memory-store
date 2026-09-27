# `@swaraj792725/ai-memory-store` 🧠⚡

> **Zero-dependency, persistent vector & keyword memory store for AI agents, vibe coding context, and LLM session state.**

`@swaraj792725/ai-memory-store` provides AI agents and vibe coders with an in-memory & file-persistent vector memory engine. Index codebase rules, architectural decisions, past chat history, and user preferences, and export them into XML context blocks (`<project_memory>`) ready to inject into Claude, Gemini, or OpenAI prompts.

---

## Features

- 🚀 **Zero Dependencies**: Pure Node.js & TypeScript with built-in TF-IDF vector math & n-gram tokenization.
- 🔍 **Vector & Semantic Search**: Cosine similarity search with category and tag filtering.
- 🏷️ **LLM XML Export**: Exports stored memories formatted into `<project_memory>` XML tags for AI agent context.
- 💾 **JSON Persistence**: Save and reload memory state to disk seamlessly using `saveToFile()` and `loadFromFile()`.
- 🛡️ **Type-Safe**: Full TypeScript type declarations out of the box.

---

## Installation

```bash
npm install @swaraj792725/ai-memory-store
```

---

## Quick Start

```typescript
import { AIMemoryStore } from '@swaraj792725/ai-memory-store';

const store = new AIMemoryStore();

// 1. Add project rules and memories
store.addMemory({
  id: 'rule_1',
  category: 'architecture',
  content: 'Use PostgreSQL for relational data and Redis for ephemeral pub/sub.',
  tags: ['database', 'backend'],
});

store.addMemory({
  id: 'rule_2',
  category: 'styling',
  content: 'Use Tailwind CSS utility classes for responsive mobile layouts.',
  tags: ['frontend', 'css'],
});

// 2. Perform vector search
const results = store.searchMemory('PostgreSQL database backend');
console.log(results[0].memory.content);

// 3. Export to LLM prompt context XML
console.log(store.exportXML());

// 4. Save state to JSON file
store.saveToFile('./.ai_memory.json');
```

---

## License

MIT © [Swaraj](https://github.com/swaraj792725)
