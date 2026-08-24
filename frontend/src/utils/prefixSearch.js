/**
 * Utility for Longest Matching Characters / Prefix Search.
 *
 * Computes a score based on prefix matching:
 * - Exact match: 1000
 * - Field starts with query: 500 + prefix length
 * - Word in field starts with query: 300 + prefix length
 * - Multi-word prefix match: 400 + total matched prefix length
 * - Longest Common Prefix (LCP) across words: 200 + LCP length
 * - Substring fallback: 100 + position penalty + query length
 */

export function getPrefixMatchScore(text, query) {
  if (!text || !query) return 0;
  const t = String(text).toLowerCase().trim();
  const q = String(query).toLowerCase().trim();
  if (!q) return 1;

  // 1. Exact match
  if (t === q) return 1000;

  // 2. Entire string starts with query (longest matching prefix)
  if (t.startsWith(q)) {
    return 500 + q.length * 10;
  }

  const words = t.split(/[\s\-_/,.]+/).filter(Boolean);

  // 3. Any individual word starts with query
  let maxWordPrefixScore = 0;
  for (const word of words) {
    if (word.startsWith(q)) {
      maxWordPrefixScore = Math.max(maxWordPrefixScore, 300 + q.length * 10);
    }
  }
  if (maxWordPrefixScore > 0) return maxWordPrefixScore;

  // 4. Multi-word query where each query word is a prefix of some word in text
  const qWords = q.split(/\s+/).filter(Boolean);
  if (qWords.length > 1) {
    const allWordsPrefixMatch = qWords.every((qw) =>
      words.some((w) => w.startsWith(qw))
    );
    if (allWordsPrefixMatch) {
      return 400 + q.length * 5;
    }
  }

  // 5. Longest Common Prefix (LCP) calculation across all words
  let maxLcp = 0;
  for (const word of words) {
    let lcp = 0;
    while (lcp < q.length && lcp < word.length && q[lcp] === word[lcp]) {
      lcp++;
    }
    if (lcp > maxLcp) {
      maxLcp = lcp;
    }
  }

  // If LCP matches a significant prefix (e.g. >= 2 chars)
  if (maxLcp >= 2 && maxLcp >= Math.min(3, q.length)) {
    return 200 + maxLcp * 10;
  }

  // 6. Substring match fallback (with penalty for later position)
  const idx = t.indexOf(q);
  if (idx !== -1) {
    const posPenalty = Math.max(0, 50 - idx * 2);
    return 100 + posPenalty + q.length;
  }

  return 0;
}

/**
 * Filters and sorts items by prefix match score against one or more fields.
 *
 * @param {Array} items - List of objects to search
 * @param {string} query - The search string
 * @param {Function} [getFields] - Function returning array of string/object fields from an item
 * @returns {Array} Filtered and scored items in descending order of relevance
 */
export function filterAndSortByPrefix(items, query, getFields) {
  if (!items || !Array.isArray(items)) return [];
  if (!query || !query.trim()) return items;

  const q = query.trim();
  const scored = [];

  for (const item of items) {
    const fields = typeof getFields === 'function' ? getFields(item) : Object.values(item);
    let bestScore = 0;

    for (const field of fields) {
      if (!field) continue;
      if (typeof field === 'string' || typeof field === 'number') {
        const score = getPrefixMatchScore(field, q);
        if (score > bestScore) bestScore = score;
      } else if (Array.isArray(field)) {
        for (const sub of field) {
          if (!sub) continue;
          const subText =
            typeof sub === 'string'
              ? sub
              : sub?.name || sub?.person_name || sub?.title || sub?.industry || '';
          const score = getPrefixMatchScore(subText, q);
          if (score > bestScore) bestScore = score;
        }
      }
    }

    if (bestScore > 0) {
      scored.push({ item, score: bestScore });
    }
  }

  return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}
