import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";

// Header ใช้ร่วมกันทุกหน้า: ปุ่มเมนู - ชื่อหน้า - ไอคอนโปรไฟล์
const AppHeader = ({ title, onMenuPress, onAvatarPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.avatar} onPress={onAvatarPress}>
        <Text style={styles.avatarIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  iconButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  menuIcon: {
    fontSize: 20,
    color: colors.text,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarIcon: {
    fontSize: 15,
    color: colors.white,
  },
});

export default AppHeader;