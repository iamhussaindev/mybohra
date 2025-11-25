-- Insert Daily Ibadat Dua items into library table
-- These items belong to "daily-ibadat" category and "DUA" album

INSERT INTO public.library (name, album, categories, created_at, updated_at)
VALUES
  (
    'Al-Hirz-e-Saify',
    'DUA',
    ARRAY['daily-ibadat']::text[],
    NOW(),
    NOW()
  ),
  (
    'Dua Hayat-e-Qaaf',
    'DUA',
    ARRAY['daily-ibadat']::text[],
    NOW(),
    NOW()
  ),
  (
    'Dua-e-Yamani',
    'DUA',
    ARRAY['daily-ibadat']::text[],
    NOW(),
    NOW()
  ),
  (
    'Dua Faazil',
    'DUA',
    ARRAY['daily-ibadat']::text[],
    NOW(),
    NOW()
  ),
  (
    'Dua Mufarrej-ul-Korobaat',
    'DUA',
    ARRAY['daily-ibadat']::text[],
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Verify the insertions
SELECT id, name, album, categories, created_at
FROM public.library
WHERE album = 'DUA' AND 'daily-ibadat' = ANY(categories)
ORDER BY id DESC
LIMIT 5;

