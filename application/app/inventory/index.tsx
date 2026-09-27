import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const pages = [
  ['item-category', 'Item Category'],
  ['add-item', 'Add Item'],
  ['item-bundle', 'Item Bundle'],
  ['supplier-list', 'Supplier List'],
  ['purchase', 'Purchase'],
  ['sell', 'Sell'],
  ['sell-collection', 'Sell Collection Report'],
  ['cancelled-invoice', 'Cancelled Invoice'],
  ['return-invoice', 'Return Invoice Report'],
  ['item-receive-sell', 'Item Receive Sell Report'],
];

export default function InventoryIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Inventory</Text>
      <FlatList
        data={pages}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/inventory/${item[0]}` as any)}>
            <Text style={styles.title}>{item[1]}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 },
  heading: { color: '#173452', fontSize: 26, fontWeight: '700', marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: '#334155', fontSize: 16, fontWeight: '700' },
  arrow: { color: '#f4512c', fontSize: 24 },
});
