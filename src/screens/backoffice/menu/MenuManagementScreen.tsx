import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { colors } from '../../../theme/theme';
import { MenuItem } from '../../../types';
import { Ionicons } from '@expo/vector-icons';

export default function MenuManagementScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'menuItems'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
      setItems(list);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el menú.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'menuItems', itemId), { available: !currentStatus });
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, available: !currentStatus } : item));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la disponibilidad.');
    }
  };

  const handleSave = async () => {
    if (!editingItem?.name || !editingItem?.price) {
      Alert.alert('Error', 'Nombre y precio son obligatorios.');
      return;
    }

    try {
      if (editingItem.id) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), editingItem);
      } else {
        await addDoc(collection(db, 'menuItems'), { ...editingItem, available: true });
      }
      setModalVisible(false);
      fetchMenu();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    }
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price}€</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{item.available ? 'Disponible' : 'Agotado'}</Text>
          <Switch 
            value={item.available} 
            onValueChange={() => toggleAvailability(item.id, item.available)}
            trackColor={{ false: '#DDD', true: colors.primary }}
          />
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => { setEditingItem(item); setModalVisible(true); }}>
          <Ionicons name="pencil" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert('Eliminar', '¿Seguro?', [
            { text: 'No' },
            { text: 'Sí', onPress: async () => {
              await deleteDoc(doc(db, 'menuItems', item.id));
              fetchMenu();
            }}
          ]);
        }}>
          <Ionicons name="trash" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GESTIÓN DE MENÚ</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { setEditingItem({}); setModalVisible(true); }}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingItem?.id ? 'Editar Producto' : 'Nuevo Producto'}</Text>
          
          <Text style={styles.label}>Nombre</Text>
          <TextInput 
            style={styles.input} 
            value={editingItem?.name} 
            onChangeText={t => setEditingItem(prev => ({ ...prev, name: t }))} 
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput 
            style={[styles.input, { height: 80 }]} 
            multiline 
            value={editingItem?.description} 
            onChangeText={t => setEditingItem(prev => ({ ...prev, description: t }))} 
          />

          <Text style={styles.label}>Precio (€)</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            value={editingItem?.price?.toString()} 
            onChangeText={t => setEditingItem(prev => ({ ...prev, price: parseFloat(t) }))} 
          />

          <Text style={styles.label}>Categoría</Text>
          <TextInput 
            style={styles.input} 
            value={editingItem?.category} 
            onChangeText={t => setEditingItem(prev => ({ ...prev, category: t }))} 
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'Anton', fontSize: 24, color: '#000' },
  addButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontFamily: 'Anton', fontSize: 16 },
  price: { color: colors.primary, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusLabel: { fontSize: 12, color: '#666', marginRight: 8 },
  actions: { flexDirection: 'row', gap: 15 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  modalTitle: { fontFamily: 'Anton', fontSize: 28, marginBottom: 20 },
  label: { fontFamily: 'Anton', fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: 'Anton' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20, paddingBottom: 40 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  cancelBtnText: { fontFamily: 'Anton', color: '#666' },
  saveBtn: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center' },
  saveBtnText: { fontFamily: 'Anton', color: '#000' },
});
