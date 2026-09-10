import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";

const PROFILE_KEY = "admin_profile";

const AppHeader = ({ title, onMenuPress }) => {
  const { user } = useProducts();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", address: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);

  const openProfile = async () => {
    const saved = typeof window !== "undefined"
      ? localStorage.getItem(PROFILE_KEY)
      : await AsyncStorage.getItem(PROFILE_KEY);
    if (saved) setProfile(JSON.parse(saved));
    setShowProfile(true);
    setIsEditing(false);
  };

  const saveProfile = async () => {
    const json = JSON.stringify(profile);
    if (typeof window !== "undefined") localStorage.setItem(PROFILE_KEY, json);
    await AsyncStorage.setItem(PROFILE_KEY, json);
    setIsEditing(false);
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.brandMark} onPress={onMenuPress} activeOpacity={onMenuPress ? 0.7 : 1}>
          <Text style={styles.brandMarkText}>B</Text>
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text style={styles.eyebrow}>BOXBOX INVENTORY</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <TouchableOpacity style={styles.avatar} onPress={openProfile}>
          <Text style={styles.avatarIcon}>บัญชี</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showProfile} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowProfile(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <ScrollView>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>โปรไฟล์</Text>
                <TouchableOpacity onPress={() => setShowProfile(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.avatarBig}><Text style={styles.avatarBigIcon}>บัญชี</Text></View>
              <Text style={styles.usernameText}>{user?.username || "admin"}</Text>

              {[
                { key: "name", label: "ชื่อ" },
                { key: "phone", label: "เบอร์โทร" },
                { key: "address", label: "ที่อยู่" },
                { key: "email", label: "Email" },
              ].map((field) => (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={profile[field.key]}
                      onChangeText={(v) => setProfile((p) => ({ ...p, [field.key]: v }))}
                      placeholder={`กรอก${field.label}`}
                      placeholderTextColor={colors.textMuted}
                      keyboardType={field.key === "phone" ? "phone-pad" : "default"}
                    />
                  ) : (
                    <Text style={styles.fieldValue}>
                      {profile[field.key] || "-"}
                    </Text>
                  )}
                </View>
              ))}

              {isEditing ? (
                <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                  <Text style={styles.saveBtnText}>บันทึก</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                  <Text style={styles.editBtnText}>แก้ไขข้อมูล</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandMark: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.primaryDark, justifyContent: "center", alignItems: "center", marginRight: 10 },
  brandMarkText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  titleGroup: { flex: 1 },
  eyebrow: { fontSize: 9, letterSpacing: 0.9, fontWeight: "800", color: colors.primary, marginBottom: 1 },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  avatar: {
    minWidth: 38, height: 32, borderRadius: 16,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryLight,
    justifyContent: "center", alignItems: "center",
  },
  avatarIcon: { fontSize: 10, color: colors.primary, fontWeight: "800", paddingHorizontal: 7 },

  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 22, maxHeight: "85%",
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: colors.text },
  closeBtn: { fontSize: 16, color: colors.textMuted },

  avatarBig: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primaryDark,
    justifyContent: "center", alignItems: "center",
    alignSelf: "center", marginBottom: 8,
  },
  avatarBigIcon: { fontSize: 12, color: colors.white, fontWeight: "700" },
  usernameText: {
    textAlign: "center", fontSize: 14,
    fontWeight: "700", color: colors.text, marginBottom: 20,
  },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, marginBottom: 5 },
  fieldValue: { fontSize: 14, color: colors.text, paddingVertical: 6 },
  input: {
    backgroundColor: colors.bgGray, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 13, color: colors.text,
  },

  editBtn: {
    borderWidth: 1, borderColor: colors.primary,
    borderRadius: 12, paddingVertical: 12,
    alignItems: "center", marginTop: 8,
  },
  editBtnText: { color: colors.primary, fontWeight: "700", fontSize: 14 },

  saveBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12, paddingVertical: 12,
    alignItems: "center", marginTop: 8,
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});

export default AppHeader;
