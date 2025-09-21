import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Text, TextInput, Button, Snackbar, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function FeedbackScreen() {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSubmit = () => {
    // TODO: invio feedback al backend
    console.log("Feedback inviato:", { rating, comment });
    setSnackbarVisible(true);
    setRating(0);
    setComment("");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <Appbar.Header style={{ backgroundColor: "transparent", elevation: 0 }}>
          <Appbar.Content
            title="Feedback"
            titleStyle={{ textAlign: "center", fontSize: 24 }}
          />
        </Appbar.Header>

        {/* Stelle */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Icon
              key={value}
              name={value <= rating ? "star" : "star-outline"}
              size={36}
              color={theme.colors.primary}
              onPress={() => setRating(value)}
            />
          ))}
        </View>

        {/* Commento */}
        <TextInput
          label="Scrivi la tua opinione"
          mode="outlined"
          multiline
          value={comment}
          onChangeText={setComment}
          style={styles.input}
        />

        {/* Pulsante invio */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={rating === 0 || comment.trim() === ""}
        >
          Invia
        </Button>

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          Grazie per il tuo feedback!
        </Snackbar>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});
