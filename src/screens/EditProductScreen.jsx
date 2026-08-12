import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
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
  // (หรือ path ตาม routing ของโปรเจกต์ เช่น /products/[id]/edit)
  const { id } = useLocalSearchParams();
  const { products, updateProduct, deleteProduct } = useProducts();

  const existingProduct = products.find((p) => p.id === id);

  // เติมข้อมูลเดิมของสินค้าเข้าฟอร์มตั้งแต่แรกที่เปิดหน้า
  const [form, setForm] = useState(() => ({ ...existingProduct }));

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
      Alert.alert("ต้องขออนุญาต", "กรุณาอนุญาตให้แอปเข้าถึงคลังภาพในตั้งค่าเครื่อง");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      update("photo", result.assets[0].uri);
    }
  };

  // วางรูปที่คัดลอกมาจากเว็บ/แอปอื่น
  const pasteFromClipboard = async () => {
    const hasImage = await Clipboard.hasImageAsync();
    if (!hasImage) {
      Alert.alert(
        "ไม่พบรูปใน Clipboard",
        "ลอง copy รูปจากเว็บก่อน (กดค้างที่รูป > Copy image) แล้วค่อยกดปุ่มนี้อีกครั้ง"
      );
      return;
    }

    const clipboardImage = await Clipboard.getImageAsync({ format: "png" });
    if (clipboardImage?.data) {
      update("photo", clipboardImage.data);
    }
  };

  const handleSave = () => {
    const missing = FIELDS.filter((f) => f.required && !form[f.key]?.trim());
    if (!form.store) missing.push({ label: "Stores availability*" });
    if (!form.photo) missing.push({ label: "Product photos*" });

    if (missing.length > 0) {
      Alert.alert(
        "กรอกข้อมูลไม่ครบ",
        `กรุณากรอก: ${missing.map((f) => f.label.replace("*", "")).join(", ")}`
      );
      return;
    }

    // อัปเดตสินค้าตัวเดิมใน Context ด้วย id เดิม แล้วเด้งกลับไปหน้า Product list
    updateProduct(id, {
      name: form.name,
      description: form.description,
      category: form.category,
      price: form.price,
      itemCode: form.itemCode,
      stockSize: form.stockSize,
      store: form.store,
      photo: form.photo,
    });

    Alert.alert("สำเร็จ", "แก้ไขสินค้าเรียบร้อยแล้ว", [
      { text: "ตกลง", onPress: () => router.push("/products") },
    ]);
  };

  // หมายเหตุ: Alert.alert แบบมีปุ่มเลือก (ยกเลิก/ลบ) ใช้ไม่ได้บนเว็บ (react-native-web)
  // เลยต้องเช็ค Platform แล้วใช้ window.confirm แทนเวลารันบนเว็บ ไม่งั้นปุ่ม "ลบสินค้านี้" จะกดไม่ได้เลย
  const handleDelete = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?");
      if (confirmed) {
        deleteProduct(id);
        router.push("/products");
      }
      return;
    }

    Alert.alert("ยืนยันการลบ", "ต้องการลบสินค้านี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          deleteProduct(id);
          router.push("/products");
        },
      },
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
        {FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.inputMultiline]}
              value={form[field.key] || ""}
              onChangeText={(v) => update(field.key, v)}
              multiline={field.multiline}
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>ลบสินค้านี้</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 18, paddingBottom: 30 },
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  dropdown: {
    backgroundColor: colors.bgGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: { fontSize: 13, color: colors.textMuted },
  dropdownArrow: { fontSize: 13, color: colors.textMuted },
  photoBox: {
    backgroundColor: colors.bgGray,
    borderRadius: 10,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  photoIcon: { fontSize: 22, marginBottom: 4 },
  photoText: { fontSize: 12, color: colors.textMuted },
  photoPreviewWrap: { marginBottom: 10 },
  photoPreview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
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
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  photoActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 14,
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