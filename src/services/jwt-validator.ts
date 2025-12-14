import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import settings from '../config/settings';

/**
 * JWT Validator for Keycloak M2M tokens.
 *
 * Validates JWT tokens using Keycloak's JWK Set with caching.
 * Designed for machine-to-machine authentication (orchestrator → wrapper).
 */
class JWTValidator {
  private jwksClient: jwksClient.JwksClient;

  constructor() {
    // Initialize JWKS client with Keycloak JWK URI
    this.jwksClient = jwksClient({
      jwksUri: settings.keycloakJwkUri,
      cache: true,
      cacheMaxAge: settings.jwkCacheTtl * 1000, // Convert to milliseconds
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  /**
   * Get signing key from JWK Set.
   *
   * @param header - JWT header containing key ID (kid)
   * @returns Signing key for verification
   */
  private getSigningKey = (header: jwt.JwtHeader): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          const signingKey = key?.getPublicKey();
          if (signingKey) {
            resolve(signingKey);
          } else {
            reject(new Error('Unable to get signing key'));
          }
        }
      });
    });
  };

  /**
   * Validate JWT token and return decoded claims.
   *
   * Verifies:
   * - Signature (RS256)
   * - Expiration
   * - Issuer
   *
   * Does NOT verify audience (matching Python implementation).
   *
   * @param token - JWT token string from Authorization header
   * @returns Decoded token claims
   * @throws Error if token is invalid, expired, or verification fails
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      // Get signing key from JWKS
      const signingKey = await this.getSigningKey(
        jwt.decode(token, { complete: true })?.header as jwt.JwtHeader
      );

      // Verify and decode token
      const decoded = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: settings.keycloakIssuerUri,
        // Don't verify audience (same as Python: verify_aud: false)
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid token: ${error.message}`);
      } else if (error instanceof Error) {
        throw new Error(`Token validation failed: ${error.message}`);
      } else {
        throw new Error('Token validation failed: Unknown error');
      }
    }
  }
}

// Global validator instance
export const jwtValidator = new JWTValidator();