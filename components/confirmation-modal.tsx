/**
 * Modal de Confirmación Profesional
 *
 * Reemplaza los window.confirm y window.alert nativos
 * con un modal estilizado y consistente con el diseño de la app
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type ConfirmationModalType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "question";

interface ConfirmationModalProps {
  visible: boolean;
  type?: ConfirmationModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  isDarkMode?: boolean;
}

const typeConfig = {
  info: { icon: "information-circle", color: "#2196F3" },
  warning: { icon: "warning", color: "#FF9800" },
  error: { icon: "close-circle", color: "#F44336" },
  success: { icon: "checkmark-circle", color: "#4CAF50" },
  question: { icon: "help-circle", color: "#9C27B0" },
};

export function ConfirmationModal({
  visible,
  type = "question",
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  showCancel = true,
  isDarkMode = false,
}: ConfirmationModalProps) {
  const config = typeConfig[type];

  const backgroundColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const overlayColor = "rgba(0, 0, 0, 0.6)";
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Icono */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${config.color}20` },
            ]}
          >
            <Ionicons
              name={config.icon as any}
              size={48}
              color={config.color}
            />
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>

          {/* Mensaje */}
          <Text style={[styles.message, { color: textColor }]}>{message}</Text>

          {/* Botones */}
          <View style={styles.buttonsContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor }]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    styles.cancelButtonText,
                    { color: textColor },
                  ]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: config.color },
                !showCancel && styles.fullWidthButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Hook para usar el modal de confirmación
interface ConfirmOptions {
  type?: ConfirmationModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export function useConfirmation(isDarkMode: boolean = false) {
  const [modalState, setModalState] = useState<{
    visible: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    visible: false,
    options: { title: "", message: "" },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        visible: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    modalState.resolve?.(true);
    setModalState((prev) => ({ ...prev, visible: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = useCallback(() => {
    modalState.resolve?.(false);
    setModalState((prev) => ({ ...prev, visible: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alert = useCallback(
    (options: Omit<ConfirmOptions, "showCancel">): Promise<boolean> => {
      return confirm({ ...options, showCancel: false });
    },
    [confirm],
  );

  const ConfirmationModalComponent = (
    <ConfirmationModal
      visible={modalState.visible}
      type={modalState.options.type}
      title={modalState.options.title}
      message={modalState.options.message}
      confirmText={modalState.options.confirmText}
      cancelText={modalState.options.cancelText}
      showCancel={modalState.options.showCancel ?? true}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      isDarkMode={isDarkMode}
    />
  );

  return { confirm, alert, ConfirmationModalComponent };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidthButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButtonText: {
    opacity: 0.8,
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
});

export default ConfirmationModal;
