import React from 'react';
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

const { height } = Dimensions.get('window');
const THEME_GREEN = '#1B4332';

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
                        <Icon name="checkmark" size={20} color={THEME_GREEN} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F2F2F7',
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
    backgroundColor: '#C7C7CC',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_GREEN,
    textAlign: 'center',
    marginBottom: 25,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  optionText: { fontSize: 16, color: '#999696' },
  selectedText: { color: THEME_GREEN, fontWeight: '600', fontStyle: 'italic' },
  separator: { height: 1, backgroundColor: '#E5E5EA', marginHorizontal: 20 },
});
