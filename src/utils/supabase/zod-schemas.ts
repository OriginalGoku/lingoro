import { z } from 'zod';

// Enums
export const VocabStatusEnum = z.enum(['hard', 'learned']);
export const EntryTypeEnum = z.enum(['word', 'sentence']);

// Language Schema
export const LanguageSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

// Source Schema
export const SourceSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

// VocabItem Schema
export const VocabItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  entry_type: EntryTypeEnum,
  content: z.string(),
  language_id: z.number().int(),
  source_id: z.number().int().nullable().optional(),
  source_details: z.string().nullable().optional(),
  status: VocabStatusEnum.default('hard'),
  created_at: z.string().datetime(),
});

// For creating a new vocab item (no id, created_at, etc.)
export const VocabItemCreateSchema = VocabItemSchema.omit({
  id: true,
  created_at: true,
});

// For updating an item (some fields optional)
export const VocabItemUpdateSchema = VocabItemCreateSchema.partial();