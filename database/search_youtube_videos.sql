-- SQL function to search YouTube videos
-- Searches in title, description, tags, and categories
CREATE OR REPLACE FUNCTION search_youtube_videos(
  search_query TEXT,
  limit_results INTEGER DEFAULT 50
)
RETURNS TABLE(
  id BIGINT,
  video_id TEXT,
  title TEXT,
  description TEXT,
  duration INTEGER,
  view_count BIGINT,
  upload_date TEXT,
  url TEXT,
  thumbnail TEXT,
  thumbnail_default TEXT,
  thumbnail_medium TEXT,
  thumbnail_high TEXT,
  thumbnail_standard TEXT,
  thumbnail_maxres TEXT,
  channel_url TEXT,
  channel_handle TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  tags TEXT[],
  categories TEXT[],
  library_id BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    yv.id,
    yv.video_id,
    yv.title,
    yv.description,
    yv.duration,
    yv.view_count,
    yv.upload_date,
    yv.url,
    yv.thumbnail,
    yv.thumbnail_default,
    yv.thumbnail_medium,
    yv.thumbnail_high,
    yv.thumbnail_standard,
    yv.thumbnail_maxres,
    yv.channel_url,
    yv.channel_handle,
    yv.created_at,
    yv.updated_at,
    yv.tags,
    yv.categories,
    yv.library_id
  FROM youtube_videos yv
  WHERE 
    search_query IS NULL OR search_query = '' OR
    (
      -- Search in title
      yv.title ILIKE '%' || search_query || '%' OR
      -- Search in description
      (yv.description IS NOT NULL AND yv.description ILIKE '%' || search_query || '%') OR
      -- Search in tags
      (yv.tags IS NOT NULL AND EXISTS (
        SELECT 1 FROM unnest(yv.tags) AS tag 
        WHERE tag ILIKE '%' || search_query || '%'
      )) OR
      -- Search in categories
      (yv.categories IS NOT NULL AND EXISTS (
        SELECT 1 FROM unnest(yv.categories) AS category 
        WHERE category ILIKE '%' || search_query || '%'
      )) OR
      -- Search in channel handle
      (yv.channel_handle IS NOT NULL AND yv.channel_handle ILIKE '%' || search_query || '%')
    )
  ORDER BY 
    -- Prioritize title matches
    CASE 
      WHEN yv.title ILIKE '%' || search_query || '%' THEN 1
      ELSE 2
    END,
    -- Then by view count (most popular first)
    yv.view_count DESC NULLS LAST,
    -- Then by created date (newest first)
    yv.created_at DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

