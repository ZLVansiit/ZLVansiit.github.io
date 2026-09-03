import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { initDb, insertArticle, listArticles, getArticleBySlug } from '../db.mjs'

test('insert list get with prev next', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yy-'))
  const db = initDb(path.join(dir, 't.db'))
  insertArticle(db, {
    slug: 'a1', title: 'T1', summary: 'S1', category: '自然科学',
    body_md: 'body1', sources: [], created_at: '2026-09-01T00:00:00.000Z'
  })
  insertArticle(db, {
    slug: 'a2', title: 'T2', summary: 'S2', category: '历史与文明',
    body_md: 'body2', sources: [{ title: 'x', url: 'https://example.com' }],
    created_at: '2026-09-02T00:00:00.000Z'
  })
  const { total, list } = listArticles(db, { page: 1, pageSize: 10 })
  assert.equal(total, 2)
  assert.equal(list[0].slug, 'a2')
  const a1 = getArticleBySlug(db, 'a1')
  assert.equal(a1.next_slug, 'a2')
  assert.equal(a1.prev_slug, null)
  const filtered = listArticles(db, { page: 1, pageSize: 10, category: '历史与文明' })
  assert.equal(filtered.total, 1)
  assert.equal(filtered.list[0].slug, 'a2')
  db.close()
})
