import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
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

// Alert.alert ของ React Native ไม่แสดงผลบนเว็บ (react-native-web) เลย แม้จะมีปุ่มเดียวก็ตาม
// เลยต้องสลับไปใช้ window.alert บนเว็บ ไม่งั้นข้อความ "กรอกไม่ครบ"/"สำเร็จ"/"ผิดพลาด" จะเงียบหายไปหมด
const showAlert = (title, message, onOk) => {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    onOk?.();
    return;
  }
  Alert.alert(title, message, onOk ? [{ text: "ตกลง", onPress: onOk }] : undefined);
};

// รายการฟิลด์แบบ input ธรรมดา (เหมือนกับ AddProductScreen ทุกประการ)
const FIELDS = [
  { key: "name", label: "Name*", multiline: false, required: true },
  { key: "description", label: "Description", multiline: true, required: false },
  { key: "category", label: "Category*", multiline: false, required: true },
  { key: "price", label: "Price*", multiline: false, required: true },
  { key: "itemCode", label: "Item code*", multiline: false, required: true },
  { key: "stockSize", label: "Stock size*", multiline: false, required: true },
];

// สาขาที่มีให้เลือก (แตะที่ dropdown เพื่อวนเลือกทีละสาขา)
const STORES = ["สาขาบางนา กรุงเทพฯ", "สาขารังสิต ปทุมธานี", "สาขาระยอง", "สาขาชลบุรี"];

const EditProductScreen = () => {
  // ต้อง navigate มาหน้านี้ด้วย router.push({ pathname: "/edit-product", params: { id: product.id } })
  const { id } = useLocalSearchParams();
  const { products, updateProduct, deleteProduct } = useProducts();

  const existingProduct = products.find((p) => p.id === id);

  // เติมข้อมูลเดิมของสินค้าเข้าฟอร์มตั้งแต่แรกที่เปิดหน้า
  const [form, setForm] = useState(() => ({ ...existingProduct }));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // แตะ dropdown แต่ละครั้งจะวนไปสาขาถัดไป
  const cycleStore = () => {
    const currentIndex = STORES.indexOf(form.store);
    const nextStore = STORES[(currentIndex + 1) % STORES.length];
    update("store", nextStore);
  };

  // เลือกรูปจากคลังภาพในเครื่อง (ต้องขอสิทธิ์ก่อน)
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

  // วางรูปที่คัดลอกมาจากเว็บ/แอปอื่น
  const pasteFromClipboard = async () => {
    const hasImage = await Clipboard.hasImageAsync();
    if (!hasImage) {
      showAlert(
        "ไม่พบรูปใน Clipboard",
        "ลอง copy รูปจากเว็บก่อน (กดค้างที่รูป > Copy image) แล้วค่อยกดปุ่มนี้อีกครั้ง"
      );
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
    if (isSaving) return; // กันกดซ้ำระหว่างกำลังบันทึก

    const missing = FIELDS.filter((f) => f.required && !form[f.key]?.trim());
    if (!form.store) missing.push({ label: "Stores availability*" });
    if (!form.photo) missing.push({ label: "Product photos*" });

    if (missing.length > 0) {
      showAlert(
        "กรอกข้อมูลไม่ครบ",
        `กรุณากรอก: ${missing.map((f) => f.label.replace("*", "")).join(", ")}`
      );
      return;
    }

    setIsSaving(true);
    try {
      // อัปเดตสินค้าตัวเดิมผ่าน backend ด้วย id เดิม แล้วเด้งกลับไปหน้า Product list
      await updateProduct(id, {
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price,
        itemCode: form.itemCode,
        stockSize: form.stockSize,
        store: form.store,
        photo: form.photo,
      });

      showAlert("สำเร็จ", "แก้ไขสินค้าเรียบร้อยแล้ว", () => router.push("/products"));
    } catch (err) {
      showAlert("บันทึกไม่สำเร็จ", err.message || "ไม่สามารถแก้ไขสินค้าได้ ลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // หมายเหตุ: Alert.alert แบบมีปุ่มเลือก (ยกเลิก/ลบ) ใช้ไม่ได้บนเว็บ (react-native-web)
  // เลยต้องเช็ค Platform แล้วใช้ window.confirm แทนเวลารันบนเว็บ ไม่งั้นปุ่ม "ลบสินค้านี้" จะกดไม่ได้เลย
  const handleDelete = () => {
    if (isDeleting) return;

    const runDelete = async () => {
      setIsDeleting(true);
      try {
        await deleteProduct(id);
        router.push("/products");
      } catch (err) {
        showAlert("ลบไม่สำเร็จ", err.message || "ลบสินค้าไม่สำเร็จ");
      } finally {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?");
      if (confirmed) runDelete();
      return;
    }

    Alert.alert("ยืนยันการลบ", "ต้องการลบสินค้านี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: runDelete },
    ]);
  };

  // กรณีเปิดหน้านี้ด้วย id ที่หาไม่เจอในรายการสินค้า
  if (!existingProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Edit product" />
        <View style={styles.notFoundBox}>
          <Text style={styles.notFoundText}>ไม่พบสินค้าที่ต้องการแก้ไข</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/products")}
          >
            <Text style={styles.backButtonText}>กลับไปหน้ารายการสินค้า</Text>
          </TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Edit product" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.pageIntro}><Text style={styles.pageTitle}>แก้ไขสินค้า</Text><Text style={styles.pageSubtitle}>อัปเดตรายละเอียดและจำนวนคงเหลือของรายการนี้</Text></View>
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

        {/* Dropdown สำหรับเลือกสาขาที่มีสินค้า */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Stores availability*</Text>
          <TouchableOpacity style={styles.dropdown} onPress={cycleStore}>
            <Text style={styles.dropdownText}>
              {form.store || "แตะเพื่อเลือกสาขา"}
            </Text>
            <Text style={styles.dropdownArrow}>⌄</Text>
          </TouchableOpacity>
        </View>

        {/* กล่องอัปโหลดรูปสินค้า */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Product photos*</Text>

          {form.photo ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: form.photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.photoRemoveButton}
                onPress={() => update("photo", null)}
              >
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
            <Text style={styles.saveButtonText}>Save changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <ActivityIndicator size="small" color="#e53935" />
          ) : (
            <Text style={styles.deleteButtonText}>ลบสินค้านี้</Text>
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
  label: {
    fontSize: 12, fontWeight: "800", color: colors.text, marginBottom: 7,
  },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12,
    fontSize: 13,
    color: colors.text,
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
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
  photoPreview: {
    width: "100%",
    height: 180, borderRadius: 12,
    backgroundColor: colors.bgGray,
  },
  photoRemoveButton: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  photoRemoveText: { fontSize: 12, color: colors.textMuted },
  photoButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoActionButton: {
    flex: 1,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryLight,
    borderRadius: 11, paddingVertical: 11,
    alignItems: "center",
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 13, paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  deleteButton: {
    borderRadius: 13, paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e53935",
  },
  deleteButtonText: { color: "#e53935", fontSize: 14, fontWeight: "700" },
  notFoundBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  backButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
});

export default EditProductScreen;
