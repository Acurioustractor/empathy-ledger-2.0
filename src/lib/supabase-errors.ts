/**
 * Comprehensive Supabase Error Handling for Empathy Ledger
 *
 * Handles all the bullshit errors that can happen with Supabase
 * and provides meaningful, actionable error messages.
 */

export enum SupabaseErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface SupabaseErrorInfo {
  type: SupabaseErrorType;
  message: string;
  userMessage: string;
  suggestion: string;
  retryable: boolean;
  statusCode?: number;
  originalError?: any;
}

export class SupabaseError extends Error {
  public readonly type: SupabaseErrorType;
  public readonly userMessage: string;
  public readonly suggestion: string;
  public readonly retryable: boolean;
  public readonly statusCode?: number;
  public readonly originalError?: any;

  constructor(info: SupabaseErrorInfo) {
    super(info.message);
    this.name = 'SupabaseError';
    this.type = info.type;
    this.userMessage = info.userMessage;
    this.suggestion = info.suggestion;
    this.retryable = info.retryable;
    this.statusCode = info.statusCode;
    this.originalError = info.originalError;
  }
}

// Error classification and handling
export function classifySupabaseError(error: any): SupabaseErrorInfo {
  // Handle null/undefined errors
  if (!error) {
    return {
      type: SupabaseErrorType.UNKNOWN_ERROR,
      message: 'Unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      suggestion: 'Check your internet connection and try again.',
      retryable: true,
    };
  }

  const errorMessage = error?.message || error?.error?.message || String(error);
  const statusCode = error?.status || error?.statusCode || error?.code;

  // Connection errors
  if (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('Network Error') ||
    errorMessage.includes('ERR_NETWORK') ||
    statusCode === 0
  ) {
    return {
      type: SupabaseErrorType.NETWORK_ERROR,
      message: `Network error: ${errorMessage}`,
      userMessage: 'Connection failed. Please check your internet connection.',
      suggestion:
        'Verify your internet connection and try again. If the problem persists, check if Supabase is experiencing issues.',
      retryable: true,
      statusCode,
      originalError: error,
    };
  }

  // Authentication errors
  if (
    errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('Invalid JWT') ||
    statusCode === 401
  ) {
    return {
      type: SupabaseErrorType.AUTHENTICATION_FAILED,
      message: `Authentication failed: ${errorMessage}`,
      userMessage: 'Authentication failed. Please sign in again.',
      suggestion:
        'Sign out and sign back in. If the problem persists, check your email for a confirmation link.',
      retryable: false,
      statusCode,
      originalError: error,
    };
  }

  // Authorization errors (RLS, permissions)
  if (
    errorMessage.includes('new row violates row-level security') ||
    errorMessage.includes('insufficient_privilege') ||
    errorMessage.includes('permission denied') ||
    statusCode === 403
  ) {
    return {
      type: SupabaseErrorType.AUTHORIZATION_FAILED,
      message: `Authorization failed: ${errorMessage}`,
      userMessage: "You don't have permission to perform this action.",
      suggestion:
        'Contact your project administrator for access. This might be due to cultural protocol restrictions.',
      retryable: false,
      statusCode,
      originalError: error,
    };
  }

  // Rate limiting
  if (
    errorMessage.includes('Too many requests') ||
    errorMessage.includes('rate limit') ||
    statusCode === 429
  ) {
    return {
      type: SupabaseErrorType.RATE_LIMITED,
      message: `Rate limited: ${errorMessage}`,
      userMessage:
        'Too many requests. Please wait a moment before trying again.',
      suggestion:
        'Wait 60 seconds and try again. Consider reducing the frequency of your requests.',
      retryable: true,
      statusCode,
      originalError: error,
    };
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('ETIMEDOUT') ||
    statusCode === 408
  ) {
    return {
      type: SupabaseErrorType.TIMEOUT_ERROR,
      message: `Request timeout: ${errorMessage}`,
      userMessage: 'The request took too long to complete.',
      suggestion:
        'Try again with a simpler query or check your internet connection.',
      retryable: true,
      statusCode,
      originalError: error,
    };
  }

  // Database constraint errors
  if (
    errorMessage.includes('duplicate key value') ||
    errorMessage.includes('violates foreign key constraint') ||
    errorMessage.includes('violates not-null constraint') ||
    errorMessage.includes('violates check constraint')
  ) {
    return {
      type: SupabaseErrorType.DATABASE_ERROR,
      message: `Database constraint violation: ${errorMessage}`,
      userMessage:
        "The data you're trying to save conflicts with existing records.",
      suggestion:
        'Check for duplicate entries or missing required fields and try again.',
      retryable: false,
      statusCode,
      originalError: error,
    };
  }

  // Invalid request format
  if (
    errorMessage.includes('invalid input syntax') ||
    errorMessage.includes('column does not exist') ||
    errorMessage.includes('relation does not exist') ||
    (statusCode >= 400 && statusCode < 500)
  ) {
    return {
      type: SupabaseErrorType.INVALID_REQUEST,
      message: `Invalid request: ${errorMessage}`,
      userMessage: 'The request format is invalid.',
      suggestion:
        'This appears to be a technical issue. Please contact support.',
      retryable: false,
      statusCode,
      originalError: error,
    };
  }

  // Server errors
  if (statusCode >= 500) {
    return {
      type: SupabaseErrorType.DATABASE_ERROR,
      message: `Server error: ${errorMessage}`,
      userMessage: 'The server is experiencing issues.',
      suggestion:
        'Please try again in a few minutes. If the problem persists, contact support.',
      retryable: true,
      statusCode,
      originalError: error,
    };
  }

  // Default to unknown error
  return {
    type: SupabaseErrorType.UNKNOWN_ERROR,
    message: `Unknown error: ${errorMessage}`,
    userMessage: 'An unexpected error occurred.',
    suggestion:
      'Please try again. If the problem persists, contact support with this error code.',
    retryable: true,
    statusCode,
    originalError: error,
  };
}

// Wrapper function for Supabase operations
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T; error: any }>,
  context?: string
): Promise<T> {
  try {
    const { data, error } = await operation();

    if (error) {
      const errorInfo = classifySupabaseError(error);
      console.error(`🔥 Supabase error in ${context || 'unknown context'}:`, {
        type: errorInfo.type,
        message: errorInfo.message,
        originalError: error,
      });
      throw new SupabaseError(errorInfo);
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }

    // Handle unexpected errors
    const errorInfo = classifySupabaseError(error);
    console.error(
      `💥 Unexpected error in ${context || 'unknown context'}:`,
      error
    );
    throw new SupabaseError(errorInfo);
  }
}

// Helper for logging errors with context
export function logSupabaseError(
  error: any,
  context: string,
  additionalInfo?: any
) {
  const errorInfo = classifySupabaseError(error);

  const logData = {
    timestamp: new Date().toISOString(),
    context,
    errorType: errorInfo.type,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    suggestion: errorInfo.suggestion,
    retryable: errorInfo.retryable,
    statusCode: errorInfo.statusCode,
    additionalInfo,
    originalError: error,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔥 Supabase Error in ${context}`);
    console.error('Error Info:', errorInfo);
    console.error('Original Error:', error);
    if (additionalInfo) {
      console.error('Additional Info:', additionalInfo);
    }
    console.groupEnd();
  }

  // In production, you might want to send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to your monitoring service
    // sendToMonitoring(logData);
  }

  return logData;
}

// User-friendly error messages for common scenarios
export const ERROR_MESSAGES = {
  STORY_SAVE_FAILED:
    'Failed to save your story. Please check your internet connection and try again.',
  PROJECT_ACCESS_DENIED:
    "You don't have access to this project. Contact your project administrator.",
  LOGIN_FAILED: 'Login failed. Please check your email and password.',
  NETWORK_ISSUES:
    'Connection issues detected. Please check your internet connection.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  PERMISSION_DENIED:
    "You don't have permission for this action. This might be due to cultural protocol restrictions.",
};

// Recovery suggestions
export const RECOVERY_SUGGESTIONS = {
  [SupabaseErrorType.CONNECTION_FAILED]: [
    'Check your internet connection',
    'Try refreshing the page',
    'Check if Supabase status page shows issues',
  ],
  [SupabaseErrorType.AUTHENTICATION_FAILED]: [
    'Sign out and sign back in',
    'Check your email for confirmation link',
    'Reset your password if needed',
  ],
  [SupabaseErrorType.AUTHORIZATION_FAILED]: [
    'Contact your project administrator',
    'Verify your role permissions',
    'Ensure cultural protocols are followed',
  ],
  [SupabaseErrorType.RATE_LIMITED]: [
    'Wait 60 seconds before trying again',
    'Reduce frequency of requests',
    'Contact support if you need higher limits',
  ],
};

// Utility to check if error is retryable
export function isRetryableError(error: any): boolean {
  if (error instanceof SupabaseError) {
    return error.retryable;
  }

  const errorInfo = classifySupabaseError(error);
  return errorInfo.retryable;
}

// Utility to get user-friendly message
export function getUserMessage(error: any): string {
  if (error instanceof SupabaseError) {
    return error.userMessage;
  }

  const errorInfo = classifySupabaseError(error);
  return errorInfo.userMessage;
}

// Utility to get suggestions
export function getSuggestions(error: any): string[] {
  if (error instanceof SupabaseError) {
    return RECOVERY_SUGGESTIONS[error.type] || [error.suggestion];
  }

  const errorInfo = classifySupabaseError(error);
  return RECOVERY_SUGGESTIONS[errorInfo.type] || [errorInfo.suggestion];
}
