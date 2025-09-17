import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { Button, useTheme, ActivityIndicator } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch } from "react-redux";
import { completeOnboarding } from "../../store/slices/onboardingSlice";
import { setAnonymous } from "../../store/slices/authSlice";

export default function OnboardingScreen() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState("P");
  const [isReady, setIsReady] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false); 

  useEffect(() => {
    setOrientation(width > height ? "L" : "P");
  }, [width, height]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const slides = [
    { key: "slide1", text: "Benvenuto in Attraction 🚍\nTrova il tuo viaggio in un attimo." },
    { key: "slide2", text: "Risparmia tempo ⏱\nConsulta orari e fermate in tempo reale." },
    { key: "slide3", text: "Viaggia green 🌱\n." },
  ];

  // Fine onboarding → aggiorna Redux
  const handleFinish = (mode: "Login" | "Register" | "guest") => {
    if (mode === "guest") {
      setLoadingGuest(true); // avvia animazione
      setTimeout(() => {
        dispatch(completeOnboarding(null));
        dispatch(setAnonymous());
        setLoadingGuest(false);
      }, 1000); // simula un piccolo delay
    } else {
      dispatch(completeOnboarding(mode));
    }
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
          onPress={() => handleFinish("Login")}
        >
          Accedi
        </Button>
        <Button
          mode="contained"
          style={styles.signupButton}
          onPress={() => handleFinish("Register")}
        >
          Registrati
        </Button>
      </View>

      {loadingGuest ? (
        <ActivityIndicator
          animating={true}
          size="small"
          style={{ marginTop: 30 }}
          color={theme.colors.primary}
        />
      ) : (
        <Text style={styles.skipText} onPress={() => handleFinish("guest")}>
          Salta (ospite)
        </Text>
      )}
    </View>
  );

  if (!isReady) return null;

  return (
    <LinearGradient colors={["#66a6ff", "#A0EACF"]} style={styles.container}>
      <Text style={styles.fixedTitle}>Attraction</Text>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={() => handleFinish("Login")}
        showSkipButton
        onSkip={() => handleFinish("Login")}
        renderPagination={(activeIndex) => (
          <View style={styles.paginationContainer}>
            <View style={styles.dots}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex ? styles.activeDot : null]}
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



