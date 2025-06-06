// Enums
export type VocabStatus = 'hard' | 'learned';
export type EntryType = 'word' | 'sentence';

// Language Table
export interface Language {
  id: number;
  name: string;
}

// Source Table
export interface Source {
  id: number;
  name: string;
}

// Vocab Item Table
export interface VocabItem {
  id: string; // UUID
  user_id: string; // UUID
  entry_type: EntryType;
  content: string;
  language_id: number;
  source_id?: number | null;
  source_details?: string | null;
  status: VocabStatus;
  created_at: string; // ISO timestamp
}