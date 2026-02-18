import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const PreciseVitalChart = ({ label, data }: { label: string, data: any[] }) => {
  const activePoints = data.filter(p => p.value > 0);
  const chartHeight = 110;
  const chartWidth = screenWidth * 0.52; // Width para sa peeking effect

  // Y-Axis mapping base sa mockup (0.2 to 0.8)
  const getY = (val: number) => {
    const min = 0.2, max = 0.85;
    return chartHeight - ((val - min) / (max - min)) * chartHeight;
  };
  const getX = (index: number) => (index * (chartWidth / 3));

  const dPath = activePoints.reduce((path, point, i) => {
    const x = getX(i);
    const y = getY(point.value);
    return i === 0 ? `M${x},${y}` : `${path} L${x},${y}`;
  }, "");

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{label}</Text>
      <View style={styles.chartContent}>
        <View style={styles.yAxis}>
          {[0.8, 0.7, 0.6, 0.2].map(v => <Text key={v} style={styles.axisText}>{v.toFixed(1)}</Text>)}
        </View>
        <View style={styles.svgWrapper}>
          <Svg width={chartWidth} height={chartHeight}>
            <Line x1="0" y1={getY(0.2)} x2={chartWidth} y2={getY(0.2)} stroke="#CCC" strokeWidth="1" />
            <Line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#CCC" strokeWidth="1" />
            {activePoints.length > 1 && <Path d={dPath} fill="none" stroke="#EDB62C" strokeWidth="2" />}
            {activePoints.map((p, i) => (
              <Circle key={i} cx={getX(i)} cy={getY(p.value)} r="4.5" fill="#EDB62C" stroke="#FFF" strokeWidth="1.5" />
            ))}
          </Svg>
        </View>
      </View>
      <View style={styles.xAxis}>
        {['6:00 am', '12:00 pm', '6:00 pm', '12:00 pm'].map(t => <Text key={t} style={styles.timeLabel}>{t}</Text>)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', flex: 1, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8 },
  chartTitle: { textAlign: 'center', color: '#29A539', fontWeight: 'bold', fontSize: 16, marginBottom: 15 }, // Figma Green
  chartContent: { flexDirection: 'row' },
  yAxis: { height: 110, justifyContent: 'space-between', paddingRight: 12 },
  axisText: { fontSize: 10, color: '#999' },
  svgWrapper: { flex: 1 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingLeft: 28 },
  timeLabel: { fontSize: 9, color: '#999' },
});

export default PreciseVitalChart;