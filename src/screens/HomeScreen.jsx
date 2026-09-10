import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";

const HomeScreen = () => {
  const { products, isLoading, loadProducts, logout } = useProducts();

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="BOXBOX" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}><Text style={styles.heroKicker}>INVENTORY OVERVIEW</Text><Text style={styles.heroTitle}>จัดการคลังของคุณ{`\n`}อย่างมั่นใจ</Text><Text style={styles.heroText}>ติดตามรายการสินค้าและสต็อกทั้งหมดได้ในที่เดียว</Text></View>
          <View style={styles.heroStat}><Text style={styles.heroStatValue}>{products.length}</Text><Text style={styles.heroStatLabel}>รายการ</Text></View>
        </View>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>สินค้าล่าสุด</Text><TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutText}>ออกจากระบบ</Text></TouchableOpacity></View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>ยังไม่มีสินค้า</Text>
            <Text style={styles.emptySubText}>ลองเพิ่มสินค้าจากหน้า Add</Text>
          </View>
        ) : (
          products.map((item) => (
            <View key={item.id} style={styles.productRow}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.productImageIcon}>📦</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productCode}>{item.itemCode}</Text>
                <Text style={styles.productPrice}>฿{item.price}</Text>
              </View>
              <View style={styles.stockBadge}>
                <Text style={styles.stockNumber}>{item.stockSize}</Text>
                <Text style={styles.stockLabel}>stock</Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgGray },
  scroll: { padding: 20, paddingBottom: 30 },
  hero: { backgroundColor: colors.primaryDark, borderRadius: 22, padding: 20, minHeight: 145, marginBottom: 24, flexDirection: "row", overflow: "hidden" },
  heroCopy: { flex: 1 }, heroKicker: { fontSize: 10, letterSpacing: 1, color: "#C7D2FE", fontWeight: "800", marginBottom: 8 }, heroTitle: { fontSize: 22, lineHeight: 28, color: colors.white, fontWeight: "800" }, heroText: { color: "#C7D2FE", fontSize: 12, lineHeight: 18, marginTop: 8, maxWidth: 210 },
  heroStat: { alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" }, heroStatValue: { fontSize: 22, fontWeight: "800", color: colors.white }, heroStatLabel: { fontSize: 10, color: "#C7D2FE", marginTop: 2 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  logoutBtn: {
    backgroundColor: "#FEF2F2", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7,
  },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 11 },
  sectionTitle: {
    fontSize: 17, fontWeight: "800", color: colors.text,
  },
  emptyBox: {
    alignItems: "center", marginTop: 42, backgroundColor: colors.white, borderRadius: 18, paddingVertical: 36, borderWidth: 1, borderColor: colors.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  emptySubText: { fontSize: 12, color: colors.textMuted },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16, padding: 13, marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  productImage: { width: 58, height: 58, borderRadius: 12,
    backgroundColor: colors.bgGray,
  },
  productImagePlaceholder: {
    width: 58, height: 58, borderRadius: 12,
    backgroundColor: colors.bgGray,
    justifyContent: "center", alignItems: "center",
  },
  productImageIcon: { fontSize: 24 },
  productInfo: { flex: 1, marginLeft: 13 },
  productName: { fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 3 },
  productCode: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  productPrice: { fontSize: 13, fontWeight: "600", color: colors.primary },
  stockBadge: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 11, paddingHorizontal: 10, paddingVertical: 7,
    minWidth: 48,
  },
  stockNumber: { fontSize: 16, fontWeight: "700", color: colors.primary },
  stockLabel: { fontSize: 9, color: colors.primary, fontWeight: "600" },
});

export default HomeScreen;
