import { router } from "expo-router";
import { useState } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";
import { useAppLanguage } from "../i18n";

const paymentQr = require("../../assets/images/payment-qr.jpg");
export default function CheckoutScreen() {
  const { cart, clearCart } = useProducts(); const [paid, setPaid] = useState(false);
  const { t } = useAppLanguage();
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const pay = async () => { await clearCart(); setPaid(true); };
  return <SafeAreaView style={styles.container}><AppHeader /><ScrollView contentContainerStyle={styles.scroll}>{paid ? <View style={styles.complete}><Text style={styles.completeIcon}>✓</Text><Text style={styles.title}>{t("paymentSuccess")}</Text><Text style={styles.description}>{t("orderRecorded")}</Text><TouchableOpacity style={styles.button} onPress={() => router.replace("/")}><Text style={styles.buttonText}>{t("returnHome")}</Text></TouchableOpacity></View> : <View style={styles.card}><Text style={styles.title}>{t("checkout")}</Text><Text style={styles.description}>{t("scanQr")} ฿{total.toLocaleString("th-TH")}</Text><Image source={paymentQr} style={styles.qrImage} /><Text style={styles.caption}>{t("testQr")}</Text><TouchableOpacity style={styles.button} onPress={pay} disabled={!cart.length}><Text style={styles.buttonText}>{t("confirmPayment")}</Text></TouchableOpacity></View>}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bgGray }, scroll: { padding: 20, alignItems: "center", justifyContent: "center", flexGrow: 1 }, card: { width: "100%", maxWidth: 420, padding: 24, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.white }, complete: { width: "100%", maxWidth: 420, padding: 32, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.white }, title: { color: colors.text, fontSize: 24, fontWeight: "700" }, description: { color: colors.textMuted, textAlign: "center", fontSize: 13, lineHeight: 20, marginTop: 8 }, qrImage: { width: 225, height: 225, marginTop: 24, resizeMode: "contain" }, caption: { color: colors.textMuted, fontSize: 11, textAlign: "center", marginTop: 15 }, button: { width: "100%", minHeight: 46, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 22 }, buttonText: { color: colors.white, fontWeight: "700" }, completeIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.success, color: colors.white, textAlign: "center", textAlignVertical: "center", fontSize: 27, fontWeight: "700", marginBottom: 15 }, });
