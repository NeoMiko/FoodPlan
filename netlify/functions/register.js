const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

exports.handler = async event => {
  const sql = neon(process.env.DATABASE_URL);
  const { email, password, name } = JSON.parse(event.body);

  try {
    // Hashowanie hasła
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Zapis do Neona
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING id, email;
    `;

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Użytkownik stworzony',
        user: result[0],
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
