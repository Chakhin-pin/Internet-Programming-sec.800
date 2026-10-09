import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";
import { useAppLanguage } from "../i18n";

const number = (value) => Number(value || 0).toLocaleString("th-TH");

const ProductVisual = ({ product }) => product.photo ? (
  <Image source={{ uri: product.photo }} style={styles.productImage} />
) : <View style={[styles.productImage, styles.placeholder]}><Text style={styles.placeholderText}>BOX</Text></View>;

export default function HomeScreen() {
  const { products, isLoading, loadProducts, logout, searchQuery, setSearchQuery, user, isAdmin, favorites, toggleFavorite, addToCart } = useProducts();
  const { t } = useAppLanguage();

  useEffect(() => {
    loadProducts();
    // ProductContext handles subsequent searches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => ({
    units: products.reduce((sum, p) => sum + Math.max(0, Number(p.stockSize) || 0), 0),
    lowStock: products.filter((p) => Number(p.stockSize) <= 10).length,
    categories: new Set(products.map((p) => p.category).filter(Boolean)).size,
  }), [products]);

  const goToProducts = () => router.push("/products");
  const handleLogout = async () => { await logout(); router.replace("/login"); };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="คลังสินค้า" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.utility}><Text style={styles.utilityBrand}>BOXBOX INVENTORY</Text><TouchableOpacity onPress={handleLogout}><Text style={styles.utilityLink}>ออกจากระบบ</Text></TouchableOpacity></View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>{isAdmin ? t("inventoryOverview") : "BOXBOX"}</Text>
          <Text style={styles.heroTitle}>{isAdmin ? t("manageProducts") : t("customerTitle")}</Text>
          <Text style={styles.heroText}>{isAdmin ? t("manageSubtitle") : t("customerSubtitle")}</Text>
          {isAdmin && <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder={t("searchPlaceholder")} placeholderTextColor={colors.textMuted} returnKeyType="search" onSubmitEditing={goToProducts} />
            <TouchableOpacity style={styles.searchButton} onPress={goToProducts}><Text style={styles.searchButtonText}>{t("search")}</Text></TouchableOpacity>
          </View>}
          <Text style={styles.welcome}>{t("welcome")}{user?.username ? `, ${user.username}` : ""}</Text>
        </View>

        {isAdmin && <><Heading title={t("inventoryStatus")} subtitle={t("currentData")} action={t("viewOverview")} onPress={() => router.push("/finances")} />
        <View style={styles.metrics}><Metric value={number(products.length)} label={t("productItems")} /><Metric value={number(summary.units)} label={t("unitsInStock")} /><Metric value={number(summary.categories)} label={t("categoriesCount")} /></View></>}

        <Heading title={t("productList")} subtitle={t("savedData")} action={t("viewAll")} onPress={goToProducts} />
        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : products.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>ยังไม่มีสินค้าในคลัง</Text><TouchableOpacity onPress={() => router.push("/add-product")}><Text style={styles.action}>เพิ่มสินค้า</Text></TouchableOpacity></View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
            {products.slice(0, 8).map((product) => <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}>
              <View style={styles.imageWrap}><ProductVisual product={product} />
                {!isAdmin && <TouchableOpacity style={styles.favoriteButton} onPress={(event) => { event.stopPropagation?.(); toggleFavorite(product.id); }} accessibilityLabel="Favorite product"><Text style={[styles.favoriteIcon, favorites.includes(product.id) && styles.favoriteIconActive]}>{favorites.includes(product.id) ? "♥" : "♡"}</Text></TouchableOpacity>}
              </View>
              <View style={styles.cardBody}><Text style={styles.productName} numberOfLines={2}>{product.name || "-"}</Text><Text style={styles.meta} numberOfLines={1}>{product.category || "-"}{product.itemCode ? ` • ${product.itemCode}` : ""}</Text><Text style={styles.cardPrice}>฿{number(product.price)}</Text><Text style={styles.stock}>{t("remaining")} {product.stockSize || "0"}</Text>{!isAdmin && <TouchableOpacity style={styles.addCartButton} onPress={(event) => { event.stopPropagation?.(); addToCart(product); }} disabled={Number(product.stockSize) < 1}><Text style={styles.addCartText}>{t("addToCart")}</Text></TouchableOpacity>}<Text style={styles.cardLink}>{t("details")}</Text></View>
            </TouchableOpacity>)}
          </ScrollView>
        )}

        {isAdmin && <View style={styles.helper}>
          <Text style={styles.helperTitle}>ค้นหาสินค้าได้เร็วขึ้น</Text>
          <Text style={styles.helperText}>พิมพ์ชื่อสินค้า หมวดหมู่ หรือรหัสสินค้าในช่องค้นหา เพื่อดูข้อมูลที่เกี่ยวข้อง</Text>
          <View style={styles.chips}><Text style={styles.chip}>ชื่อสินค้า</Text><Text style={styles.chip}>หมวดหมู่</Text><Text style={styles.chip}>รหัสสินค้า</Text></View>
        </View>}

        {isAdmin && summary.lowStock > 0 && <View style={styles.lowStock}><View><Text style={styles.lowStockTitle}>สินค้าใกล้หมด</Text><Text style={styles.lowStockText}>มี {number(summary.lowStock)} รายการที่เหลือไม่เกิน 10 ชิ้น</Text></View><TouchableOpacity style={styles.outline} onPress={goToProducts}><Text style={styles.outlineText}>ตรวจสอบ</Text></TouchableOpacity></View>}
        <View style={styles.footer}><Text style={styles.footerText}>BOXBOX • ระบบจัดการคลังสินค้า</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Heading = ({ title, subtitle, action, onPress }) => <View style={styles.heading}><View><Text style={styles.headingTitle}>{title}</Text><Text style={styles.headingSub}>{subtitle}</Text></View><TouchableOpacity onPress={onPress}><Text style={styles.action}>{action}</Text></TouchableOpacity></View>;
const Metric = ({ value, label }) => <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgGray }, scroll: { paddingBottom: 30 },
  utility: { height: 34, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F3F4F6" }, utilityBrand: { fontSize: 10, fontWeight: "700", letterSpacing: .8, color: colors.textMuted }, utilityLink: { fontSize: 12, color: colors.textMuted },
  hero: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border }, kicker: { color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: .6, marginBottom: 8 }, heroTitle: { color: colors.text, fontSize: 30, lineHeight: 36, fontWeight: "700", letterSpacing: -.8 }, heroText: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 470 },
  searchBox: { flexDirection: "row", alignItems: "center", minHeight: 54, marginTop: 22, paddingLeft: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 28, backgroundColor: colors.white }, searchIcon: { fontSize: 25, color: colors.textMuted, lineHeight: 26, marginRight: 6 }, searchInput: { flex: 1, minWidth: 0, fontSize: 13, color: colors.text, paddingVertical: 10 }, searchButton: { alignSelf: "stretch", paddingHorizontal: 17, borderRadius: 27, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", margin: 3 }, searchButtonText: { color: colors.white, fontSize: 13, fontWeight: "700" }, welcome: { color: colors.textMuted, fontSize: 12, marginTop: 10 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, marginTop: 28, marginBottom: 13 }, headingTitle: { color: colors.text, fontSize: 21, fontWeight: "700", letterSpacing: -.3 }, headingSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 }, action: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  metrics: { flexDirection: "row", gap: 9, paddingHorizontal: 20 }, metric: { flex: 1, minHeight: 94, padding: 13, justifyContent: "space-between", borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.white }, metricValue: { color: colors.text, fontSize: 21, fontWeight: "700" }, metricLabel: { color: colors.textMuted, fontSize: 11, lineHeight: 15 }, loader: { marginVertical: 35 },
  productRow: { paddingLeft: 20, paddingRight: 8, gap: 12 }, productCard: { width: 190, overflow: "hidden", borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.white }, imageWrap: { position: "relative" }, productImage: { width: "100%", height: 128, backgroundColor: "#F3F4F6" }, favoriteButton: { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: colors.border }, favoriteIcon: { color: colors.text, fontSize: 23, lineHeight: 25 }, favoriteIconActive: { color: colors.primary }, placeholder: { alignItems: "center", justifyContent: "center" }, placeholderText: { color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: .7 }, cardBody: { padding: 12 }, productName: { color: colors.text, fontSize: 15, fontWeight: "700", minHeight: 37 }, meta: { color: colors.textMuted, fontSize: 12, marginTop: 5 }, cardPrice: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 10 }, stock: { color: colors.textMuted, fontSize: 12, marginTop: 7 }, addCartButton: { marginTop: 11, minHeight: 32, borderWidth: 1, borderColor: colors.primary, borderRadius: 6, alignItems: "center", justifyContent: "center" }, addCartText: { color: colors.primary, fontSize: 12, fontWeight: "700" }, cardLink: { color: colors.primary, fontSize: 12, fontWeight: "700", marginTop: 8 },
  empty: { marginHorizontal: 20, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.white }, emptyText: { color: colors.textMuted, fontSize: 14 },
  helper: { margin: 20, marginTop: 32, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#D7EEE7", backgroundColor: "#F1FAF6" }, helperTitle: { color: colors.text, fontSize: 19, fontWeight: "700" }, helperText: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 7 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 15 }, chip: { color: colors.text, fontSize: 12, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: "#A8D8C7", backgroundColor: colors.white },
  lowStock: { marginHorizontal: 20, padding: 17, flexDirection: "row", gap: 14, alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#F1C8CD", borderRadius: 10, backgroundColor: "#FFF8F8" }, lowStockTitle: { color: colors.text, fontSize: 16, fontWeight: "700" }, lowStockText: { color: colors.textMuted, fontSize: 12, marginTop: 4 }, outline: { paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: colors.primary, borderRadius: 6 }, outlineText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  footer: { marginTop: 38, paddingVertical: 22, alignItems: "center", borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.text }, footerText: { color: "#D1D5DB", fontSize: 12 },
});
