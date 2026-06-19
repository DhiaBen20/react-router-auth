import { createRemoteJWKSet, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import z from "zod";

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const discoveryDocumentEndpoint =
    "https://accounts.google.com/.well-known/openid-configuration";

type DiscoveryDocument = {
    authorization_endpoint: string;
    token_endpoint: string;
    jwks_uri: string;
};

type Tokens = {
    access_token: string;
    expires_in: number;
    id_token: string;
    scope: string;
    token_type: "Bearer";
    refresh_token?: string;
};

export type IdTokenPayload = {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
};

export async function getDiscoveryDocument() {
    const res = await fetch(discoveryDocumentEndpoint);

    if (!res.ok) {
        throw new Error("Couldn't fetch the discovery document");
    }

    try {
        return (await res.json()) as DiscoveryDocument;
    } catch {
        throw new Error("Failed parsing dicovery document as JSON");
    }
}

export function generateStateToken() {
    return randomBytes(16).toString("base64url");
}

export async function buildAuthenticationUrl(
    redirectUri: string,
    state: string,
) {
    const document = await getDiscoveryDocument();

    const search = new URLSearchParams({
        response_type: "code",
        redirect_uri: redirectUri,
        client_id: clientId,
        scope: "openid profile email",
        state: state,
    });

    return document.authorization_endpoint + "?" + search;
}

export async function exchangeTokens(code: string, redirectUri: string) {
    const document = await getDiscoveryDocument();

    const res = await fetch(document.token_endpoint, {
        method: "post",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
            code,
        }),
    });

    if (!res.ok) throw new Error("Tokens exchange failed");

    try {
        return (await res.json()) as Tokens;
    } catch {
        throw new Error("Failed parsing tokens response as JSON");
    }
}

const stateSchema = z.object({ origin: z.string(), token: z.string() });

export function validateState(state: string | null) {
    if (!state) return null;

    const decoded = Buffer.from(state, "base64url").toString();

    try {
        return stateSchema.parse(JSON.parse(decoded));
    } catch {
        return null;
    }
}

export async function verifyIdToken(token: string) {
    try {
        const document = await getDiscoveryDocument();

        const jwks = createRemoteJWKSet(new URL(document.jwks_uri));

        const { payload } = await jwtVerify(token, jwks, {
            audience: clientId,
            issuer: ["https://accounts.google.com", "accounts.google.com"],
        });

        return payload as IdTokenPayload;
    } catch {
        return null;
    }
}
