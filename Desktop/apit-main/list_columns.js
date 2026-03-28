import { supabase } from "./src/integrations/supabase/client.js";

async function listColumns() {
  const { data, error } = await supabase.from("projects").select("*").limit(1);
  if (error) {
    console.error("Error fetching projects:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns in projects table:", Object.keys(data[0]));
  } else {
    console.log("Projects table is empty.");
  }
}

listColumns();
