import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import { colors } from "../theme/colors";

// ข้อมูลส่วนตัวที่แสดงในการ์ดสีม่วงอ่อน
const PERSONAL_FIELDS = [
  { label: "Name*", value: "John Hopkins" },
  { label: "Company email*", value: "j.hopkins@inventor.io" },
  { label: "Account password*", value: "••••••••••" },
  { label: "Store", value: "Leicester, UK" },
  { label: "Employee code", value: "94-K-6764-LEI" },
  { label: "Current role", value: "Manager" },
];

const ROLE_OPTIONS = ["Manager", "Editor", "Supplier", "Seller", "Admin", "Finance"];
const TOGGLE_ROLES = ["Customer", "Product", "User"];

const SettingsScreen = () => {
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [toggles, setToggles] = useState({
    Customer: true,
    Product: true,
    User: true,
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Settings" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* การ์ดข้อมูลส่วนตัว */}
        <Text style={styles.sectionTitle}>Personal settings</Text>
        <View style={styles.personalCard}>
          <TouchableOpacity style={styles.editIcon}>
            <Text style={styles.editIconText}>✎</Text>
          </TouchableOpacity>

          {PERSONAL_FIELDS.map((field) => (
            <View key={field.label} style={styles.personalRow}>
              <Text style={styles.personalLabel}>{field.label}</Text>
              <Text style={styles.personalValue}>{field.value}</Text>
            </View>
          ))}
        </View>

        {/* รายการ Role แบบเลือกได้ทีละหนึ่ง (checkbox) */}
        <Text style={styles.sectionTitle}>Role</Text>
        <View style={styles.roleList}>
          {ROLE_OPTIONS.map((role) => {
            const isSelected = role === selectedRole;
            return (
              <TouchableOpacity
                key={role}
                style={styles.roleRow}
                onPress={() => setSelectedRole(role)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                  {role}
                </Text>
                {isSelected && <Text style={styles.rolePencil}>✎</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* รายการ Role แบบเปิด/ปิดได้หลายอัน (toggle switch) */}
        <Text style={styles.sectionTitle}>Role</Text>
        <View style={styles.toggleCard}>
          {TOGGLE_ROLES.map((role) => (
            <View key={role} style={styles.toggleRow}>
              <Text style={styles.toggleCheck}>✓</Text>
              <Text style={styles.toggleLabel}>{role}</Text>
              <Switch
                value={toggles[role]}
                onValueChange={(v) => setToggles((t) => ({ ...t, [role]: v }))}
                trackColor={{ false: "#ddd", true: colors.primary }}
                thumbColor={colors.white}
                style={styles.switch}
              />
              <TouchableOpacity style={styles.togglePencil}>
                <Text style={styles.togglePencilText}>✎</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 18, paddingBottom: 30 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  personalCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  editIcon: { position: "absolute", top: 14, right: 14 },
  editIconText: { fontSize: 14, color: colors.primary },
  personalRow: { marginBottom: 10 },
  personalLabel: { fontSize: 11, fontWeight: "700", color: colors.primary },
  personalValue: { fontSize: 12, color: colors.text, marginTop: 2 },
  roleList: {
    backgroundColor: colors.bgGray,
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  roleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxTick: { color: colors.white, fontSize: 10, fontWeight: "700" },
  roleLabel: { flex: 1, fontSize: 13, color: colors.textMuted },
  roleLabelSelected: { color: colors.primary, fontWeight: "700" },
  rolePencil: { fontSize: 13, color: colors.primary },
  toggleCard: { backgroundColor: colors.bgGray, borderRadius: 14, padding: 12 },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  toggleCheck: {
    color: colors.success,
    fontSize: 13,
    marginRight: 8,
    fontWeight: "700",
  },
  toggleLabel: { flex: 1, fontSize: 13, color: colors.text },
  switch: { marginRight: 10, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  togglePencil: { padding: 4 },
  togglePencilText: { fontSize: 12, color: colors.textMuted },
});

export default SettingsScreen;