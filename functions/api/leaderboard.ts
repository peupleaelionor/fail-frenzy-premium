/**
 * FAIL FRENZY - Enhanced Leaderboard API
 * Global & mode-specific leaderboards with real-time sync
 */

interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { playerName, score, mode, fails, time } = await context.request.json();
    
    // Validation
    if (!playerName || score === undefined || !mode) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Generate unique ID
    const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Insert into D1
    await context.env.DB.prepare(`
      INSERT INTO leaderboard (id, player_name, score, mode, fails, time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(id, playerName, score, mode, fails, time).run();
    
    // Cache in KV (global leaderboard)
    await updateLeaderboardCache(context.env.KV, mode);
    
    return new Response(JSON.stringify({ 
      success: true, 
      id,
      rank: await getPlayerRank(context.env.DB, id, mode)
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const mode = url.searchParams.get('mode') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Try cache first
    const cacheKey = `leaderboard:${mode}:${limit}`;
    const cached = await context.env.KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }
    
    // Query D1
    let query = `
      SELECT id, player_name, score, mode, fails, time, created_at
      FROM leaderboard
    `;
    
    if (mode !== 'all') {
      query += ` WHERE mode = ?`;
    }
    
    query += ` ORDER BY score DESC LIMIT ?`;
    
    const stmt = mode !== 'all' 
      ? context.env.DB.prepare(query).bind(mode, limit)
      : context.env.DB.prepare(query).bind(limit);
    
    const { results } = await stmt.all();
    
    // Cache result
    const response = JSON.stringify(results);
    await context.env.KV.put(cacheKey, response, { expirationTtl: 60 });
    
    return new Response(response, {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function updateLeaderboardCache(kv: KVNamespace, mode: string): Promise<void> {
  // Invalidate cache for this mode
  await kv.delete(`leaderboard:${mode}:10`);
  await kv.delete(`leaderboard:${mode}:50`);
  await kv.delete(`leaderboard:${mode}:100`);
  await kv.delete(`leaderboard:all:10`);
}

async function getPlayerRank(db: D1Database, id: string, mode: string): Promise<number> {
  const { results } = await db.prepare(`
    SELECT COUNT(*) as rank
    FROM leaderboard
    WHERE mode = ? AND score > (
      SELECT score FROM leaderboard WHERE id = ?
    )
  `).bind(mode, id).all();
  
  return (results[0] as any).rank + 1;
}
