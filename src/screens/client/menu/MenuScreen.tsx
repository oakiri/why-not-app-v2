import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { menuService, categoryService, searchMenuItems } from '../../../services/firebase.service';
import { useCartActions } from '../../../hooks/useCart';
import type { MenuItem, Category, RootStackParamList } from '../../../types';
import { COLORS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

  // Load categories and menu items
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesData = await categoryService.getAll([]);
      const sortedCategories = categoriesData
        .filter(cat => cat.active)
        .sort((a, b) => a.order - b.order);
      setCategories(sortedCategories);

      // Load all menu items
      const itemsData = await menuService.getAll([]);
      const availableItems = itemsData.filter(item => item.available);
      setMenuItems(availableItems);
      setFilteredItems(availableItems);

      setLoading(false);
    } catch (error) {
      console.error('Error loading menu data:', error);
      Alert.alert('Error', ERROR_MESSAGES.NETWORK_ERROR);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Filter items by category
  const filterByCategory = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');

    if (categoryId === null) {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item => item.category === categoryId);
      setFilteredItems(filtered);
    }
  }, [menuItems]);

  // Handle search
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

  // Handle add to cart
  const handleAddToCart = useCallback((item: MenuItem) => {
    addItem(item, 1);
    Alert.alert('Éxito', `${item.name} añadido al carrito`);
  }, [addItem]);

  // Handle item press
  const handleItemPress = useCallback((item: MenuItem) => {
    navigation.navigate('MenuDetail', { itemId: item.id });
  }, [navigation]);

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => filterByCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item.id && styles.categoryChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render menu item
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.menuItemImage}
        resizeMode="cover"
      />
      
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color={COLORS.white} />
          <Text style={styles.featuredText}>Destacado</Text>
        </View>
      )}

      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <Text style={styles.menuItemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.allergens && item.allergens.length > 0 && (
          <View style={styles.allergensContainer}>
            <Ionicons name="warning-outline" size={14} color={COLORS.warning} />
            <Text style={styles.allergensText}>
              Contiene alérgenos
            </Text>
          </View>
        )}

        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>{item.price.toFixed(2)}€</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive,
          ]}
          onPress={() => filterByCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === null && styles.categoryChipTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando menú...</Text>
      </View>
    );
  }

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
            <Ionicons name="restaurant-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  menuItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.surface,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
  menuItemContent: {
    padding: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  allergensContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  allergensText: {
    fontSize: 10,
    color: COLORS.warning,
    marginLeft: 4,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
