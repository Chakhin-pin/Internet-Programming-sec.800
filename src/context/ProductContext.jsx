import { createContext, useContext, useState } from "react";

// Context กลางสำหรับเก็บรายการสินค้า ใช้ร่วมกันได้ทุกหน้าจอ
const ProductContext = createContext(null);

// ตัวอย่างสินค้าเริ่มต้น (mock data) ให้หน้า Product list ไม่ว่างเปล่าตั้งแต่แรก
const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "ราวแขวนเสื้อสแตนเลส 2 ชั้น",
    category: "ราวแขวนเสื้อ",
    price: "1,290",
    stockSize: "24",
  },
  {
    id: "p2",
    name: "ไม้แขวนเสื้อไม้โอ๊ค",
    category: "ไม้แขวนเสื้อ",
    price: "89",
    stockSize: "150",
  },
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // เพิ่มสินค้าใหม่เข้าไปในรายการ (เติม id ให้อัตโนมัติจากเวลาปัจจุบัน)
  const addProduct = (product) => {
    setProducts((prev) => [
      { ...product, id: String(Date.now()) },
      ...prev,
    ]);
  };

  // แก้ไขสินค้าที่มีอยู่แล้วด้วย id (ใช้กับหน้า Edit product)
  // updatedFields = เฉพาะฟิลด์ที่เปลี่ยน จะถูก merge ทับของเดิม
  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  // ลบสินค้าออกจากรายการด้วย id
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Hook ไว้เรียกใช้ products/addProduct/updateProduct จากหน้าไหนก็ได้
export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProducts ต้องถูกเรียกภายใน <ProductProvider> เท่านั้น");
  }
  return ctx;
};