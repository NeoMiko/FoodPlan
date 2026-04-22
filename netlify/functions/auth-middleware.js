const jwt = require('jsonwebtoken');

function verifyToken(token) {
  if (!token) {
    throw new Error('Token nie został podany');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token wygasł');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Nieprawidłowy token');
    }
    throw new Error('Błąd weryfikacji tokenu');
  }
}

function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

function requireAuth(handler) {
  return async (event, context) => {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);

    try {
      const user = verifyToken(token);
      event.user = user;
      return await handler(event, context);
    } catch (error) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: error.message || 'Nieautoryzowany dostęp',
        }),
      };
    }
  };
}

function createResponse(statusCode, data, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      ...headers,
    },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  };
}

function handleCORS(event) {
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }
  return null;
}

module.exports = {
  verifyToken,
  extractTokenFromHeader,
  requireAuth,
  createResponse,
  handleCORS,
};
