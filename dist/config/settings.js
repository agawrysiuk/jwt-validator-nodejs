"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const settings = {
    keycloakIssuerUri: process.env.KEYCLOAK_ISSUER_URI || 'http://localhost:8180/realms/homeai',
    keycloakJwkUri: process.env.KEYCLOAK_JWK_URI || 'http://localhost:8180/realms/homeai/protocol/openid-connect/certs',
    jwkCacheTtl: parseInt(process.env.JWK_CACHE_TTL || '300', 10),
};
exports.default = settings;
//# sourceMappingURL=settings.js.map