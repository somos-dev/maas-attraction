import React from "react";
import { Appbar, useTheme } from "react-native-paper";
import { useNavigation, DrawerActions } from "@react-navigation/native";

interface AppHeaderProps {
  title: string;
  isHome?: boolean;
}

export default function AppHeader({ title, isHome = false }: AppHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Appbar.Header mode="center-aligned" style={{ backgroundColor: theme.colors.surface }}>
      {isHome ? (
        <Appbar.Action
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      ) : (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}

      <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />

      {isHome && (
        <Appbar.Action
          icon="bell-outline"
          onPress={() => console.log("Notifiche")}
        />
      )}
    </Appbar.Header>
  );
}
