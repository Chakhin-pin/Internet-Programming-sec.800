import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

const ProductContext = createContext(null);
const CART_KEY = "boxbox_cart";
const FAVORITES_KEY = "boxbox_favorites";
const PREFERENCES_KEY = "boxbox_preferences";

// Configure this per environment in .env (for example EXPO_PUBLIC_API_URL=https://api.example.com).
// The fallback keeps the current development server working, but production should use HTTPS.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://119.59.102.161:3014";
const isWeb = Platform.OS === "web";

const getStoredAuth = async () => {
  if (isWeb) {
    return {
      token: localStorage.getItem("token"),
      userJson: localStorage.getItem("user"),
    };
  }

  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem("token"),
    AsyncStorage.getItem("user"),
  ]);
  return { token, userJson };
};

// ลบ session จาก storage ทั้งสองแบบเสมอ เพราะบนเว็บ token อยู่ใน localStorage
// แต่บน native อยู่ใน AsyncStorage
const clearStoredAuth = async () => {
  await AsyncStorage.multiRemove(["token", "user"]);
  if (isWeb) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [preferences, setPreferences] = useState({ language: "th", profile: {} });

  // สถานะผู้ใช้ที่ login อยู่ (null = ยังไม่ login) + สถานะกำลังเช็ค token ตอนเปิดแอปครั้งแรก
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const isAdmin = user?.role === "admin";

  // ตอนเปิดแอปครั้งแรก เช็คว่ามี token ค้างอยู่จาก session ก่อนหน้าไหม (จำ login ไว้)
  useEffect(() => {
    (async () => {
      try {
        const { token, userJson } = await getStoredAuth();
        if (token && userJson) {
          setUser(JSON.parse(userJson));
        }
      } finally {
        setIsAuthReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const read = async (key, fallback) => {
        const raw = isWeb ? localStorage.getItem(key) : await AsyncStorage.getItem(key);
        try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
      };
      setCart(await read(CART_KEY, []));
      setFavorites(await read(FAVORITES_KEY, []));
      setPreferences(await read(PREFERENCES_KEY, { language: "th", profile: {} }));
    })();
  }, []);

  const persist = async (key, value) => {
    const serialized = JSON.stringify(value);
    if (isWeb) localStorage.setItem(key, serialized);
    else await AsyncStorage.setItem(key, serialized);
  };

  const addToCart = async (product, quantity = 1) => {
    const existing = cart.find((item) => item.id === product.id);
    const next = existing
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...cart, { ...product, quantity }];
    setCart(next);
    await persist(CART_KEY, next);
  };

  const updateCartQuantity = async (id, quantity) => {
    const next = quantity <= 0 ? cart.filter((item) => item.id !== id) : cart.map((item) => item.id === id ? { ...item, quantity } : item);
    setCart(next);
    await persist(CART_KEY, next);
  };

  const clearCart = async () => { setCart([]); await persist(CART_KEY, []); };
  const toggleFavorite = async (id) => {
    const next = favorites.includes(id) ? favorites.filter((favoriteId) => favoriteId !== id) : [...favorites, id];
    setFavorites(next);
    await persist(FAVORITES_KEY, next);
  };
  const updatePreferences = async (changes) => {
    const next = { ...preferences, ...changes, profile: { ...preferences.profile, ...(changes.profile || {}) } };
    setPreferences(next);
    await persist(PREFERENCES_KEY, next);
  };

  // helper ยิง request แนบ JWT ให้อัตโนมัติทุกครั้ง
// ใหม่ (แทนทับ)
  const apiCall = async (path, options = {}) => {
  const token = isWeb
    ? localStorage.getItem("token")
    : await AsyncStorage.getItem("token");
    
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      if (!options.skipAuthRedirect) {
        await clearStoredAuth();
        setUser(null);
      }
      // ใช้รหัสที่แยกได้ชัดเจน เพื่อให้หน้าที่โหลดข้อมูลไม่ log error
      // ในกรณี session หมดอายุ (ระบบจะพาผู้ใช้กลับไป login เอง)
      const authError = new Error(data.error || "UNAUTHORIZED");
      authError.code = "UNAUTHORIZED";
      throw authError;
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed: ${res.status}`);
    }
    return data;
  };
  // เข้าสู่ระบบ: ยิง /api/auth/login แล้วเก็บ token + user ไว้ใน AsyncStorage (จำ login ข้ามการเปิดแอปใหม่)
  const login = async (username, password) => {
  const data = await apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    skipAuthRedirect: true,
  });
  
  // Native has no localStorage. Keep web and native persistence separate.
  await AsyncStorage.setItem("token", data.token);
  await AsyncStorage.setItem("user", JSON.stringify(data.user));
  if (isWeb) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  
  setUser(data.user);
  return data.user;
};

  const logout = async () => {
  await clearStoredAuth();
  setUser(null);
  setProducts([]);
  setTotal(0);
  setFetchError(null);
};

  const changeOwnRole = async (role) => {
    const data = await apiCall("/api/auth/role", {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    if (isWeb) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    setUser(data.user);
  };

  // ดึงรายการสินค้า พร้อม search + pagination
  const loadProducts = async (query = searchQuery, pageNum = 1) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "50",
      });
      if (query.trim()) params.set("q", query.trim());

      const data = await apiCall(`/api/products?${params.toString()}`);
      const items = Array.isArray(data) ? data : data.items || [];

      const mapped = items.map((row) => ({
        id: String(row.id ?? row.Productcode ?? ""),
        name: row.name ?? row.Name ?? "",
        description: row.description ?? "",
        category: row.category ?? row.Category ?? "",
        price: row.price != null && row.price !== "" ? String(Number(row.price)) : "0",
        stockSize: row.stock != null ? String(row.stock) : String(row.Stock ?? ""),
        itemCode: row.productCode ?? "",
        store: row.storeAvailability ?? "",
        photo: row.image ?? row.image_url ?? null,
        brand: row.brand ?? "",
        sizes: row.sizes ?? "",
        location: row.location ?? "",
        orderName: row.orderName ?? "",
        status: row.status ?? "",
      }));

      setProducts(mapped);
      setTotal(data.total ?? mapped.length);
      setPage(pageNum);
    } catch (err) {
      // 401 เป็นการหมดอายุของ session ตามปกติ: apiCall ล้าง token และ
      // setUser(null) แล้ว ทำให้ Expo Router กลับไปหน้า login โดยอัตโนมัติ
      if (err.code !== "UNAUTHORIZED") {
        console.error("Error fetching products:", err);
        setFetchError(err.message || "Unable to load products from backend.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // debounce search: รอ 300ms หลังหยุดพิมพ์ค่อยยิง API (ยิงเฉพาะตอน login แล้วเท่านั้น เพราะ GET ต้องมี JWT)
  useEffect(() => {
    if (!isAuthReady || !user) return;
    const timer = setTimeout(() => {
      loadProducts(searchQuery, 1);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isAuthReady, user]);

  // แปลงฟิลด์จากฟอร์ม UI (stockSize, itemCode, store, photo) ให้ตรงกับชื่อ column ที่ backend ต้องการ
  // (stock, productCode, storeAvailability, image) ก่อนส่งไป API
  const toApiPayload = (form) => ({
    name: form.name,
    description: form.description ?? null,
    category: form.category,
    price: form.price,
    stock: form.stockSize,
    productCode: form.itemCode,
    storeAvailability: form.store,
    image: form.photo,
    status: form.status ?? "Active",
    brand: form.brand ?? null,
    sizes: form.sizes ?? null,
    location: form.location ?? null,
    orderName: form.orderName ?? null,
  });

  const addProduct = async (product) => {
    const data = await apiCall("/api/products", {
      method: "POST",
      body: JSON.stringify(toApiPayload(product)),
    });
    await loadProducts(searchQuery, page);
    return data;
  };

  const updateProduct = async (id, updatedFields) => {
    const data = await apiCall(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(toApiPayload(updatedFields)),
    });
    // ดึงข้อมูลจริงจาก backend กลับมาแสดงใหม่ (แทนที่จะเดาผลลัพธ์เอง)
    // เพื่อให้แน่ใจว่าสิ่งที่เห็นบนหน้าจอตรงกับที่บันทึกจริงใน MySQL เสมอ
    await loadProducts(searchQuery, page);
    return data;
  };

  // ลบสินค้า: ยิง DELETE ไป backend ก่อน สำเร็จค่อยลบออกจาก state
  const deleteProduct = async (id) => {
    try {
      await apiCall(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err; // ให้หน้าจอที่เรียกใช้ไป catch แล้วแสดง Alert เอง
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        total,
        isLoading,
        fetchError,
        searchQuery,
        setSearchQuery,
        page,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        favorites,
        preferences,
        addToCart,
        updateCartQuantity,
        clearCart,
        toggleFavorite,
        updatePreferences,
        user,
        isAdmin,
        isAuthReady,
        login,
        logout,
        changeOwnRole,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProducts ต้องถูกเรียกภายใน <ProductProvider> เท่านั้น");
  }
  return ctx;
};
