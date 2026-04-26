-- Bootstrap extensions used by Dirstarter / Ronin Dojo.
-- Runs once on first container startup (when the data volume is empty).

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
