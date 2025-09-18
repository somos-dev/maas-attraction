// src/components/common/header/AppHeader.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { Appbar, useTheme, IconButton } from "react-native-paper";
import { useNavigation, DrawerActions, useRoute } from "@react-navigation/native";
import { SCREEN_TITLES } from "../../../navigation/screenTitles";

interface AppHeaderProps {
  isHome?: boolean;
}

export default function AppHeader({ isHome = false }: AppHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const title = SCREEN_TITLES[route.name] || route.name;

  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 4 }}>
      {isHome ? (
        <>
          {/* Menu */}
          <Appbar.Action
            icon="menu"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />

          {/* Search bar */}
          <TouchableOpacity
            style={styles.searchContainer}
            onPress={() => navigation.navigate("Search" as never)}
          >
            <Text style={styles.searchText}>Cerca la tua destinazione</Text>
            <IconButton icon="magnify" size={20} />
          </TouchableOpacity>

          {/* Notifiche */}
          <Appbar.Action icon="bell-outline" onPress={() => console.log("Notifiche")} />
        </>
      ) : (
        <>
          {navigation.canGoBack() && (
            <Appbar.BackAction onPress={() => navigation.goBack()} />
          )}
          <Appbar.Content
            title={title}
            titleStyle={styles.title}
          />
        </>
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  searchText: {
    color: "#888",
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#333",
    letterSpacing: 0.5,
    marginLeft: 20,
  },
});






