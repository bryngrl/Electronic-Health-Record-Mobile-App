import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const AccountModal = ({ visible, onClose, onLogout }: AccountModalProps) => {
  return (
    <Modal
      animationType="slide" // This provides the "liquid" slide-up motion
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Tap overlay to close */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Top Handle Bar */}
              <View style={styles.handle} />

              <Text style={styles.titleText}>Accounts</Text>

              {/* Profile Card Section */}
              <View style={styles.profileSection}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>J</Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.userName}>Jovilyn</Text>
                  <Text style={styles.userRole}>Nurse</Text>
                </View>
              </View>

              {/* Menu Options */}
              <View style={styles.menuCard}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Switch Account</Text>
                </TouchableOpacity>
                
                <View style={styles.separator} />

                <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
                  <View style={styles.logoutRow}>
                    <Icon name="close-circle-outline" size={24} color="#FF3B30" />
                    <Text style={styles.logoutLabel}>Log out</Text>
                  </View>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay for depth
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#F2F2F7', // Slightly grey background to pop white cards
    borderTopLeftRadius: 35, // High radius for liquid look
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: height * 0.38,
    // Higher zIndex to sit above BottomNav
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
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
    color: '#1B4332',
    textAlign: 'center',
    marginBottom: 25,
  },
  profileSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarBox: {
    width: 52,
    height: 52,
    backgroundColor: '#86B79D', // Sage green from image
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  profileText: { marginLeft: 16 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  userRole: { fontSize: 14, color: '#8E8E93' },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: { padding: 20 },
  menuText: { fontSize: 16, color: '#000', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#E5E5EA', marginHorizontal: 20 },
  logoutRow: { flexDirection: 'row', alignItems: 'center' },
  logoutLabel: { color: '#FF3B30', fontSize: 16, marginLeft: 12, fontWeight: '600' },
});