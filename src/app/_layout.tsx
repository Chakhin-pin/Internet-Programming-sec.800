import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { ProductProvider, useProducts } from "../context/ProductContext";

function AppLayout() {
  const { user, isAuthReady } = useProducts();
  const segments = useSegments();

  useEffect(() => {
    if (!isAuthReady) return;

    const isLoginPage = segments[0] === "login";

    if (!user && !isLoginPage) {
      router.replace("/login");
    }
  }, [user, isAuthReady, segments]);

  if (!isAuthReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ProductProvider>
      <AppLayout />
    </ProductProvider>
  );
}