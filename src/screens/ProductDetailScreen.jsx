import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";
import { useAppLanguage } from "../i18n";

const showMessage = (message) => Platform.OS === "web" ? window.alert(message) : Alert.alert("BOXBOX", message);

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { products, isAdmin, favorites, toggleFavorite, addToCart } = useProducts();
  const { t } = useAppLanguage();
  const [quantity, setQuantity] = useState(1);
  const product = useMemo(() => products.find((item) => item.id === String(id)), [id, products]);
  if (!product) return <SafeAreaView style={styles.container}><AppHeader /><View style={styles.empty}><Text style={styles.emptyText}>{t("unavailable")}</Text></View></SafeAreaView>;

  const favorite = favorites.includes(product.id);
  const price = Number(product.price || 0).toLocaleString("th-TH");
  const stock = Math.max(0, Number(product.stockSize) || 0);
  const add = async () => { await addToCart(product, quantity); showMessage("เพิ่มสินค้าในรถเข็นแล้ว"); };

  return <SafeAreaView style={styles.container}>
    <AppHeader />
    <ScrollView contentContainerStyle={styles.scroll}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ {t("backProducts")}</Text></TouchableOpacity>
      <View style={styles.detail}>
        <View style={styles.imagePanel}>{product.photo ? <Image source={{ uri: product.photo }} style={styles.image} resizeMode="contain" /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>BOX</Text></View>}</View>
        <View style={styles.info}>
          <View style={styles.titleRow}><Text style={styles.name}>{product.name || "ไม่ระบุชื่อสินค้า"}</Text><TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(product.id)} accessibilityLabel="เพิ่มในรายการโปรด"><Text style={[styles.heartText, favorite && styles.heartActive]}>{favorite ? "♥" : "♡"}</Text></TouchableOpacity></View>
          <Text style={styles.meta}>{product.category || "ไม่ระบุหมวดหมู่"}{product.itemCode ? ` • ${product.itemCode}` : ""}</Text>
          <Text style={styles.price}>฿{price}</Text>
          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
          <View style={styles.details}>
            {product.brand ? <Detail label={t("brand")} value={product.brand} /> : null}
            {product.sizes ? <Detail label={t("size")} value={product.sizes} /> : null}
            {product.location ? <Detail label={t("storageLocation")} value={product.location} /> : null}
            {product.status ? <Detail label={t("status")} value={product.status} /> : null}
          </View>
          <View style={styles.stockBox}><Text style={styles.stockTitle}>{t("status")}</Text><Text style={styles.stockValue}>{stock > 0 ? `${t("inStock")} ${stock}` : t("outOfStock")}</Text></View>
          {isAdmin ? <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: "/edit-product", params: { id: product.id } })}><Text style={styles.editText}>{t("editProduct")}</Text></TouchableOpacity> : <View style={styles.buyRow}>
            <View style={styles.quantity}><TouchableOpacity onPress={() => setQuantity((value) => Math.max(1, value - 1))}><Text style={styles.quantityButton}>−</Text></TouchableOpacity><Text style={styles.quantityValue}>{quantity}</Text><TouchableOpacity onPress={() => setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))}><Text style={styles.quantityButton}>+</Text></TouchableOpacity></View>
            <TouchableOpacity style={[styles.cartButton, stock === 0 && styles.disabled]} onPress={add} disabled={stock === 0}><Text style={styles.cartText}>{t("addToCart")}</Text></TouchableOpacity>
          </View>}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const Detail = ({ label, value }) => <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white }, scroll: { padding: 20, paddingBottom: 38, maxWidth: 1180, width: "100%", alignSelf: "center" }, back: { color: colors.textMuted, fontSize: 13, marginBottom: 18 }, detail: { flexDirection: "row", flexWrap: "wrap", gap: 30 }, imagePanel: { flexGrow: 1, flexBasis: 420, minHeight: 350, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: "#FAFAFA", overflow: "hidden" }, image: { width: "100%", height: "100%" }, placeholder: { flex: 1, alignItems: "center", justifyContent: "center" }, placeholderText: { color: colors.textMuted, fontSize: 18, fontWeight: "700", letterSpacing: 2 }, info: { flexGrow: 1, flexBasis: 300, maxWidth: 440 }, titleRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" }, name: { flex: 1, color: colors.text, fontSize: 24, lineHeight: 31, fontWeight: "700" }, heart: { width: 38, height: 38, justifyContent: "center", alignItems: "center" }, heartText: { color: colors.text, fontSize: 30 }, heartActive: { color: colors.primary }, meta: { color: colors.textMuted, fontSize: 13, marginTop: 8 }, price: { color: colors.text, fontSize: 28, fontWeight: "700", marginTop: 17 }, description: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 17 }, details: { marginTop: 16, borderTopWidth: 1, borderColor: colors.border }, detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: "#F1F1F1" }, detailLabel: { color: colors.textMuted, fontSize: 12 }, detailValue: { flex: 1, textAlign: "right", color: colors.text, fontSize: 12, fontWeight: "600" }, stockBox: { marginTop: 20, padding: 13, borderLeftWidth: 3, borderLeftColor: colors.success, backgroundColor: "#F4FBF7" }, stockTitle: { color: colors.textMuted, fontSize: 12 }, stockValue: { color: colors.text, fontSize: 14, fontWeight: "700", marginTop: 3 }, buyRow: { flexDirection: "row", gap: 10, marginTop: 22 }, quantity: { flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 24 }, quantityButton: { color: colors.text, fontSize: 22, paddingVertical: 7 }, quantityValue: { color: colors.text, fontSize: 14, fontWeight: "700" }, cartButton: { flex: 1, minHeight: 47, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, cartText: { color: colors.white, fontSize: 14, fontWeight: "700" }, editButton: { marginTop: 22, minHeight: 46, borderRadius: 6, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, editText: { color: colors.white, fontSize: 14, fontWeight: "700" }, disabled: { opacity: .45 }, empty: { flex: 1, justifyContent: "center", alignItems: "center" }, emptyText: { color: colors.textMuted },
});
