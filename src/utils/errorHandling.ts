/**
 * Error Handling Utilities
 *
 * Centralized error handling and user-friendly error messages.
 */

/**
 * Custom application error with user-friendly messages
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle errors and return user-friendly messages
 */
export function handleError(error: unknown, context: string): string {
  console.error(`[${context}]`, error);

  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('UNIQUE constraint')) {
      return 'This entry already exists.';
    }

    if (error.message.includes('FOREIGN KEY constraint')) {
      return 'Referenced data no longer exists.';
    }

    if (error.message.includes('NOT NULL constraint')) {
      return 'Required information is missing.';
    }

    // Generic error message
    return 'An unexpected error occurred. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}

/**
 * Wrap database operations with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Database error in ${context}:`, error);

    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint')) {
        throw new AppError(
          error.message,
          'DUPLICATE_ENTRY',
          'This entry already exists'
        );
      }

      if (error.message.includes('FOREIGN KEY constraint')) {
        throw new AppError(
          error.message,
          'INVALID_REFERENCE',
          'Referenced data no longer exists'
        );
      }

      if (error.message.includes('NOT NULL constraint')) {
        throw new AppError(
          error.message,
          'MISSING_DATA',
          'Required data is missing'
        );
      }
    }

    throw new AppError(
      'Database operation failed',
      'DATABASE_ERROR',
      'Failed to save data. Please try again.'
    );
  }
}

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Convert validation errors to a map for easy display
 */
export function validationErrorsToMap(
  errors: ValidationError[]
): Record<string, string> {
  const errorMap: Record<string, string> = {};
  errors.forEach((err) => {
    errorMap[err.field] = err.message;
  });
  return errorMap;
}
