import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@App/theme/ThemeContext';

const { height } = Dimensions.get('window');

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedOption: string;
  onSelect: (option: string) => void;
  options: string[];
}

export const SortModal = ({
  visible,
  onClose,
  selectedOption,
  onSelect,
  options,
}: SortModalProps) => {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.handle} />
              <Text style={styles.titleText}>Sort by</Text>

              <View style={styles.optionsCard}>
                {options.map((option, index) => (
                  <React.Fragment key={option}>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => {
                        onSelect(option);
                        onClose();
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedOption === option && styles.selectedText,
                        ]}
                      >
                        {option}
                      </Text>
                      {selectedOption === option && (
                        <Icon
                          name="checkmark"
                          size={20}
                          color={theme.primary}
                        />
                      )}
                    </TouchableOpacity>
                    {index < options.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.modalBg,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 40,
      minHeight: height * 0.35,
    },
    handle: {
      width: 45,
      height: 5,
      backgroundColor: theme.border,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 20,
    },
    titleText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.primary,
      textAlign: 'center',
      marginBottom: 25,
    },
    optionsCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      overflow: 'hidden',
    },
    optionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingLeft: 30,
      paddingRight: 30,
    },
    optionText: { fontSize: 16, color: theme.textMuted },
    selectedText: {
      color: theme.primary,
      fontWeight: '600',
      fontStyle: 'italic',
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 20,
    },
  });
