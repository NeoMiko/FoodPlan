const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createResponse, handleCORS } = require('./auth-middleware');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim();
}

exports.handler = async event => {
  const corsResponse = handleCORS(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Metoda niedozwolona' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return createResponse(400, { error: 'Nieprawidłowy format JSON' });
  }

  const email = sanitizeInput(body.email);
  const password = body.password;

  if (!email || !password) {
    return createResponse(400, {
      error: 'Email i hasło są wymagane',
      fieldErrors: {
        email: !email ? 'Email jest wymagany' : undefined,
        password: !password ? 'Hasło jest wymagane' : undefined,
      },
    });
  }

  if (!validateEmail(email)) {
    return createResponse(400, {
      error: 'Nieprawidłowy format email',
      fieldErrors: {
        email: 'Podaj poprawny adres email',
      },
    });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    const users = await sql`
      SELECT id, email, password_hash, full_name, is_active 
      FROM users 
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (users.length === 0) {
      return createResponse(401, {
        error: 'Nieprawidłowy email lub hasło',
        fieldErrors: {
          email: 'Nie znaleziono konta dla tego adresu email',
        },
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return createResponse(403, {
        error: 'Konto zostało dezaktywowane',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return createResponse(401, {
        error: 'Nieprawidłowy email lub hasło',
        fieldErrors: {
          password: 'Podane hasło jest niepoprawne',
        },
      });
    }

    await sql`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'foodplan-api',
        audience: 'foodplan-app',
      }
    );

    return createResponse(200, {
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, {
      error: 'Błąd serwera. Spróbuj ponownie za chwilę.',
    });
  }
};
