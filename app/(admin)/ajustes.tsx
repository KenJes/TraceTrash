import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function AdminAjustesScreen() {
  const { theme, setTheme } = useThemeContext();
  const { user, logout, updateUser } = useAuthContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [editingName, setEditingName] = useState(false);
  const [tempNombre, setTempNombre] = useState('');

  const handleSaveField = async (field: 'nombre', value: string) => {
    if (!value.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    try {
      if (user?.uid) {
        await firebaseService.updateUserProfile(user.uid, { [field]: value });
        updateUser({ [field]: value });
        setEditingName(false);
        Alert.alert('Éxito', 'Actualizado correctamente');
      }
    } catch {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const EditModal = ({ visible, title, value, onSave, onClose }: any) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View style={[styles.card, { width: '85%', maxWidth: 400 }]}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            placeholder={`Nuevo ${title.toLowerCase()}`}
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={value}
            onChangeText={setTempNombre}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.buttonSecondary, { flex: 1 }]} onPress={onClose}>
              <ThemedText style={styles.buttonSecondaryText}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={onSave}>
              <ThemedText style={styles.buttonText}>Guardar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/trace1_logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <ThemedText type="title" style={styles.title}>Configuración</ThemedText>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Apariencia</ThemedText>
          <View style={styles.spaceBetween}>
            <ThemedText style={styles.bodyText}>{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</ThemedText>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#E8F5E9', true: '#1B5E20' }}
              thumbColor={isDarkMode ? '#43A047' : '#FFB300'}
            />
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Perfil de Administrador</ThemedText>
          
          <View style={{ marginBottom: 16 }}>
            <View style={[styles.spaceBetween, { marginBottom: 8 }]}>
              <ThemedText style={styles.label}>Nombre</ThemedText>
              <TouchableOpacity onPress={() => { setTempNombre(user?.nombre || ''); setEditingName(true); }}>
                <Ionicons name="pencil" size={18} color="#43A047" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.bodyText}>{user?.nombre}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={{ marginTop: 12 }}>
            <ThemedText style={[styles.label, { marginBottom: 4 }]}>Email</ThemedText>
            <ThemedText style={styles.bodyText}>{user?.email}</ThemedText>
          </View>

          <View style={{ marginTop: 12 }}>
            <ThemedText style={[styles.label, { marginBottom: 4 }]}>Rol</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconBadge, { backgroundColor: '#673AB7', marginRight: 8, width: 28, height: 28 }]}>
                <Ionicons name="shield-checkmark" size={16} color="#FFF" />
              </View>
              <ThemedText style={[styles.bodyText, { fontWeight: '600' }]}>Administrador</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Información</ThemedText>
          <ThemedText style={[styles.bodyText, { marginBottom: 8 }]}>Versión 1.0.0</ThemedText>
          <ThemedText style={styles.bodyText}>Panel de administración</ThemedText>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#E53935' }]} onPress={logout}>
          <ThemedText style={styles.buttonText}>Cerrar Sesión</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <EditModal
        visible={editingName}
        title="Nombre"
        value={tempNombre}
        onSave={() => handleSaveField('nombre', tempNombre)}
        onClose={() => setEditingName(false)}
      />
    </ThemedView>
  );
}
