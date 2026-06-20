import { useTranslations } from "@/core/i18n";
import { NotificationService } from "@/core/notifications/NotificationService";
import { GlassCard, useTheme } from "@/design-system";
import type { NotificationMessage } from "@/domain/entities";
import { useExternalActionNavigation } from "@/features/widget";
import { Ionicons } from "@expo/vector-icons";
import type * as Notifications from "expo-notifications";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotificationCenter } from "./notificationCenter";

const TOAST_MS = 4200;

const iconByType = {
  success: "checkmark-circle",
  error: "alert-circle",
  warning: "warning",
  info: "notifications"
} as const;

export function NotificationToastHost() {
  const { navigateToDeepLink } = useExternalActionNavigation();
  const tr = useTranslations();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const record = useNotificationCenter((s) => s.record);
  const hydrate = useNotificationCenter((s) => s.hydrate);
  const markRead = useNotificationCenter((s) => s.markRead);
  const [toast, setToast] = useState<NotificationMessage | null>(null);
  const seenIds = useRef(new Set<string>());
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const openMessage = useCallback(
    (message: NotificationMessage) => {
      void markRead(message.id);
      setToast(null);
      if (message.deepLink) {
        navigateToDeepLink({
          actionId: `notification:${message.id}`,
          deepLink: message.deepLink
        });
      }
    },
    [markRead, navigateToDeepLink]
  );

  const openNotificationDeepLink = useCallback(
    (notification: Notifications.Notification) => {
      const data = notification.request.content.data ?? {};
      if (typeof data.deepLink !== "string") return;
      const id = String(data.messageId ?? notification.request.identifier);
      navigateToDeepLink({
        actionId: `notification:${id}`,
        deepLink: data.deepLink
      });
    },
    [navigateToDeepLink]
  );

  const showToast = useCallback((message: NotificationMessage) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setToast(message);
    clearTimer.current = setTimeout(() => {
      setToast((current) => (current?.id === message.id ? null : current));
    }, TOAST_MS);
  }, []);

  const persistNotification = useCallback(
    async (
      notification: Notifications.Notification,
      options?: { foregroundToast?: boolean }
    ) => {
      const request = notification.request;
      const content = request.content;
      const data = content.data ?? {};
      const id = String(data.messageId ?? request.identifier);
      if (seenIds.current.has(id)) return null;
      seenIds.current.add(id);

      const message = await record({
        id,
        title: content.title ?? tr.notifications.center.fallbackTitle,
        body: content.body ?? "",
        type: notificationTypeFromKind(data.kind),
        deepLink: typeof data.deepLink === "string" ? data.deepLink : null,
        source: "system",
        createdAt: notification.date
      });
      if (options?.foregroundToast) showToast(message);
      return message;
    },
    [record, showToast, tr]
  );

  useEffect(() => {
    let active = true;
    void NotificationService.consumeLastResponse().then((event) => {
      if (!active || !event) return;
      void persistNotification(event.notification).then((message) => {
        if (message) {
          openMessage(message);
        } else {
          openNotificationDeepLink(event.notification);
        }
      });
    });
    const received = NotificationService.addReceivedListener((notification) => {
      void persistNotification(notification, { foregroundToast: true });
    });
    const response = NotificationService.addResponseListener((event) => {
      void persistNotification(event.notification).then((message) => {
        if (message) {
          openMessage(message);
        } else {
          openNotificationDeepLink(event.notification);
        }
      });
    });

    return () => {
      active = false;
      received?.remove();
      response?.remove();
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, [openMessage, openNotificationDeepLink, persistNotification]);

  const toastStyle = useMemo(
    () => [styles.wrap, { top: insets.top + t.spacing[2] }],
    [insets.top, t.spacing]
  );

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      entering={FadeInDown.duration(180)}
      exiting={FadeOutUp.duration(160)}
      style={toastStyle}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={toast.title}
        onPress={() => openMessage(toast)}
      >
        <GlassCard radius={t.radii.md} padding={t.spacing[3]} glow>
          <View style={styles.row}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: t.colors.glass,
                  borderColor: t.colors.panelEdge
                }
              ]}
            >
              <Ionicons
                name={iconByType[toast.type]}
                size={18}
                color={toneColor(toast.type, t.colors)}
              />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: t.colors.text }]}>
                {toast.title}
              </Text>
              {toast.body ? (
                <Text
                  numberOfLines={2}
                  style={[styles.body, { color: t.colors.textSecondary }]}
                >
                  {toast.body}
                </Text>
              ) : null}
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

function notificationTypeFromKind(kind: unknown): NotificationMessage["type"] {
  if (kind === "dive-complete") return "success";
  if (kind === "active-dive") return "info";
  if (kind === "dive-reminder") return "info";
  return "info";
}

function toneColor(
  type: NotificationMessage["type"],
  colors: ReturnType<typeof useTheme>["colors"]
): string {
  if (type === "success") return colors.success;
  if (type === "error") return colors.danger;
  if (type === "warning") return colors.warning;
  return colors.accent;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1200
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth
  },
  textWrap: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontFamily: "Sora_600SemiBold",
    fontSize: 14
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  }
});
