import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { menuService, categoryService, searchMenuItems } from '../../../services/firebase.service';
import { useCartActions } from '../../../hooks/useCart';
import type { MenuItem, Category, RootStackParamList } from '../../../types';
import { COLORS, ERROR_MESSAGES } from '../../../constants';
import { MenuSkeleton } from '../../../components/ui/Skeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function MenuScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addItem } = useCartActions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesData, itemsData] = await Promise.all([
        categoryService.getAll([]),
        menuService.getAll([])
      ]);

      const sortedCategories = categoriesData
        .filter(cat => cat.active)
        .sort((a, b) => a.order - b.order);
      setCategories(sortedCategories);

      const availableItems = itemsData.filter(item => item.available);
      setMenuItems(availableItems);
      setFilteredItems(availableItems);
    } catch (error) {
      console.error('Error loading menu data:', error);
      Alert.alert('Error', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filterByCategory = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    if (categoryId === null) {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === categoryId));
    }
  }, [menuItems]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    if (query.trim() === '') {
      setFilteredItems(menuItems);
      return;
    }
    try {
      const results = await searchMenuItems(query);
      setFilteredItems(results);
    } catch (error) {
      console.error('Error searching menu items:', error);
    }
  }, [menuItems]);

  const handleAddToCart = useCallback((item: MenuItem) => {
    addItem(item, 1);
    // Notificación con personalidad
    Alert.alert('¡A la saca!', `Tu ${item.name} ya está en el carrito. ¡Qué hambre! 🍔`);
  }, [addItem]);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate('MenuDetail', { itemId: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.menuItemImage}
        resizeMode="cover"
      />
      
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={10} color={COLORS.white} />
          <Text style={styles.featuredText}>TOP</Text>
        </View>
      )}

      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.menuItemPrice}>{item.price.toFixed(2)}€</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.mainTitle}>WHY NOT?</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="¿Qué te apetece hoy?"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          onPress={() => filterByCategory(null)}
        >
          <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => filterByCategory(cat.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) return <SafeAreaView style={styles.container}><MenuSkeleton /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>No hay hamburguesas por aquí...</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 16 },
  mainTitle: { fontFamily: 'Anton', fontSize: 40, color: '#000', marginBottom: 15, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Anton', fontSize: 16 },
  categoriesScroll: { marginBottom: 10 },
  categoryChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#F5F5F5', marginRight: 10 },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipText: { fontFamily: 'Anton', fontSize: 14, color: '#666' },
  categoryChipTextActive: { color: '#000' },
  listContent: { paddingBottom: 20 },
  columnWrapper: { paddingHorizontal: 12, justifyContent: 'space-between' },
  menuItem: { width: (width - 40) / 2, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'hidden' },
  menuItemImage: { width: '100%', height: 140 },
  featuredBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  featuredText: { fontSize: 10, fontFamily: 'Anton', marginLeft: 3 },
  menuItemContent: { padding: 12 },
  menuItemName: { fontFamily: 'Anton', fontSize: 16, color: '#000', marginBottom: 4 },
  menuItemPrice: { fontFamily: 'Anton', fontSize: 18, color: COLORS.primary },
  addButton: { position: 'absolute', bottom: 12, right: 12, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontFamily: 'Anton', color: '#CCC', marginTop: 10 },
});
