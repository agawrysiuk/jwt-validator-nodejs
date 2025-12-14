import { JwtPayload } from 'jsonwebtoken';
/**
 * JWT Validator for Keycloak M2M tokens.
 *
 * Validates JWT tokens using Keycloak's JWK Set with caching.
 * Designed for machine-to-machine authentication (orchestrator → wrapper).
 */
declare class JWTValidator {
    private jwksClient;
    constructor();
    /**
     * Get signing key from JWK Set.
     *
     * @param header - JWT header containing key ID (kid)
     * @returns Signing key for verification
     */
    private getSigningKey;
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
    validateToken(token: string): Promise<JwtPayload>;
}
export declare const jwtValidator: JWTValidator;
export {};
//# sourceMappingURL=jwt-validator.d.ts.map