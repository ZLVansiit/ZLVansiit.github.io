import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

export function initDb(dbPath = process.env.DB_PATH || './data/youyong.db') {
  fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true })
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      body_md TEXT NOT NULL,
      sources TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
  `)
  return db
}

export function listArticles(db, { page = 1, pageSize = 20 } = {}) {
  const size = Math.min(Math.max(Number(pageSize) || 20, 1), 50)
  const p = Math.max(Number(page) || 1, 1)
  const total = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c
  const list = db.prepare(`
    SELECT id, slug, title, summary, category, created_at
    FROM articles ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(size, (p - 1) * size)
  return { total, list }
}

export function getArticleBySlug(db, slug) {
  const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug)
  if (!row) return null
  const prev = db.prepare(`
    SELECT slug FROM articles
    WHERE created_at < ? OR (created_at = ? AND id < ?)
    ORDER BY created_at DESC, id DESC LIMIT 1
  `).get(row.created_at, row.created_at, row.id)
  const next = db.prepare(`
    SELECT slug FROM articles
    WHERE created_at > ? OR (created_at = ? AND id > ?)
    ORDER BY created_at ASC, id ASC LIMIT 1
  `).get(row.created_at, row.created_at, row.id)
  let sources = []
  try {
    sources = JSON.parse(row.sources || '[]')
  } catch (e) {
    console.error(`[db] invalid sources JSON for slug=${slug}:`, e.message || e)
  }
  return {
    ...row,
    sources,
    prev_slug: prev?.slug ?? null,
    next_slug: next?.slug ?? null
  }
}

export function insertArticle(db, {
  slug, title, summary, category, body_md, sources, created_at
}) {
  db.prepare(`
    INSERT INTO articles (slug, title, summary, category, body_md, sources, created_at)
    VALUES (@slug, @title, @summary, @category, @body_md, @sources, @created_at)
  `).run({
    slug,
    title,
    summary,
    category,
    body_md,
    sources: typeof sources === 'string' ? sources : JSON.stringify(sources ?? []),
    created_at: created_at || new Date().toISOString()
  })
}

export function getRecentTopics(db, days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  return db.prepare(`
    SELECT title, summary, category FROM articles
    WHERE created_at >= ? ORDER BY created_at DESC
  `).all(since)
}
