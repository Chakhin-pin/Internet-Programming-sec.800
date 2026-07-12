import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";

// จับคู่แท็บกับ route จริงของ expo-router
const TABS = [
  { key: "home", label: "Home", icon: "🏠", route: "/" },
  { key: "add", label: "Add", icon: "➕", route: "/add-product" },
  { key: "product", label: "Product", icon: "📦", route: "/products" },
  { key: "finances", label: "Finances", icon: "💰", route: "/finances" },
  { key: "categories", label: "Categories", icon: "🗂️", route: "/categories" },
];

// Bottom nav: กดแล้วเปลี่ยนหน้าจริงด้วย router.push
// และไฮไลต์แท็บอัตโนมัติตาม path ปัจจุบัน (ไม่ต้องส่ง prop active เข้ามาเอง)
const BottomNav = () => {
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => router.push(tab.route)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  icon: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 2,
  },
  iconActive: {
    color: colors.primary,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
});

export default BottomNav;