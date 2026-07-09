const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables - Handle both direct execution and npm workspace execution
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Resolve Supabase credentials with fallbacks for Vercel serverless deployment
// On Vercel, the backend runs inside Next.js serverless functions where the local .env
// file doesn't exist. In that case, fall back to the NEXT_PUBLIC_ prefixed variables
// that are configured in the Vercel dashboard.
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ FATAL ERROR: Supabase environment variables are required!",
  );
  console.error(
    "Checked: SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  console.error(
    "Please configure these variables in your .env file or Vercel dashboard.",
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
