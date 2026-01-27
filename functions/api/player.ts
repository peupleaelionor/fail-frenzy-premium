/**
 * FAIL FRENZY - Player Stats & Progress API
 * Real-time stats sync with KV storage
 */

interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface PlayerStats {
  playerName: string;
  totalGames: number;
  totalScore: number;
  highScore: number;
  totalFails: number;
  totalTime: number;
  longestCombo: number;
  level: number;
  experience: number;
  achievements: string[];
  lastPlayed: string;
}

// GET: Fetch player stats
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
    const cacheKey = `player:${playerName}`;
    const cached = await context.env.KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
    
    // Query D1
    const { results } = await context.env.DB.prepare(`
      SELECT * FROM players WHERE player_name = ?
    `).bind(playerName).all();
    
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: 'Player not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const player = results[0] as any;
    const stats: PlayerStats = {
      playerName: player.player_name,
      totalGames: player.total_games,
      totalScore: player.total_score,
      highScore: player.high_score,
      totalFails: player.total_fails,
      totalTime: player.total_time,
      longestCombo: player.longest_combo,
      level: player.level,
      experience: player.experience,
      achievements: JSON.parse(player.achievements || '[]'),
      lastPlayed: player.last_played,
    };
    
    // Cache result
    const response = JSON.stringify(stats);
    await context.env.KV.put(cacheKey, response, { expirationTtl: 300 });
    
    return new Response(response, {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Update player stats
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const stats: Partial<PlayerStats> = await context.request.json();
    
    if (!stats.playerName) {
      return new Response(JSON.stringify({ error: 'Player name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if player exists
    const { results } = await context.env.DB.prepare(`
      SELECT player_name FROM players WHERE player_name = ?
    `).bind(stats.playerName).all();
    
    if (results.length === 0) {
      // Create new player
      await context.env.DB.prepare(`
        INSERT INTO players (
          player_name, total_games, total_score, high_score, total_fails, total_time,
          longest_combo, level, experience, achievements, last_played
        ) VALUES (?, 0, 0, 0, 0, 0, 0, 1, 0, '[]', datetime('now'))
      `).bind(stats.playerName).run();
    }
    
    // Update stats
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (stats.totalGames !== undefined) {
      updateFields.push('total_games = total_games + ?');
      updateValues.push(stats.totalGames);
    }
    if (stats.totalScore !== undefined) {
      updateFields.push('total_score = total_score + ?');
      updateValues.push(stats.totalScore);
    }
    if (stats.highScore !== undefined) {
      updateFields.push('high_score = MAX(high_score, ?)');
      updateValues.push(stats.highScore);
    }
    if (stats.totalFails !== undefined) {
      updateFields.push('total_fails = total_fails + ?');
      updateValues.push(stats.totalFails);
    }
    if (stats.totalTime !== undefined) {
      updateFields.push('total_time = total_time + ?');
      updateValues.push(stats.totalTime);
    }
    if (stats.longestCombo !== undefined) {
      updateFields.push('longest_combo = MAX(longest_combo, ?)');
      updateValues.push(stats.longestCombo);
    }
    if (stats.level !== undefined) {
      updateFields.push('level = ?');
      updateValues.push(stats.level);
    }
    if (stats.experience !== undefined) {
      updateFields.push('experience = ?');
      updateValues.push(stats.experience);
    }
    if (stats.achievements !== undefined) {
      updateFields.push('achievements = ?');
      updateValues.push(JSON.stringify(stats.achievements));
    }
    
    updateFields.push('last_played = datetime("now")');
    updateValues.push(stats.playerName);
    
    const query = `
      UPDATE players SET ${updateFields.join(', ')}
      WHERE player_name = ?
    `;
    
    await context.env.DB.prepare(query).bind(...updateValues).run();
    
    // Invalidate cache
    await context.env.KV.delete(`player:${stats.playerName}`);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating player stats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE: Remove player data (GDPR compliance)
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const playerName = url.searchParams.get('name');
    
    if (!playerName) {
      return new Response(JSON.stringify({ error: 'Player name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Delete from D1
    await context.env.DB.prepare(`
      DELETE FROM players WHERE player_name = ?
    `).bind(playerName).run();
    
    await context.env.DB.prepare(`
      DELETE FROM leaderboard WHERE player_name = ?
    `).bind(playerName).run();
    
    // Delete from KV
    await context.env.KV.delete(`player:${playerName}`);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
