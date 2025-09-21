// src/components/common/header/AppHeader.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, Text, ViewStyle } from "react-native";
import { Appbar, useTheme, IconButton } from "react-native-paper";
import { useNavigation, DrawerActions, useRoute } from "@react-navigation/native";
import { SCREEN_TITLES } from "../../../navigation/screenTitles";

interface AppHeaderProps {
  isHome?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  style?: ViewStyle;
}

export default function AppHeader({
  isHome = false,
  rightIcon,
  onRightPress,
  style,
}: AppHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const title = SCREEN_TITLES[route.name] || route.name;

  return (
    <Appbar.Header
      mode="center-aligned"
      style={[{ backgroundColor: theme.colors.surface, elevation: 4 }, style]}
    >
      {isHome ? (
        <>
          {/* Menu */}
          <Appbar.Action
            icon="menu"
            color={theme.colors.onSurface}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />

          {/* Search bar inline */}
          <TouchableOpacity
            style={[
              styles.searchContainer,
              { backgroundColor: theme.colors.background }, 
            ]}
            onPress={() => navigation.navigate("Search" as never)}
          >
            <Text
              style={[
                styles.searchText,
                { color: theme.colors.onSurface },
              ]}
            >
              Cerca la tua destinazione
            </Text>
            <IconButton
              icon="magnify"
              size={20}
              iconColor={theme.colors.onSurface} 
            />
          </TouchableOpacity>

          {/* Notifiche */}
          <Appbar.Action
            icon="bell-outline"
            color={theme.colors.onSurface}
            onPress={() => console.log("Notifiche")}
          />
        </>
      ) : (
        <>
          {navigation.canGoBack() && (
            <Appbar.BackAction
              color={theme.colors.onSurface} 
              onPress={() => navigation.goBack()}
            />
          )}
          <Appbar.Content
            title={title}
            titleStyle={[styles.title, { color: theme.colors.onSurface }]} 
          />
          {rightIcon && (
            <Appbar.Action
              icon={rightIcon}
              color={theme.colors.onSurface} 
              onPress={onRightPress}
            />
          )}
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
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  searchText: {
    flex: 1,
    fontFamily: "Montserrat-Regular",
    fontSize: 14,
  },
  title: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    letterSpacing: 0.5,
    marginLeft: 15,
  },
});








