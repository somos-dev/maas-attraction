// src/navigation/DrawerNavigator.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme, Appbar } from "react-native-paper";

import TabNavigator from "./TabNavigator";              // Home/Linee/Servizi/Profilo
import SettingsScreen from "../screens/drawer/SettingsScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="TabsRoot"
      screenOptions={{
        headerShown: false, // niente header globale del Drawer (evita doppio header)
        drawerStyle: { backgroundColor: theme.colors.surface, width: 260 },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      {/* Root delle Tab: nascosta nel menù */}
      <Drawer.Screen
        name="TabsRoot"
        component={TabNavigator}
        options={{ drawerItemStyle: { display: "none" } }}
      />

      {/* Unica voce del menù: Impostazioni, con header personalizzato (titolo + back) */}
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ navigation }) => ({
          title: "Impostazioni",
          headerShown: true,
          header: () => (
            <Appbar.Header>
              <Appbar.BackAction
                onPress={() => navigation.navigate("TabsRoot" as never)}
              />
              <Appbar.Content title="Impostazioni" />
            </Appbar.Header>
          ),
        })}
      />
    </Drawer.Navigator>
  );
}
