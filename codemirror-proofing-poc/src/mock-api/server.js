/**
 * Simple mock API server for the LLM rewrite endpoint.
 * Run with: node src/mock-api/server.js
 *
 * This is a basic Node.js HTTP server that simulates LLM rewrite responses.
 * For the POC, you can also use the Vite proxy instead.
 */

import { createServer } from "node:http";

const PORT = 3001;

const REWRITE_STRATEGIES = {
  "fix-grammar": (text) => {
    // Simple heuristic grammar fixes for demo
    return text
      .replace(/\btheir\b(?=\s+(going|is|are|was|were))/gi, "they're")
      .replace(/\bthere\b(?=\s+(house|car|dog|cat|place))/gi, "their")
      .replace(/\btommorrow\b/gi, "tomorrow")
      .replace(/\bgrocerries\b/gi, "groceries")
      .replace(/\bdetects\b(?=\s)/gi, "detect")
      .replace(/\bautomaticaly\b/gi, "automatically")
      .replace(/\berors\b/gi, "errors")
      .replace(/\bsampel\b/gi, "sample")
      .replace(/\bcorreckted\b/gi, "corrected");
  },
  rewrite: (text) => {
    // For demo, just clean up the text slightly
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  },
  shorter: (text) => {
    // Remove filler words for demo
    return text
      .replace(/\b(very|really|just|quite|rather|somewhat)\s+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  },
  "more-formal": (text) => {
    return text
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bwon't\b/gi, "will not")
      .replace(/\bisn't\b/gi, "is not")
      .replace(/\baren't\b/gi, "are not")
      .replace(/\bdidn't\b/gi, "did not")
      .replace(/\bgonna\b/gi, "going to")
      .replace(/\bwanna\b/gi, "want to");
  },
};

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/proof/rewrite") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const { text, mode } = JSON.parse(body);
        const strategy =
          REWRITE_STRATEGIES[mode] || REWRITE_STRATEGIES["fix-grammar"];

        // Simulate processing delay
        setTimeout(() => {
          const rewritten = strategy(text);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ rewritten }));
        }, 500 + Math.random() * 1000);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
