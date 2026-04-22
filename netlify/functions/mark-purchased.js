const {neon} = require('@neondatabase/serverless');
const {requireAuth, createResponse, handleCORS} = require('./auth-middleware');

async function handler(event) {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'PATCH') {
    return createResponse(405, {error: 'Metoda niedozwolona'});
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return createResponse(400, {error: 'Nieprawidlowy format JSON'});
  }

  const {itemId} = body;

  if (!itemId) {
    return createResponse(400, {error: 'ID pozycji jest wymagane'});
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;

    const result = await sql`
      UPDATE shopping_list
      SET is_purchased = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId} AND user_id = ${userId}
      RETURNING id, item_name, is_purchased
    `;

    if (result.length === 0) {
      return createResponse(404, {error: 'Pozycja nie znaleziona'});
    }

    await sql`
      INSERT INTO activity_log (user_id, action, description, entity_id)
      VALUES (
        ${userId},
        'marked_purchased',
        ${`Oznaczono ${result[0].item_name} jako kupiony`},
        ${itemId}
      )
    `;

    return createResponse(200, {item: result[0]});
  } catch (error) {
    console.error('Mark purchased error:', error);
    return createResponse(500, {error: 'Blad serwera. Sprobuj ponownie za chwile.'});
  }
}

exports.handler = requireAuth(handler);
