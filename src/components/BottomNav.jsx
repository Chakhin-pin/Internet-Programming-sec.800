import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";

// จับคู่แท็บกับ route จริงของ expo-router
const TABS = [
  { key: "home", label: "หน้าแรก", route: "/" },
  { key: "add", label: "เพิ่มสินค้า", route: "/add-product" },
  { key: "product", label: "สินค้า", route: "/products" },
  { key: "finances", label: "ภาพรวม", route: "/finances" },
  { key: "categories", label: "หมวดหมู่", route: "/categories" },
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
            <View style={[styles.navPill, isActive && styles.navPillActive]}><Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text></View>
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
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center", justifyContent: "center",
  },
  navPill: { paddingHorizontal: 7, paddingVertical: 6, borderRadius: 10 },
  navPillActive: { backgroundColor: colors.primaryLight },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    paddingVertical: 0,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "800",
  },
});

export default BottomNav;
