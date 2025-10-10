import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Appbar,
  TextInput,
  Button,
  Snackbar,
  useTheme,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useCreateFeedbackMutation } from "../../store/api/feedbackApi";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import RestrictedAccess from "../../components/common/RestrictedAccess"; // 👈 aggiunto

export default function FeedbackScreen() {
  const theme = useTheme();
  const auth = useSelector((state: RootState) => state.auth);
  const user = useSelector((state: RootState) => state.user);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const handleSubmit = async () => {
    if (!user) {
      console.error("Utente non autenticato");
      return;
    }

    try {
      await createFeedback({
        user_id: user.id, // aggiunto
        text: `⭐ ${rating}/5\n${comment}`,
      }).unwrap();

      setSnackbarVisible(true);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Errore invio feedback:", error);
    }
  };

  // 👇 Se l'utente è anonimo o non loggato, mostriamo RestrictedAccess
  if (auth.isAnonymous || !auth.access) {
    return (
      <RestrictedAccess message="Solo gli utenti registrati possono inviare un feedback." />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <Appbar.Header
          style={{ backgroundColor: "transparent", elevation: 0 }}
        >
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
          loading={isLoading}
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

