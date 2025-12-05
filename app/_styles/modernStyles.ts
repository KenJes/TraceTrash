import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const getModernStyles = (isDark: boolean) => {
  const colors = isDark ? Colors.dark : Colors.light;

  return StyleSheet.create({
    // Layout containers
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingHorizontal: 20,
    },

    scrollContainer: {
      paddingBottom: 40,
    },

    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Logo & Branding
    logoContainer: {
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 16,
    },

    logo: {
      width: 80,
      height: 80,
      marginBottom: 8,
    },

    // Typography
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.tint,
      marginBottom: 8,
      letterSpacing: -0.5,
    },

    subtitle: {
      fontSize: 14,
      color: colors.icon,
      marginBottom: 24,
      lineHeight: 20,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.3,
    },

    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    bodyText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },

    // Cards & Surfaces
    card: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: isDark ? 4 : 2,
    },

    cardCompact: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.25 : 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: isDark ? 3 : 1,
    },

    // Form Inputs
    inputGroup: {
      marginBottom: 20,
    },

    input: {
      minHeight: 48,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      color: colors.text,
      fontSize: 15,
    },

    inputFocused: {
      borderColor: colors.tint,
      backgroundColor: isDark ? 'rgba(67,160,71,0.08)' : 'rgba(67,160,71,0.04)',
    },

    // Buttons
    button: {
      backgroundColor: colors.tint,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
    },

    buttonSecondary: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    },

    buttonSecondaryText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },

    buttonOutline: {
      backgroundColor: 'transparent',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.tint,
    },

    buttonOutlineText: {
      color: colors.tint,
      fontSize: 15,
      fontWeight: '600',
    },

    // Selection chips/buttons
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    chip: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    },

    chipSelected: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },

    chipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },

    chipTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },

    // Layout utilities
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    // Status badges
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },

    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Dividers
    divider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      marginVertical: 16,
    },

    // Grid
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },

    gridItem: {
      flex: 1,
      minWidth: '45%',
    },

    // Icon badges
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tint,
    },

    // Metrics
    metricValue: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 12,
      marginBottom: 4,
    },

    metricLabel: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.7,
      textAlign: 'center',
    },

    // Legacy compatibility properties
    boton: {
      backgroundColor: colors.tint,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: isDark ? 4 : 3,
    },

    botonTexto: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    subtitulo: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
      marginBottom: 20,
      lineHeight: 20,
    },

    picker: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 14,
      marginTop: 8,
      color: colors.text,
    },

    ubicacionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
      flexWrap: 'wrap',
    },

    ubicacionBoton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 10,
      flex: 1,
      minWidth: 120,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: isDark ? 3 : 2,
    },

    ubicacionBotonTexto: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },

    label2: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.7,
      fontWeight: '500',
    },

    valor: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
      marginTop: 4,
    },

    rastreo: {
      fontSize: 13,
      color: colors.tint,
      marginTop: 12,
      textAlign: 'center',
      fontStyle: 'italic',
    },

    enviarBtn: {
      backgroundColor: colors.tint,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: isDark ? 4 : 3,
    },

    enviarBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },

    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
  });
};
