/**
 * useForm Hook
 *
 * Custom hook for managing form state and validation.
 * Provides real-time validation and error handling.
 */

import { useState, useCallback, useMemo } from 'react';
import type { ValidationError } from '../../types/session.types';

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => ValidationError[];
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: ValidationError[];
  touched: Set<keyof T>;
  isValid: boolean;
  isSubmitting: boolean;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldTouched: (field: keyof T) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
  getFieldError: (field: keyof T) => string | undefined;
}

export function useForm<T extends object>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate current values
  const errors = useMemo(() => {
    if (!validate) return [];
    return validate(values);
  }, [values, validate]);

  // Check if form is valid
  const isValid = useMemo(() => errors.length === 0, [errors]);

  // Update a single field
  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Mark a field as touched
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => {
      const newTouched = new Set(prev);
      newTouched.add(field);
      return newTouched;
    });
  }, []);

  // Get error for a specific field (only if touched)
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      if (!touched.has(field)) return undefined;
      const error = errors.find(err => err.field === field);
      return error?.message;
    },
    [errors, touched]
  );

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    setTouched(new Set(Object.keys(values) as Array<keyof T>));

    // Check if valid
    if (!isValid) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('[useForm] Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, isValid, onSubmit]);

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched(new Set());
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset,
    getFieldError,
  };
}
