import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useTheme, Appbar, Text, Divider, Icon } from "react-native-paper";
import { View, StyleSheet, Share, Image } from "react-native";
import AppFooter from "../components/common/footer/AppFooter";
import TabNavigator from "./TabNavigator";
import SettingsScreen from "../screens/drawer/SettingsScreen";
import FeedbackScreen from "../screens/drawer/FeedbackScreen";

import type { DrawerParamList } from "./types";
import { SCREEN_TITLES } from "./screenTitles";

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: any) {
  const theme = useTheme();

  const handleMenuItemPress = (routeName: string) => {
    props.navigation.navigate(routeName);
    props.navigation.closeDrawer();
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: "Fai conoscere Attraction",
        message:
          "Scopri Attraction \nL’app per muoverti in modo sostenibile!\nhttps://attraction-app.example.com",
      });
    } catch (err) {
      console.log("Share error", err);
    }
  };

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.colors.surface }]}>
      {/* Header con immagine a piena larghezza */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/logo/header.png")}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Sezione App */}
        <View style={styles.menuSection}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Applicazione
          </Text>

          <DrawerItem
            label={SCREEN_TITLES.Settings}
            icon={({ color, size }) => <Icon source="cog-outline" color={color} size={size} />}
            onPress={() => handleMenuItemPress("Settings")}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />

          <DrawerItem
            label={SCREEN_TITLES.Feedback}
            icon={({ color, size }) => <Icon source="message-text-outline" color={color} size={size} />}
            onPress={() => handleMenuItemPress("Feedback")}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />

          <DrawerItem
            label="Fai conoscere Attraction"
            icon={({ color, size }) => <Icon source="share-variant-outline" color={color} size={size} />}
            onPress={handleShareApp}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Sezione Supporto */}
        <View style={styles.menuSection}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Supporto
          </Text>

          <DrawerItem
            label="Aiuto"
            icon={({ color, size }) => <Icon source="help-circle-outline" color={color} size={size} />}
            onPress={() => {
              console.log("Apri sezione aiuto");
              props.navigation.closeDrawer();
            }}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />

          <DrawerItem
            label="Informazioni"
            icon={({ color, size }) => <Icon source="information-outline" color={color} size={size} />}
            onPress={() => {
              console.log("Apri informazioni app");
              props.navigation.closeDrawer();
            }}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />
        </View>
      </DrawerContentScrollView>

      {/* Footer fisso in basso */}
      <AppFooter />
    </View>
  );
}

export default function DrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="TabsRoot"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: theme.colors.surface, width: "80%" },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurface,
        drawerType: "front",
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="TabsRoot" component={TabNavigator} options={{ drawerItemStyle: { display: "none" } }} />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ navigation }) => ({
          title: SCREEN_TITLES.Settings,
          headerShown: true,
          header: () => (
            <Appbar.Header>
              <Appbar.BackAction color={theme.colors.onSurface} onPress={() => navigation.goBack()} />
              <Appbar.Content
                title={SCREEN_TITLES.Settings}
                titleStyle={[theme.typography?.headerTitle, { color: theme.colors.onSurface }]}
              />
            </Appbar.Header>
          ),
        })}
      />

      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={({ navigation }) => ({
          title: SCREEN_TITLES.Feedback,
          headerShown: true,
          header: () => (
            <Appbar.Header>
              <Appbar.BackAction color={theme.colors.onSurface} onPress={() => navigation.goBack()} />
              <Appbar.Content
                title={SCREEN_TITLES.Feedback}
                titleStyle={[theme.typography?.headerTitle, { color: theme.colors.onSurface }]}
              />
            </Appbar.Header>
          ),
        })}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1 },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", // fallback se l’immagine non carica
  },
  headerImage: {
    width: "100%",  // riempie la larghezza del drawer
    height: 158,    // altezza fissa, regolabile
  },
  menuSection: { marginTop: 10 },
  sectionTitle: { paddingHorizontal: 20, paddingVertical: 10, fontWeight: "600" },
  drawerItem: { marginHorizontal: 10, borderRadius: 8 },
  drawerLabel: { fontSize: 15, marginLeft: 8, fontWeight: "400" },
  divider: { marginVertical: 15, marginHorizontal: 20 },
  footer: { padding: 20, alignItems: "center", marginTop: "auto" },
});
