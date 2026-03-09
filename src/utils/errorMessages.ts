/**
 * User-friendly error messages
 * Instead of showing technical errors, we show helpful messages
 */

export const ERROR_MESSAGES = {
  // API Key errors
  INVALID_API_KEY: "Invalid API key. Please check your settings and try again.",
  API_KEY_PERMISSION_DENIED: "API key doesn't have permission. Check your Google Cloud console.",
  API_KEY_WRONG_FORMAT: "API key format is incorrect. It should start with 'AI...'",

  // Quota & Limit errors
  DAILY_QUOTA_EXCEEDED: "You've reached your daily limit. Try again tomorrow, or upgrade to Navigator Pro for unlimited access.",
  WEEKLY_QUOTA_EXCEEDED: "You've reached your weekly limit. Consider upgrading for a higher cap.",
  FREE_LIMIT_REACHED: "You've used all your free analyses! Upgrade to Navigator Plus or Pro to keep going.",
  RATE_LIMIT_EXCEEDED: "The AI is working hard right now! Please take a quick break and try again in a moment.",

  // Network errors
  NETWORK_ERROR: "Connection issue. Check your internet and try again.",
  TIMEOUT_ERROR: "Request took too long. The server might be slow - try again in a moment.",

  // Scraping errors
  SCRAPE_FAILED: "Couldn't fetch the job posting. Try copying and pasting the job description instead.",
  SCRAPE_EMPTY: "The job posting appears to be empty or behind a login wall. Try copying the text manually.",
  SCRAPE_BLOCKED: "This website blocks automated access. Please copy and paste the job description.",

  // Authentication errors
  AUTH_INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  AUTH_USER_NOT_FOUND: "No account found with that email.",
  AUTH_EMAIL_IN_USE: "An account with this email already exists.",
  AUTH_WEAK_PASSWORD: "Password should be at least 6 characters.",
  AUTH_INVALID_INVITE: "Invalid or expired invite code. If you're having trouble, please contact support.",

  // Generic errors
  UNKNOWN_ERROR: "Unable to complete request. Please refresh or try again.",
  SERVER_ERROR: "The system is currently busy. Please try again in a few moments.",
  NOT_A_JOB: "This content doesn't look like a valid job description. Please check your source and try again.",
} as const;

/**
 * Converts technical error messages to user-friendly ones
 */
export function getUserFriendlyError(error: Error | string): string {
  const originalMessage = typeof error === 'string' ? error : error.message;
  // Use lowercase for insensitive matching, but keep original for fallback
  const message = originalMessage.toLowerCase();

  // Plan & Quota limits
  if (message.includes('free_limit_reached') || (message.includes('limit') && message.includes('free'))) {
    return ERROR_MESSAGES.FREE_LIMIT_REACHED;
  }
  if (message.includes('weekly_limit_reached')) {
    return ERROR_MESSAGES.WEEKLY_QUOTA_EXCEEDED;
  }
  if (message.includes('daily_limit_reached') || message.includes('daily_quota_exceeded') || message.includes('perday')) {
    return ERROR_MESSAGES.DAILY_QUOTA_EXCEEDED;
  }

  // General "limit" catch-all if we didn't specify the tier
  if (message.includes('limit reached') || message.includes('limit_reached')) {
    return ERROR_MESSAGES.DAILY_QUOTA_EXCEEDED;
  }

  // Rate limiting (429 generally)
  if (message.includes('rate_limit_exceeded') || message.includes('429') || message.includes('quota')) {
    return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (message.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // API key errors
  if (message.includes('403') || message.includes('permission') || message.includes('apikey') || message.includes('apikey')) {
    return ERROR_MESSAGES.API_KEY_PERMISSION_DENIED;
  }

  // Only match "Invalid API key" if it's explicitly about the key
  if (message.includes('invalid api key')) {
    return ERROR_MESSAGES.INVALID_API_KEY;
  }

  // Scraping errors
  if (message.includes('scrape') || message.includes('scraped content is too short') || message.includes('not_a_job') || message.includes('not a job description')) {
    return ERROR_MESSAGES.NOT_A_JOB;
  }

  // Auth errors
  if (message.includes('invalid login credentials')) {
    return ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS;
  }

  if (message.includes('user not found')) {
    return ERROR_MESSAGES.AUTH_USER_NOT_FOUND;
  }

  if (message.includes('already registered')) {
    return ERROR_MESSAGES.AUTH_EMAIL_IN_USE;
  }

  if (message.includes('password should be')) {
    return ERROR_MESSAGES.AUTH_WEAK_PASSWORD;
  }

  if (message.includes('invalid') && message.includes('invite')) {
    return ERROR_MESSAGES.AUTH_INVALID_INVITE;
  }

  // If no match, return the original message if it doesn't look like a code crash
  const isCodeCrash = message.includes('at ') || message.includes('node_modules') || (message.includes('error:') && message.length > 150);

  if (isCodeCrash || message.length > 300) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Edge Function / Proxy issues
  if (message.includes('non-2xx') || message.includes('proxy error') || message.includes('edge function') || message.includes('status code')) {
    if (message.includes('401')) return "Session expired. Please log out and back in.";
    if (message.includes('429')) return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    return "Analysis timed out or service busy. Try again in 10 seconds.";
  }

  return originalMessage;
}

/**
 * Format retry message for display
 */
export function getRetryMessage(attempt: number, maxAttempts: number, delaySeconds: number): string {
  return `Hang tight! The AI is a bit busy. Retrying (${attempt}/${maxAttempts}) in ${delaySeconds}s...`;
}
