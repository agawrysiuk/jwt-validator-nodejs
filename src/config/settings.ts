import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Settings {
  keycloakIssuerUri: string;
  keycloakJwkUri: string;
  jwkCacheTtl: number;
}

const settings: Settings = {
  keycloakIssuerUri: process.env.KEYCLOAK_ISSUER_URI || 'http://localhost:8180/realms/homeai',
  keycloakJwkUri: process.env.KEYCLOAK_JWK_URI || 'http://localhost:8180/realms/homeai/protocol/openid-connect/certs',
  jwkCacheTtl: parseInt(process.env.JWK_CACHE_TTL || '300', 10),
};

export default settings;
