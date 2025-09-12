import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, useTheme } from "react-native-paper";

import MainStack from "../screens/main/MainStack";
import LinesStack from "../screens/lines/LinesStack";
import ServicesStack from "../screens/services/ServicesStack";
import ProfileStack from "../screens/profile/ProfileStack";

import type { TabNavigatorParamList } from "./types";

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

export default function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: 60,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={MainStack}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Icon source="home-variant" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="LinesTab"
        component={LinesStack}
        options={{
          title: "Linee",
          tabBarIcon: ({ color, size }) => <Icon source="bus-multiple" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStack}
        options={{
          title: "Servizi",
          tabBarIcon: ({ color, size }) => <Icon source="toolbox-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: "Profilo",
          tabBarIcon: ({ color, size }) => <Icon source="account-circle-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
