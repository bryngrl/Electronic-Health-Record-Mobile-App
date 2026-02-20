import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { ViewMode } from '../screen/DiagnosticsScreen';

interface Props {
  label: string;
  viewMode: ViewMode;
  imageUrl?: string | null;
  onImport: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const DiagnosticCard: React.FC<Props> = ({
  label,
  viewMode,
  imageUrl,
  onImport,
  onDelete,
  disabled,
}) => {
  const isGrid = viewMode === 'grid';
  const hasImage = !!imageUrl;

  return (
    <View style={[styles.cardWrapper, !isGrid && styles.fullWidth]}>
      {/* Mint Pill Label */}
      <View style={styles.pillLabel}>
        <Text style={styles.pillText}>{label}</Text>
      </View>

      {/* Content Box */}
      <View
        style={[
          styles.box,
          !isGrid && styles.boxLarge,
          !hasImage && styles.dashedBorder,
          disabled && styles.disabledBox,
        ]}
      >
        {hasImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl! }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {isGrid ? (
              <TouchableOpacity style={styles.closeCircle} onPress={onDelete}>
                <Ionicon name="close-circle" size={30} color="#FF5A5A" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Text style={styles.deleteText}>DELETE</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.placeholder}
            onPress={onImport}
            disabled={disabled}
          >
            <FeatherIcon
              name="upload"
              size={isGrid ? 35 : 50}
              color={disabled ? '#e2e2e2' : '#585858'}
            />
            <Text style={[styles.importText, disabled && styles.disabledText]}>
              Import photo
            </Text>
            <Text style={styles.clickText}>Click to upload</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { width: '100%', marginBottom: 20 },
  fullWidth: { width: '100%' },
  pillLabel: {
    backgroundColor: '#e6f9ed',
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  pillText: { color: '#14532d', fontWeight: 'bold', fontSize: 12 },
  box: {
    height: 250, // Grid (Tablet) mode height
    borderRadius: 20,
    backgroundColor: '#d5d4d4',
    overflow: 'visible',
    borderWidth: 1,
    borderColor: '#9d9d9d',
  },
  boxLarge: { height: 380 }, // List (Mobile/Horizontal) mode height
  disabledBox: { opacity: 0.6 },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#9d9d9d',
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  importText: { color: '#585858', fontWeight: '600', marginTop: 8 },
  disabledText: { color: '#585859' },
  clickText: { color: '#C7C7CD', fontSize: 11 },
  imageContainer: {
    flex: 1,
    position: 'relative',
    padding: 25,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  closeCircle: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFF',
    borderRadius: 15,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF5A5A',
  },
  deleteText: { color: '#FF5A5A', fontWeight: 'bold' },
});

export default DiagnosticCard;
