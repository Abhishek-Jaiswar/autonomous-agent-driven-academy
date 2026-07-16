import dotenv from "dotenv";
import { z } from "zod";

// Load .env before any validation
dotenv.config();

// ─── Schema ───────────────────────────────────────────────────────────────────

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ── LLM ──────────────────────────────────────────────────────────────────
  GOOGLE_API_KEY: z
    .string()
    .min(1, "GOOGLE_API_KEY is required — add it to your .env file"),

  // ── LangSmith (optional) ─────────────────────────────────────────────────
  LANGCHAIN_API_KEY: z.string().optional(),
  LANGCHAIN_PROJECT: z.string().default("adaptive-interview"),
  LANGCHAIN_TRACING_V2: z.enum(["true", "false"]).default("false"),
  DATABASE_URL: z.string().min(1, { error: "Database url is required" }),
  SLOW_QUERY_THRESHOLD: z.coerce.number().default(500),

  // ── Redis Cache & Queue ──────────────────────────────────────────────────
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),

  // ── Pinecone Vector DB ───────────────────────────────────────────────────
  PINECONE_API_KEY: z.string().min(1, "PINECONE_API_KEY is required"),
  PINECONE_INDEX: z.string().default("astralearn"),

  // ── Authentication ───────────────────────────────────────────────────────
  JWT_SECRET: z.string().default("default_super_secret_key_change_me_in_production"),
});

// ─── Preprocess & Validate ───────────────────────────────────────────────────

const rawEnv = {
  ...process.env,
  LANGCHAIN_API_KEY:
    process.env.LANGCHAIN_API_KEY || process.env.LANGSMITH_API_KEY,
  LANGCHAIN_PROJECT:
    process.env.LANGCHAIN_PROJECT || process.env.LANGSMITH_PROJECT,
  LANGCHAIN_TRACING_V2:
    process.env.LANGCHAIN_TRACING_V2 || process.env.LANGSMITH_TRACING,
};

const result = envSchema.safeParse(rawEnv);

if (!result.success) {
  console.error("❌  Environment validation failed — cannot start server.\n");
  result.error.issues.forEach((issue) => {
    console.error(`   • ${issue.path.join(".")} → ${issue.message}`);
  });
  console.error("");
  process.exit(1);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const env = result.data;
