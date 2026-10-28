import { z } from 'zod';

const Env = z.object({
  OUTLOOK_CLIENT_ID:   z.string().min(1),
  OUTLOOK_AUTHORITY:   z.string().url().default('https://login.microsoftonline.com/common'),
  DATABASE_URL:        z.string().min(1),
  DB_PASSWORD:         z.string().min(1),
  INTERVALO_MINUTOS:   z.coerce.number().int().positive().default(5),
  DIAS_SEGUIMIENTO:    z.coerce.number().int().positive().default(30),
  AVISAR_EN:           z.enum(['primera', 'ultima']).default('primera'),
  MAX_INTENTOS_AVISO:  z.coerce.number().int().positive().default(5),
  RUTA_CACHE_TOKEN:    z.string().default('.token_cache.json'),
  TELEGRAM_BOT_TOKEN:  z.string().optional(),
  TELEGRAM_CHAT_ID:    z.string().optional(),
});

export type Config = z.infer<typeof Env>;

export function cargarConfig(): Config {
  const resultado = Env.safeParse(process.env);
  if (!resultado.success) {
    const errores = resultado.error.issues
      .map(e => `  ${e.path.map(String).join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Variables de entorno inválidas:\n${errores}`);
  }
  return resultado.data;
}
