import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";

// แปลงราคาให้แสดงเป็นตัวเลขอ่านง่ายเสมอ (กันกรณี price ว่าง/ไม่ใช่ตัวเลข ไม่ให้จอว่างเปล่า)
const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 บาท";
  return `${num.toLocaleString("th-TH")} บาท`;
};

const ProductListScreen = () => {
  const {
    products,
    isLoading,
    fetchError,
    searchQuery,
    setSearchQuery,
    deleteProduct,
    loadProducts,
    user,
    isAdmin,
    isAuthReady,
    logout,
  } = useProducts();

  // เก็บ id ของสินค้าที่กำลังลบอยู่ตอนนี้ เพื่อ disable ปุ่มกันกดซ้ำ (double tap)
  // ถ้าไม่มีตัวนี้ กดปุ่มลบเร็วๆ สองครั้งจะยิง DELETE ซ้ำ id เดิม รอบสองจะเจอ 404
  const [deletingId, setDeletingId] = useState(null);

  // ถ้ายังไม่ได้ login (ไม่มี user หลังจากเช็ค token เสร็จแล้ว) ให้เด้งไปหน้า login ทันที
  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace("/login");
    }
  }, [isAuthReady, user]);

  const goToEdit = (product) => {
    router.push({ pathname: "/edit-product", params: { id: product.id } });
  };

  const handleLogout = () => {
    const runLogout = async () => {
      await logout();
      router.replace("/login");
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("ต้องการออกจากระบบใช่ไหม?");
      if (confirmed) runLogout();
      return;
    }

    Alert.alert("ออกจากระบบ", "ต้องการออกจากระบบใช่ไหม?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: runLogout },
    ]);
  };

  const confirmDelete = (product) => {
    if (deletingId) return; // กำลังลบอยู่แล้ว กันการกดซ้อน

    const runDelete = async () => {
      setDeletingId(product.id);
      try {
        await deleteProduct(product.id);
      } catch (err) {
        const message = err.message || "ลบสินค้าไม่สำเร็จ";
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("ลบไม่สำเร็จ", message);
        }
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`ต้องการลบ "${product.name}" ใช่ไหม?`);
      if (confirmed) runDelete();
      return;
    }

    Alert.alert(
      "ลบสินค้า",
      `ต้องการลบ "${product.name}" ใช่ไหม?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        { text: "ลบ", style: "destructive", onPress: runDelete },
      ]
    );
  };

  // ระหว่างรอเช็ค token หรือยังไม่ login ไม่ต้องแสดงอะไร (กำลังจะเด้งไปหน้า login)
  if (!isAuthReady || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Products" />

      {/* แถบผู้ใช้ปัจจุบัน + ปุ่มออกจากระบบ */}
      <View style={styles.userBar}>
        <Text style={styles.userBarText}>
          {user.username} {isAdmin ? "(admin)" : ""}
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาสินค้า..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>สินค้าทั้งหมด ({products.length})</Text>

        {isLoading && (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        )}

        {!isLoading && fetchError && (
          <View style={{ alignItems: "center", marginTop: 30 }}>
            <Text style={styles.emptyText}>{fetchError}</Text>
            <TouchableOpacity onPress={() => loadProducts(searchQuery)} style={styles.retryButton}>
              <Text style={styles.retryText}>ลองใหม่</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !fetchError && products.length === 0 && (
          <Text style={styles.emptyText}>
            {searchQuery ? `ไม่พบสินค้าที่ตรงกับ "${searchQuery}"` : "ยังไม่มีสินค้า ลองเพิ่มจากหน้า Add product"}
          </Text>
        )}

        {!isLoading &&
          !fetchError &&
          products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => goToEdit(product)}
            >
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
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{product.category}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>คงเหลือ {product.stockSize}</Text>
                </View>
              </View>

              {/* ปุ่ม Edit/Delete เห็นเฉพาะ admin เท่านั้น ตามที่ backend บังคับสิทธิ์ไว้ */}
              {isAdmin && (
                <>
                  <TouchableOpacity style={styles.editButton} onPress={() => goToEdit(product)}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, deletingId === product.id && styles.deleteButtonDisabled]}
                    onPress={() => confirmDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? (
                      <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  userBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  userBarText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  logoutText: { fontSize: 12, color: "#e53935", fontWeight: "700" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgGray,
    borderRadius: 10,
    marginHorizontal: 18,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: colors.text },
  clearIcon: { fontSize: 14, color: colors.textMuted, paddingLeft: 8 },
  retryButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: colors.white, fontWeight: "700" },
  scroll: { padding: 18, paddingBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 14 },
  emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: colors.bgGray,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  thumbnail: { width: 56, height: 56, borderRadius: 10, marginRight: 12, backgroundColor: colors.white },
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
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  name: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 14, fontWeight: "700", color: colors.primary },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: colors.textMuted },
  metaDot: { fontSize: 12, color: colors.textMuted, marginHorizontal: 6 },
  editButton: { justifyContent: "center", alignItems: "center", paddingLeft: 10 },
  editIcon: { fontSize: 16 },
  deleteButton: { justifyContent: "center", alignItems: "center", paddingLeft: 10 },
  deleteButtonDisabled: { opacity: 0.5 },
  deleteIcon: { fontSize: 18 },
});

export default ProductListScreen;