import React, { useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TextInput, TouchableOpacity, Image, Dimensions, FlatList, StatusBar 
} from 'react-native';
import VitalCard from '../component/VitalCard';
import DynamicLineChart from '../component/VitalSignsChart';
import { useVitalSignsLogic } from '../hook/useVitalSignsLogic';

const { width } = Dimensions.get('window');

// CONFIGURATION PARA SA CHART SIZE
const ITEM_WIDTH = width * 0.72; // Mas pinaliit mula 0.8 para mas kita ang kasunod
const ITEM_SPACING = 12;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

const alertIcon = require('../../../../assets/icons/alert.png'); 
const arrowIcon = require('../../../../assets/icons/ARROW.png'); 

const VitalSignsScreen = () => {
  const { 
    vitals, handleUpdateVital, patientName, setPatientName, 
    currentTime, vitalKeys, getChartData, handleNextTime, isDataEntered
  } = useVitalSignsLogic();
  
  const [chartIndex, setChartIndex] = useState(0);
  const chartListRef = useRef<FlatList>(null);

  const scrollChart = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next' ? chartIndex + 1 : chartIndex - 1;
    if (nextIdx >= 0 && nextIdx < vitalKeys.length) {
      setChartIndex(nextIdx);
      // Saktong pag-scroll gamit ang offset
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
        
        {/* Header Area */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Vital Signs</Text>
            <Text style={styles.subDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity><Text style={styles.menuDots}>⋮</Text></TouchableOpacity>
        </View>

        {/* Patient Name Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PATIENT NAME :</Text>
          <TextInput style={styles.pillInput} placeholder="Select or type Patient name" value={patientName} onChangeText={setPatientName} />
        </View>

        {/* Date and Day No */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1.2, marginRight: 10 }]}>
            <Text style={styles.fieldLabel}>DATE :</Text>
            <View style={styles.pillInput} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>DAY NO. :</Text>
            <View style={[styles.pillInput, styles.dropdown]}>
               <Image source={arrowIcon} style={styles.arrowIconImage} />
            </View>
          </View>
        </View>

        {/* CHART CAROUSEL: Mas maliit ang width para sa "Exact Design" */}
        <View style={styles.chartCarousel}>
          {chartIndex > 0 && (
            <TouchableOpacity style={[styles.navArrow, { left: 0 }]} onPress={() => scrollChart('prev')}>
              <Text style={styles.arrowLabel}>←</Text>
            </TouchableOpacity>
          )}

          <FlatList
            ref={chartListRef}
            horizontal
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL} // Para laging naka-snap sa gitna
            decelerationRate="fast"
            contentContainerStyle={{ paddingLeft: 0, paddingRight: 40 }} // Extra space sa kanan para sa peeking
            data={vitalKeys}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={[styles.chartContainer, { width: ITEM_WIDTH, marginRight: ITEM_SPACING }]}>
                {/* 

[Image of a Temperature Line Graph]
 */}
                <DynamicLineChart label={item.toUpperCase()} data={getChartData(item)} />
              </View>
            )}
          />

          {chartIndex < vitalKeys.length - 1 && (
            <TouchableOpacity style={[styles.navArrow, { right: 0 }]} onPress={() => scrollChart('next')}>
              <Text style={styles.arrowLabel}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Time Banner */}
        <View style={styles.timeBanner}><Text style={styles.timeText}>{currentTime}</Text></View>

        {/* Vital Cards Restored (Lahat ng 5 inputs) */}
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
                <Text style={[styles.nextBtnText, !isDataEntered && styles.nextBtnTextDisabled]}>NEXT</Text>
                <Text style={[styles.nextChevron, !isDataEntered && styles.nextBtnTextDisabled]}>›</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Nav Bar */}
      <View style={styles.bottomNav}>
          <TouchableOpacity><Text style={styles.navIcon}>🏠</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navIcon}>🔍</Text></TouchableOpacity>
          <View style={styles.floatingAdd}><Text style={styles.plusSign}>+</Text></View>
          <TouchableOpacity><Text style={styles.navIcon}>📊</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navIcon}>📅</Text></TouchableOpacity>
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
  pillInput: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 25, height: 45, paddingHorizontal: 20, backgroundColor: '#FFF', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15 },
  arrowIconImage: { width: 14, height: 8, resizeMode: 'contain', tintColor: '#29A539' },

  chartCarousel: { height: 180, marginVertical: 20, position: 'relative', width: '100%' },
  chartContainer: { height: 180 }, 
  navArrow: { position: 'absolute', top: '40%', width: 35, height: 35, borderRadius: 18, backgroundColor: '#A5D6A7', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 },
  arrowLabel: { color: '#FFF', fontWeight: 'bold' },

  timeBanner: { backgroundColor: '#E5FFE8', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  timeText: { color: '#29A539', fontWeight: 'bold', fontSize: 16 },

  footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  alertIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  nextButton: { flex: 1, backgroundColor: '#E5FFE8', height: 48, borderRadius: 25, marginLeft: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C8E6C9' },
  nextButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  nextBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 16 },
  nextBtnTextDisabled: { color: '#BDBDBD' },
  nextChevron: { color: '#035022', fontSize: 20, marginLeft: 8 },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  navIcon: { fontSize: 22, color: '#035022' },
  floatingAdd: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', marginTop: -45, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  plusSign: { fontSize: 28, color: '#29A539', fontWeight: 'bold' }
});

export default VitalSignsScreen;