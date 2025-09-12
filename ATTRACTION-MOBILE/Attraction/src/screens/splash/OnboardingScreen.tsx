import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Button, useTheme } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState("P");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setOrientation(width > height ? "L" : "P");
  }, [width, height]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  const slides = [
    { key: "slide1", text: "Benvenuto in Attraction 🚍\nTrova il tuo viaggio in un attimo." },
    { key: "slide2", text: "Risparmia tempo ⏱\nConsulta orari e fermate in tempo reale." },
    { key: "slide3", text: "Viaggia green 🌱\n." },
  ];

  const handleDone = async () => {
    await AsyncStorage.setItem("onboardingShown", "true");
    navigation.replace("Auth", { screen: "Login" });
  };

  const renderItem = ({ item }: { item: { text: string } }) => (
    <View style={styles.slide}>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  const renderBottomButtons = () => (
    <View style={styles.buttonWrapper}>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.loginButton}
          onPress={async () => {
            await AsyncStorage.setItem("onboardingShown", "true");
            navigation.replace("Auth", { screen: "Login" });
          }}
        >
          Accedi
        </Button>
        <Button
          mode="contained"
          style={styles.signupButton}
          onPress={async () => {
            await AsyncStorage.setItem("onboardingShown", "true");
            navigation.replace("Auth", { screen: "Register" });
          }}
        >
          Registrati
        </Button>
      </View>
      <Text
        style={styles.skipText}
        onPress={async () => {
          await AsyncStorage.setItem("onboardingShown", "true");
          navigation.replace("Tab");
        }}
      >
        Salta (ospite)
      </Text>
    </View>
  );

  if (!isReady) return null;

  return (
    <LinearGradient
      colors={["#66a6ff", "#A0EACF"]}
      style={styles.container}
    >
      <Text style={styles.fixedTitle}>Attraction</Text>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={handleDone}
        showSkipButton
        onSkip={handleDone}
        renderPagination={(activeIndex) => (
          <View style={styles.paginationContainer}>
            <View style={styles.dots}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeIndex ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
            {renderBottomButtons()}
          </View>
        )}
        dotStyle={{ display: "none" }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  fixedTitle: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    marginBottom: 10,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 22,
    color: "#333",
    textAlign: "center",
    lineHeight: 28,
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#008080",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 60,
  },
  loginButton: {
    flex: 1,
    marginRight: 15,
  },
  signupButton: {
    flex: 1,
    marginLeft: 15,
  },
  buttonWrapper: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  skipText: {
    marginTop: 30,
    fontSize: 16,
    color: "#333",
    textDecorationLine: "underline",
  },
});





