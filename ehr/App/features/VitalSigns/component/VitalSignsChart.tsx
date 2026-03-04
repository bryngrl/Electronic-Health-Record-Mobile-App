import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;

const RANGES: Record<string, { min: number; max: number }> = {
  TEMPERATURE: { min: 35, max: 41 },
  HR: { min: 40, max: 160 },
  RR: { min: 10, max: 40 },
  BP: { min: 60, max: 180 },
  SPO2: { min: 80, max: 100 },
};

const TIME_LABELS = [
  '6:00 AM',
  '8:00 AM',
  '12:00 PM',
  '2:00 PM',
  '6:00 PM',
  '8:00 PM',
  '12:00 AM',
];

const PreciseVitalChart = ({ label, data }: { label: string; data: any[] }) => {
  const range = RANGES[label] || { min: 0, max: 100 };
  const activePoints = data.filter(p => p.value > 0);

  const PADDING = 10; // Extra space so dots don't clip
  const chartHeight = 110;
  const chartWidth = screenWidth * 0.52;

  const svgWidth = chartWidth + PADDING * 2;
  const svgHeight = chartHeight + PADDING * 2;

  const getY = (val: number) => {
    const min = range.min,
      max = range.max;
    const clampedVal = Math.max(min, Math.min(max, val));
    return (
      PADDING + (chartHeight - ((clampedVal - min) / (max - min)) * chartHeight)
    );
  };

  const getX = (time: string) => {
    const index = TIME_LABELS.indexOf(time);
    return index === -1
      ? PADDING
      : PADDING + (index / (TIME_LABELS.length - 1)) * chartWidth;
  };

  const dPath = activePoints.reduce((path, point, i) => {
    const x = getX(point.time);
    const y = getY(point.value);
    return i === 0 ? `M${x},${y}` : `${path} L${x},${y}`;
  }, '');

  return (
    <LinearGradient
      colors={['#FFFFFF', '#e1e1e1']}
      style={styles.chartCard}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <Text style={styles.chartTitle}>{label}</Text>
      <View style={styles.chartContent}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisText}>{range.max}</Text>
          <Text style={styles.axisText}>
            {Math.round((range.max + range.min) / 2)}
          </Text>
          <Text style={styles.axisText}>{range.min}</Text>
        </View>
        <View style={styles.svgWrapper}>
          <Svg
            width={svgWidth}
            height={svgHeight}
            style={{ marginLeft: -PADDING, marginTop: -PADDING }}
          >
            {/* Y-Axis vertical line */}
            <Line
              x1={getX(TIME_LABELS[0])}
              y1={getY(range.max)}
              x2={getX(TIME_LABELS[0])}
              y2={getY(range.min)}
              stroke="#626262"
              strokeWidth="1"
            />
            {/* Grid line (Horizontal) */}
            <Line
              x1={getX(TIME_LABELS[0])}
              y1={getY(range.min)}
              x2={getX(TIME_LABELS[TIME_LABELS.length - 1]) + 20}
              y2={getY(range.min)}
              stroke="#626262"
              strokeWidth="1"
            />

            {activePoints.length > 1 && (
              <Path d={dPath} fill="none" stroke="#EDB62C" strokeWidth="2.5" />
            )}

            {activePoints.map((p, i) => (
              <Circle
                key={i}
                cx={getX(p.time)}
                cy={getY(p.value)}
                r="4.5"
                fill="#EDB62C"
              />
            ))}
          </Svg>
        </View>
      </View>
      {/* X-Axis Time Labels */}
      <View style={styles.xAxis}>
        {['6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM'].map(t => (
          <Text key={t} style={styles.timeLabel}>
            {t}
          </Text>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  chartTitle: {
    textAlign: 'center',
    color: '#29A539',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 15,
  },
  chartContent: { flexDirection: 'row' },
  yAxis: { height: 110, justifyContent: 'space-between', paddingRight: 12 },
  axisText: { fontSize: 10, color: '#424242' },
  svgWrapper: { flex: 1, justifyContent: 'center' },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingLeft: 28,
  },
  timeLabel: { fontSize: 9, color: '#424242' },
});

export default PreciseVitalChart;
