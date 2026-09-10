import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useProducts } from "../context/ProductContext";
import { colors } from "../theme/colors";

// Alert.alert ไม่แสดงผลบนเว็บ (react-native-web) เลย เลยต้องสลับไปใช้ window.alert แทนตอนรันบนเว็บ
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};

const LoginScreen = () => {
  const { login } = useProducts();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;

    if (!username.trim() || !password.trim()) {
      showAlert("กรอกข้อมูลไม่ครบ", "กรุณากรอก username และ password");
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
      router.replace("/");
    } catch (err) {
      showAlert("เข้าสู่ระบบไม่สำเร็จ", err.message || "username หรือ password ไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Boxbox</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อจัดการสินค้า</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="กรอก username"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="กรอก password"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryDark,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 30,
  },
  fieldGroup: { marginBottom: 16 },
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
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: { color: colors.white, fontSize: 14, fontWeight: "700" },
});

export default LoginScreen;