import { useTheme } from "@/design-system";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";

/**
 * Bottom tabs.
 * Reads the active theme via `useTheme()` so tab colors always match the
 * currently selected palette (was previously a static snapshot).
 */
export default function TabsLayout() {
  const t = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      lazy: true,
      freezeOnBlur: true,
      tabBarShowLabel: false,
      tabBarActiveTintColor: t.colors.accent,
      tabBarInactiveTintColor: t.colors.textMuted,
      tabBarStyle: {
        position: "absolute" as const,
        borderTopWidth: 0,
        backgroundColor: "transparent",
        elevation: 0,
        height: 84,
        paddingTop: 10
      },
      tabBarBackground: () => (
        <View style={StyleSheet.absoluteFill}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={50}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: t.colors.surface }
              ]}
            />
          )}
          <View
            style={{
              position: "absolute" as const,
              top: 0,
              left: 0,
              right: 0,
              height: StyleSheet.hairlineWidth,
              backgroundColor: t.colors.glassEdge
            }}
          />
        </View>
      )
    }),
    [t]
  );

  return (
    <Tabs detachInactiveScreens screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "water" : "water-outline"}
              color={color}
              size={26}
            />
          )
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "fish" : "fish-outline"}
              color={color}
              size={26}
            />
          )
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "pulse" : "pulse-outline"}
              color={color}
              size={26}
            />
          )
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "sparkles" : "sparkles-outline"}
              color={color}
              size={24}
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              size={28}
            />
          )
        }}
      />
    </Tabs>
  );
}
