import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import type { AppTheme } from "../themes";
import { useTheme } from "../useTheme";
import { useThemedStyles } from "../useThemedStyles";

type SwitchRow = {
  type: "switch";
  value: boolean;
  onChange: (next: boolean) => void;
};

type NavRow = {
  type: "nav";
  value?: string;
  onPress: () => void;
};

type DisplayRow = {
  type: "display";
  value: string;
};

type Variant = SwitchRow | NavRow | DisplayRow;

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Trailing badge (e.g. PremiumBadge). */
  badge?: React.ReactNode;
  divider?: boolean;
} & Variant;

/**
 * SettingRow — unified row used inside cards for any "label + control" config.
 * Variants: switch | nav | display. Replaces 3 duplicated patterns previously
 * scattered across `ProfileScreen`.
 */
export const SettingRow = React.memo(function SettingRow(props: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  const body = (
    <View style={[styles.row, props.divider !== false && styles.rowDivider]}>
      {props.icon && <View style={styles.iconSlot}>{props.icon}</View>}
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{props.title}</Text>
          {props.badge}
        </View>
        {props.subtitle && <Text style={styles.sub}>{props.subtitle}</Text>}
      </View>
      {renderTrailing(props, t, styles)}
    </View>
  );

  if (props.type === "nav") {
    return (
      <Pressable
        onPress={props.onPress}
        accessibilityRole="button"
        accessibilityLabel={props.title}
        android_ripple={{ color: t.colors.glass }}
        style={({ pressed }) => (pressed ? styles.rowPressed : null)}
      >
        {body}
      </Pressable>
    );
  }
  return body;
});

function renderTrailing(
  props: Props,
  t: ReturnType<typeof useTheme>,
  styles: ReturnType<typeof makeStyles>
) {
  if (props.type === "switch") {
    return (
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        style={styles.trailingSwitch}
        trackColor={{
          false: t.colors.glass,
          true: t.colors.accent
        }}
        thumbColor={t.colors.text}
        ios_backgroundColor={t.colors.glass}
      />
    );
  }
  if (props.type === "nav") {
    return (
      <View style={styles.navTrailing}>
        {props.value && <Text style={styles.trailingValue}>{props.value}</Text>}
        <Text style={styles.chevron}>{"\u203A"}</Text>
      </View>
    );
  }
  return <Text style={styles.trailingValue}>{props.value}</Text>;
}

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: t.spacing[3.5],
      gap: t.spacing[3]
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.border
    },
    rowPressed: { opacity: 0.65 },
    iconSlot: {
      width: 32,
      alignItems: "center",
      justifyContent: "center"
    },
    text: { flex: 1 },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    title: {
      color: t.colors.text,
      fontSize: 15,
      fontFamily: t.fonts.body
    },
    sub: {
      color: t.colors.textMuted,
      fontSize: 12,
      marginTop: 2,
      fontFamily: t.fonts.body
    },
    navTrailing: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing[2]
    },
    trailingValue: {
      color: t.colors.accent,
      fontSize: 13,
      fontFamily: t.fonts.body
    },
    chevron: {
      color: t.colors.textMuted,
      fontSize: 22,
      lineHeight: 22
    },
    trailingSwitch: {
      transform: [{ scale: 0.8 }],
      marginRight: -4
    }
  });
