import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { chartPalette, colors } from "../theme/colors";

// ข้อมูลตัวอย่าง (mock data) แทนกราฟยอดขายสุทธิ / กำไรขั้นต้น
const netSalesData = [30, 45, 35, 50, 40, 60, 55, 90, 70, 100];
const grossProfitData = [25, 30, 45, 35, 55, 40, 65, 85, 60, 95];

// ข้อมูลตัวอย่าง Revenue แบบ stacked bar (แต่ละคอลัมน์มี 4 segment)
const revenueData = [
  [10, 15, 8, 5],
  [12, 10, 10, 6],
  [8, 18, 12, 4],
  [15, 12, 9, 7],
  [10, 20, 11, 5],
  [13, 14, 13, 6],
  [9, 16, 10, 8],
  [14, 19, 12, 5],
];

// หมวดสินค้าของร้าน (ธุรกิจขายราวแขวนผ้า) ใช้เป็น legend ของกราฟ Revenue
const LEGEND = ["ราวแขวนเสื้อ", "ไม้แขวนเสื้อ", "ตะขอแขวนผนัง", "ชั้นวางผ้า"];

// กราฟแท่งธรรมดา ไฮไลต์แท่งท้าย ๆ ให้เป็นสีเข้ม
const BarChart = ({ data, highlightLastN = 3 }) => {
  const max = Math.max(...data);
  return (
    <View style={styles.barChart}>
      {data.map((value, i) => {
        const isHighlight = i >= data.length - highlightLastN;
        return (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: `${(value / max) * 100}%`,
                backgroundColor: isHighlight
                  ? colors.primaryDark
                  : colors.primaryLight,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

// กราฟแท่งซ้อน (stacked bar) สำหรับ Revenue
const StackedBarChart = ({ data }) => {
  const totals = data.map((segments) => segments.reduce((a, b) => a + b, 0));
  const max = Math.max(...totals);

  return (
    <View style={styles.stackedChart}>
      {data.map((segments, i) => (
        <View
          key={i}
          style={[styles.stackedCol, { height: `${(totals[i] / max) * 100}%` }]}
        >
          {segments.map((seg, j) => (
            <View
              key={j}
              style={{
                flex: seg,
                backgroundColor: chartPalette[j % chartPalette.length],
                width: "100%",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const LegendDot = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const FinancesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Finances" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ตัวเลือกช่วงเวลา */}
        <View style={styles.rangeRow}>
          <TouchableOpacity style={styles.rangePill}>
            <Text style={styles.rangePillText}>View range</Text>
          </TouchableOpacity>
          <Text style={styles.rangeDates}>February 2025 - March 2025</Text>
        </View>

        {/* การ์ด Net sales */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Net sales</Text>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValue}>฿4,103</Text>
            <Text style={styles.cardDelta}>+2.12%</Text>
          </View>
          <BarChart data={netSalesData} />
        </View>

        {/* การ์ด Gross profit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gross profit</Text>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValue}>฿3,819</Text>
            <Text style={styles.cardDelta}>+1.40%</Text>
          </View>
          <BarChart data={grossProfitData} />
        </View>

        {/* การ์ด Margin - แสดง empty state ตามภาพต้นแบบ */}
        <View style={[styles.card, styles.marginCard]}>
          <Text style={styles.cardTitle}>Margin</Text>
          <Text style={styles.emptyText}>
            Not enough data{"\n"}to show the chart
          </Text>
        </View>

        {/* การ์ด Revenue + legend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue</Text>
          <StackedBarChart data={revenueData} />
          <View style={styles.legendRow}>
            {LEGEND.map((label, i) => (
              <LegendDot key={label} color={chartPalette[i]} label={label} />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 18, paddingBottom: 30 },
  rangeRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  rangePill: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 10,
  },
  rangePillText: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  rangeDates: { color: colors.textMuted, fontSize: 11 },
  card: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  cardValueRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 10 },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginRight: 8,
  },
  cardDelta: { fontSize: 12, color: colors.success, fontWeight: "600" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 6,
  },
  bar: { flex: 1, borderRadius: 4, minHeight: 6 },
  marginCard: { alignItems: "center", justifyContent: "center", minHeight: 100 },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  stackedChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
    gap: 6,
  },
  stackedCol: {
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  legendRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLabel: { fontSize: 11, color: colors.textMuted },
});

export default FinancesScreen;