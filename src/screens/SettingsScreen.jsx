import { router } from "expo-router";
import { useState } from "react";
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";

const message = (title, body) => Platform.OS === "web" ? window.alert(`${title}\n\n${body}`) : Alert.alert(title, body);
export default function SettingsScreen() {
  const { user, isAdmin, cart, preferences, updatePreferences, logout, changeOwnRole } = useProducts();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: preferences.profile.name || user?.username || "", email: preferences.profile.email || "" });
  const save = async () => { await updatePreferences({ profile }); setEditing(false); };
  const changeRole = async (role) => { try { await changeOwnRole(role); message("อัปเดตสิทธิ์แล้ว", "กรุณาเข้าสู่ระบบใหม่เพื่อใช้งานสิทธิ์ล่าสุด"); } catch (error) { message("อัปเดตไม่สำเร็จ", error.message); } };
  const signOut = async () => { await logout(); router.replace("/login"); };
  return <SafeAreaView style={styles.container}><AppHeader /><ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.pageTitle}>บัญชีผู้ใช้</Text>
    <Text style={styles.pageSub}>{isAdmin ? "ผู้ดูแลระบบ" : "ลูกค้า"}</Text>
    <View style={styles.card}><View style={styles.cardHeader}><Text style={styles.cardTitle}>Personal settings</Text><TouchableOpacity onPress={() => editing ? save() : setEditing(true)}><Text style={styles.edit}>{editing ? "บันทึก" : "แก้ไขข้อมูล"}</Text></TouchableOpacity></View>
      <Field label="ชื่อ" value={profile.name} editing={editing} onChangeText={(name) => setProfile((value) => ({ ...value, name }))} />
      <Field label="อีเมล" value={profile.email} editing={editing} onChangeText={(email) => setProfile((value) => ({ ...value, email }))} keyboardType="email-address" />
      <Field label="ชื่อผู้ใช้" value={user?.username || "-"} />
      <Field label="สิทธิ์" value={user?.role || "-"} />
    </View>
    {isAdmin ? <><Text style={styles.sectionTitle}>Role</Text><View style={styles.card}>{["admin", "customer"].map((role) => <TouchableOpacity key={role} style={styles.roleRow} onPress={() => changeRole(role)}><View style={[styles.radio, user?.role === role && styles.radioActive]}>{user?.role === role && <View style={styles.radioDot} />}</View><Text style={styles.roleText}>{role}</Text></TouchableOpacity>)}</View></> : <><Text style={styles.sectionTitle}>การสั่งซื้อ</Text><View style={styles.card}><Row label="สินค้าที่รอชำระ" value="0 รายการ" /><Row label="สินค้าในรถเข็น" value={`${cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น`} onPress={() => router.push("/cart")} /></View></>}
    <TouchableOpacity style={styles.logout} onPress={signOut}><Text style={styles.logoutText}>ออกจากระบบ</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}
const Field = ({ label, value, editing, onChangeText, keyboardType }) => <View style={styles.field}><Text style={styles.label}>{label}</Text>{editing && onChangeText ? <TextInput style={styles.input} value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={`กรอก${label}`} placeholderTextColor={colors.textMuted} /> : <Text style={styles.value}>{value || "-"}</Text>}</View>;
const Row = ({ label, value, onPress }) => <TouchableOpacity disabled={!onPress} style={styles.row} onPress={onPress}><Text style={styles.roleText}>{label}</Text><Text style={styles.rowValue}>{value}{onPress ? " ›" : ""}</Text></TouchableOpacity>;
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgGray }, scroll: { padding: 20, paddingBottom: 38, maxWidth: 700, width: "100%", alignSelf: "center" }, pageTitle: { color: colors.text, fontSize: 25, fontWeight: "700" }, pageSub: { color: colors.textMuted, fontSize: 13, marginTop: 3, marginBottom: 20 }, sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 21, marginBottom: 8 }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 16 }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }, cardTitle: { color: colors.text, fontSize: 16, fontWeight: "700" }, edit: { color: colors.primary, fontSize: 13, fontWeight: "700" }, field: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#F1F1F1" }, label: { color: colors.textMuted, fontSize: 11 }, value: { color: colors.text, fontSize: 14, marginTop: 4 }, input: { color: colors.text, fontSize: 14, marginTop: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }, roleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11 }, radio: { width: 18, height: 18, borderWidth: 1, borderColor: colors.textMuted, borderRadius: 9, justifyContent: "center", alignItems: "center", marginRight: 10 }, radioActive: { borderColor: colors.primary }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }, roleText: { flex: 1, color: colors.text, fontSize: 14 }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11, borderBottomWidth: 1, borderColor: "#F1F1F1" }, rowValue: { color: colors.textMuted, fontSize: 13 }, logout: { marginTop: 26, minHeight: 44, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6, backgroundColor: colors.white }, logoutText: { color: colors.primary, fontSize: 14, fontWeight: "700" }, });
