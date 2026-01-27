// Cloudflare Pages Functions - API Leaderboard
// GET /api/leaderboard?mode=classic

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const gameMode = url.searchParams.get('mode') || 'classic';
  const limit = parseInt(url.searchParams.get('limit') || '10');

  try {
    // Query D1 database for leaderboard
    const { results } = await env.DB.prepare(`
      SELECT 
        l.player_id,
        u.username,
        l.score,
        l.fail_count,
        l.max_streak,
        l.rank,
        l.updated_at
      FROM leaderboards l
      JOIN users u ON l.player_id = u.player_id
      WHERE l.game_mode = ?
      ORDER BY l.score DESC
      LIMIT ?
    `).bind(gameMode, limit).all();

    return new Response(JSON.stringify({
      success: true,
      gameMode,
      leaderboard: results
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/leaderboard - Submit score
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { playerId, gameMode, score, failCount, maxStreak } = body;

    if (!playerId || !gameMode || score === undefined) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upsert leaderboard entry
    await env.DB.prepare(`
      INSERT INTO leaderboards (player_id, game_mode, score, fail_count, max_streak, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(player_id, game_mode) 
      DO UPDATE SET 
        score = MAX(score, excluded.score),
        fail_count = excluded.fail_count,
        max_streak = MAX(max_streak, excluded.max_streak),
        updated_at = CURRENT_TIMESTAMP
      WHERE excluded.score > score
    `).bind(playerId, gameMode, score, failCount, maxStreak).run();

    // Update user stats
    await env.DB.prepare(`
      UPDATE users 
      SET 
        total_score = total_score + ?,
        games_played = games_played + 1,
        best_streak = MAX(best_streak, ?),
        total_fails = total_fails + ?,
        last_played_at = CURRENT_TIMESTAMP
      WHERE player_id = ?
    `).bind(score, maxStreak, failCount, playerId).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Score submitted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
