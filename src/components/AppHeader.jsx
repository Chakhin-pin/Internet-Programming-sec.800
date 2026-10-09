import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { useProducts } from "../context/ProductContext";

const MOBILE_BREAKPOINT = 768;
const navItems = (language, isAdmin) => (language === "en" ? [
  { label: "Home", route: "/" }, { label: "Products", route: "/products" }, { label: "Overview", route: "/finances" }, { label: "Categories", route: "/categories" },
] : [
  { label: "หน้าแรก", route: "/" }, { label: "สินค้า", route: "/products" }, { label: "ภาพรวม", route: "/finances" }, { label: "หมวดหมู่", route: "/categories" },
]).filter((item) => isAdmin || item.route !== "/finances");

const RackMark = () => <View style={styles.rackMark}><View style={styles.rackRail} /><View style={[styles.rackHook, styles.rackHookOne]} /><View style={[styles.rackHook, styles.rackHookTwo]} /></View>;

export default function AppHeader() {
  const pathname = usePathname();
  const { isAdmin, cart, preferences, updatePreferences } = useProducts();
  const language = preferences.language || "th";
  const copy = language === "en" ? { account: "Account", cart: "Cart", add: "Add product" } : { account: "บัญชี", cart: "รถเข็น", add: "เพิ่มสินค้า" };
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(Dimensions.get("window").width >= MOBILE_BREAKPOINT);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      const desktop = window.width >= MOBILE_BREAKPOINT;
      setIsDesktop(desktop);
      if (desktop) setMenuOpen(false);
    });
    const onKeyDown = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    if (Platform.OS === "web") window.addEventListener("keydown", onKeyDown);
    return () => {
      subscription.remove();
      if (Platform.OS === "web") window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const navigate = (route) => { setMenuOpen(false); router.push(route); };
  const active = (route) => pathname === route;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.brand} onPress={() => navigate("/")} accessibilityLabel="หน้าแรก BOXBOX">
          <View style={styles.brandMark}><RackMark /></View>
          <Text style={styles.wordmark}>BOXBOX</Text>
        </TouchableOpacity>

        {isDesktop && <View style={styles.desktopNav}>
          {navItems(language, isAdmin).map((item) => <NavLink key={item.route} item={item} active={active(item.route)} onPress={() => navigate(item.route)} />)}
        </View>}

        {isDesktop ? <View style={styles.actions}>
          <LanguageToggle language={language} onPress={() => updatePreferences({ language: language === "th" ? "en" : "th" })} />
          <TouchableOpacity onPress={() => navigate("/Settings")}><Text style={styles.ghostAction}>{copy.account}</Text></TouchableOpacity>
          {!isAdmin && <TouchableOpacity style={styles.cartLink} onPress={() => navigate("/cart")}><Text style={styles.cartLinkText}>{copy.cart} ({cart.reduce((sum, item) => sum + item.quantity, 0)})</Text></TouchableOpacity>}
          {isAdmin && <TouchableOpacity style={styles.primaryAction} onPress={() => navigate("/add-product")}><Text style={styles.primaryActionText}>{copy.add}</Text></TouchableOpacity>}
        </View> : <Pressable
          style={styles.menuButton}
          onPress={() => setMenuOpen((open) => !open)}
          accessibilityLabel={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
          accessibilityState={{ expanded: menuOpen }}
          aria-expanded={menuOpen}
          aria-controls="boxbox-mobile-navigation"
        ><Text style={styles.menuIcon}>{menuOpen ? "×" : "☰"}</Text></Pressable>}
      </View>

      {!isDesktop && menuOpen && <View nativeID="boxbox-mobile-navigation" style={styles.mobilePanel}>
        {navItems(language, isAdmin).map((item) => <NavLink key={item.route} item={item} active={active(item.route)} onPress={() => navigate(item.route)} mobile />)}
        <View style={styles.mobileActions}>
          <LanguageToggle language={language} onPress={() => updatePreferences({ language: language === "th" ? "en" : "th" })} />
          <TouchableOpacity style={styles.mobileGhost} onPress={() => navigate("/Settings")}><Text style={styles.ghostAction}>{copy.account}</Text></TouchableOpacity>
          {!isAdmin && <TouchableOpacity style={styles.cartLink} onPress={() => navigate("/cart")}><Text style={styles.cartLinkText}>{copy.cart} ({cart.reduce((sum, item) => sum + item.quantity, 0)})</Text></TouchableOpacity>}
          {isAdmin && <TouchableOpacity style={styles.primaryAction} onPress={() => navigate("/add-product")}><Text style={styles.primaryActionText}>{copy.add}</Text></TouchableOpacity>}
        </View>
      </View>}
    </View>
  );
}

function NavLink({ item, active, onPress, mobile }) {
  return <TouchableOpacity style={[styles.navLink, mobile && styles.mobileNavLink]} onPress={onPress} accessibilityRole="link"><Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text></TouchableOpacity>;
}
function LanguageToggle({ language, onPress }) {
  return <TouchableOpacity style={styles.languageToggle} onPress={onPress} accessibilityLabel="Change language"><Text style={styles.languageText}>{language === "th" ? "EN" : "ไทย"}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  wrap: { zIndex: 10, backgroundColor: "rgba(255,255,255,0.88)", borderBottomWidth: 1, borderBottomColor: "rgba(229,231,235,0.9)", ...(Platform.OS === "web" ? { backdropFilter: "blur(14px)", position: "sticky", top: 0 } : {}) },
  header: { minHeight: 64, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 }, brandMark: { width: 36, height: 36, borderRadius: 9, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, wordmark: { color: colors.text, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  rackMark: { width: 22, height: 20, position: "relative" }, rackRail: { position: "absolute", top: 5, left: 1, right: 1, height: 3, borderRadius: 3, backgroundColor: colors.white }, rackHook: { position: "absolute", top: 8, width: 8, height: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: colors.white, borderBottomLeftRadius: 7 }, rackHookOne: { left: 4 }, rackHookTwo: { right: 3 },
  desktopNav: { flex: 1, justifyContent: "flex-end", flexDirection: "row", marginRight: 22, gap: 4 }, navLink: { paddingHorizontal: 11, paddingVertical: 9 }, navText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" }, navTextActive: { color: colors.primary },
  actions: { flexDirection: "row", alignItems: "center", gap: 15 }, languageToggle: { paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: colors.border, borderRadius: 5 }, languageText: { color: colors.text, fontSize: 12, fontWeight: "700" }, ghostAction: { color: colors.text, fontSize: 13, fontWeight: "600" }, cartLink: { paddingHorizontal: 3, paddingVertical: 8 }, cartLinkText: { color: colors.primary, fontSize: 13, fontWeight: "700" }, primaryAction: { minHeight: 36, paddingHorizontal: 14, borderRadius: 6, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }, primaryActionText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  menuButton: { width: 38, height: 38, borderRadius: 7, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border }, menuIcon: { color: colors.text, fontSize: 23, lineHeight: 25, fontWeight: "400" },
  mobilePanel: { padding: 12, gap: 2, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "rgba(255,255,255,0.98)" }, mobileNavLink: { paddingVertical: 12, paddingHorizontal: 10 }, mobileActions: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border }, mobileGhost: { paddingHorizontal: 10, paddingVertical: 9 },
});
