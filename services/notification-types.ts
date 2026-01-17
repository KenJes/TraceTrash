/**
 * Tipos compartidos para notificaciones
 */

export interface PushMessage {
  to: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: "default" | "normal" | "high";
}

export interface NotificationHandler {
  shouldShowAlert: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
  shouldShowBanner?: boolean;
  shouldShowList?: boolean;
}

export const DEFAULT_NOTIFICATION_HANDLER: NotificationHandler = {
  shouldShowAlert: true,
  shouldPlaySound: true,
  shouldSetBadge: true,
  shouldShowBanner: true,
  shouldShowList: true,
};
