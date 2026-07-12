import { Stack } from "expo-router";
import { ProductProvider } from "../context/ProductContext";

export default function RootLayout() {
  return (
    <ProductProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProductProvider>
  );
}