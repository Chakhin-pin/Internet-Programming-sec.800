import { router } from 'expo-router';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import { useProducts } from '../context/ProductContext';
import { colors } from '../theme/colors';

const CATEGORIES = [
  { id: '1', name: 'สินค้าขายดี', emoji: '🔥', filterFn: (products) => products.filter(p => p.isBestseller) },
  { id: '2', name: 'ทำจากไม้',    emoji: '🪵', filterFn: (products) => products.filter(p => p.category === 'ทำจากไม้') },
  { id: '3', name: 'ทำงานเหล็ก',  emoji: '🔧', filterFn: (products) => products.filter(p => p.category === 'ทำงานเหล็ก') },
  { id: '4', name: 'ทำจากพลาสติก',emoji: '♻️', filterFn: (products) => products.filter(p => p.category === 'ทำจากพลาสติก') },
];

export default function CategoriesScreen() {
  const { products } = useProducts();

  const renderItem = ({ item }) => {
    const count = item.filterFn(products).length;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/products', params: { category: item.name } })}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.count}>{count} รายการ</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="หมวดหมู่" />
      <View style={styles.intro}><Text style={styles.header}>เลือกหมวดหมู่สินค้า</Text><Text style={styles.subheader}>ดูรายการสินค้าแยกตามประเภท</Text></View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgGray },
  intro: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14 },
  header: { fontSize: 22, fontWeight: '800', color: colors.text },
  subheader: { fontSize: 13, color: colors.textMuted, marginTop: 5 },
  list: { paddingHorizontal: 20, paddingBottom: 28, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 16, gap: 14, shadowColor: colors.shadow, shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  emoji: { fontSize: 30, width: 45, height: 45, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.primarySoft, borderRadius: 13 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  count: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
