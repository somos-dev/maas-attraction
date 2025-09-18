import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions, Image } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { Button, useTheme, ActivityIndicator } from "react-native-paper";
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
    { key: "slide3", text: "Viaggia green 🌱\nScegli la mobilità sostenibile." },
  ];

  const handleFinish = (mode: "Login" | "Register" | "guest") => {
    if (mode === "guest") {
      setLoadingGuest(true);
      setTimeout(() => {
        dispatch(completeOnboarding(null));
        dispatch(setAnonymous());
        setLoadingGuest(false);
      }, 1000);
    } else {
      dispatch(completeOnboarding(mode));
    }
  };

  const renderItem = ({ item }: { item: { text: string } }) => (
    <View style={styles.slide}>
      <Text style={[styles.text, { color: theme.colors.text }]}>{item.text}</Text>
    </View>
  );

  const renderBottomButtons = () => (
    <View style={styles.buttonWrapper}>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.loginButton}
          buttonColor={theme.colors.primary}
          textColor="#fff"
          onPress={() => handleFinish("Login")}
        >
          Accedi
        </Button>
        <Button
          mode="contained-tonal"
          style={styles.signupButton}
          buttonColor={theme.colors.secondary}
          textColor="#fff"
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
        <Text
          style={[styles.skipText, { color: theme.colors.text }]}
          onPress={() => handleFinish("guest")}
        >
          Salta (ospite)
        </Text>
      )}
    </View>
  );

  if (!isReady) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image
        source={require("../../assets/images/logo/Attraction.scritta.png")}
        style={styles.logo}
        resizeMode="contain"
      />
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
                  style={[
                    styles.dot,
                    { backgroundColor: i === activeIndex ? theme.colors.primary : "#ccc" },
                  ]}
                />
              ))}
            </View>
            {renderBottomButtons()}
          </View>
        )}
        dotStyle={{ display: "none" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  logo: {
    width: "70%",
    height: 200,
    alignSelf: "center",
    marginBottom: 10,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: "Montserrat-Regular",
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
  },
  loginButton: {
    flex: 1,
    marginRight: 10,
  },
  signupButton: {
    flex: 1,
    marginLeft: 10,
  },
  buttonWrapper: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  skipText: {
    marginTop: 25,
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "Montserrat-Light",
  },
});




