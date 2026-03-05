import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Platform, useColorScheme } from 'react-native';
import { useAppTheme } from '@App/theme/ThemeContext';

export default function CalendarScreen() {
  const { theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles), [theme, commonStyles]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Calendar</Text>
      </View>
      {/* You can integrate react-native-calendars here later */}
      <View style={styles.emptyContent}>
        <Text style={styles.placeholderText}>
          No scheduled appointments for today.
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: any, commonStyles: any) => StyleSheet.create({
  container: {
    ...commonStyles.container,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  title: {
    ...commonStyles.title,
    marginBottom: 0, // Reset since headerRow has marginBottom
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.textMuted,
    fontSize: 16,
  },
});
