/**
 * DatePicker Component
 *
 * Date picker with label and error support.
 * Uses native date pickers for iOS and Android.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing } from '../../theme';

export interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  placeholder = 'Select date',
  maximumDate,
  minimumDate,
}) => {
  const [show, setShow] = useState(false);

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    // On Android, picker closes automatically
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShow(true);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setShow(false);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.input,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholder,
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        {value && !disabled && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  placeholder: {
    color: colors.text.tertiary,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surfaceElevated,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  clearButtonText: {
    color: colors.text.tertiary,
    fontSize: 18,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
