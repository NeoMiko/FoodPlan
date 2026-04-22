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

  const {productId} = body;

  if (!productId) {
    return createResponse(400, {error: 'ID produktu jest wymagane'});
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;

    const products = await sql`
      SELECT id, name, unit FROM products
      WHERE id = ${productId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (products.length === 0) {
      return createResponse(404, {error: 'Produkt nie znaleziony'});
    }

    const product = products[0];

    const existing = await sql`
      SELECT id FROM shopping_list
      WHERE user_id = ${userId} AND item_name = ${product.name} AND is_purchased = false
      LIMIT 1
    `;

    if (existing.length > 0) {
      return createResponse(409, {error: 'Produkt juz jest na liscie zakupow'});
    }

    const [item] = await sql`
      INSERT INTO shopping_list (user_id, item_name, quantity, unit)
      VALUES (${userId}, ${product.name}, 1, ${product.unit})
      RETURNING id, item_name, quantity, unit, is_purchased, category, created_at
    `;

    await sql`
      INSERT INTO activity_log (user_id, action, description, entity_id)
      VALUES (
        ${userId},
        'moved_to_shopping',
        ${`Przeniesiono ${product.name} na liste zakupow`},
        ${product.id}
      )
    `;

    return createResponse(201, {item});
  } catch (error) {
    console.error('Move to shopping error:', error);
    return createResponse(500, {error: 'Blad serwera. Sprobuj ponownie za chwile.'});
  }
}

exports.handler = requireAuth(handler);
