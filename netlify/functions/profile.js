const { neon } = require('@neondatabase/serverless');
const { requireAuth, createResponse, handleCORS } = require('./auth-middleware');

async function handler(event) {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'GET') {
    return createResponse(405, { error: 'Metoda niedozwolona' });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;

    const userResult = await sql`
      SELECT id, email, full_name, created_at, last_login
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (userResult.length === 0) {
      return createResponse(404, { error: 'Użytkownik nie znaleziony' });
    }

    const user = userResult[0];

    return createResponse(200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return createResponse(500, {
      error: 'Błąd serwera. Spróbuj ponownie za chwilę.',
    });
  }
}

exports.handler = requireAuth(handler);
