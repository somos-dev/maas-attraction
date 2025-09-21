import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function AppFooter() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.outline }]}>
      {/* Logo */}
      <Image
        source={require("../../../assets/images/logo/Footer.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Versione app */}
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurface, opacity: 0.6 }}
      >
        Versione 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: "100%", 
    height: 90,  
    marginBottom: 8,
  },
});
