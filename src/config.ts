import { z } from 'zod';

const Env = z.object({
  // Database
  DATABASE_URL:        z.string().min(1),
  DATABASE_URL_TEST:   z.string().min(1).optional(),
  ADMIN_DATABASE_URL:  z.string().min(1).optional(),

  // Microsoft Graph / Outlook
  OUTLOOK_CLIENT_ID:   z.string().min(1),
  OUTLOOK_AUTHORITY:   z.string().url().default('https://login.microsoftonline.com/common'),

  // Email tracking
  INTERVALO_MINUTOS:   z.coerce.number().int().positive().default(5),
  DIAS_SEGUIMIENTO:    z.coerce.number().int().positive().default(30),
  AVISAR_EN:           z.enum(['primera', 'ultima']).default('primera'),
  MAX_INTENTOS_AVISO:  z.coerce.number().int().positive().default(5),
  RUTA_CACHE_TOKEN:    z.string().default('.token_cache.json'),

  // Telegram notifications (optional)
  TELEGRAM_BOT_TOKEN:  z.string().optional(),
  TELEGRAM_CHAT_ID:    z.string().optional(),
});

export type Config = z.infer<typeof Env>;

export function loadConfig(): Config {
  const result = Env.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map(e => `  ${e.path.map(String).join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${errors}`);
  }
  return result.data;
}

// Keep Spanish alias for backwards compatibility during migration
export const cargarConfig = loadConfig;
