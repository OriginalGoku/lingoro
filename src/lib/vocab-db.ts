import { createClient } from '@/utils/supabase/server'; 
// import type { Database } from '../utils/supabase/types'; 


/**
 * Represents one row from the "vocab_items" table,
 * plus any joined fields (e.g. language name, source name).
 */
export type VocabItem = {
  id: string;
  user_id: string;
  entry_type: 'word' | 'sentence';
  content: string;
  language_id: number;
  language_name: string | null;
  source_id: number | null;
  source_name: string | null;
  source_details: string | null;
  status: 'hard' | 'learned';
  created_at: string; // ISO timestamp
};


/**
 * Fetch all vocabulary items for a given user, ordered by creation date descending.
 *
 * - Joins to "languages" to get `language_name`.
 * - Joins to "sources" to get `source_name`.
 *
 * @param userId - the Supabase auth.uid() for the current user.
 * @returns an array of VocabItem or throws an error if the query fails.
 */
export async function getUserVocabItems(
  userId: string
): Promise<VocabItem[]> {
  // 1. Create a Supabase server client that can read RLS‐protected tables
  const supabase = await createClient();

  // 2. Build a query: select everything from vocab_items,
  //    plus the joined language and source name fields.
  //    Example SQL equivalent:
  //    SELECT
  //      v.id,
  //      v.user_id,
  //      v.entry_type,
  //      v.content,
  //      v.language_id,
  //      l.name as language_name,
  //      v.source_id,
  //      s.name as source_name,
  //      v.source_details,
  //      v.status,
  //      v.created_at
  //    FROM public.vocab_items v
  //    LEFT JOIN public.languages l ON v.language_id = l.id
  //    LEFT JOIN public.sources s ON v.source_id = s.id
  //    WHERE v.user_id = <userId>
  //    ORDER BY v.created_at DESC;

  const { data, error } = await supabase
    .from('vocab_items')
    .select(`
      id,
      user_id,
      entry_type,
      content,
      language_id,
      languages ( name ),      
      source_id,
      sources ( name ),        
      source_details,
      status,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
// -- Supabase’s “dot notation” for a JOIN
// -- Supabase’s “dot notation” again
  if (error) {
    // 3. If anything goes wrong, throw an error so the caller (component) can catch it.
    console.error('Error fetching vocab_items for user', userId, error);
    throw new Error(error.message);
  }

  // 4. Transform Supabase’s “nested” join into our flat VocabItem type
  const items: VocabItem[] = (data || []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    entry_type: row.entry_type,
    content: row.content,
    language_id: row.language_id,
    language_name: (row.languages as { name: string } | null)?.name || null,
    source_id: row.source_id,
    source_name: (row.sources as { name: string } | null)?.name || null,
    source_details: row.source_details,
    status: row.status,
    created_at: row.created_at,
  }));

  return items;
}