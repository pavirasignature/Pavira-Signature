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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ FATAL ERROR: SUPABASE_URL and SUPABASE_KEY environment variables are required!",
  );
  console.error(
    "Please configure these variables in your .env file or deployment environment.",
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
