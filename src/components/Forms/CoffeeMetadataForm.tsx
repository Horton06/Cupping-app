/**
 * CoffeeMetadataForm Component
 *
 * Form for editing coffee metadata (name, origin, roaster, etc.).
 * Includes validation and real-time error display.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from '../TextInput';
import { DatePicker } from './DatePicker';
import { RoastLevelPicker } from './RoastLevelPicker';
import { useForm } from './useForm';
import type { CoffeeFormData, ValidationError } from '../../types/session.types';
import { spacing } from '../../theme';

export interface CoffeeMetadataFormProps {
  initialValues?: Partial<CoffeeFormData>;
  onSubmit?: (values: CoffeeFormData) => void | Promise<void>;
  onChange?: (values: CoffeeFormData) => void;
  disabled?: boolean;
}

/**
 * Validate coffee form data
 */
function validateCoffeeForm(values: CoffeeFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Coffee name is required
  if (!values.name || values.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Coffee name is required',
    });
  }

  // Name length validation
  if (values.name && values.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Coffee name must be less than 100 characters',
    });
  }

  // Origin length validation
  if (values.origin && values.origin.length > 100) {
    errors.push({
      field: 'origin',
      message: 'Origin must be less than 100 characters',
    });
  }

  // Roaster length validation
  if (values.roaster && values.roaster.length > 100) {
    errors.push({
      field: 'roaster',
      message: 'Roaster must be less than 100 characters',
    });
  }

  // Brew method length validation
  if (values.brewMethod && values.brewMethod.length > 100) {
    errors.push({
      field: 'brewMethod',
      message: 'Brew method must be less than 100 characters',
    });
  }

  // Roast date validation - cannot be in the future
  if (values.roastDate) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (values.roastDate > today) {
      errors.push({
        field: 'roastDate',
        message: 'Roast date cannot be in the future',
      });
    }
  }

  return errors;
}

export const CoffeeMetadataForm: React.FC<CoffeeMetadataFormProps> = ({
  initialValues = {},
  onSubmit,
  onChange,
  disabled = false,
}) => {
  const form = useForm<CoffeeFormData>({
    initialValues: {
      name: initialValues.name || '',
      roaster: initialValues.roaster,
      origin: initialValues.origin,
      brewMethod: initialValues.brewMethod,
      roastLevel: initialValues.roastLevel,
      roastDate: initialValues.roastDate,
    },
    validate: validateCoffeeForm,
    onSubmit,
  });

  // Notify parent of changes
  React.useEffect(() => {
    if (onChange) {
      onChange(form.values);
    }
  }, [form.values, onChange]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        {/* Coffee Name (Required) */}
        <TextInput
          label="Coffee Name *"
          value={form.values.name}
          onChangeText={(text) => form.setFieldValue('name', text)}
          onBlur={() => form.setFieldTouched('name')}
          error={form.getFieldError('name')}
          placeholder="e.g., Ethiopian Yirgacheffe"
          disabled={disabled}
          autoCapitalize="words"
        />

        {/* Origin */}
        <TextInput
          label="Origin"
          value={form.values.origin}
          onChangeText={(text) => form.setFieldValue('origin', text)}
          onBlur={() => form.setFieldTouched('origin')}
          error={form.getFieldError('origin')}
          placeholder="e.g., Ethiopia"
          disabled={disabled}
          autoCapitalize="words"
        />

        {/* Roaster */}
        <TextInput
          label="Roaster"
          value={form.values.roaster}
          onChangeText={(text) => form.setFieldValue('roaster', text)}
          onBlur={() => form.setFieldTouched('roaster')}
          error={form.getFieldError('roaster')}
          placeholder="e.g., Blue Bottle Coffee"
          disabled={disabled}
          autoCapitalize="words"
        />

        {/* Roast Level */}
        <RoastLevelPicker
          label="Roast Level"
          value={form.values.roastLevel}
          onChange={(level) => {
            form.setFieldValue('roastLevel', level);
            form.setFieldTouched('roastLevel');
          }}
          error={form.getFieldError('roastLevel')}
          disabled={disabled}
        />

        {/* Roast Date */}
        <DatePicker
          label="Roast Date"
          value={form.values.roastDate}
          onChange={(date) => {
            form.setFieldValue('roastDate', date);
            form.setFieldTouched('roastDate');
          }}
          error={form.getFieldError('roastDate')}
          placeholder="Select roast date"
          maximumDate={new Date()}
          disabled={disabled}
        />

        {/* Brew Method */}
        <TextInput
          label="Brew Method"
          value={form.values.brewMethod}
          onChangeText={(text) => form.setFieldValue('brewMethod', text)}
          onBlur={() => form.setFieldTouched('brewMethod')}
          error={form.getFieldError('brewMethod')}
          placeholder="e.g., Pour Over, Espresso, French Press"
          disabled={disabled}
          autoCapitalize="words"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
});
