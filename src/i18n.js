import { useProducts } from "./context/ProductContext";

const translations = {
  th: {
    home: "หน้าแรก", products: "สินค้า", overview: "ภาพรวม", categories: "หมวดหมู่", account: "บัญชี", cart: "รถเข็น", addProduct: "เพิ่มสินค้า",
    inventoryOverview: "ภาพรวมคลังสินค้า", manageProducts: "จัดการสินค้า\nอย่างเป็นระเบียบ", customerTitle: "เลือกสินค้าที่\nคุณต้องการ", manageSubtitle: "ตรวจสอบรายการสินค้า ค้นหา และอัปเดตสต็อกของคุณได้จากที่เดียว", customerSubtitle: "ดูรายละเอียดสินค้า เพิ่มลงรถเข็น และชำระเงินได้ในที่เดียว",
    search: "ค้นหา", searchPlaceholder: "ค้นหาชื่อสินค้า หมวดหมู่ หรือรหัสสินค้า", welcome: "ยินดีต้อนรับ", inventoryStatus: "สถานะคลังสินค้า", currentData: "ข้อมูลจากรายการสินค้าปัจจุบัน", viewOverview: "ดูภาพรวม", productItems: "รายการสินค้า", unitsInStock: "ชิ้นในคลัง", categoriesCount: "หมวดหมู่", productList: "รายการสินค้า", savedData: "แสดงจากข้อมูลที่บันทึกไว้", viewAll: "ดูทั้งหมด", details: "ดูรายละเอียด", remaining: "คงเหลือ", lowStock: "สินค้าใกล้หมด", check: "ตรวจสอบ",
    backProducts: "กลับไปสินค้าทั้งหมด", unavailable: "ไม่พบสินค้า", status: "สถานะสินค้า", inStock: "มีสินค้า", outOfStock: "สินค้าหมด", addToCart: "ใส่รถเข็น", editProduct: "แก้ไขสินค้า", brand: "แบรนด์", size: "ขนาด", storageLocation: "ตำแหน่งจัดเก็บ",
    yourCart: "รถเข็นของคุณ", cartEmpty: "ยังไม่มีสินค้าในรถเข็น", chooseProducts: "เลือกสินค้า", orderSummary: "สรุปคำสั่งซื้อ", items: "สินค้า", total: "ยอดรวม", payment: "ชำระเงิน", remove: "ลบ", checkout: "ชำระเงิน", scanQr: "สแกน QR เพื่อชำระเงิน จำนวน", testQr: "QR สำหรับทดสอบเท่านั้น ไม่มีการตัดเงินจริง", confirmPayment: "ยืนยันการชำระเงิน", paymentSuccess: "ชำระเงินสำเร็จ", orderRecorded: "รายการสั่งซื้อของคุณได้รับการบันทึกแล้ว", returnHome: "กลับหน้าแรก",
    accountTitle: "บัญชีผู้ใช้", administrator: "ผู้ดูแลระบบ", customer: "ลูกค้า", personalSettings: "ข้อมูลส่วนตัว", editProfile: "แก้ไขข้อมูล", save: "บันทึก", name: "ชื่อ", email: "อีเมล", username: "ชื่อผู้ใช้", role: "สิทธิ์", orders: "การสั่งซื้อ", pendingPayment: "สินค้าที่รอชำระ", cartItems: "สินค้าในรถเข็น", signOut: "ออกจากระบบ", language: "ภาษา", login: "เข้าสู่ระบบ", loginWelcome: "ยินดีต้อนรับกลับมา", loginSubtitle: "เข้าสู่ BOXBOX เพื่อดูแลคลังสินค้าของคุณ", password: "รหัสผ่าน",
  },
  en: {
    home: "Home", products: "Products", overview: "Overview", categories: "Categories", account: "Account", cart: "Cart", addProduct: "Add product",
    inventoryOverview: "Inventory overview", manageProducts: "Manage products\nwith confidence", customerTitle: "Choose products\nfor your home", manageSubtitle: "Review products, search, and update stock from one place.", customerSubtitle: "Browse products, add them to your cart, and pay in one place.",
    search: "Search", searchPlaceholder: "Search product, category, or code", welcome: "Welcome", inventoryStatus: "Inventory status", currentData: "Based on current product data", viewOverview: "View overview", productItems: "Products", unitsInStock: "Units in stock", categoriesCount: "Categories", productList: "Products", savedData: "From saved product data", viewAll: "View all", details: "View details", remaining: "Remaining", lowStock: "Low stock", check: "Review",
    backProducts: "Back to all products", unavailable: "Product not found", status: "Product status", inStock: "In stock", outOfStock: "Out of stock", addToCart: "Add to cart", editProduct: "Edit product", brand: "Brand", size: "Size", storageLocation: "Storage location",
    yourCart: "Your cart", cartEmpty: "Your cart is empty", chooseProducts: "Browse products", orderSummary: "Order summary", items: "Items", total: "Total", payment: "Payment", remove: "Remove", checkout: "Checkout", scanQr: "Scan the QR code to pay", testQr: "Test QR only. No real payment is processed.", confirmPayment: "Confirm payment", paymentSuccess: "Payment successful", orderRecorded: "Your order has been recorded.", returnHome: "Back to home",
    accountTitle: "Account", administrator: "Administrator", customer: "Customer", personalSettings: "Personal settings", editProfile: "Edit profile", save: "Save", name: "Name", email: "Email", username: "Username", role: "Role", orders: "Orders", pendingPayment: "Pending payment", cartItems: "Cart items", signOut: "Sign out", language: "Language", login: "Sign in", loginWelcome: "Welcome back", loginSubtitle: "Sign in to BOXBOX to manage your inventory.", password: "Password",
  },
};

export const useAppLanguage = () => {
  const { preferences } = useProducts();
  const language = preferences.language === "en" ? "en" : "th";
  return { language, t: (key) => translations[language][key] || translations.th[key] || key };
};
