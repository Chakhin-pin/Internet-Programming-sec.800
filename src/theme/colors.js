// ธีมสีกลาง ใช้ร่วมกันทุกหน้าจอ (โทนม่วงตามภาพต้นแบบ)
export const colors = {
  primary: "#CC9B71",       // ม่วงเข้ม ใช้กับปุ่มหลัก/ตัวหนังสือเน้น
  primaryDark: "#b37d4e",   // ม่วงเข้มขึ้น ใช้กับปุ่ม Save
  primaryLight: "#fcf8f2",  // ม่วงอ่อน ใช้กับพื้นหลังการ์ด
  primarySoft: "#ffffff",   // ม่วงอ่อนมาก
  white: "#FFFFFF",
  bgGray: "#F7F7FA",        // เทาอ่อน ใช้กับพื้นหลัง input
  border: "#ECECF1",
  text: "#1F1147",          // ตัวหนังสือหลัก (ม่วงเข้มเกือบดำ)
  textMuted: "#8B8B99",     // ตัวหนังสือรอง/placeholder
  success: "#12B76A",       // สีเขียว ใช้กับ % เพิ่มขึ้น / checkmark
  amber: "#B45309",         // สีน้ำตาลส้ม ใช้กับ Item categories / รายชื่อสาขา
};

// สีชุดกราฟแท่ง (จากอ่อนไปเข้ม) ใช้กับ Revenue stacked chart
export const chartPalette = ["#FFF4C7", "#deb28c", "#CC9B71", "#b37d4e"]; 