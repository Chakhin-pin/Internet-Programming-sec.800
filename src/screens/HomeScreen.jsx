import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { colors } from "../theme/colors";

// ข้อมูลการ์ด Recent Activity (mock data)
// key "viewMore" ใช้แยกกรณีพิเศษ เพราะการ์ดนี้ไม่มีตัวเลข มีแค่ปุ่มลูกศร
const ACTIVITY_CARDS = [
  { key: "newItems", label: "New items", qty: 741 },
  { key: "newOrders", label: "New orders", qty: 123 },
  { key: "refunds", label: "Refunds", qty: 12 },
  { key: "message", label: "Message", qty: 1 },
  { key: "groups", label: "Groups", qty: 4 },
  { key: "viewMore", label: "View more", isAction: true },
];

// ข้อมูลกราฟยอดขาย (mock data) - แต่ละแท่งคือสถานะออเดอร์
const SALES_DATA = [
  { label: "Confirmed", value: 60 },
  { label: "Packed", value: 90 },
  { label: "Refunded", value: 30 },
  { label: "Shipped", value: 85 },
];

// ข้อมูล Top item categories (mock data) - แต่ละแถวมีสีตัวเลขต่างกันเพื่อสื่อความหมาย
const TOP_CATEGORIES = [
  { key: "lowStock", label: "Low stock items", value: 12, color: colors.primary, hasInfo: true },
  { key: "itemCategories", label: "Item categories", value: 6, color: colors.amber },
  { key: "refundedItems", label: "Refunded items", value: 1, color: colors.success },
];

// รายชื่อสาขา (mock data) - ร้านขายราวแขวนผ้า
const STORES = ["สาขาบางนา กรุงเทพฯ", "สาขารังสิต ปทุมธานี", "สาขาระยอง", "สาขาชลบุรี"];

const ActivityCard = ({ card }) => {
  if (card.isAction) {
    // การ์ด "View more" เป็นปุ่มลูกศรวงกลม ไม่ใช่การ์ดตัวเลข
    return (
      <TouchableOpacity style={[styles.card, styles.viewMoreCard]}>
        <View style={styles.viewMoreCircle}>
          <Text style={styles.viewMoreArrow}>›</Text>
        </View>
        <Text style={styles.viewMoreLabel}>{card.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardQty}>{card.qty}</Text>
      <Text style={styles.cardQtyUnit}>Qty</Text>
      <Text style={styles.cardLabel}>{card.label.toUpperCase()}</Text>
    </View>
  );
};

// กราฟแท่งยอดขาย วางอยู่บนพื้นหลังม่วงอ่อน
const SalesBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartBars}>
        {data.map((item, i) => (
          <View key={item.label} style={styles.chartBarColumn}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: i % 2 === 0 ? colors.primary : colors.primaryDark,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.chartLabelsRow}>
        {data.map((item) => (
          <Text key={item.label} style={styles.chartLabel}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="BOXBOX" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.cardGrid}>
          {ACTIVITY_CARDS.map((card) => (
            <ActivityCard key={card.key} card={card} />
          ))}
        </View>

        {/* Sales */}
        <Text style={styles.sectionTitle}>Sales</Text>
        <SalesBarChart data={SALES_DATA} />

        {/* Top item categories */}
        <Text style={styles.sectionTitle}>Top item categories</Text>
        <View style={styles.infoCard}>
          {TOP_CATEGORIES.map((item, i) => (
            <View
              key={item.key}
              style={[
                styles.infoRow,
                i === TOP_CATEGORIES.length - 1 && styles.infoRowLast,
              ]}
            >
              <Text style={[styles.infoLabel, { color: item.color }]}>
                {item.label}
              </Text>
              <View style={styles.infoValueGroup}>
                <Text style={[styles.infoValue, { color: item.color }]}>
                  {item.value}
                </Text>
                {item.hasInfo && <Text style={styles.infoIcon}>ⓘ</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Stores list */}
        <Text style={styles.sectionTitle}>Stores list</Text>
        <View style={styles.infoCard}>
          {STORES.map((store, i) => (
            <TouchableOpacity
              key={store}
              style={[
                styles.storeRow,
                i === STORES.length - 1 && styles.infoRowLast,
              ]}
            >
              <Text style={styles.storeLabel}>{store}</Text>
              <Text style={styles.storeArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const CARD_WIDTH = "31%"; // 3 คอลัมน์ต่อแถว เว้นช่องว่างระหว่างการ์ดด้วย gap

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 18, paddingBottom: 30 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
    marginBottom: 12,
  },

  // --- Recent Activity cards ---
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    // เงาบางๆ ให้การ์ดดูลอยขึ้นมาเล็กน้อย
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardQty: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  cardQtyUnit: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.3,
  },
  viewMoreCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  viewMoreCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  viewMoreArrow: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  viewMoreLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },

  // --- Sales chart ---
  chartCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 12,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 140,
  },
  chartBarColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartBar: {
    width: 10,
    borderRadius: 6,
    minHeight: 10,
  },
  chartLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(108,43,217,0.15)",
    paddingTop: 8,
  },
  chartLabel: {
    flex: 1,
    fontSize: 10,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },

  // --- Top item categories / Stores list (การ์ดแบบรายการ ใช้ร่วมกัน 2 ส่วน) ---
  infoCard: {
    backgroundColor: colors.bgGray,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  infoValueGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoIcon: {
    fontSize: 11,
    color: colors.primary,
  },
  storeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  storeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.amber,
  },
  storeArrow: {
    fontSize: 16,
    color: colors.textMuted,
  },
});

export default HomeScreen;