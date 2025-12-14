# @agawrysiuk/jwt-validator

JWT validator for Keycloak authentication using JWKS (JSON Web Key Set).

## Features

- Validates JWT tokens issued by Keycloak
- Fetches and caches public keys from Keycloak's JWK endpoint
- Verifies token signature, expiration, and issuer
- TypeScript support with full type definitions
- Configurable via environment variables

## Installation

### From GitHub

```bash
npm install github:agawrysiuk/jwt-validator-nodejs#v1.0.0
```

### Update to latest version

```bash
# Update package.json to point to new tag
# "dependencies": {
#   "@agawrysiuk/jwt-validator": "github:agawrysiuk/jwt-validator-nodejs#v1.0.1"
# }

npm install
```

## Usage

### Basic Usage

```typescript
import { jwtValidator } from '@agawrysiuk/jwt-validator';

// Validate a token (typically from Authorization header)
try {
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';
  const claims = await jwtValidator.validateToken(token);

  console.log('Token is valid!');
  console.log('User ID:', claims.sub);
  console.log('Expires at:', new Date(claims.exp * 1000));
} catch (error) {
  console.error('Token validation failed:', error.message);
}
```

### In Express Middleware

```typescript
import express from 'express';
import { jwtValidator } from '@agawrysiuk/jwt-validator';

const app = express();

// Authentication middleware
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const claims = await jwtValidator.validateToken(token);
    req.user = claims; // Attach claims to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

app.get('/protected', (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});
```

## Configuration

The validator reads configuration from environment variables. Create a `.env` file in your project root:

```bash
# Keycloak issuer URI (validates 'iss' claim)
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/homeai

# Keycloak JWK URI (fetches public keys for signature verification)
KEYCLOAK_JWK_URI=http://localhost:8180/realms/homeai/protocol/openid-connect/certs

# JWK cache TTL in seconds (default: 300 = 5 minutes)
JWK_CACHE_TTL=300
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KEYCLOAK_ISSUER_URI` | Keycloak realm issuer URI | `http://localhost:8180/realms/homeai` |
| `KEYCLOAK_JWK_URI` | Keycloak JWK endpoint | `http://localhost:8180/realms/homeai/protocol/openid-connect/certs` |
| `JWK_CACHE_TTL` | Cache duration for JWKs (seconds) | `300` |

## How It Works

1. **Token Validation**: The validator decodes the JWT header to extract the key ID (`kid`)
2. **Key Fetching**: Fetches the corresponding public key from Keycloak's JWK endpoint
3. **Signature Verification**: Verifies the token signature using the RS256 algorithm
4. **Claims Validation**: Checks token expiration and issuer
5. **Caching**: Public keys are cached to reduce requests to Keycloak

## Validation Details

The validator performs the following checks:

- ✅ **Signature verification** using RS256 algorithm
- ✅ **Expiration check** (`exp` claim)
- ✅ **Issuer verification** (`iss` claim)
- ❌ **Audience is NOT verified** (matches Python implementation behavior)

## Error Handling

The validator throws descriptive errors:

```typescript
try {
  await jwtValidator.validateToken(token);
} catch (error) {
  // Possible error messages:
  // - "Token has expired"
  // - "Invalid token: <reason>"
  // - "Token validation failed: <reason>"
}
```

## Development

### Build

```bash
npm install
npm run build
```

### Test in Local Project

```bash
# In jwt-validator-nodejs folder
npm link

# In your project folder
npm link @agawrysiuk/jwt-validator
```

## Dependencies

- `jsonwebtoken` - JWT decoding and verification
- `jwks-rsa` - JWK Set client with caching
- `dotenv` - Environment variable management

## License

ISC

## Author

Arkadiusz Gawrysiuk
