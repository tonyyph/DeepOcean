import { useTranslations, type Translations } from "@/core/i18n";
import type { AppTheme } from "@/design-system";
import {
  ActionButton,
  GlassCard,
  GlowText,
  PressableCard,
  ScreenSafeAreaView,
  ScreenScrollView,
  Skeleton,
  UnderwaterCanvas,
  useTheme,
  useThemedStyles,
  ZoneBackground
} from "@/design-system";
import type { NotificationMessage } from "@/domain/entities";
import {
  selectUnreadNotificationCount,
  useNotificationCenter
} from "@/features/notifications";
import { useExternalActionNavigation } from "@/features/widget";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type FilterMode = "all" | "unread";

export default function NotificationCenterScreen() {
  const router = useRouter();
  const { navigateToDeepLink } = useExternalActionNavigation();
  const tr = useTranslations();
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const messages = useNotificationCenter((s) => s.messages);
  const isLoading = useNotificationCenter((s) => s.isLoading);
  const error = useNotificationCenter((s) => s.error);
  const hydrate = useNotificationCenter((s) => s.hydrate);
  const markRead = useNotificationCenter((s) => s.markRead);
  const markAllRead = useNotificationCenter((s) => s.markAllRead);
  const unreadCount = useNotificationCenter(selectUnreadNotificationCount);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await hydrate();
    setRefreshing(false);
  }, [hydrate]);

  const openMessage = useCallback(
    (message: NotificationMessage) => {
      void markRead(message.id);
      if (message.deepLink) {
        navigateToDeepLink({
          actionId: `notification-center:${message.id}`,
          deepLink: message.deepLink
        });
      }
    },
    [markRead, navigateToDeepLink]
  );

  const contentContainerStyle = useMemo(
    () => [
      styles.listContent,
      messages.length === 0 && !isLoading ? styles.emptyListContent : null
    ],
    [styles, messages.length, isLoading]
  );
  const filteredMessages = useMemo(
    () =>
      filter === "unread"
        ? messages.filter((message) => message.readAt == null)
        : messages,
    [filter, messages]
  );
  const latestMessage = messages[0] ?? null;
  const hasMessages = messages.length > 0;

  return (
    <ZoneBackground zone="midnight">
      <UnderwaterCanvas zone="midnight" />
      <ScreenSafeAreaView style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={20} color={t.colors.text} />
          </Pressable>
          <GlowText shadow={false} size={20}>
            {tr.notifications.center.title}
          </GlowText>
          <View style={styles.backBtnNoColor} />
        </View>
        <ScreenScrollView
          bottomInset={t.spacing[10]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={t.colors.accent}
            />
          }
        >
          <GlassCard radius={t.radii.lg} padding={0} glow>
            <View style={styles.heroShell}>
              <LinearGradient
                pointerEvents="none"
                colors={[t.colors.panelTint, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="notifications"
                    size={22}
                    color={t.colors.accent}
                  />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>
                    {tr.notifications.center.signalLog}
                  </Text>
                  <Text style={styles.heroTitle}>
                    {unreadCount > 0
                      ? tr.notifications.center.unreadSummary(unreadCount)
                      : tr.notifications.center.allReviewed}
                  </Text>
                  <Text style={styles.heroSubtitle} numberOfLines={2}>
                    {latestMessage
                      ? latestMessage.title
                      : tr.notifications.center.fallbackLatest}
                  </Text>
                </View>
              </View>
              <View style={styles.heroStats}>
                <MetricPill
                  label={tr.notifications.center.total}
                  value={messages.length}
                />
                <MetricPill
                  label={tr.notifications.center.unread}
                  value={unreadCount}
                />
                <MetricPill
                  label={tr.notifications.center.latest}
                  value={
                    latestMessage
                      ? formatRelativeTime(
                          latestMessage.createdAt,
                          tr.notifications.center
                        )
                      : "--"
                  }
                />
              </View>
            </View>
          </GlassCard>

          {hasMessages ? (
            <View style={styles.controlsRow}>
              <View style={styles.segment}>
                <FilterChip
                  label={tr.notifications.center.all}
                  active={filter === "all"}
                  onPress={() => setFilter("all")}
                />
                <FilterChip
                  label={tr.notifications.center.unread}
                  active={filter === "unread"}
                  onPress={() => setFilter("unread")}
                />
              </View>
              {unreadCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={markAllRead}
                  style={({ pressed }) => [
                    styles.markReadIcon,
                    pressed && styles.pressed
                  ]}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={18}
                    color={t.colors.accent}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {isLoading && messages.length === 0 ? <LoadingState /> : null}

          {error ? (
            <GlassCard radius={t.radii.md}>
              <View style={styles.stateRow}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={t.colors.danger}
                />
                <Text style={styles.errorText}>
                  {tr.notifications.center.loadError}
                </Text>
              </View>
              <ActionButton
                label={tr.notifications.center.retry}
                icon="refresh"
                tone="secondary"
                size="sm"
                onPress={hydrate}
                containerStyle={styles.retryButton}
              />
            </GlassCard>
          ) : null}

          {filteredMessages.length > 0 ? (
            <FlatList
              data={filteredMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NotificationRow message={item} onPress={openMessage} tr={tr} />
              )}
              scrollEnabled={false}
              contentContainerStyle={contentContainerStyle}
            />
          ) : null}
        </ScreenScrollView>
      </ScreenSafeAreaView>
    </ZoneBackground>
  );
}

function NotificationRow({
  message,
  onPress,
  tr
}: {
  message: NotificationMessage;
  onPress: (message: NotificationMessage) => void;
  tr: Translations;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const unread = message.readAt == null;
  const iconName = iconForMessage(message);
  const color = colorForMessage(message, t);

  return (
    <PressableCard
      radius={t.radii.md}
      padding={0}
      onPress={() => onPress(message)}
      containerStyle={styles.rowCard}
      glow={unread}
    >
      <View style={styles.messageCardInner}>
        <View style={[styles.messageAccent, { backgroundColor: color }]} />
        <View style={styles.messageRow}>
          <View
            style={[
              styles.messageIcon,
              { borderColor: unread ? color : t.colors.panelEdge }
            ]}
          >
            <Ionicons name={iconName} size={18} color={color} />
          </View>
          <View style={styles.messageText}>
            <View style={styles.messageMetaRow}>
              <View style={styles.sourcePill}>
                <Text style={[styles.sourceText, { color }]}>
                  {labelForMessage(message, tr)}
                </Text>
              </View>
              <Text style={styles.messageTime}>
                {formatRelativeTime(message.createdAt, tr.notifications.center)}
              </Text>
            </View>
            <Text style={styles.messageTitle}>{message.title}</Text>
            {message.body ? (
              <Text style={styles.messageBody} numberOfLines={3}>
                {message.body}
              </Text>
            ) : null}
          </View>
          {unread ? (
            <View style={[styles.unreadBadge, { backgroundColor: color }]} />
          ) : null}
          {message.deepLink ? (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={t.colors.textMuted}
            />
          ) : null}
        </View>
      </View>
    </PressableCard>
  );
}

function MetricPill({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text
        style={[
          styles.filterText,
          { color: active ? t.colors.background : t.colors.textSecondary }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LoadingState() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlassCard radius={t.radii.md}>
      <Skeleton style={styles.skeletonTitle} />
      <Skeleton style={styles.skeletonBody} />
      <Skeleton style={styles.skeletonBodyShort} />
    </GlassCard>
  );
}

function iconForMessage(
  message: NotificationMessage
): keyof typeof Ionicons.glyphMap {
  if (message.type === "success") return "checkmark-circle";
  if (message.type === "warning") return "warning";
  if (message.type === "error") return "alert-circle";
  if (message.deepLink === "/dive") return "water";
  return "radio";
}

function labelForMessage(
  message: NotificationMessage,
  tr: Translations
): string {
  if (message.type === "success") return tr.notifications.center.typeComplete;
  if (message.type === "warning") return tr.notifications.center.typeWarning;
  if (message.type === "error") return tr.notifications.center.typeActionNeeded;
  if (message.deepLink === "/dive") return tr.notifications.center.typeReminder;
  return tr.notifications.center.typeUpdate;
}

function colorForMessage(message: NotificationMessage, t: AppTheme): string {
  if (message.type === "success") return t.colors.success;
  if (message.type === "warning") return t.colors.warning;
  if (message.type === "error") return t.colors.danger;
  return t.colors.accent;
}

function formatRelativeTime(
  timestamp: number,
  tr: Translations["notifications"]["center"]
): string {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (deltaSeconds < 60) return tr.now;
  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) return tr.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return tr.hoursAgo(hours);
  return tr.daysAgo(Math.floor(hours / 24));
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: t.spacing[3],
      paddingTop: t.spacing[3],
      paddingBottom: t.spacing[3]
    },
    backBtn: {
      width: 40,
      minHeight: 40,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.panelStrong,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: t.spacing[3]
    },
    backBtnNoColor: {
      width: 40,
      minHeight: 40,
      borderRadius: t.radii.lg,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      marginRight: t.spacing[3]
    },
    heroShell: {
      overflow: "hidden",
      padding: t.spacing[5],
      gap: t.spacing[5],
      borderRadius: t.radii.lg
    },
    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[4]
    },
    heroIcon: {
      width: 56,
      height: 56,
      borderRadius: t.radii.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    heroCopy: {
      flex: 1,
      minWidth: 0
    },
    heroEyebrow: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.label,
      fontSize: 11,
      letterSpacing: 1
    },
    heroTitle: {
      color: t.colors.text,
      fontFamily: t.fonts.display,
      fontSize: 24,
      lineHeight: 30,
      marginTop: t.spacing[1]
    },
    heroSubtitle: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: t.spacing[1]
    },
    heroStats: {
      flexDirection: "row",
      gap: t.spacing[2]
    },
    metricPill: {
      flex: 1,
      minHeight: 58,
      justifyContent: "center",
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radii.md,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    metricValue: {
      color: t.colors.text,
      fontFamily: t.fonts.mono,
      fontSize: 17
    },
    metricLabel: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.label,
      fontSize: 10,
      marginTop: t.spacing[1]
    },
    controlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[3]
    },
    segment: {
      flexDirection: "row",
      flex: 1,
      padding: t.spacing[1],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    filterChip: {
      flex: 1,
      minHeight: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: t.radii.pill
    },
    filterChipActive: {
      backgroundColor: t.colors.accent
    },
    filterText: {
      fontFamily: t.fonts.label,
      fontSize: 12
    },
    markReadIcon: {
      width: 44,
      height: 44,
      borderRadius: t.radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.panelEdge
    },
    pressed: {
      opacity: 0.72,
      transform: [{ scale: 0.98 }]
    },
    listContent: {
      gap: t.spacing[3]
    },
    emptyListContent: {
      flexGrow: 1
    },
    rowCard: {
      marginBottom: t.spacing[3]
    },
    messageCardInner: {
      overflow: "hidden",
      borderRadius: t.radii.md
    },
    messageAccent: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      opacity: 0.9
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.spacing[3],
      padding: t.spacing[4],
      paddingLeft: t.spacing[5]
    },
    messageIcon: {
      width: 42,
      height: 42,
      borderRadius: t.radii.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.glass,
      borderWidth: StyleSheet.hairlineWidth
    },
    messageText: {
      flex: 1,
      minWidth: 0
    },
    messageMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.spacing[2],
      marginBottom: t.spacing[2]
    },
    sourcePill: {
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[1],
      borderRadius: t.radii.pill,
      backgroundColor: t.colors.glass
    },
    sourceText: {
      fontFamily: t.fonts.label,
      fontSize: 10
    },
    messageTitle: {
      color: t.colors.text,
      fontFamily: t.fonts.label,
      fontSize: 15,
      lineHeight: 20
    },
    messageTime: {
      color: t.colors.textMuted,
      fontFamily: t.fonts.mono,
      fontSize: 11
    },
    messageBody: {
      color: t.colors.textSecondary,
      fontFamily: t.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      marginTop: t.spacing[2]
    },
    unreadBadge: {
      width: 8,
      height: 8,
      borderRadius: 8,
      marginTop: t.spacing[1]
    },
    stateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    errorText: {
      flex: 1,
      color: t.colors.text,
      fontFamily: t.fonts.body,
      fontSize: 14
    },
    retryButton: {
      marginTop: t.spacing[3],
      alignSelf: "flex-start"
    },
    skeletonTitle: {
      width: 160,
      height: 16,
      borderRadius: t.radii.xs
    },
    skeletonBody: {
      width: "90%",
      height: 13,
      borderRadius: t.radii.xs,
      marginTop: t.spacing[3]
    },
    skeletonBodyShort: {
      width: "62%",
      height: 13,
      borderRadius: t.radii.xs,
      marginTop: t.spacing[2]
    }
  });
