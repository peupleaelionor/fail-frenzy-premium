// Cloudflare Pages Functions - Player Management
// POST /api/player - Create or update player

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { playerId, username, email } = body;

    if (!playerId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Player ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upsert player
    await env.DB.prepare(`
      INSERT INTO users (player_id, username, email)
      VALUES (?, ?, ?)
      ON CONFLICT(player_id) 
      DO UPDATE SET 
        username = excluded.username,
        email = excluded.email
    `).bind(playerId, username || null, email || null).run();

    return new Response(JSON.stringify({
      success: true,
      playerId
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

// GET /api/player?id=xxx - Get player stats
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const playerId = url.searchParams.get('id');

  if (!playerId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Player ID is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const player = await env.DB.prepare(`
      SELECT * FROM users WHERE player_id = ?
    `).bind(playerId).first();

    if (!player) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Player not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      player
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30'
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
