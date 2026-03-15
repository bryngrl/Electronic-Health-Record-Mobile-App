import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { ViewMode } from '../screen/DiagnosticsScreen';
import { useAppTheme } from '@App/theme/ThemeContext';

export interface DiagnosticImage {
  id: number;
  url: string;
}

interface Props {
  label: string;
  viewMode: ViewMode;
  images: DiagnosticImage[];
  onImport: () => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
  hideImport?: boolean;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const DiagnosticCard: React.FC<Props> = ({
  label,
  viewMode,
  images,
  onImport,
  onDelete,
  disabled,
  hideImport = false,
}) => {
  const { theme, isDarkMode } = useAppTheme();
  const isGrid = viewMode === 'grid';
  const hasImages = images.length > 0;
  const imgCount = images.length;
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const useLargeLayout = imgCount <= 2;
  const itemWidth = useLargeLayout ? '46%' : '30%';

  return (
    <View style={[styles.cardWrapper, !isGrid && styles.fullWidth]}>
      {/* Full-screen image lightbox */}
      <Modal
        visible={!!lightboxUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxUrl(null)}
        statusBarTranslucent
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setLightboxUrl(null)}
            activeOpacity={0.8}
          >
            <MaterialIcon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {lightboxUrl && (
            <Image
              source={{ uri: lightboxUrl }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      {/* Mint Pill Label */}
      <View
        style={[
          styles.pillLabel,
          { backgroundColor: isDarkMode ? '#1e293b' : '#e6f9ed' },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            { color: isDarkMode ? theme.secondary : '#14532d' },
          ]}
        >
          {label}
        </Text>
      </View>

      {/* Content Box */}
      <View
        style={[
          styles.box,
          !isGrid && styles.boxLarge,
          !hasImages && styles.dashedBorder,
          {
            backgroundColor: isDarkMode ? '#1e293b' : '#d5d4d4',
            borderColor: isDarkMode ? theme.border : '#9d9d9d',
          },
          disabled && styles.disabledBox,
        ]}
      >
        {hasImages ? (
          <ScrollView 
            style={styles.gridScroll}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* ADD button — hidden for doctor read-only */}
            {!hideImport && (
              <TouchableOpacity
                style={[
                  styles.squareItem,
                  styles.addMoreSquare,
                  {
                    width: itemWidth,
                    backgroundColor: isDarkMode ? '#334155' : '#c4c4c4',
                    borderColor: isDarkMode ? theme.border : '#9d9d9d',
                  },
                ]}
                onPress={onImport}
                disabled={disabled}
              >
                <MaterialIcon name="add-a-photo" size={useLargeLayout ? 32 : 24} color={theme.primary} />
                <Text style={[styles.addMoreText, { color: theme.primary, fontSize: useLargeLayout ? 12 : 10 }]}>
                  ADD
                </Text>
              </TouchableOpacity>
            )}

            {images.map(img => (
              <View key={img.id} style={[styles.squareItem, { width: itemWidth }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setLightboxUrl(img.url)}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Image
                    source={{ uri: img.url }}
                    style={styles.squareImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                {/* Delete button — hidden for doctor read-only */}
                {!hideImport && (
                  <TouchableOpacity
                    style={styles.closeCircle}
                    onPress={() => onDelete(img.id)}
                  >
                    <Ionicon name="close-circle" size={useLargeLayout ? 26 : 22} color="#FF5A5A" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          hideImport ? (
            <View style={styles.placeholder}>
              <MaterialIcon name="image-not-supported" size={isGrid ? 40 : 60} color="#e2e2e2" />
              <Text style={[styles.importText, { color: '#C7C7CD' }]}>No images available</Text>
            </View>
          ) : (
          <TouchableOpacity
            style={styles.placeholder}
            onPress={onImport}
            disabled={disabled}
          >
            <MaterialIcon
              name="cloud-upload"
              size={isGrid ? 40 : 60}
              color={disabled ? '#e2e2e2' : isDarkMode ? theme.textMuted : '#585858'}
            />
            <Text
              style={[
                styles.importText,
                { color: isDarkMode ? theme.text : '#585858' },
                disabled && styles.disabledText,
              ]}
            >
              Import photo
            </Text>
            <Text style={styles.clickText}>Click to upload</Text>
          </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { width: '100%', marginBottom: 20 },
  fullWidth: { width: '100%' },
  pillLabel: {
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  pillText: {
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 14,
  },
  box: {
    height: 240, 
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  boxLarge: { height: 340 }, 
  disabledBox: { opacity: 0.6 },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  importText: { fontWeight: '600', marginTop: 8 },
  disabledText: { color: '#585859' },
  clickText: { color: '#C7C7CD', fontSize: 11 },
  gridScroll: {
    flex: 1,
  },
  gridContainer: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  squareItem: {
    width: '30%', // Fits roughly 3 per row with gaps
    aspectRatio: 1,
    margin: '1.5%',
    position: 'relative',
    borderRadius: 12,
    overflow: 'visible',
  },
  squareImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  addMoreSquare: {
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 10,
    marginTop: 4,
  },
  closeCircle: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 11,
    elevation: 3,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.85,
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
});

export default DiagnosticCard;
