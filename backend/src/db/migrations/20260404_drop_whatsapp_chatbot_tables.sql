-- Migration: Drop WhatsApp chatbot tables
-- The WhatsApp module has been refactored from a full chatbot to a patient
-- notification service. The session and per-doctor phone verification tables
-- are no longer needed.

DROP TABLE IF EXISTS whatsapp_verifications;
DROP TABLE IF EXISTS whatsapp_sessions;
