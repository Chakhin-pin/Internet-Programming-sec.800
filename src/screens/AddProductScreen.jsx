import { Picker } from "@react-native-picker/picker";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
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

const showAlert = (title, message, onOk) => {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    onOk?.();
    return;
  }
  Alert.alert(title, message, onOk ? [{ text: "ตกลง", onPress: onOk }] : undefined);
};

const CATEGORIES = ["ทำจากไม้", "ทำงานเหล็ก", "ทำจากพลาสติก"];

const FIELDS = [
  { key: "name",        label: "Name*",        multiline: false, required: true },
  { key: "description", label: "Description",  multiline: true,  required: false },
  { key: "price",       label: "Price*",       multiline: false, required: true },
  { key: "itemCode",    label: "Item code*",   multiline: false, required: true },
  { key: "stockSize",   label: "Stock size*",  multiline: false, required: true },
];

const STORES = ["สาขาบางนา กรุงเทพฯ", "สาขารังสิต ปทุมธานี", "สาขาระยอง", "สาขาชลบุรี"];

const AddProductScreen = () => {
  const [form, setForm] = useState({ category: CATEGORIES[0] }); // default category
  const [isSaving, setIsSaving] = useState(false);
  const { addProduct } = useProducts();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const cycleStore = () => {
    const currentIndex = STORES.indexOf(form.store);
    const nextStore = STORES[(currentIndex + 1) % STORES.length];
    update("store", nextStore);
  };

  const pickFromDevice = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("ต้องขออนุญาต", "กรุณาอนุญาตให้แอปเข้าถึงคลังภาพในตั้งค่าเครื่อง");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (!asset.base64) {
        showAlert("เลือกรูปไม่สำเร็จ", "ไม่สามารถเตรียมรูปภาพเพื่อบันทึกได้ กรุณาลองเลือกรูปอีกครั้ง");
        return;
      }
      update("photo", `data:image/jpeg;base64,${asset.base64}`);
    }
  };

  const pasteFromClipboard = async () => {
    const hasImage = await Clipboard.hasImageAsync();
    if (!hasImage) {
      showAlert("ไม่พบรูปใน Clipboard", "ลอง copy รูปจากเว็บก่อน แล้วค่อยกดปุ่มนี้อีกครั้ง");
      return;
    }
    const clipboardImage = await Clipboard.getImageAsync({ format: "png" });
    if (clipboardImage?.data) {
      const dataUri = clipboardImage.data.startsWith("data:")
        ? clipboardImage.data
        : `data:image/png;base64,${clipboardImage.data}`;
      update("photo", dataUri);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    const missing = FIELDS.filter((f) => f.required && !form[f.key]?.trim());
    if (!form.store)  missing.push({ label: "Stores availability*" });
    if (!form.photo)  missing.push({ label: "Product photos*" });

    if (missing.length > 0) {
      showAlert("กรอกข้อมูลไม่ครบ", `กรุณากรอก: ${missing.map((f) => f.label.replace("*", "")).join(", ")}`);
      return;
    }

    const price = Number(form.price);
    const stockSize = Number(form.stockSize);
    if (!Number.isFinite(price) || price < 0) {
      showAlert("ราคาไม่ถูกต้อง", "กรุณากรอกราคาเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");
      return;
    }
    if (!Number.isInteger(stockSize) || stockSize < 0) {
      showAlert("จำนวนสต็อกไม่ถูกต้อง", "กรุณากรอกจำนวนสต็อกเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป");
      return;
    }

    setIsSaving(true);
    try {
      await addProduct({
        name:        form.name.trim(),
        description: form.description?.trim(),
        category:    form.category,   // ← ส่ง category จาก Picker
        price,
        itemCode:    form.itemCode.trim(),
        stockSize,
        store:       form.store,
        photo:       form.photo,
      });

      setForm({ category: CATEGORIES[0] });
      showAlert("สำเร็จ", "เพิ่มสินค้าเรียบร้อยแล้ว", () => router.push("/products"));
    } catch (err) {
      showAlert("บันทึกไม่สำเร็จ", err.message || "ไม่สามารถเพิ่มสินค้าได้ ลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Add product" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.pageIntro}><Text style={styles.pageTitle}>เพิ่มสินค้าใหม่</Text><Text style={styles.pageSubtitle}>กรอกรายละเอียดเพื่อเพิ่มสินค้าเข้าสู่คลัง</Text></View>

        {/* TextInput fields ปกติ (ไม่มี category แล้ว) */}
        {FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.inputMultiline]}
              value={form[field.key] || ""}
              onChangeText={(v) => update(field.key, v)}
              multiline={field.multiline}
              keyboardType={field.key === "price" || field.key === "stockSize" ? "numeric" : "default"}
            />
          </View>
        ))}

        {/* Picker สำหรับ Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category*</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.category}
              onValueChange={(val) => update("category", val)}
            >
              {CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Dropdown สาขา */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Stores availability*</Text>
          <TouchableOpacity style={styles.dropdown} onPress={cycleStore}>
            <Text style={styles.dropdownText}>{form.store || "แตะเพื่อเลือกสาขา"}</Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
        </View>

        {/* อัปโหลดรูป */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Product photos*</Text>
          {form.photo ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: form.photo }} style={styles.photoPreview} />
              <TouchableOpacity style={styles.photoRemoveButton} onPress={() => update("photo", null)}>
                <Text style={styles.photoRemoveText}>✕ เอารูปออก</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoBox}>
              <Text style={styles.photoIcon}>🖼️</Text>
              <Text style={styles.photoText}>ยังไม่มีรูปสินค้า</Text>
            </View>
          )}
          <View style={styles.photoButtonRow}>
            <TouchableOpacity style={styles.photoActionButton} onPress={pickFromDevice}>
              <Text style={styles.photoActionText}>📁 เลือกจากเครื่อง</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionButton} onPress={pasteFromClipboard}>
              <Text style={styles.photoActionText}>📋 วางรูปจากเว็บ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save product</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgGray },
  scroll: { padding: 20, paddingBottom: 30 },
  pageIntro: { marginBottom: 22 }, pageTitle: { fontSize: 23, fontWeight: "800", color: colors.text }, pageSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 5 },
  fieldGroup: { marginBottom: 17 },
  label: { fontSize: 12, fontWeight: "800", color: colors.text, marginBottom: 7 },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12,
    fontSize: 13,
    color: colors.text,
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  pickerWrapper: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdown: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 13, paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: { fontSize: 13, color: colors.text },
  dropdownArrow: { fontSize: 13, color: colors.textMuted },
  photoBox: {
    backgroundColor: colors.white, borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary,
    borderRadius: 12, height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  photoIcon: { fontSize: 22, marginBottom: 4 },
  photoText: { fontSize: 12, color: colors.textMuted },
  photoPreviewWrap: { marginBottom: 10 },
  photoPreview: { width: "100%", height: 180, borderRadius: 12, backgroundColor: colors.bgGray },
  photoRemoveButton: { alignSelf: "flex-start", marginTop: 6 },
  photoRemoveText: { fontSize: 12, color: colors.textMuted },
  photoButtonRow: { flexDirection: "row", gap: 10 },
  photoActionButton: {
    flex: 1,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryLight,
    borderRadius: 11, paddingVertical: 11,
    alignItems: "center",
  },
  photoActionText: { fontSize: 12, fontWeight: "600", color: colors.primary },
  saveButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 13, paddingVertical: 15, alignItems: "center", marginTop: 8,
  },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: "700" },
});

export default AddProductScreen;
