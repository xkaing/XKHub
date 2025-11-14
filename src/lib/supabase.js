import { createClient } from "@supabase/supabase-js";
import supabaseConfig from "../../superbase.json";

const supabaseUrl = supabaseConfig.SupabaseConfig.supabaseURL;
const supabaseKey = supabaseConfig.SupabaseConfig.supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
