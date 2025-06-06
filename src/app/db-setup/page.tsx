// 'use client'

// import { useState } from 'react'
// import { createClient } from '@supabase/supabase-js'

// // Initialize Supabase client
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use service role key for admin operations
// const supabase = createClient(supabaseUrl, supabaseServiceKey)

// interface SetupStep {
//   id: string
//   name: string
//   description: string
//   sql: string
//   completed: boolean
//   error?: string
// }

// export default function DatabaseSetupPage() {
//   const [isRunning, setIsRunning] = useState(false)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [steps, setSteps] = useState<SetupStep[]>([
//     {
//       id: 'extensions',
//       name: 'Enable Extensions',
//       description: 'Enable required PostgreSQL extensions',
//       sql: `
//         create extension if not exists citext;
//         create extension if not exists pg_trgm;
//       `,
//       completed: false
//     },
//     {
//       id: 'functions',
//       name: 'Create Helper Functions',
//       description: 'Create utility functions for triggers',
//       sql: `
//         create or replace function public.set_updated_at() returns trigger language plpgsql as $$
//         begin
//           new.updated_at := now();
//           return new;
//         end;
//         $$;
//       `,
//       completed: false
//     },
//     {
//       id: 'user_profiles',
//       name: 'User Profiles Table',
//       description: 'Create user profiles table to extend auth.users',
//       sql: `
//         create table public.user_profiles (
//           id             uuid        primary key references auth.users(id) on delete cascade,
//           display_name   text,
//           native_language char(2)     not null default 'en',
//           target_languages char(2)[]   not null default '{}',
//           daily_goal     int         not null default 10,
//           timezone       text        not null default 'UTC',
//           created_at     timestamptz not null default now(),
//           updated_at     timestamptz not null default now()
//         );

//         create trigger trg_user_profiles_updated_at
//           before update on public.user_profiles
//           for each row execute procedure public.set_updated_at();
//       `,
//       completed: false
//     },
//     {
//       id: 'media_sources',
//       name: 'Media Sources Table',
//       description: 'Create table for movies, shows, YouTube videos, etc.',
//       sql: `
//         create table public.media_sources (
//           id             bigserial   primary key,
//           title          text        not null,
//           type           text        not null
//                           check (type in ('movie','series','podcast','youtube','music','documentary','other')),
//           season_number  int,
//           episode_number int,
//           duration_minutes int,
//           release_year   int,
//           language_code  char(2)     not null,
//           difficulty_level text       check (difficulty_level in ('beginner','intermediate','advanced')),
//           genre          text[],
//           external_url   text,
//           thumbnail_url  text,
//           description    text,
//           imdb_id        text,
//           created_at     timestamptz not null default now(),
//           updated_at     timestamptz not null default now()
//         );

//         create index idx_media_type on public.media_sources(type);
//         create index idx_media_language on public.media_sources(language_code);
//         create index idx_media_difficulty on public.media_sources(difficulty_level);
//         create index idx_media_title_trgm on public.media_sources using gin(title gin_trgm_ops);

//         create trigger trg_media_updated_at
//           before update on public.media_sources
//           for each row execute procedure public.set_updated_at();
//       `,
//       completed: false
//     },
//     {
//       id: 'vocabulary',
//       name: 'Vocabulary Table',
//       description: 'Create main vocabulary table with spaced repetition',
//       sql: `
//         create table public.vocabulary (
//           id             bigserial   primary key,
//           user_id        uuid        not null references auth.users(id) on delete cascade,
//           media_id       bigint      references public.media_sources(id),
//           original_text  text        not null,
//           context_sentence text,
//           context_note   text,
//           part_of_speech text,
//           frequency_rank int,
//           difficulty_level text      check (difficulty_level in ('easy','medium','hard')),
//           status         text        not null default 'learning'
//                           check (status in ('new','learning','review','mastered','ignored')),
//           next_review_at timestamptz,
//           interval_days  int         not null default 1,
//           ease_factor    numeric(4,2) not null default 2.50,
//           repetitions    int         not null default 0,
//           last_reviewed_at timestamptz,
//           created_at     timestamptz not null default now(),
//           updated_at     timestamptz not null default now(),
//           tsv            tsvector
//         );

//         create index idx_vocab_user_id on public.vocabulary(user_id);
//         create index idx_vocab_media_id on public.vocabulary(media_id);
//         create index idx_vocab_status on public.vocabulary(status);
//         create index idx_vocab_next_review on public.vocabulary(next_review_at) where next_review_at is not null;
//         create index idx_vocab_difficulty on public.vocabulary(difficulty_level);
//         create index idx_vocab_created_at on public.vocabulary(created_at);
//         create index idx_vocab_tsv on public.vocabulary using gin(tsv);
//         create index idx_vocab_user_status on public.vocabulary(user_id, status);
//         create index idx_vocab_user_review on public.vocabulary(user_id, next_review_at) where next_review_at is not null;
//       `,
//       completed: false
//     },
//     {
//       id: 'vocabulary_triggers',
//       name: 'Vocabulary Triggers',
//       description: 'Create triggers for vocabulary table',
//       sql: `
//         create trigger trg_vocab_updated_at
//           before update on public.vocabulary
//           for each row execute procedure public.set_updated_at();

//         create or replace function public.vocabulary_tsv_trigger() returns trigger language plpgsql as $$
//         begin
//           new.tsv := to_tsvector('simple',
//             coalesce(new.original_text,'') || ' ' ||
//             coalesce(new.context_sentence,'') || ' ' ||
//             coalesce(new.context_note,''));
//           return new;
//         end;
//         $$;

//         create trigger trg_vocab_tsv
//           before insert or update on public.vocabulary
//           for each row execute procedure public.vocabulary_tsv_trigger();
//       `,
//       completed: false
//     },
//     {
//       id: 'translations',
//       name: 'Translations Table',
//       description: 'Create translations table for vocabulary',
//       sql: `
//         create table public.translations (
//           id             bigserial   primary key,
//           vocab_id       bigint      not null references public.vocabulary(id) on delete cascade,
//           language_code  char(2)     not null,
//           text           text        not null,
//           definition     text,
//           example_sentence text,
//           source         text        not null default 'user',
//           confidence     numeric(3,2),
//           verified       boolean     not null default false,
//           created_at     timestamptz not null default now(),
//           updated_at     timestamptz not null default now(),
//           unique (vocab_id, language_code)
//         );

//         create index idx_translations_vocab_id on public.translations(vocab_id);
//         create index idx_translations_language on public.translations(language_code);

//         create trigger trg_trans_updated_at
//           before update on public.translations
//           for each row execute procedure public.set_updated_at();
//       `,
//       completed: false
//     },
//     {
//       id: 'etymologies',
//       name: 'Etymologies Table',
//       description: 'Create etymologies table for word origins',
//       sql: `
//         create table public.etymologies (
//           id             bigserial   primary key,
//           vocab_id       bigint      not null references public.vocabulary(id) on delete cascade,
//           language_code  char(2)     not null,
//           origin_text    text        not null,
//           historical_info text,
//           source         text        not null default 'openai',
//           confidence     numeric(3,2),
//           created_at     timestamptz not null default now(),
//           updated_at     timestamptz not null default now()
//         );

//         create index idx_etymologies_vocab_id on public.etymologies(vocab_id);

//         create trigger trg_ety_updated_at
//           before update on public.etymologies
//           for each row execute procedure public.set_updated_at();
//       `,
//       completed: false
//     },
//     {
//       id: 'tags',
//       name: 'Tags System',
//       description: 'Create tags and vocab_tags tables',
//       sql: `
//         create table public.tags (
//           id         bigserial   primary key,
//           name       citext      not null unique,
//           color      text        default '#3b82f6',
//           created_by uuid        references auth.users(id),
//           is_system  boolean     not null default false,
//           created_at timestamptz not null default now()
//         );

//         create table public.vocab_tags (
//           vocab_id   bigint      not null references public.vocabulary(id) on delete cascade,
//           tag_id     bigint      not null references public.tags(id) on delete cascade,
//           created_at timestamptz not null default now(),
//           primary key (vocab_id, tag_id)
//         );

//         insert into public.tags (name, color, is_system) values 
//           ('difficult', '#ef4444', true),
//           ('easy', '#22c55e', true),
//           ('grammar', '#8b5cf6', true),
//           ('idiom', '#f59e0b', true),
//           ('slang', '#ec4899', true),
//           ('formal', '#6366f1', true);
//       `,
//       completed: false
//     },
//     {
//       id: 'practice_sessions',
//       name: 'Practice Sessions',
//       description: 'Create practice sessions and attempts tables',
//       sql: `
//         create table public.practice_sessions (
//           id               bigserial   primary key,
//           user_id          uuid        not null references auth.users(id) on delete cascade,
//           session_type     text        not null default 'general'
//                             check (session_type in ('general','review','quiz','flashcard','sentence_builder')),
//           language_code    char(2)     not null,
//           total_questions  int         not null default 0,
//           correct_answers  int         not null default 0,
//           started_at       timestamptz not null default now(),
//           finished_at      timestamptz,
//           duration_seconds int
//         );

//         create table public.practice_attempts (
//           id           bigserial   primary key,
//           session_id   bigint      not null references public.practice_sessions(id) on delete cascade,
//           vocab_id     bigint      not null references public.vocabulary(id) on delete cascade,
//           question_type text       not null default 'translation'
//                         check (question_type in ('translation','definition','context','audio','image')),
//           user_answer  text,
//           correct_answer text      not null,
//           is_correct   boolean     not null,
//           response_ms  int,
//           hint_used    boolean     not null default false,
//           created_at   timestamptz not null default now()
//         );

//         create index idx_sessions_user_id on public.practice_sessions(user_id);
//         create index idx_sessions_started_at on public.practice_sessions(started_at);
//         create index idx_attempts_session_id on public.practice_attempts(session_id);
//         create index idx_attempts_vocab_id on public.practice_attempts(vocab_id);
//       `,
//       completed: false
//     },
//     {
//       id: 'learning_stats',
//       name: 'Learning Statistics',
//       description: 'Create learning streaks and daily stats tables',
//       sql: `
//         create table public.learning_streaks (
//           id             bigserial   primary key,
//           user_id        uuid        not null references auth.users(id) on delete cascade,
//           current_streak int         not null default 0,
//           longest_streak int         not null default 0,
//           last_activity_date date    not null default current_date,
//           created_at     timestamptz not null default now(),
//           updated_at     timestamptz not null default now(),
//           unique(user_id)
//         );

//         create trigger trg_streaks_updated_at
//           before update on public.learning_streaks
//           for each row execute procedure public.set_updated_at();

//         create table public.daily_stats (
//           id                bigserial   primary key,
//           user_id           uuid        not null references auth.users(id) on delete cascade,
//           date              date        not null default current_date,
//           words_learned     int         not null default 0,
//           words_reviewed    int         not null default 0,
//           practice_sessions int         not null default 0,
//           time_spent_minutes int        not null default 0,
//           accuracy_rate     numeric(5,2),
//           created_at        timestamptz not null default now(),
//           updated_at        timestamptz not null default now(),
//           unique(user_id, date)
//         );

//         create index idx_daily_stats_user_date on public.daily_stats(user_id, date);

//         create trigger trg_daily_stats_updated_at
//           before update on public.daily_stats
//           for each row execute procedure public.set_updated_at();
//       `,
//       completed: false
//     },
//     {
//       id: 'generated_sentences',
//       name: 'Generated Sentences',
//       description: 'Create table for AI-generated practice sentences',
//       sql: `
//         create table public.generated_sentences (
//           id             bigserial   primary key,
//           user_id        uuid        not null references auth.users(id) on delete cascade,
//           vocab_ids      bigint[]    not null,
//           sentence_text  text        not null,
//           translation    text,
//           difficulty     text        check (difficulty in ('easy','medium','hard')),
//           source         text        not null default 'openai',
//           is_favorite    boolean     not null default false,
//           created_at     timestamptz not null default now()
//         );

//         create index idx_generated_sentences_user_id on public.generated_sentences(user_id);
//         create index idx_generated_sentences_vocab_ids on public.generated_sentences using gin(vocab_ids);
//       `,
//       completed: false
//     },
//     {
//       id: 'rls_policies',
//       name: 'Row Level Security',
//       description: 'Enable RLS and create security policies',
//       sql: `
//         alter table public.user_profiles enable row level security;
//         create policy user_profiles_own on public.user_profiles for all
//           using (id = auth.uid());

//         alter table public.vocabulary enable row level security;
//         create policy vocab_owner on public.vocabulary for all
//           using (user_id = auth.uid());

//         alter table public.translations enable row level security;
//         create policy trans_owner on public.translations for all
//           using (exists (
//             select 1 from public.vocabulary v
//              where v.id = translations.vocab_id
//                and v.user_id = auth.uid()
//           ));

//         alter table public.etymologies enable row level security;
//         create policy ety_owner on public.etymologies for all
//           using (exists (
//             select 1 from public.vocabulary v
//              where v.id = etymologies.vocab_id
//                and v.user_id = auth.uid()
//           ));

//         alter table public.vocab_tags enable row level security;
//         create policy vocab_tags_owner on public.vocab_tags for all
//           using (exists (
//             select 1 from public.vocabulary v
//              where v.id = vocab_tags.vocab_id
//                and v.user_id = auth.uid()
//           ));

//         alter table public.practice_sessions enable row level security;
//         create policy sessions_owner on public.practice_sessions for all
//           using (user_id = auth.uid());

//         alter table public.practice_attempts enable row level security;
//         create policy attempts_owner on public.practice_attempts for all
//           using (exists (
//             select 1 from public.practice_sessions s
//              where s.id = practice_attempts.session_id
//                and s.user_id = auth.uid()
//           ));

//         alter table public.learning_streaks enable row level security;
//         create policy streaks_owner on public.learning_streaks for all
//           using (user_id = auth.uid());

//         alter table public.daily_stats enable row level security;
//         create policy daily_stats_owner on public.daily_stats for all
//           using (user_id = auth.uid());

//         alter table public.generated_sentences enable row level security;
//         create policy generated_sentences_owner on public.generated_sentences for all
//           using (user_id = auth.uid());

//         alter table public.media_sources enable row level security;
//         create policy media_sources_read on public.media_sources for select
//           using (true);

//         alter table public.tags enable row level security;
//         create policy tags_read on public.tags for select
//           using (true);
//       `,
//       completed: false
//     },
//     {
//       id: 'views_functions',
//       name: 'Views and Functions',
//       description: 'Create useful views and utility functions',
//       sql: `
//         create view public.vocabulary_with_stats as
//         select 
//           v.*,
//           t.text as translation,
//           t.definition,
//           coalesce(attempt_stats.total_attempts, 0) as total_attempts,
//           coalesce(attempt_stats.correct_attempts, 0) as correct_attempts,
//           case 
//             when attempt_stats.total_attempts > 0 
//             then round((attempt_stats.correct_attempts::numeric / attempt_stats.total_attempts * 100), 2)
//             else null 
//           end as accuracy_percentage
//         from public.vocabulary v
//         left join public.translations t on t.vocab_id = v.id and t.language_code = 'en'
//         left join (
//           select 
//             vocab_id,
//             count(*) as total_attempts,
//             sum(case when is_correct then 1 else 0 end) as correct_attempts
//           from public.practice_attempts
//           group by vocab_id
//         ) attempt_stats on attempt_stats.vocab_id = v.id;

//         create or replace function public.update_spaced_repetition(
//           vocab_id bigint,
//           is_correct boolean
//         ) returns void language plpgsql security definer as $$
//         declare
//           current_ease numeric(4,2);
//           current_interval int;
//           current_reps int;
//           new_ease numeric(4,2);
//           new_interval int;
//           new_reps int;
//         begin
//           select ease_factor, interval_days, repetitions
//           into current_ease, current_interval, current_reps
//           from public.vocabulary
//           where id = vocab_id;
          
//           if is_correct then
//             new_reps := current_reps + 1;
//             if new_reps = 1 then
//               new_interval := 1;
//             elsif new_reps = 2 then
//               new_interval := 6;
//             else
//               new_interval := round(current_interval * current_ease);
//             end if;
//             new_ease := current_ease + (0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02));
//           else
//             new_reps := 0;
//             new_interval := 1;
//             new_ease := greatest(1.3, current_ease - 0.2);
//           end if;
          
//           update public.vocabulary
//           set 
//             ease_factor = new_ease,
//             interval_days = new_interval,
//             repetitions = new_reps,
//             next_review_at = now() + (new_interval || ' days')::interval,
//             last_reviewed_at = now(),
//             status = case when new_reps >= 3 and new_interval >= 21 then 'mastered' else 'learning' end
//           where id = vocab_id;
//         end;
//         $$;
//       `,
//       completed: false
//     }
//   ])


//   const runSetup = async () => {
//     setIsRunning(true)
//     const updatedSteps = [...steps]

//     for (let i = 0; i < updatedSteps.length; i++) {
//       setCurrentStep(i)
//       const step = updatedSteps[i]
      
//       try {
//         // Split multi-statement SQL into individual statements
//         const statements = step.sql
//           .split(';')
//           .filter(stmt => stmt.trim().length > 0)
//           .map(stmt => stmt.trim() + ';')

//         for (const statement of statements) {
//           const { error } = await supabase.rpc('exec_sql', { 
//             query: statement 
//           })
          
//           if (error) {
//             throw new Error(error.message)
//           }
//         }

//         updatedSteps[i].completed = true
//         updatedSteps[i].error = undefined
//       } catch (error: unknown) {
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
//         updatedSteps[i].error = errorMessage
//         console.error(`Error in step ${step.name}:`, error)
//         // Continue with next steps even if one fails
//       }
      
//       setSteps([...updatedSteps])
//       // Small delay to show progress
//       await new Promise(resolve => setTimeout(resolve, 500))
//     }

//     setIsRunning(false)
//     setCurrentStep(-1)
//   }

//   const resetSetup = () => {
//     setSteps(steps.map(step => ({ ...step, completed: false, error: undefined })))
//     setCurrentStep(0)
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-4xl">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Database Setup
//         </h1>
//         <p className="text-gray-600">
//           Initialize your Supabase database with the language learning schema.
//         </p>
//       </div>

//       {/* Progress Overview */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-semibold">Setup Progress</h2>
//           <div className="text-sm text-gray-500">
//             {steps.filter(s => s.completed).length} / {steps.length} completed
//           </div>
//         </div>
        
//         <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
//           <div 
//             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//             style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
//           />
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={runSetup}
//             disabled={isRunning}
//             className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
//           >
//             {isRunning ? 'Running Setup...' : 'Start Setup'}
//           </button>
          
//           <button
//             onClick={resetSetup}
//             disabled={isRunning}
//             className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
//           >
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* Steps List */}
//       <div className="space-y-4">
//         {steps.map((step, index) => (
//           <div
//             key={step.id}
//             className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
//               step.completed
//                 ? 'border-green-500'
//                 : step.error
//                 ? 'border-red-500'
//                 : currentStep === index
//                 ? 'border-blue-500'
//                 : 'border-gray-200'
//             }`}
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
//                     step.completed
//                       ? 'bg-green-500 text-white'
//                       : step.error
//                       ? 'bg-red-500 text-white'
//                       : currentStep === index
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 text-gray-600'
//                   }`}>
//                     {step.completed ? '✓' : step.error ? '✗' : index + 1}
//                   </div>
                  
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {step.name}
//                   </h3>
                  
//                   {currentStep === index && isRunning && (
//                     <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
//                   )}
//                 </div>
                
//                 <p className="text-gray-600 mb-3">
//                   {step.description}
//                 </p>
                
//                 {step.error && (
//                   <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
//                     <p className="text-red-800 text-sm font-medium mb-1">Error:</p>
//                     <p className="text-red-700 text-sm">{step.error}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* SQL Preview */}
//             <details className="mt-4">
//               <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
//                 View SQL Code
//               </summary>
//               <pre className="mt-2 bg-gray-50 rounded-md p-3 text-xs overflow-x-auto border">
//                 <code>{step.sql.trim()}</code>
//               </pre>
//             </details>
//           </div>
//         ))}
//       </div>

//       {/* Completion Message */}
//       {steps.every(s => s.completed) && !isRunning && (
//         <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
//               <span className="text-white font-bold">✓</span>
//             </div>
//             <h3 className="text-lg font-semibold text-green-900">
//               Setup Complete!
//             </h3>
//           </div>
//           <p className="text-green-800">
//             Your database has been successfully initialized with the language learning schema. 
//             You can now start building your application features.
//           </p>
//         </div>
//       )}
//     </div>
//   )
// }

