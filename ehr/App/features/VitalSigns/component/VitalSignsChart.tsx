import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

// Standard ranges para sa maayos na graph scaling
const RANGES: Record<string, { min: number; max: number }> = {
  TEMPERATURE: { min: 35, max: 41 },
  HR: { min: 40, max: 160 },
  RR: { min: 10, max: 40 },
  BP: { min: 60, max: 180 },
  SPO2: { min: 80, max: 100 },
};

// Kailangang tugma ito sa TIME_SLOTS sa iyong logic hook
const TIME_LABELS = ['6:00 AM', '8:00 AM', '12:00 PM', '2:00 PM', '6:00 PM', '8:00 PM', '12:00 AM'];

const PreciseVitalChart = ({ label, data }: { label: string, data: any[] }) => {
  const range = RANGES[label] || { min: 0, max: 100 };
  const activePoints = data.filter(p => p.value > 0);
  const chartHeight = 110;
  const chartWidth = screenWidth * 0.52;

  // Y-Axis mapping base sa vital range
  const getY = (val: number) => {
    const min = range.min, max = range.max;
    // Tinitiyak na hindi lalampas sa graph area
    const clampedVal = Math.max(min, Math.min(max, val));
    return chartHeight - ((clampedVal - min) / (max - min)) * chartHeight;
  };

  // X-Axis mapping base sa posisyon sa TIME_SLOTS
  const getX = (time: string) => {
    const index = TIME_LABELS.indexOf(time);
    return index === -1 ? 0 : (index / (TIME_LABELS.length - 1)) * chartWidth;
  };

  // Precise Path Logic: Kinokonekta ang bawat dot dulo-sa-dulo
  const dPath = activePoints.reduce((path, point, i) => {
    const x = getX(point.time);
    const y = getY(point.value);
    return i === 0 ? `M${x},${y}` : `${path} L${x},${y}`;
  }, "");

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{label}</Text>
      <View style={styles.chartContent}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisText}>{range.max}</Text>
          <Text style={styles.axisText}>{Math.round((range.max + range.min) / 2)}</Text>
          <Text style={styles.axisText}>{range.min}</Text>
        </View>
        <View style={styles.svgWrapper}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid line */}
            <Line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#CCC" strokeWidth="1" />
            
            {/* Ang Precise na Linya */}
            {activePoints.length > 1 && <Path d={dPath} fill="none" stroke="#EDB62C" strokeWidth="2.5" />}
            
            {/* Ang mga Dots na nag-uupdate real-time */}
            {activePoints.map((p, i) => (
              <Circle 
                key={i} 
                cx={getX(p.time)} 
                cy={getY(p.value)} 
                r="4.5" 
                fill="#EDB62C" 
                stroke="#FFF" 
                strokeWidth="1.5" 
              />
            ))}
          </Svg>
        </View>
      </View>
      {/* X-Axis Time Labels */}
      <View style={styles.xAxis}>
        {['6a', '12p', '6p', '12a'].map(t => <Text key={t} style={styles.timeLabel}>{t}</Text>)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', flex: 1, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8 },
  chartTitle: { textAlign: 'center', color: '#29A539', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  chartContent: { flexDirection: 'row' },
  yAxis: { height: 110, justifyContent: 'space-between', paddingRight: 12 },
  axisText: { fontSize: 10, color: '#999' },
  svgWrapper: { flex: 1, justifyContent: 'center' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingLeft: 28 },
  timeLabel: { fontSize: 9, color: '#999' },
});

export default PreciseVitalChart;