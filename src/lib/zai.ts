import ZAI, { type ZAIConfig } from "z-ai-web-dev-sdk";

/**
 * Initialise the Z.ai SDK from environment variables.
 *
 * The SDK's built-in `ZAI.create()` reads credentials from a `.z-ai-config`
 * file on disk — which doesn't exist on serverless platforms like Vercel.
 * Instead we construct the client directly from env vars so it works
 * everywhere (local dev, Vercel, any serverless host).
 *
 * Required env vars:
 *   - ZAI_BASE_URL  e.g. https://internal-api.z.ai/v1
 *   - ZAI_API_KEY   your Z.ai API key
 *
 * Optional env vars:
 *   - ZAI_CHAT_ID, ZAI_USER_ID, ZAI_TOKEN
 */

// The SDK types the constructor as `private`, but at runtime it is a regular
// public constructor. Cast to a callable constructor type to satisfy TS.
type ZAIConstructor = new (config: ZAIConfig) => ZAI;
const ZAIClass = ZAI as unknown as ZAIConstructor;

let instance: ZAI | null = null;

export async function getZAI(): Promise<ZAI> {
  if (instance) return instance;

  const baseUrl = process.env.ZAI_BASE_URL;
  const apiKey = process.env.ZAI_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "ZAI_BASE_URL and ZAI_API_KEY environment variables are required for AI features.",
    );
  }

  const config: ZAIConfig = {
    baseUrl,
    apiKey,
    ...(process.env.ZAI_CHAT_ID && { chatId: process.env.ZAI_CHAT_ID }),
    ...(process.env.ZAI_USER_ID && { userId: process.env.ZAI_USER_ID }),
    ...(process.env.ZAI_TOKEN && { token: process.env.ZAI_TOKEN }),
  };

  instance = new ZAIClass(config);
  return instance;
}
