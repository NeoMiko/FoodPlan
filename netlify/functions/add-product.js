const {neon} = require('@neondatabase/serverless');
const {requireAuth, createResponse, handleCORS} = require('./auth-middleware');

async function handler(event) {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'POST') {
    return createResponse(405, {error: 'Metoda niedozwolona'});
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return createResponse(400, {error: 'Nieprawidlowy format JSON'});
  }

  const {name, emoji, location, expiryDate, quantity, unit, notes} = body;

  if (!name || !String(name).trim()) {
    return createResponse(400, {error: 'Nazwa produktu jest wymagana'});
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;
    const trimmedName = String(name).trim();

    const [product] = await sql`
      INSERT INTO products (user_id, name, emoji, location, expiry_date, quantity, unit, notes)
      VALUES (
        ${userId},
        ${trimmedName},
        ${emoji || null},
        ${location || null},
        ${expiryDate || null},
        ${quantity ?? 1},
        ${unit || null},
        ${notes || null}
      )
      RETURNING id, name, emoji, location, expiry_date, quantity, unit, notes, created_at
    `;

    await sql`
      INSERT INTO activity_log (user_id, action, description, entity_id)
      VALUES (
        ${userId},
        'added_product',
        ${`Dodano ${trimmedName}${location ? ` do ${location}` : ''}`},
        ${product.id}
      )
    `;

    return createResponse(201, {product});
  } catch (error) {
    console.error('Add product error:', error);
    return createResponse(500, {error: 'Blad serwera. Sprobuj ponownie za chwile.'});
  }
}

exports.handler = requireAuth(handler);
