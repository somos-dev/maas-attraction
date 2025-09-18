// src/screens/splash/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={["#50b948", "#45c3d6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Image
        source={require("../../assets/images/logo/LogoBianco.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
});
