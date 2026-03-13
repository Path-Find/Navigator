import { z } from 'zod';

/**
 * Environment Variable Validation
 *
 * Validates required environment variables at application startup.
 * Fails fast with clear error messages if configuration is missing or invalid.
 *
 * Benefits:
 * - Catch config errors before runtime
 * - Clear error messages instead of "undefined is not a URL"
 * - Type-safe access to environment variables
 */

const envSchema = z.object({
  // Supabase Configuration (Required)
  VITE_SUPABASE_URL: z
    .string()
    .url('VITE_SUPABASE_URL must be a valid URL')
    .min(1, 'VITE_SUPABASE_URL is required'),

  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_ANON_KEY is required'),

  // Development/Production Mode
  MODE: z.enum(['development', 'production', 'test']).optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

// Export the validated environment variables
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables and return result with errors
 */
function validateEnv(): { env: Env | null; errors: string[] } {
  const result = envSchema.safeParse(import.meta.env);

  if (result.success) {
    return { env: result.data, errors: [] };
  }

  // Format validation errors nicely
  const errors = result.error.issues.map((err: z.ZodIssue) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  console.error('Environment validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');

  return { env: null, errors };
}

// Validate on module load
const validation = validateEnv();

// Export validation state for the app to check
export const env = validation.env;
export const envErrors = validation.errors;

// Helper to check if env is valid
export function isEnvValid(): boolean {
  return validation.env !== null && validation.errors.length === 0;
}
