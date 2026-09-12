-- ============================================================
--  REGLAS QUE PRISMA NO SABE DECLARAR
--  Se aplican con:  npm run db:sql
--  Es idempotente: puedes lanzarlo tantas veces como quieras.
-- ============================================================

-- ------------------------------------------------------------
-- 1. UN ENLACE DE FUENTE APUNTA A UN SOLO SITIO
--    La tabla source_links tiene ocho destinos posibles y solo uno
--    puede estar relleno. Sin esta restricción, una fila podría
--    apuntar a la vez a una declaración y a un expediente, y los
--    recuentos de fuentes empezarían a mentir sin avisar.
-- ------------------------------------------------------------
ALTER TABLE source_links DROP CONSTRAINT IF EXISTS source_links_un_solo_destino;
ALTER TABLE source_links ADD CONSTRAINT source_links_un_solo_destino CHECK (
  (("statementId"     IS NOT NULL)::int +
   ("promiseId"       IS NOT NULL)::int +
   ("dossierId"       IS NOT NULL)::int +
   ("contradictionId" IS NOT NULL)::int +
   ("timelineId"      IS NOT NULL)::int +
   ("viralQuoteId"    IS NOT NULL)::int +
   ("judicialCaseId"  IS NOT NULL)::int +
   ("stepId"          IS NOT NULL)::int) = 1
);

-- ------------------------------------------------------------
-- 2. LO PUBLICADO ES LO VERIFICADO
--    publishedAt solo puede tener fecha si el registro está
--    VERIFICADO. La premoderación deja de depender de que nadie se
--    equivoque en una consulta: la base de datos la rechaza.
-- ------------------------------------------------------------
ALTER TABLE statements DROP CONSTRAINT IF EXISTS statements_publicado_si_verificado;
ALTER TABLE statements ADD CONSTRAINT statements_publicado_si_verificado CHECK (
  "publishedAt" IS NULL OR "reviewState" = 'VERIFICADO'
);

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_publicado_si_verificado;
ALTER TABLE comments ADD CONSTRAINT comments_publicado_si_verificado CHECK (
  "publishedAt" IS NULL OR "reviewState" = 'VERIFICADO'
);

ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_publicado_si_verificado;
ALTER TABLE videos ADD CONSTRAINT videos_publicado_si_verificado CHECK (
  "publishedAt" IS NULL OR "reviewState" = 'VERIFICADO'
);

-- ------------------------------------------------------------
-- 3. UNA CORRECCIÓN NECESITA FUENTE
--    Sin fuente es una opinión, y las opiniones van a la capa
--    comunidad, no a la cola de correcciones del archivo.
-- ------------------------------------------------------------
ALTER TABLE corrections DROP CONSTRAINT IF EXISTS corrections_con_fuente;
ALTER TABLE corrections ADD CONSTRAINT corrections_con_fuente CHECK (
  length(btrim("sourceUrl")) > 0
);

-- ------------------------------------------------------------
-- 4. UN CAMBIO DE EVIDENCIA NECESITA MOTIVO
--    Un archivo que corrige en silencio no es un archivo.
-- ------------------------------------------------------------
ALTER TABLE dossier_changes DROP CONSTRAINT IF EXISTS dossier_changes_con_motivo;
ALTER TABLE dossier_changes ADD CONSTRAINT dossier_changes_con_motivo CHECK (
  length(btrim(reason)) > 0
);

-- ------------------------------------------------------------
-- 5. BÚSQUEDA EN ESPAÑOL
--    Columnas generadas + índices GIN. Sustituyen al buscador en
--    memoria de src/lib/search.ts: con 120 declaraciones da igual,
--    con 12.000 es la diferencia entre 5 ms y 2 segundos.
-- ------------------------------------------------------------
ALTER TABLE statements DROP COLUMN IF EXISTS search;
ALTER TABLE statements ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(text, '') || ' ' || coalesce(place, '') || ' ' || coalesce(context, ''))
  ) STORED;
CREATE INDEX IF NOT EXISTS statements_search_idx ON statements USING GIN (search);

ALTER TABLE dossiers DROP COLUMN IF EXISTS search;
ALTER TABLE dossiers ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(title, '') || ' ' || coalesce("whatWasSaid", '') || ' ' ||
      coalesce("whatSourcesSay", '') || ' ' || coalesce(conclusion, ''))
  ) STORED;
CREATE INDEX IF NOT EXISTS dossiers_search_idx ON dossiers USING GIN (search);

ALTER TABLE promises DROP COLUMN IF EXISTS search;
ALTER TABLE promises ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish',
      coalesce(text, '') || ' ' || coalesce(objective, '') || ' ' || coalesce(context, ''))
  ) STORED;
CREATE INDEX IF NOT EXISTS promises_search_idx ON promises USING GIN (search);

ALTER TABLE sources DROP COLUMN IF EXISTS search;
ALTER TABLE sources ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(author, ''))
  ) STORED;
CREATE INDEX IF NOT EXISTS sources_search_idx ON sources USING GIN (search);

-- ------------------------------------------------------------
-- 6. LIMPIEZA AUTOMÁTICA DE DATOS TÉCNICOS
--    Los registros de limitación de envíos no se conservan.
--    (Se puede programar con pg_cron; si tu plan no lo incluye,
--     llama a esta función desde una tarea del servidor.)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION purgar_datos_tecnicos() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE "expiresAt" < now();
  DELETE FROM submissions WHERE "purgeAfter" IS NOT NULL AND "purgeAfter" < now();
END;
$$ LANGUAGE plpgsql;
