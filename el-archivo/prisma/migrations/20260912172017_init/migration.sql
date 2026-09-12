-- CreateEnum
CREATE TYPE "Layer" AS ENUM ('ARCHIVO', 'VERIFICACION', 'COMUNIDAD');

-- CreateEnum
CREATE TYPE "EvidenceLevel" AS ENUM ('RESPALDADO', 'PARCIALMENTE_RESPALDADO', 'EVIDENCIA_INSUFICIENTE', 'CONTRADICCION_DOCUMENTADA', 'NO_VERIFICABLE', 'EN_INVESTIGACION');

-- CreateEnum
CREATE TYPE "PromiseState" AS ENUM ('CUMPLIDA', 'EN_PROCESO', 'NO_CUMPLIDA', 'NO_EVALUABLE');

-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('PENDIENTE', 'VERIFICADO', 'RECHAZADO', 'NECESITA_INFO');

-- CreateEnum
CREATE TYPE "Topic" AS ENUM ('economia', 'vivienda', 'cataluna', 'exterior', 'justicia', 'elecciones', 'sanidad', 'educacion', 'empleo', 'energia', 'inmigracion', 'institucional', 'otros');

-- CreateEnum
CREATE TYPE "SourceTier" AS ENUM ('DOCUMENTO_OFICIAL', 'RESOLUCION_JUDICIAL', 'ORGANISMO_PUBLICO', 'DATO_OFICIAL', 'DECLARACION_ORIGINAL', 'MEDIO', 'FUENTE_SECUNDARIA', 'RED_SOCIAL');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('video', 'noticia', 'documento', 'declaracion', 'fuente', 'contradiccion', 'dato', 'otro');

-- CreateEnum
CREATE TYPE "CommentStance" AS ENUM ('A_FAVOR', 'EN_CONTRA', 'FALTA_CONTEXTO', 'APORTO_FUENTE', 'DETECTO_ERROR');

-- CreateEnum
CREATE TYPE "VoteOption" AS ENUM ('FUNDAMENTADA', 'NO_DE_ACUERDO', 'FALTA_EVIDENCIA', 'FALTA_CONTEXTO');

-- CreateEnum
CREATE TYPE "CounterKind" AS ENUM ('video', 'declaracion', 'documento', 'noticia', 'dato', 'explicacion');

-- CreateEnum
CREATE TYPE "TimelineKind" AS ENUM ('DECLARACION', 'DECISION', 'HECHO', 'MEDIDA', 'RESOLUCION', 'PUBLICACION');

-- CreateEnum
CREATE TYPE "ContradictionSide" AS ENUM ('DIJO', 'OCURRIO');

-- CreateEnum
CREATE TYPE "ViralResult" AS ENUM ('DOCUMENTADA', 'PARCIAL', 'SIN_EVIDENCIA', 'CONTEXTO_ENGANOSO');

-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('YouTube', 'X', 'TikTok', 'Instagram', 'Medio', 'Institucional', 'Otra');

-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('activo', 'pendiente');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USUARIO', 'MODERADOR', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('APORTACION', 'FUENTE_ACEPTADA', 'ERROR_DETECTADO', 'EVIDENCIA_INCORPORADA', 'EXPEDIENTE_ACTUALIZADO', 'DEBATE', 'CORRECCION_ACEPTADA');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APROBAR', 'RECHAZAR', 'PEDIR_INFO', 'INCORPORAR', 'EDITAR', 'OCULTAR', 'ESCALAR', 'CAMBIAR_EVIDENCIA');

-- CreateEnum
CREATE TYPE "ProceduralStatus" AS ENUM ('DENUNCIA', 'INVESTIGADO', 'ACUSADO', 'PROCESADO', 'JUICIO_ORAL', 'CONDENADO_NO_FIRME', 'CONDENADO_FIRME', 'ABSUELTO', 'ARCHIVADO', 'RECURRIDO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "handle" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USUARIO',
    "bio" VARCHAR(280) NOT NULL DEFAULT '',
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "suspendedWhy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "from" DATE NOT NULL,
    "to" DATE,
    "status" "SubjectStatus" NOT NULL DEFAULT 'activo',
    "note" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" DATE,
    "tier" "SourceTier" NOT NULL,
    "summary" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "contributedById" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_links" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "statementId" TEXT,
    "promiseId" TEXT,
    "dossierId" TEXT,
    "contradictionId" TEXT,
    "timelineId" TEXT,
    "viralQuoteId" TEXT,
    "judicialCaseId" TEXT,
    "stepId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "block" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statements" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "place" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "topics" "Topic"[],
    "videoId" TEXT,
    "videoTimestamp" INTEGER,
    "dossierId" TEXT,
    "reviewState" "ReviewState" NOT NULL DEFAULT 'PENDIENTE',
    "publishedAt" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "contributedById" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "duration" INTEGER NOT NULL,
    "platform" "VideoPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "embeddable" BOOLEAN NOT NULL DEFAULT false,
    "transcriptAvailable" BOOLEAN NOT NULL DEFAULT false,
    "reviewState" "ReviewState" NOT NULL DEFAULT 'PENDIENTE',
    "publishedAt" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "contributedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promises" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "context" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "deadline" DATE,
    "state" "PromiseState" NOT NULL,
    "stateRationale" TEXT NOT NULL,
    "topics" "Topic"[],
    "lastReviewed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "promises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" "TimelineKind" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "topics" "Topic"[],
    "relatedStatementId" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contradictions" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topics" "Topic"[],
    "evidence" "EvidenceLevel" NOT NULL,
    "conclusion" TEXT NOT NULL,
    "limitations" TEXT[],
    "dossierId" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contradictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contradiction_steps" (
    "id" TEXT NOT NULL,
    "contradictionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "at" DATE NOT NULL,
    "side" "ContradictionSide" NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "statementId" TEXT,
    "timelineId" TEXT,

    CONSTRAINT "contradiction_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossiers" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topics" "Topic"[],
    "whatWasSaid" TEXT NOT NULL,
    "whenAndContext" TEXT NOT NULL,
    "whatSourcesSay" TEXT NOT NULL,
    "counterEvidence" TEXT[],
    "conclusion" TEXT NOT NULL,
    "evidence" "EvidenceLevel" NOT NULL,
    "limitations" TEXT[],
    "openedAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossier_statements" (
    "dossierId" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dossier_statements_pkey" PRIMARY KEY ("dossierId","statementId")
);

-- CreateTable
CREATE TABLE "dossier_timeline" (
    "dossierId" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dossier_timeline_pkey" PRIMARY KEY ("dossierId","timelineId")
);

-- CreateTable
CREATE TABLE "dossier_changes" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "from" "EvidenceLevel" NOT NULL,
    "to" "EvidenceLevel" NOT NULL,
    "reason" TEXT NOT NULL,
    "byId" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossier_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viral_quotes" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "circulating" TEXT NOT NULL,
    "result" "ViralResult" NOT NULL,
    "whatIsDocumented" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "videoId" TEXT,
    "videoTimestamp" INTEGER,
    "date" DATE,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viral_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judicial_cases" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "investigatedParties" TEXT[],
    "court" TEXT NOT NULL,
    "facts" TEXT NOT NULL,
    "relationToSubject" TEXT NOT NULL,
    "relationEvidence" TEXT[],
    "status" "ProceduralStatus" NOT NULL,
    "proven" TEXT[],
    "pending" TEXT[],
    "allegationsOnly" TEXT[],
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judicial_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "approxDate" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "whyRelevant" TEXT NOT NULL,
    "userConclusion" TEXT NOT NULL,
    "byId" TEXT,
    "reviewState" "ReviewState" NOT NULL DEFAULT 'PENDIENTE',
    "moderatorNote" TEXT NOT NULL DEFAULT '',
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "becameRecordType" TEXT,
    "becameRecordId" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purgeAfter" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "byId" TEXT,
    "stance" "CommentStance" NOT NULL,
    "text" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "reviewState" "ReviewState" NOT NULL DEFAULT 'PENDIENTE',
    "publishedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_upvotes" (
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_upvotes_pkey" PRIMARY KEY ("commentId","userId")
);

-- CreateTable
CREATE TABLE "counter_evidence" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "byId" TEXT,
    "kind" "CounterKind" NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT,
    "reviewState" "ReviewState" NOT NULL DEFAULT 'PENDIENTE',
    "incorporated" BOOLEAN NOT NULL DEFAULT false,
    "moderatedById" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counter_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "option" "VoteOption" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrections" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "byId" TEXT,
    "whatIsWrong" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "reviewState" "ReviewState" NOT NULL DEFAULT 'PENDIENTE',
    "resolution" TEXT NOT NULL DEFAULT '',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "kind" "ActivityKind" NOT NULL,
    "layer" "Layer" NOT NULL,
    "text" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "actorId" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_log" (
    "id" TEXT NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "byId" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_log" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "preferencias" BOOLEAN NOT NULL,
    "analitica" BOOLEAN NOT NULL,
    "publicidad" BOOLEAN NOT NULL,
    "version" INTEGER NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_meta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "build" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "demoMode" BOOLEAN NOT NULL DEFAULT true,
    "disclaimer" TEXT NOT NULL,

    CONSTRAINT "archive_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_handle_idx" ON "users"("handle");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sources_publicId_key" ON "sources"("publicId");

-- CreateIndex
CREATE INDEX "sources_tier_idx" ON "sources"("tier");

-- CreateIndex
CREATE INDEX "sources_publishedAt_idx" ON "sources"("publishedAt");

-- CreateIndex
CREATE INDEX "source_links_statementId_idx" ON "source_links"("statementId");

-- CreateIndex
CREATE INDEX "source_links_dossierId_idx" ON "source_links"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_statementId_key" ON "source_links"("sourceId", "statementId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_promiseId_key" ON "source_links"("sourceId", "promiseId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_dossierId_key" ON "source_links"("sourceId", "dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_contradictionId_key" ON "source_links"("sourceId", "contradictionId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_timelineId_key" ON "source_links"("sourceId", "timelineId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_viralQuoteId_key" ON "source_links"("sourceId", "viralQuoteId");

-- CreateIndex
CREATE UNIQUE INDEX "source_links_sourceId_stepId_key" ON "source_links"("sourceId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "statements_publicId_key" ON "statements"("publicId");

-- CreateIndex
CREATE INDEX "statements_subjectId_date_idx" ON "statements"("subjectId", "date");

-- CreateIndex
CREATE INDEX "statements_reviewState_publishedAt_idx" ON "statements"("reviewState", "publishedAt");

-- CreateIndex
CREATE INDEX "statements_topics_idx" ON "statements" USING GIN ("topics");

-- CreateIndex
CREATE UNIQUE INDEX "videos_publicId_key" ON "videos"("publicId");

-- CreateIndex
CREATE INDEX "videos_subjectId_date_idx" ON "videos"("subjectId", "date");

-- CreateIndex
CREATE INDEX "videos_reviewState_idx" ON "videos"("reviewState");

-- CreateIndex
CREATE UNIQUE INDEX "promises_publicId_key" ON "promises"("publicId");

-- CreateIndex
CREATE INDEX "promises_subjectId_date_idx" ON "promises"("subjectId", "date");

-- CreateIndex
CREATE INDEX "promises_state_idx" ON "promises"("state");

-- CreateIndex
CREATE INDEX "promises_topics_idx" ON "promises" USING GIN ("topics");

-- CreateIndex
CREATE UNIQUE INDEX "timeline_events_publicId_key" ON "timeline_events"("publicId");

-- CreateIndex
CREATE INDEX "timeline_events_subjectId_date_idx" ON "timeline_events"("subjectId", "date");

-- CreateIndex
CREATE INDEX "timeline_events_topics_idx" ON "timeline_events" USING GIN ("topics");

-- CreateIndex
CREATE UNIQUE INDEX "contradictions_publicId_key" ON "contradictions"("publicId");

-- CreateIndex
CREATE INDEX "contradictions_subjectId_idx" ON "contradictions"("subjectId");

-- CreateIndex
CREATE INDEX "contradictions_evidence_idx" ON "contradictions"("evidence");

-- CreateIndex
CREATE INDEX "contradiction_steps_contradictionId_idx" ON "contradiction_steps"("contradictionId");

-- CreateIndex
CREATE UNIQUE INDEX "contradiction_steps_contradictionId_position_key" ON "contradiction_steps"("contradictionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_publicId_key" ON "dossiers"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_number_key" ON "dossiers"("number");

-- CreateIndex
CREATE UNIQUE INDEX "dossiers_slug_key" ON "dossiers"("slug");

-- CreateIndex
CREATE INDEX "dossiers_subjectId_idx" ON "dossiers"("subjectId");

-- CreateIndex
CREATE INDEX "dossiers_evidence_idx" ON "dossiers"("evidence");

-- CreateIndex
CREATE INDEX "dossiers_lastUpdated_idx" ON "dossiers"("lastUpdated");

-- CreateIndex
CREATE INDEX "dossiers_topics_idx" ON "dossiers" USING GIN ("topics");

-- CreateIndex
CREATE INDEX "dossier_changes_dossierId_at_idx" ON "dossier_changes"("dossierId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "viral_quotes_publicId_key" ON "viral_quotes"("publicId");

-- CreateIndex
CREATE INDEX "viral_quotes_subjectId_idx" ON "viral_quotes"("subjectId");

-- CreateIndex
CREATE INDEX "viral_quotes_result_idx" ON "viral_quotes"("result");

-- CreateIndex
CREATE UNIQUE INDEX "judicial_cases_publicId_key" ON "judicial_cases"("publicId");

-- CreateIndex
CREATE INDEX "judicial_cases_status_idx" ON "judicial_cases"("status");

-- CreateIndex
CREATE INDEX "submissions_reviewState_at_idx" ON "submissions"("reviewState", "at");

-- CreateIndex
CREATE INDEX "submissions_byId_idx" ON "submissions"("byId");

-- CreateIndex
CREATE INDEX "submissions_escalated_idx" ON "submissions"("escalated");

-- CreateIndex
CREATE INDEX "comments_dossierId_at_idx" ON "comments"("dossierId", "at");

-- CreateIndex
CREATE INDEX "comments_reviewState_idx" ON "comments"("reviewState");

-- CreateIndex
CREATE INDEX "counter_evidence_dossierId_idx" ON "counter_evidence"("dossierId");

-- CreateIndex
CREATE INDEX "counter_evidence_reviewState_idx" ON "counter_evidence"("reviewState");

-- CreateIndex
CREATE INDEX "votes_dossierId_option_idx" ON "votes"("dossierId", "option");

-- CreateIndex
CREATE UNIQUE INDEX "votes_dossierId_userId_key" ON "votes"("dossierId", "userId");

-- CreateIndex
CREATE INDEX "corrections_reviewState_at_idx" ON "corrections"("reviewState", "at");

-- CreateIndex
CREATE INDEX "corrections_targetType_targetId_idx" ON "corrections"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "activity_events_at_idx" ON "activity_events"("at");

-- CreateIndex
CREATE INDEX "moderation_log_targetType_targetId_idx" ON "moderation_log"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "moderation_log_at_idx" ON "moderation_log"("at");

-- CreateIndex
CREATE INDEX "rate_limits_ipHash_route_at_idx" ON "rate_limits"("ipHash", "route", "at");

-- CreateIndex
CREATE INDEX "rate_limits_expiresAt_idx" ON "rate_limits"("expiresAt");

-- CreateIndex
CREATE INDEX "consent_log_anonId_idx" ON "consent_log"("anonId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_contributedById_fkey" FOREIGN KEY ("contributedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_promiseId_fkey" FOREIGN KEY ("promiseId") REFERENCES "promises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_contradictionId_fkey" FOREIGN KEY ("contradictionId") REFERENCES "contradictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_viralQuoteId_fkey" FOREIGN KEY ("viralQuoteId") REFERENCES "viral_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_judicialCaseId_fkey" FOREIGN KEY ("judicialCaseId") REFERENCES "judicial_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_links" ADD CONSTRAINT "source_links_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "contradiction_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_contributedById_fkey" FOREIGN KEY ("contributedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_contributedById_fkey" FOREIGN KEY ("contributedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promises" ADD CONSTRAINT "promises_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_relatedStatementId_fkey" FOREIGN KEY ("relatedStatementId") REFERENCES "statements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contradictions" ADD CONSTRAINT "contradictions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contradictions" ADD CONSTRAINT "contradictions_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contradiction_steps" ADD CONSTRAINT "contradiction_steps_contradictionId_fkey" FOREIGN KEY ("contradictionId") REFERENCES "contradictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contradiction_steps" ADD CONSTRAINT "contradiction_steps_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "statements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contradiction_steps" ADD CONSTRAINT "contradiction_steps_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "timeline_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_statements" ADD CONSTRAINT "dossier_statements_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_statements" ADD CONSTRAINT "dossier_statements_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_timeline" ADD CONSTRAINT "dossier_timeline_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_timeline" ADD CONSTRAINT "dossier_timeline_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_changes" ADD CONSTRAINT "dossier_changes_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_changes" ADD CONSTRAINT "dossier_changes_byId_fkey" FOREIGN KEY ("byId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viral_quotes" ADD CONSTRAINT "viral_quotes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viral_quotes" ADD CONSTRAINT "viral_quotes_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_byId_fkey" FOREIGN KEY ("byId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_byId_fkey" FOREIGN KEY ("byId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_upvotes" ADD CONSTRAINT "comment_upvotes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_upvotes" ADD CONSTRAINT "comment_upvotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_evidence" ADD CONSTRAINT "counter_evidence_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_evidence" ADD CONSTRAINT "counter_evidence_byId_fkey" FOREIGN KEY ("byId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_evidence" ADD CONSTRAINT "counter_evidence_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_byId_fkey" FOREIGN KEY ("byId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_log" ADD CONSTRAINT "moderation_log_byId_fkey" FOREIGN KEY ("byId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
