import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { useProducts } from "../context/ProductContext";
import { chartPalette, colors } from "../theme/colors";

const formatCurrency = (value) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);

const Metric = ({ label, value, detail }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricDetail}>{detail}</Text>
  </View>
);

export default function FinancesScreen() {
  const { products, isLoading } = useProducts();
  const inventory = products.reduce((total, product) => total + Math.max(0, Number(product.price) || 0) * Math.max(0, Number(product.stockSize) || 0), 0);
  const units = products.reduce((total, product) => total + Math.max(0, Number(product.stockSize) || 0), 0);
  const lowStock = products.filter((product) => Number(product.stockSize) <= 10).length;
  const categories = Object.values(products.reduce((result, product) => {
    const name = product.category || "ไม่ระบุหมวดหมู่";
    const value = Math.max(0, Number(product.price) || 0) * Math.max(0, Number(product.stockSize) || 0);
    result[name] = { name, value: (result[name]?.value || 0) + value };
    return result;
  }, {})).sort((a, b) => b.value - a.value);
  const maxCategoryValue = Math.max(...categories.map((category) => category.value), 1);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="ภาพรวมคลังสินค้า" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>ภาพรวม</Text>
        <Text style={styles.subheading}>คำนวณจากราคาและจำนวนสินค้าที่บันทึกไว้</Text>

        {isLoading ? <ActivityIndicator size="large" color={colors.primary} style={styles.loader} /> : (
          <>
            <View style={styles.metricGrid}>
              <Metric label="มูลค่าคงคลัง" value={formatCurrency(inventory)} detail="ราคา × จำนวนคงเหลือ" />
              <Metric label="สินค้าทั้งหมด" value={products.length.toLocaleString("th-TH")} detail={`${units.toLocaleString("th-TH")} ชิ้นในคลัง`} />
              <Metric label="ใกล้หมด" value={lowStock.toLocaleString("th-TH")} detail="สินค้าไม่เกิน 10 ชิ้น" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>มูลค่าตามหมวดหมู่</Text>
              {categories.length === 0 ? <Text style={styles.emptyText}>ยังไม่มีข้อมูลสินค้า</Text> : categories.map((category, index) => (
                <View key={category.name} style={styles.categoryRow}>
                  <View style={styles.categoryLabelRow}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryValue}>{formatCurrency(category.value)}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.bar, { width: `${(category.value / maxCategoryValue) * 100}%`, backgroundColor: chartPalette[index % chartPalette.length] }]} />
                  </View>
                </View>
              ))}
            </View>

            {lowStock > 0 && <View style={styles.notice}>
              <Text style={styles.noticeTitle}>ตรวจสอบสินค้าใกล้หมด</Text>
              <Text style={styles.noticeText}>มีสินค้า {lowStock} รายการที่เหลือไม่เกิน 10 ชิ้น</Text>
            </View>}
          </>
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgGray },
  scroll: { padding: 20, paddingBottom: 28 },
  heading: { fontSize: 25, fontWeight: "800", color: colors.text, letterSpacing: -0.4 },
  subheading: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 },
  loader: { marginTop: 48 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  metric: { width: "47%", flexGrow: 1, backgroundColor: colors.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  metricLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: "800", color: colors.text },
  metricDetail: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  section: { backgroundColor: colors.white, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 16 },
  categoryRow: { marginBottom: 16 },
  categoryLabelRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 8 },
  categoryName: { flex: 1, fontSize: 13, color: colors.text, fontWeight: "600" },
  categoryValue: { fontSize: 13, color: colors.text, fontWeight: "600" },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.bgGray, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 4, minWidth: 4 },
  emptyText: { color: colors.textMuted, fontSize: 14, paddingVertical: 12 },
  notice: { marginTop: 16, backgroundColor: "#FFFBEB", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#FDE68A" },
  noticeTitle: { color: colors.amber, fontWeight: "700", fontSize: 14, marginBottom: 4 },
  noticeText: { color: colors.amber, fontSize: 13 },
});
