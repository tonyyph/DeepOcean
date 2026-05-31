import React from "react";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/design-system/theme";

/**
 * Bottom tabs — translucent dock with bio-luminescent active state.
 * Note: @expo/vector-icons ships with Expo SDK; no extra dep needed.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: "rgba(234,246,255,0.45)",
        tabBarStyle: {
          position: "absolute",
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
                  { backgroundColor: "rgba(2,8,28,0.85)" }
                ]}
              />
            )}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: StyleSheet.hairlineWidth,
                backgroundColor: theme.colors.glassEdge
              }}
            />
          </View>
        )
      }}
    >
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
