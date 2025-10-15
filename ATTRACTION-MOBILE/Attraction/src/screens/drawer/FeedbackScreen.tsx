// src/screens/drawer/FeedbackScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Appbar,
  TextInput,
  Button,
  Snackbar,
  useTheme,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import RestrictedAccess from "../../components/common/RestrictedAccess";
import {
  useGetMyFeedbackQuery,
  useUpdateFeedbackMutation,
} from "../../store/api/feedbackApi";

export default function FeedbackScreen() {
  const theme = useTheme();
  const auth = useSelector((state: RootState) => state.auth);

  // Carica il feedback dell’utente
  const { data: myFeedback, isFetching } = useGetMyFeedbackQuery(undefined, {
    skip: !auth.access || auth.isAnonymous,
  });

  const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Precompila se esiste già un feedback
  useEffect(() => {
    if (myFeedback?.text) {
      setComment(myFeedback.text);
      // Se il testo inizia con "⭐ X/5", prova a ricavare X
      const m = myFeedback.text.match(/^⭐\s*(\d)\s*\/\s*5/i);
      if (m) {
        const parsed = parseInt(m[1], 10);
        if (parsed >= 1 && parsed <= 5) setRating(parsed);
      }
    }
  }, [myFeedback]);

  const handleSubmit = async () => {
    try {
      const textPayload =
        rating > 0 ? `⭐ ${rating}/5\n${comment.trim()}` : comment.trim();

      await updateFeedback({ text: textPayload }).unwrap();

      setSnackbarVisible(true);
    } catch (error) {
      console.error("Errore invio/aggiornamento feedback:", error);
    }
  };

  // Solo utenti registrati
  if (auth.isAnonymous || !auth.access) {
    return (
      <RestrictedAccess message="Solo gli utenti registrati possono inviare un feedback." />
    );
  }

  const isLoading = isFetching || isUpdating;
  const disabled = rating === 0 || comment.trim() === "" || isLoading;

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

        {/* Pulsante invio/aggiorna */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={disabled}
        >
          {myFeedback ? "Aggiorna" : "Invia"}
        </Button>

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {myFeedback ? "Feedback aggiornato!" : "Grazie per il tuo feedback!"}
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



