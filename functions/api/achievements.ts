/**
 * FAIL FRENZY - Achievements API
 * Track and unlock achievements with rewards
 */

interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface Achievement {
  id: string;
  playerName: string;
  achievementId: string;
  unlockedAt: string;
  reward: string;
}

// GET: Fetch player achievements
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const playerName = url.searchParams.get('name');
    
    if (!playerName) {
      return new Response(JSON.stringify({ error: 'Player name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Try KV cache first
    const cacheKey = `achievements:${playerName}`;
    const cached = await context.env.KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600',
        },
      });
    }
    
    // Query D1
    const { results } = await context.env.DB.prepare(`
      SELECT * FROM achievements WHERE player_name = ? ORDER BY unlocked_at DESC
    `).bind(playerName).all();
    
    // Cache result
    const response = JSON.stringify(results);
    await context.env.KV.put(cacheKey, response, { expirationTtl: 600 });
    
    return new Response(response, {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Unlock achievement
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { playerName, achievementId, reward } = await context.request.json();
    
    if (!playerName || !achievementId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if already unlocked
    const { results } = await context.env.DB.prepare(`
      SELECT id FROM achievements WHERE player_name = ? AND achievement_id = ?
    `).bind(playerName, achievementId).all();
    
    if (results.length > 0) {
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Achievement already unlocked'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Insert achievement
    const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await context.env.DB.prepare(`
      INSERT INTO achievements (id, player_name, achievement_id, reward, unlocked_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(id, playerName, achievementId, JSON.stringify(reward)).run();
    
    // Invalidate cache
    await context.env.KV.delete(`achievements:${playerName}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      id,
      reward
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
