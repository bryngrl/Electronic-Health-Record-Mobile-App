import React, { useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TextInput, TouchableOpacity, Image, Dimensions, FlatList, StatusBar 
} from 'react-native';
import VitalCard from '../component/VitalCard';
import PreciseVitalChart from '../component/VitalSignsChart';
import { useVitalSignsLogic } from '../hook/useVitalSignsLogic';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72; // Mas maliit para makita ang onti ng next chart
const ITEM_SPACING = 15;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

// ASSETS
const alertIcon = require('../../../../assets/icons/alert.png'); 
const arrowIcon = require('../../../../assets/icons/ARROW.png'); 

const VitalSignsScreen = () => {
  const { 
    vitals, handleUpdateVital, patientName, setPatientName, 
    currentTime, vitalKeys, getChartData, handleNextTime, isDataEntered
  } = useVitalSignsLogic();
  
  const [chartIndex, setChartIndex] = useState(0);
  const chartListRef = useRef<FlatList>(null);

  // FIXED: In-update para gumana ang Next at Previous
  const scrollChart = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next' ? chartIndex + 1 : chartIndex - 1;
    if (nextIdx >= 0 && nextIdx < vitalKeys.length) {
      setChartIndex(nextIdx);
      chartListRef.current?.scrollToOffset({ 
        offset: nextIdx * SNAP_INTERVAL, 
        animated: true 
      });
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Vital Signs</Text>
            <Text style={styles.subDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity><Text style={styles.menuDots}>⋮</Text></TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PATIENT NAME :</Text>
          <TextInput style={styles.pillInput} placeholder="Select Patient" value={patientName} onChangeText={setPatientName} />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1.2, marginRight: 10 }}>
            <Text style={styles.fieldLabel}>DATE :</Text>
            <View style={styles.pillInput} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>DAY NO. :</Text>
            <View style={[styles.pillInput, styles.dropdown]}>
               <Image source={arrowIcon} style={styles.arrowIconImage} />
            </View>
          </View>
        </View>

        {/* CHART CAROUSEL: Pinagsamang Left at Right Arrows */}
        <View style={styles.chartCarousel}>
          {/* PREVIOUS ARROW (Left) */}
          {chartIndex > 0 && (
            <TouchableOpacity style={[styles.navArrow, { left: -10 }]} onPress={() => scrollChart('prev')}>
              <View style={styles.arrowCircle}><Text style={styles.arrowLabelText}>←</Text></View>
            </TouchableOpacity>
          )}

          <FlatList
            ref={chartListRef}
            horizontal
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            data={vitalKeys}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingRight: 60 }}
            renderItem={({ item }) => (
              <View style={{ width: ITEM_WIDTH, marginRight: ITEM_SPACING }}>
                <PreciseVitalChart label={item.toUpperCase()} data={getChartData(item)} />
              </View>
            )}
          />

          {/* NEXT ARROW (Right) */}
          {chartIndex < vitalKeys.length - 1 && (
            <TouchableOpacity style={[styles.navArrow, { right: 0 }]} onPress={() => scrollChart('next')}>
              <View style={styles.arrowCircle}><Text style={styles.arrowLabelText}>→</Text></View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.timeBanner}><Text style={styles.timeText}>{currentTime}</Text></View>

        {/* Vital Cards */}
        <VitalCard label="Temperature" value={vitals.temperature} onChangeText={(v)=>handleUpdateVital('temperature', v)} />
        <VitalCard label="HR" value={vitals.hr} onChangeText={(v)=>handleUpdateVital('hr', v)} />
        <VitalCard label="RR" value={vitals.rr} onChangeText={(v)=>handleUpdateVital('rr', v)} />
        <VitalCard label="BP" value={vitals.bp} onChangeText={(v)=>handleUpdateVital('bp', v)} />
        <VitalCard label="SP02" value={vitals.spo2} onChangeText={(v)=>handleUpdateVital('spo2', v)} />

        {/* Action Footer */}
        <View style={styles.footerAction}>
            <TouchableOpacity 
              style={[styles.alertIcon, { backgroundColor: isDataEntered ? '#FFECBD' : '#EBEBEB' }]}
              disabled={!isDataEntered}
            >
              <Image 
                source={alertIcon} 
                style={[styles.fullImg, isDataEntered ? { tintColor: '#EDB62C', opacity: 1 } : { tintColor: '#999696', opacity: 0.5 }]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.nextButton, !isDataEntered && styles.nextButtonDisabled]} 
              onPress={handleNextTime}
              disabled={!isDataEntered}
            >
                <Text style={[styles.nextBtnText, !isDataEntered && { color: '#BDBDBD' }]}>NEXT ›</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
          <Text style={styles.navIcon}>🏠</Text><Text style={styles.navIcon}>🔍</Text>
          <View style={styles.fab}><Text style={styles.plusSign}>+</Text></View>
          <Text style={styles.navIcon}>📊</Text><Text style={styles.navIcon}>📅</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 160 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 25 },
  title: { fontSize: 39, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  subDate: { color: '#999', fontSize: 16 },
  menuDots: { fontSize: 28, color: '#035022' },
  inputGroup: { marginBottom: 15 },
  fieldLabel: { color: '#29A539', fontWeight: 'bold', fontSize: 13, marginBottom: 8 },
  pillInput: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 25, height: 45, paddingHorizontal: 20, justifyContent: 'center' },
  row: { flexDirection: 'row' },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15 },
  arrowIconImage: { width: 14, height: 8, resizeMode: 'contain', tintColor: '#29A539' },

  chartCarousel: { height: 210, marginVertical: 20, position: 'relative' },
  navArrow: { position: 'absolute', top: '38%', zIndex: 10 },
  arrowCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#A5D6A7', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#29A539', elevation: 5 },
  arrowLabelText: { fontSize: 18, fontWeight: 'bold', color: '#035022' },

  timeBanner: { backgroundColor: '#E5FFE8', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  timeText: { color: '#29A539', fontWeight: 'bold', fontSize: 16 },
  footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  alertIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  nextButton: { flex: 1, backgroundColor: '#E5FFE8', height: 48, borderRadius: 25, marginLeft: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C8E6C9' },
  nextButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  nextBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 16 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  navIcon: { fontSize: 22, color: '#035022' },
  fab: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', marginTop: -45, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  plusSign: { fontSize: 28, color: '#29A539', fontWeight: 'bold' }
});

export default VitalSignsScreen;