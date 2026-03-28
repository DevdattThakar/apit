import { supabase } from "./src/integrations/supabase/client.js";

async function diagnose() {
  console.log("Fetching projects from Supabase...");
  const { data, error } = await supabase.from("projects").select("*").limit(5);

  if (error) {
    console.error("Error fetching projects:", error);
    return;
  }

  console.log("Found", data.length, "projects.");
  data.forEach((p, i) => {
    console.log(`\nProject ${i + 1}: ${p.name}`);
    console.log(`- Column 'contact_person_name': ${p.contact_person_name}`);
    console.log(`- Column 'contact_person_email': ${p.contact_person_email}`);
    console.log(`- Column 'contact_person_mobile': ${p.contact_person_mobile}`);
    
    // Check for other possible column names
    console.log(`- Other columns:`, Object.keys(p).filter(k => k.includes('contact')));
  });
}

diagnose();
