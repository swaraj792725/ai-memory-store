const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
]);

/**
 * Tokenize text into lowercased terms and bi-grams.
 */
export function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  const tokens = [...words];
  // Add bi-grams for phrase matching
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }
  return tokens;
}

/**
 * Build TF-IDF term weight vector for a tokenized document.
 */
export function buildTFIDFVector(docTokens: string[], corpusTokens: string[][]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of docTokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  const N = Math.max(1, corpusTokens.length);
  const vector = new Map<string, number>();

  for (const [token, count] of tf.entries()) {
    const termFrequency = count / docTokens.length;
    let docCount = 0;
    for (const doc of corpusTokens) {
      if (doc.includes(token)) docCount++;
    }
    const idf = Math.log(1 + N / Math.max(1, docCount));
    vector.set(token, termFrequency * idf);
  }

  return vector;
}

/**
 * Compute cosine similarity between two term weight vectors.
 */
export function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, weightA] of vecA.entries()) {
    normA += weightA * weightA;
    const weightB = vecB.get(term);
    if (weightB !== undefined) {
      dotProduct += weightA * weightB;
    }
  }

  for (const weightB of vecB.values()) {
    normB += weightB * weightB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
