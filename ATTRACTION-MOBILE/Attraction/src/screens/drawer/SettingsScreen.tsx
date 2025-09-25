// src/screens/SettingsScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  List,
  Switch,
  Divider,
  Menu,
  Button,
  useTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { toggleTheme } from "../../store/slices/themeSlice";

export default function SettingsScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // 🔗 recupera lo stato del tema da Redux
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("it");
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        {/* Tema */}
        <List.Item
          title="Tema scuro"
          titleStyle={{ color: theme.colors.onSurface }} // 👈 coerente
          left={() => <List.Icon icon="theme-light-dark" color={theme.colors.onSurface} />}
          right={() => (
            <Switch
              value={isDarkTheme}
              onValueChange={() => dispatch(toggleTheme())}
              color={theme.colors.primary}
            />
          )}
        />
        <Divider />

        {/* Notifiche */}
        <List.Item
          title="Notifiche"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => <List.Icon icon="bell-outline" color={theme.colors.onSurface} />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={() =>
                setNotificationsEnabled(!notificationsEnabled)
              }
              color={theme.colors.primary}
            />
          )}
        />
        <Divider />

        {/* Lingua */}
        <List.Item
          title="Lingua"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => <List.Icon icon="translate" color={theme.colors.onSurface} />}
          right={() => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={[
                    styles.dropdownButton,
                    { borderColor: theme.colors.outline },
                  ]}
                  textColor={theme.colors.primary}
                >
                  {language === "it" ? "Italiano" : "English"}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setLanguage("it");
                  setMenuVisible(false);
                }}
                title="Italiano"
              />
              <Menu.Item
                onPress={() => {
                  setLanguage("en");
                  setMenuVisible(false);
                }}
                title="English"
              />
            </Menu>
          )}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dropdownButton: {
    borderRadius: 20,
  },
});





