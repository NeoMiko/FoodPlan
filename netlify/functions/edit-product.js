const { neon } = require('@neondatabase/serverless');
const {
  requireAuth,
  createResponse,
  handleCORS,
} = require('./auth-middleware');

async function handler(event) {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'PATCH') {
    return createResponse(405, { error: 'Metoda niedozwolona' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return createResponse(400, { error: 'Nieprawidlowy format JSON' });
  }

  const {
    productId,
    name,
    emoji,
    location,
    expiryDate,
    quantity,
    unit,
    notes,
  } = body;

  if (!productId) {
    return createResponse(400, { error: 'ID produktu jest wymagane' });
  }

  if (!name || !String(name).trim()) {
    return createResponse(400, { error: 'Nazwa produktu jest wymagana' });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;
    const trimmedName = String(name).trim();

    const result = await sql`
      UPDATE products
      SET
        name       = ${trimmedName},
        emoji      = ${emoji || null},
        location   = ${location || null},
        expiry_date = ${expiryDate || null},
        quantity   = ${quantity ?? 1},
        unit       = ${unit || null},
        notes      = ${notes || null}
      WHERE id = ${productId} AND user_id = ${userId}
      RETURNING id, name, emoji, location, expiry_date, quantity, unit, notes, created_at
    `;

    if (result.length === 0) {
      return createResponse(404, { error: 'Produkt nie znaleziony' });
    }

    await sql`
      INSERT INTO activity_log (user_id, action, description, entity_id)
      VALUES (
        ${userId},
        'edited_product',
        ${`Zaktualizowano ${trimmedName}`},
        ${productId}
      )
    `;

    return createResponse(200, { product: result[0] });
  } catch (error) {
    console.error('Edit product error:', error);
    return createResponse(500, {
      error: 'Blad serwera. Sprobuj ponownie za chwile.',
    });
  }
}

exports.handler = requireAuth(handler);
