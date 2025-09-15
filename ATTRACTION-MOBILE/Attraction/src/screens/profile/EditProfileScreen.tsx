import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  TextInput,
  Button,
  Appbar,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setUser } from "../../store/slices/userSlice";
import { useUpdateProfileMutation } from "../../store/api/userApi";

export default function EditProfileScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const handleSave = async () => {
    try {
      const updated = await updateProfile({ username, email }).unwrap();
      dispatch(setUser(updated));
      Alert.alert("Successo", "Profilo aggiornato correttamente.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile aggiornare il profilo.");
    }
  };

  return (
    <View style={styles.container}>
      

      {/* Campi modificabili */}
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={isLoading}
        style={{ marginTop: 20 }}
      >
        {isLoading ? <ActivityIndicator animating={true} /> : "Salva modifiche"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  input: {
    marginBottom: 12,
  },
});
