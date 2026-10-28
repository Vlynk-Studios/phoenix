-- db/migrations/001_inicial.sql
-- Initial schema for Phoenix email tracking system.

CREATE TYPE estado_envio AS ENUM (
  'borrador', 'enviando', 'esperando', 'respondido',
  'rebotado', 'fallido', 'resultado_desconocido'
);
CREATE TYPE tipo_mensaje AS ENUM ('respuesta', 'rebote', 'automatica');
CREATE TYPE estado_notificacion AS ENUM ('no_aplica', 'pendiente', 'enviada', 'fallida');
CREATE TYPE estado_revision AS ENUM ('pendiente', 'asignada', 'descartada');

CREATE TABLE envios (
  id                  BIGSERIAL PRIMARY KEY,
  uuid_envio          UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  codigo_ref          TEXT NOT NULL UNIQUE,            -- e.g. PHX-8F3K2A91C0D4
  filial              TEXT NOT NULL,
  conversation_id     TEXT,
  internet_message_id TEXT,
  graph_message_id    TEXT,
  plantilla           SMALLINT NOT NULL CHECK (plantilla BETWEEN 1 AND 3),
  asunto              TEXT NOT NULL,                   -- already rendered
  datos               JSONB NOT NULL DEFAULT '{}',
  estado              estado_envio NOT NULL DEFAULT 'borrador',
  error_codigo        TEXT,
  error_mensaje       TEXT,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
  intento_envio_en    TIMESTAMPTZ,                     -- moment of the send call
  enviado_en          TIMESTAMPTZ,
  respondido_en       TIMESTAMPTZ,
  seguimiento_hasta   TIMESTAMPTZ
);

-- conversation_id is NOT unique: one thread may contain multiple sends.
CREATE INDEX idx_envios_conversation ON envios (conversation_id) WHERE conversation_id IS NOT NULL;
CREATE UNIQUE INDEX uq_envios_internet_message ON envios (internet_message_id) WHERE internet_message_id IS NOT NULL;
CREATE INDEX idx_envios_graph_message ON envios (graph_message_id) WHERE graph_message_id IS NOT NULL;
CREATE INDEX idx_envios_filial ON envios (filial);
CREATE INDEX idx_envios_vigilados ON envios (seguimiento_hasta) WHERE estado IN ('esperando', 'respondido');

CREATE TABLE destinatarios (
  id       BIGSERIAL PRIMARY KEY,
  envio_id BIGINT NOT NULL REFERENCES envios(id) ON DELETE CASCADE,
  tipo     TEXT NOT NULL CHECK (tipo IN ('para', 'cc')),
  email    TEXT NOT NULL CHECK (email = lower(email)),
  UNIQUE (envio_id, email)
);
CREATE INDEX idx_destinatarios_email ON destinatarios (email);

CREATE TABLE respuestas (
  id                    BIGSERIAL PRIMARY KEY,
  envio_id              BIGINT NOT NULL REFERENCES envios(id) ON DELETE CASCADE,
  graph_message_id      TEXT NOT NULL UNIQUE,
  internet_message_id   TEXT,
  remitente             TEXT NOT NULL CHECK (remitente = lower(remitente)),
  recibido_en           TIMESTAMPTZ NOT NULL,
  tipo                  tipo_mensaje NOT NULL,
  puntaje               SMALLINT NOT NULL,
  senales               JSONB NOT NULL,                -- list of matched signals
  notificacion          estado_notificacion NOT NULL DEFAULT 'pendiente',
  notificacion_intentos SMALLINT NOT NULL DEFAULT 0,
  notificacion_error    TEXT,
  notificada_en         TIMESTAMPTZ,
  registrado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_respuestas_envio ON respuestas (envio_id, recibido_en);
CREATE INDEX idx_respuestas_pendientes ON respuestas (notificacion) WHERE notificacion IN ('pendiente', 'fallida');

-- Minimal metadata for ambiguous messages (review queue). Limited retention.
CREATE TABLE mensajes_revision (
  id                  BIGSERIAL PRIMARY KEY,
  graph_message_id    TEXT NOT NULL UNIQUE,
  envio_candidato_id  BIGINT REFERENCES envios(id) ON DELETE CASCADE,
  remitente           TEXT NOT NULL,
  asunto              TEXT NOT NULL,
  recibido_en         TIMESTAMPTZ NOT NULL,
  puntaje             SMALLINT NOT NULL,
  senales             JSONB NOT NULL,
  estado              estado_revision NOT NULL DEFAULT 'pendiente',
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE estado_sistema (
  clave          TEXT PRIMARY KEY,
  valor          TEXT NOT NULL,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- keys: 'cursor_bandeja' (ISO UTC), 'correo_propio'
