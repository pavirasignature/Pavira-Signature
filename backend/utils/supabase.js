const { createClient } = require("@supabase/supabase-js");

// Load environment variables from .env file when running locally.
// On Vercel, fs/path are stubbed out by webpack, so dotenv will fail — that's expected.
// Vercel provides env vars at runtime via process.env instead.
try {
  const dotenv = require("dotenv");
  const path = require("path");
  const fs = require("fs");
  const envPath = path.resolve(__dirname, "../.env");
  if (fs && fs.existsSync && fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }
} catch (_) {
  // Expected on Vercel — dotenv/fs/path are unavailable in the webpack bundle
}

// Resolve Supabase credentials.
// Use bracket notation (process.env['VAR']) to prevent Next.js webpack DefinePlugin
// from inlining NEXT_PUBLIC_* values as undefined at build time.
// This ensures the values are read at RUNTIME from Vercel's environment.
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env["NEXT_PUBLIC_SUPABASE_URL"];

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ||
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  const availableKeys = Object.keys(process.env)
    .filter(k => k.includes("SUPABASE") || k.includes("supabase"))
    .join(", ");
  console.error(
    "❌ FATAL ERROR: Supabase environment variables are required!",
  );
  console.error("Available Supabase-related env vars:", availableKeys || "NONE");
  console.error(
    "Please add SUPABASE_URL + SUPABASE_KEY (or NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to your Vercel dashboard or .env file.",
  );
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing required Supabase environment variables. Cannot start application.",
    );
  }
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function makeChainable(promise) {
  promise.populate = function () {
    return makeChainable(promise);
  };
  promise.select = function () {
    return makeChainable(promise);
  };
  promise.sort = function () {
    return makeChainable(promise);
  };
  promise.limit = function () {
    return makeChainable(promise);
  };
  promise.skip = function () {
    return makeChainable(promise);
  };
  return promise;
}

module.exports = {
  supabase,
  makeChainable,
};
