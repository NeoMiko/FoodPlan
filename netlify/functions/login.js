const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async event => {
  const sql = neon(process.env.DATABASE_URL);
  const { email, password } = JSON.parse(event.body);

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0)
      return { statusCode: 401, body: 'Błędny email lub hasło' };

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) return { statusCode: 401, body: 'Błędny email lub hasło' };

    // Generowanie tokenu
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: { id: user.id, name: user.full_name },
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
