const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createResponse, handleCORS } = require('./auth-middleware');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'Hasło musi mieć co najmniej 8 znaków';
  }
  if (!/[a-z]/.test(password)) {
    return 'Hasło musi zawierać małą literę';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Hasło musi zawierać wielką literę';
  }
  if (!/[0-9]/.test(password)) {
    return 'Hasło musi zawierać cyfrę';
  }
  return null;
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
  const name = sanitizeInput(body.name);

  const fieldErrors = {};

  if (!name) {
    fieldErrors.name = 'Imię i nazwisko jest wymagane';
  } else if (name.length < 2) {
    fieldErrors.name = 'Imię i nazwisko musi mieć co najmniej 2 znaki';
  }

  if (!email) {
    fieldErrors.email = 'Email jest wymagany';
  } else if (!validateEmail(email)) {
    fieldErrors.email = 'Podaj poprawny adres email';
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return createResponse(400, {
      error: 'Popraw dane formularza i spróbuj ponownie',
      fieldErrors,
    });
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return createResponse(409, {
        error: 'Konto z takim adresem email już istnieje',
        fieldErrors: {
          email: 'Ten adres email jest już zajęty',
        },
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${email.toLowerCase()}, ${hashedPassword}, ${name})
      RETURNING id, email, full_name
    `;

    const newUser = result[0];

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'foodplan-api',
        audience: 'foodplan-app',
      }
    );

    return createResponse(201, {
      message: 'Użytkownik utworzony pomyślnie',
      token,
      user: {
        id: newUser.id,
        name: newUser.full_name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') {
      return createResponse(409, {
        error: 'Konto z takim adresem email już istnieje',
        fieldErrors: {
          email: 'Ten adres email jest już zajęty',
        },
      });
    }

    return createResponse(500, {
      error: 'Błąd serwera. Spróbuj ponownie za chwilę.',
    });
  }
};
