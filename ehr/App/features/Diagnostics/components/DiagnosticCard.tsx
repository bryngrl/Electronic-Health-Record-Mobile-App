import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { ViewMode } from '../screen/DiagnosticsScreen';

interface Props {
  label: string;
  viewMode: ViewMode;
  hasImage: boolean;
}

const DiagnosticCard: React.FC<Props> = ({ label, viewMode, hasImage }) => {
  const isGrid = viewMode === 'grid';

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
        ]}
      >
        {hasImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/400' }} // Replace with actual patient image
              style={styles.mainImage}
            />
            {isGrid ? (
              <TouchableOpacity style={styles.closeCircle}>
                <Ionicon name="close-circle" size={30} color="#FF5A5A" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteText}>DELETE</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.placeholder}>
            <FeatherIcon
              name="upload"
              size={isGrid ? 35 : 50}
              color="#C7C7CD"
            />
            <Text style={styles.importText}>Import photo</Text>
            <Text style={styles.clickText}>Click to upload</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { width: '48%', marginBottom: 20 },
  fullWidth: { width: '100%' },
  pillLabel: {
    backgroundColor: '#e6f9ed',
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  pillText: { color: '#22c55e', fontWeight: 'bold', fontSize: 12 },
  box: {
    height: 180,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    overflow: 'visible',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  boxLarge: { height: 350 },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#D1D1D1',
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  importText: { color: '#8E8E93', fontWeight: '600', marginTop: 8 },
  clickText: { color: '#C7C7CD', fontSize: 11 },
  imageContainer: { flex: 1, position: 'relative' },
  mainImage: { width: '100%', height: '100%', borderRadius: 20 },
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
