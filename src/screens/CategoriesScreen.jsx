import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { colors } from "../theme/colors";

// หมวดหมู่สินค้าของร้าน (ธุรกิจขายราวแขวนผ้า) - mock data
const CATEGORIES = [
  { key: "bestSellers", label: "สินค้าขายดี", count: 32, icon: "🔥" },
  { key: "wood", label: "ทำจากไม้", count: 18, icon: "🪵" },
  { key: "steel", label: "ทำงานเหล็ก", count: 27, icon: "🔩" },
  { key: "plastic", label: "ทำจากพลาสติก", count: 14, icon: "♻️" },
];

const CategoriesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Categories" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.key} style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{cat.icon}</Text>
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.label}>{cat.label}</Text>
              <Text style={styles.count}>{cat.count} รายการ</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 18, paddingBottom: 30 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgGray,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  icon: { fontSize: 24 },
  textGroup: { flex: 1 },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

export default CategoriesScreen;