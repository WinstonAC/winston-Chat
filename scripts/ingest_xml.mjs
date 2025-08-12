#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MAX_PAGES = 50;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// Portfolio page filtering
const ALLOW_PATHS = [
  "/work", "/projects", "/case", "/case-study", "/portfolio", "/product",
  "/about", "/", "/services", "/expertise", "/experience"
];
const DENY_PATHS = [
  "/tag", "/tags", "/category", "/categories", "/author", "/feed", "/rss",
  "/wp-json", "/privacy", "/terms", "/search", "/admin", "/wp-admin"
];

function shouldInclude(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    if (DENY_PATHS.some(d => path.startsWith(d))) return false;
    if (ALLOW_PATHS.some(a => path.startsWith(a))) return true;
    // allow homepage and top-level "about" if relevant
    return path === "/" || path.startsWith("/about");
  } catch { return false; }
}

// Helper functions
function isHttpUrl(p) { return /^https?:\/\//i.test(p); }

async function readMaybeUrl(p) {
  if (isHttpUrl(p)) {
    const res = await fetch(p);
    if (!res.ok) throw new Error(`Failed to fetch ${p}: ${res.status}`);
    return await res.text();
  }
  return readFileSync(p, "utf8");
}

function normalizeUrl(link, base) {
  if (!link) return null;
  try { return new URL(link, base).href; } catch { return null; }
}

function extractPagesFromWXR(obj) {
  const base = obj?.rss?.channel?.link;
  const items = obj?.rss?.channel?.item || [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.map((it, index) => {
    const url = normalizeUrl(it?.link, base);
    // WordPress WXR puts HTML here (namespaced tag)
    const html = it?.['content:encoded'] || '';
    // Simple HTML to text conversion
    const text = toText(`<body>${html}</body>`);
    
    return (url && text && text.length > 100) ? { url, text } : null;
  }).filter(Boolean);
}

function toText(html) {
  // Simple HTML to text conversion
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalUrl(html, fallback) {
  try {
    // Simple regex-based canonical extraction
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    if (canonicalMatch) {
      return new URL(canonicalMatch[1], fallback).href;
    }
  } catch {}
  return fallback;
}

function chunkText(text, url) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);
    
    // Try to break at word boundaries
    if (end < text.length) {
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastSpace > start + CHUNK_SIZE * 0.8) {
        chunk = chunk.slice(0, lastSpace);
        start = start + lastSpace + 1;
      } else {
        start = end;
      }
    } else {
      start = end;
    }
    
    chunks.push({
      url,
      text: chunk.trim()
    });
  }
  
  return chunks;
}

async function main() {
  const args = process.argv.slice(2);
  const xmlFile = args[0];
  const outputFile = args[1] || 'chunks.json';
  const maxPages = parseInt(args[2]) || MAX_PAGES;
  
  if (!xmlFile) {
    console.error('Usage: node ingest_xml.mjs <xml-file-or-url> [output-file] [max-pages]');
    process.exit(1);
  }
  
  try {
    // Read and parse XML (supports both local files and remote URLs)
    const xmlContent = await readMaybeUrl(xmlFile);
    const data = parseXML(xmlContent);
    
    if (!data) {
      console.error('Failed to parse XML');
      process.exit(1);
    }
    
    const chunks = [];
    
    if (data?.rss?.channel?.item) {
      // WXR (WordPress export) path
      const pages = extractPagesFromWXR(data).slice(0, maxPages);
      for (const p of pages) {
        chunks.push(...chunkText(p.text, p.url));
        process.stdout.write(`✓ ${p.url}\n`);
      }
    } else if (data?.urlset?.url) {
      // Sitemap path
      const urlsNode = data.urlset.url;
      const urls = (Array.isArray(urlsNode) ? urlsNode : [urlsNode])
        .map(u => u?.loc).filter(Boolean)
        .filter(shouldInclude)
        .slice(0, maxPages);
      
      console.log(`Processing ${urls.length} portfolio pages...`);
      
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.error(`⚠️ Failed to fetch ${url}: ${res.status}`);
            continue;
          }
          
          const html = await res.text();
          const text = toText(html);
          
          if (text && text.length > 100) {
            const urlCanon = canonicalUrl(html, url);
            chunks.push(...chunkText(text, urlCanon));
            process.stdout.write(`✓ ${urlCanon}\n`);
          }
        } catch (error) {
          console.error(`⚠️ Error processing ${url}:`, error.message);
        }
      }
    } else {
      console.error('No WXR or sitemap content found in XML');
      process.exit(1);
    }
    
    // Write chunks to JSON
    const outputPath = join(__dirname, '..', 'client-data', outputFile);
    writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
    
    console.log(`\nWrote ${chunks.length} chunks → ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function parseXML(xmlString) {
  try {
    // Check if it's a sitemap first
    if (xmlString.includes('<urlset')) {
      // Sitemap format
      const urlMatches = xmlString.match(/<url>([\s\S]*?)<\/url>/gi);
      if (!urlMatches) return null;
      
      const urls = urlMatches.map(url => {
        const locMatch = url.match(/<loc>([^<]+)<\/loc>/i);
        return {
          loc: locMatch ? locMatch[1] : null
        };
      }).filter(u => u.loc);
      
      return { urlset: { url: urls } };
    }
    
    // WXR format (existing logic)
    const channelMatch = xmlString.match(/<channel>([\s\S]*?)<\/channel>/i);
    if (!channelMatch) return null;
    
    const channelContent = channelMatch[1];
    
    // Extract base URL
    const linkMatch = channelContent.match(/<link>([^<]+)<\/link>/i);
    const base = linkMatch ? linkMatch[1] : 'https://we-rule.com';
    
    // Extract items
    const itemMatches = channelContent.match(/<item>([\s\S]*?)<\/item>/gi);
    if (!itemMatches) return null;
    
    const items = itemMatches.map(item => {
      const linkMatch = item.match(/<link>([^<]+)<\/link>/i);
      const contentMatch = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);
      
      return {
        link: linkMatch ? linkMatch[1] : null,
        'content:encoded': contentMatch ? contentMatch[1] : ''
      };
    });
    
    return {
      rss: {
        channel: {
          link: base,
          item: items
        }
      }
    };
    
  } catch (error) {
    console.error('XML parsing error:', error.message);
    return null;
  }
}

// Run the script
main();
