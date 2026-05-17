const { neon } = require('@neondatabase/serverless');
const {
  requireAuth,
  createResponse,
  handleCORS,
} = require('./auth-middleware');

async function handler(event) {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'DELETE') {
    return createResponse(405, { error: 'Metoda niedozwolona' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return createResponse(400, { error: 'Nieprawidlowy format JSON' });
  }

  const productId = body.productId || event.queryStringParameters?.productId;

  if (!productId) {
    return createResponse(400, { error: 'ID produktu jest wymagane' });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;

    const result = await sql`
      DELETE FROM products
      WHERE id = ${productId} AND user_id = ${userId}
      RETURNING id, name
    `;

    if (result.length === 0) {
      return createResponse(404, { error: 'Produkt nie znaleziony' });
    }

    await sql`
      INSERT INTO activity_log (user_id, action, description, entity_id)
      VALUES (
        ${userId},
        'deleted_product',
        ${`Usunięto ${result[0].name}`},
        ${productId}
      )
    `;

    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return createResponse(500, {
      error: 'Blad serwera. Sprobuj ponownie za chwile.',
    });
  }
}

exports.handler = requireAuth(handler);
