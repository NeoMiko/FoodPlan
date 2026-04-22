const {neon} = require('@neondatabase/serverless');
const {requireAuth, createResponse, handleCORS} = require('./auth-middleware');

async function handler(event) {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'GET') {
    return createResponse(405, {error: 'Metoda niedozwolona'});
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const userId = event.user.userId;

    const [products, shoppingList, history, statsRows] = await Promise.all([
      sql`
        SELECT id, name, emoji, location, expiry_date, quantity, unit, notes, created_at
        FROM products
        WHERE user_id = ${userId}
        ORDER BY expiry_date ASC NULLS LAST, created_at DESC
      `,
      sql`
        SELECT id, item_name, quantity, unit, is_purchased, category, created_at
        FROM shopping_list
        WHERE user_id = ${userId}
        ORDER BY is_purchased ASC, created_at DESC
      `,
      sql`
        SELECT id, action, description, created_at
        FROM activity_log
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 30
      `,
      sql`
        SELECT
          COUNT(*)::int AS total_products,
          COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE)::int AS expired_count,
          COUNT(*) FILTER (WHERE expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '3 days')::int AS expiring_soon_count,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::int AS added_this_month
        FROM products
        WHERE user_id = ${userId}
      `,
    ]);

    const stats = statsRows[0] || {
      total_products: 0,
      expired_count: 0,
      expiring_soon_count: 0,
      added_this_month: 0,
    };

    return createResponse(200, {products, shoppingList, history, stats});
  } catch (error) {
    console.error('Dashboard error:', error);
    return createResponse(500, {error: 'Blad serwera. Sprobuj ponownie za chwile.'});
  }
}

exports.handler = requireAuth(handler);
