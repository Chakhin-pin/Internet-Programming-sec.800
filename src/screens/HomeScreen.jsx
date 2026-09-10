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

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>สินค้าทั้งหมด ({products.length})</Text>

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
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 18, paddingBottom: 30 },
  logoutBtn: {
    backgroundColor: "#FEE2E2", borderRadius: 12,
    paddingVertical: 12, alignItems: "center", marginBottom: 16,
  },
  logoutText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12,
  },
  emptyBox: {
    alignItems: "center", marginTop: 60,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  emptySubText: { fontSize: 12, color: colors.textMuted },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  productImage: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: colors.bgGray,
  },
  productImagePlaceholder: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: colors.bgGray,
    justifyContent: "center", alignItems: "center",
  },
  productImageIcon: { fontSize: 24 },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 2 },
  productCode: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  productPrice: { fontSize: 13, fontWeight: "600", color: colors.primary },
  stockBadge: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    minWidth: 48,
  },
  stockNumber: { fontSize: 16, fontWeight: "700", color: colors.primary },
  stockLabel: { fontSize: 9, color: colors.primary, fontWeight: "600" },
});

export default HomeScreen;