import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';
export const getThemeStyles = (isDark: boolean) => {
  const colors = isDark ? Colors.dark : Colors.light;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 60,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },

    logo: {
      width: 80,
      height: 80,
      marginBottom: 16,
      marginTop: 8,
    },

    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    title: {
      marginBottom: 28,
      fontSize: 32,
      fontWeight: '700',
      color: colors.tint,
      textAlign: 'center',
      letterSpacing: 0.5,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      marginTop: 4,
    },

    label: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },

    label2: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingVertical: 8,
    },

    centrar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },

    card: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 12,
      marginBottom: 18,
      width: '100%',
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.15 : 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: isDark ? 3 : 1,
      borderWidth: 0,
      borderColor: 'transparent',
    },

    inputGroup: {
      marginBottom: 16,
    },

    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },

    input: {
      width: '100%',
      minHeight: 50,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderRadius: 10,
      padding: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },

    inputPlaceholder: {
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
    },

    valor: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 8,
      textAlign: 'center',
      color: colors.text,
    },

    rastreo: {
      marginTop: 12,
      fontSize: 14,
      color: colors.icon,
      fontWeight: '600',
      textAlign: 'center',
    },

    boton: {
      backgroundColor: colors.tint,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 4,
      elevation: isDark ? 2 : 1,
      marginTop: 12,
    },

    botonTexto: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.3,
    },

    pickerContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 18,
      width: '100%',
      borderWidth: 0,
      borderColor: 'transparent',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.15 : 0.06,
      shadowRadius: 6,
      elevation: isDark ? 3 : 1,
    },

    picker: {
      width: '100%',
      color: colors.text,
      backgroundColor: colors.card,
      fontSize: 16,
    },

    pickerItem: {
      fontSize: 16,
      color: colors.text,
    },

    subtitulo: {
      color: colors.icon,
      marginBottom: 20,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '500',
    },

    ubicacionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
      gap: 8,
    },

    ubicacionBtn: {
      marginLeft: 8,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    ubicacionBtnText: {
      color: '#000',
      fontWeight: '700',
      fontSize: 14,
    },

    imagenesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 16,
      gap: 12,
    },

    imagen: {
      width: 56,
      height: 56,
      borderRadius: 10,
      marginRight: 8,
      borderWidth: 2,
      borderColor: colors.accent,
    },

    fotoBtn: {
      width: 56,
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },

    fotoBtnText: {
      color: '#000',
      fontSize: 28,
      fontWeight: 'bold',
    },

    enviarBtn: {
      marginTop: 28,
      backgroundColor: colors.tint,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    enviarBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 18,
      letterSpacing: 0.5,
    },
  });
};