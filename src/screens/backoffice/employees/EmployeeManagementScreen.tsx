import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Switch,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { colors } from '../../../theme/theme';
import { UserProfile, EmployeePermissions } from '../../../types';
import { Ionicons } from '@expo/vector-icons';

export default function EmployeeManagementScreen() {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', 'in', ['empleado', 'master']));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      setEmployees(list);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los empleados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const togglePermission = async (employeeId: string, permission: keyof EmployeePermissions) => {
    const employee = employees.find(e => e.uid === employeeId);
    if (!employee) return;

    const newPermissions = {
      ...employee.permissions,
      [permission]: !employee.permissions?.[permission]
    };

    try {
      await updateDoc(doc(db, 'users', employeeId), {
        permissions: newPermissions
      });
      setEmployees(prev => prev.map(e => e.uid === employeeId ? { ...e, permissions: newPermissions } : e));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el permiso.');
    }
  };

  const renderEmployee = ({ item }: { item: UserProfile }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: item.role === 'master' ? '#FFD700' : '#EEE' }]}>
            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => { setSelectedEmployee(item); setModalVisible(true); }}>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {item.role === 'empleado' && (
        <View style={styles.permissionsGrid}>
          <PermissionToggle 
            label="Menú" 
            value={!!item.permissions?.manageMenu} 
            onToggle={() => togglePermission(item.uid, 'manageMenu')} 
          />
          <PermissionToggle 
            label="Pedidos" 
            value={!!item.permissions?.manageOrders} 
            onToggle={() => togglePermission(item.uid, 'manageOrders')} 
          />
          <PermissionToggle 
            label="Reservas" 
            value={!!item.permissions?.manageReservations} 
            onToggle={() => togglePermission(item.uid, 'manageReservations')} 
          />
          <PermissionToggle 
            label="Promos" 
            value={!!item.permissions?.managePromotions} 
            onToggle={() => togglePermission(item.uid, 'managePromotions')} 
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GESTIÓN DE EQUIPO</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => fetchEmployees()}>
          <Ionicons name="refresh" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={item => item.uid}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

function PermissionToggle({ label, value, onToggle }: { label: string, value: boolean, onToggle: () => void }) {
  return (
    <View style={styles.permissionItem}>
      <Text style={styles.permissionLabel}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: '#DDD', true: colors.primary }}
        thumbColor={value ? '#FFF' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { 
    padding: 20, 
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  title: { fontFamily: 'Anton', fontSize: 24, color: '#000' },
  addButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 8 },
  employeeCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  employeeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  employeeName: { fontFamily: 'Anton', fontSize: 18, color: '#000' },
  employeeEmail: { fontSize: 14, color: '#666', marginBottom: 5 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: 'bold' },
  permissionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    borderTopWidth: 1, 
    borderTopColor: '#EEE', 
    paddingTop: 10 
  },
  permissionItem: { width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 5 },
  permissionLabel: { fontSize: 12, color: '#444' },
});
