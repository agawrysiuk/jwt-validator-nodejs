"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtValidator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const settings_1 = __importDefault(require("../config/settings"));
/**
 * JWT Validator for Keycloak M2M tokens.
 *
 * Validates JWT tokens using Keycloak's JWK Set with caching.
 * Designed for machine-to-machine authentication (orchestrator → wrapper).
 */
class JWTValidator {
    constructor() {
        /**
         * Get signing key from JWK Set.
         *
         * @param header - JWT header containing key ID (kid)
         * @returns Signing key for verification
         */
        this.getSigningKey = (header) => {
            return new Promise((resolve, reject) => {
                this.jwksClient.getSigningKey(header.kid, (err, key) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const signingKey = key === null || key === void 0 ? void 0 : key.getPublicKey();
                        if (signingKey) {
                            resolve(signingKey);
                        }
                        else {
                            reject(new Error('Unable to get signing key'));
                        }
                    }
                });
            });
        };
        // Initialize JWKS client with Keycloak JWK URI
        this.jwksClient = (0, jwks_rsa_1.default)({
            jwksUri: settings_1.default.keycloakJwkUri,
            cache: true,
            cacheMaxAge: settings_1.default.jwkCacheTtl * 1000, // Convert to milliseconds
            rateLimit: true,
            jwksRequestsPerMinute: 10,
        });
    }
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
    validateToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Get signing key from JWKS
                const signingKey = yield this.getSigningKey((_a = jsonwebtoken_1.default.decode(token, { complete: true })) === null || _a === void 0 ? void 0 : _a.header);
                // Verify and decode token
                const decoded = jsonwebtoken_1.default.verify(token, signingKey, {
                    algorithms: ['RS256'],
                    issuer: settings_1.default.keycloakIssuerUri,
                    // Don't verify audience (same as Python: verify_aud: false)
                });
                return decoded;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    throw new Error('Token has expired');
                }
                else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    throw new Error(`Invalid token: ${error.message}`);
                }
                else if (error instanceof Error) {
                    throw new Error(`Token validation failed: ${error.message}`);
                }
                else {
                    throw new Error('Token validation failed: Unknown error');
                }
            }
        });
    }
}
// Global validator instance
exports.jwtValidator = new JWTValidator();
//# sourceMappingURL=jwt-validator.js.map