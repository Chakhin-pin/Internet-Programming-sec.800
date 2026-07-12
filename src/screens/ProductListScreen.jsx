import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";

const ProductListScreen = () => {
  const { products, deleteProduct } = useProducts();

  // ถามยืนยันก่อนลบทุกครั้ง กันกดพลาด
  const confirmDelete = (product) => {
    Alert.alert(
      "ลบสินค้า",
      `ต้องการลบ "${product.name}" ใช่ไหม?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: () => deleteProduct(product.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Products" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>สินค้าทั้งหมด ({products.length})</Text>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>ยังไม่มีสินค้า ลองเพิ่มจากหน้า Add product</Text>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.card}>
              {product.photo ? (
                <Image source={{ uri: product.photo }} style={styles.thumbnail} />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.thumbnailPlaceholderIcon}>🖼️</Text>
                </View>
              )}

              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.name}>{product.name}</Text>
                  <Text style={styles.price}>฿{product.price}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{product.category}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>คงเหลือ {product.stockSize}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(product)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.bgGray,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.white,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailPlaceholderIcon: { fontSize: 20 },
  cardInfo: { flex: 1, justifyContent: "center" },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 14, fontWeight: "700", color: colors.primary },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: colors.textMuted },
  metaDot: { fontSize: 12, color: colors.textMuted, marginHorizontal: 6 },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
  deleteIcon: { fontSize: 18 },
});

export default ProductListScreen;