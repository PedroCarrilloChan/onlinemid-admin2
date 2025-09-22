
-- Migration: Create Clientes table
-- Date: 2025-01-22

CREATE TABLE IF NOT EXISTS Clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email_contacto TEXT NOT NULL,
  fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on nombre for faster lookups
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON Clientes (nombre);
