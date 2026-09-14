require("dotenv").config({ path: "../backend/.env" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", "pavirasignature@gmail.com");

  console.log("Found users:", users);
  
  if (users && users.length > 0 && users[0].role !== "admin") {
    console.log("Updating role to admin...");
    const { data: updateData, error: updateError } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("email", "pavirasignature@gmail.com")
      .select("id, email, role");
    console.log("Updated to:", updateData);
  } else {
    console.log("Role is already admin, or user not found.");
  }
}

check();
