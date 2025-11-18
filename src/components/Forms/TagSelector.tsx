/**
 * TagSelector Component
 *
 * Multi-select tag picker with predefined and custom tags.
 * Displays tags as chips that can be toggled on/off.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from '../TextInput';
import { Button } from '../Button';
import { colors, typography, spacing } from '../../theme';

export interface TagSelectorProps {
  predefinedTags?: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

const DEFAULT_TAGS = [
  'Exceptional',
  'Everyday',
  'Experimental',
  'Gift',
  'Competition',
  'Origin Trip',
  'Blend',
  'Single Origin',
];

export const TagSelector: React.FC<TagSelectorProps> = ({
  predefinedTags = DEFAULT_TAGS,
  selectedTags,
  onTagsChange,
  disabled = false,
}) => {
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    if (disabled) return;

    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (!trimmedTag) return;

    // Don't add duplicates
    if (selectedTags.includes(trimmedTag)) {
      setCustomTag('');
      return;
    }

    onTagsChange([...selectedTags, trimmedTag]);
    setCustomTag('');
  };

  const removeTag = (tag: string) => {
    if (disabled) return;
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <View style={styles.container}>
      {/* Predefined tags */}
      <View style={styles.tagsContainer}>
        {predefinedTags.map(tag => {
          const isSelected = selectedTags.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                isSelected && styles.tagSelected,
                disabled && styles.tagDisabled,
              ]}
              onPress={() => toggleTag(tag)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tagText,
                  isSelected && styles.tagTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom tags (non-predefined) */}
      {selectedTags.some(tag => !predefinedTags.includes(tag)) && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Custom Tags</Text>
          <View style={styles.tagsContainer}>
            {selectedTags
              .filter(tag => !predefinedTags.includes(tag))
              .map(tag => (
                <View key={tag} style={[styles.tag, styles.tagSelected]}>
                  <Text style={styles.tagTextSelected}>{tag}</Text>
                  {!disabled && (
                    <TouchableOpacity
                      onPress={() => removeTag(tag)}
                      style={styles.removeButton}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Add custom tag input */}
      {!disabled && (
        <View style={styles.customTagSection}>
          <Text style={styles.sectionLabel}>Add Custom Tag</Text>
          <View style={styles.customTagInput}>
            <TextInput
              value={customTag}
              onChangeText={setCustomTag}
              placeholder="Enter tag name..."
              onSubmitEditing={addCustomTag}
              returnKeyType="done"
              maxLength={30}
              style={styles.input}
            />
            <Button
              title="Add"
              onPress={addCustomTag}
              disabled={!customTag.trim()}
              size="small"
              style={styles.addButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  tagDisabled: {
    opacity: 0.5,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: spacing.xs,
    padding: 2,
  },
  removeButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  customTagSection: {
    marginTop: spacing.md,
  },
  customTagInput: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    marginTop: 0,
  },
});
