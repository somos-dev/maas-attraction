// src/screens/profile/EditProfileScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import {
  TextInput,
  Button,
  Appbar,
  ActivityIndicator,
  useTheme,
  Menu,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setUser } from "../../store/slices/userSlice";
import {
  useUpdateProfileMutation,
  usePatchProfileMutation,
  userApi,
} from "../../store/api/userApi";

type UserType = "student" | "worker" | "other";

export default function EditProfileScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [userType, setUserType] = useState<UserType | null>(
    (user?.type as UserType) ?? null
  );
  const [menuVisible, setMenuVisible] = useState(false);

  // PUT usato quando cambia l'email (richiede payload completo)
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  // PATCH per modifiche parziali (username/type)
  const [patchProfile, { isLoading: isPatching }] = usePatchProfileMutation();
  const isLoading = isUpdating || isPatching;

  const typeLabel = (t?: UserType | null) =>
    t === "student"
      ? "Studente"
      : t === "worker"
      ? "Lavoratore"
      : t === "other"
      ? "Altro"
      : "";

  const handleSave = async () => {
    if (!user) return;

    const nextUsername = username.trim();
    const nextEmail = email.trim();
    const currType = (user.type as UserType) || "other";
    const nextType = (userType as UserType) ?? currType;

    // Costruisci SOLO i campi effettivamente cambiati
    const changes: Partial<{ username: string; email: string; type: UserType }> =
      {};
    if (nextUsername !== user.username) changes.username = nextUsername;
    if (nextEmail !== user.email) changes.email = nextEmail;
    if (nextType !== currType) changes.type = nextType;

    if (Object.keys(changes).length === 0) {
      Alert.alert("Nessuna modifica", "Non hai cambiato nessun campo.");
      return;
    }

    const emailChanged = "email" in changes;

    try {
      if (emailChanged) {
        // 🔒 Cambio email → flusso a conferma (il backend NON salva le altre modifiche in questo passaggio)
        const payload = {
          username: nextUsername || user.username,
          type: nextType || currType,
          email: nextEmail, // nuovo indirizzo
        };

        const updated = await updateProfile(payload).unwrap();

        // Se il backend restituisce i dati (non è garantito), aggiorna lo store
        if (updated) dispatch(setUser(updated));

        Alert.alert(
          "Conferma email inviata",
          "Controlla la posta e conferma il nuovo indirizzo. Le altre eventuali modifiche non sono state salvate."
        );

        navigation.goBack();
        return;
      }

      // Nessun cambio email → PATCH parziale per username/type
      const partial: Partial<{ username: string; type: UserType }> = {};
      if ("username" in changes) partial.username = nextUsername;
      if ("type" in changes) partial.type = nextType;

      const updated = await patchProfile(partial).unwrap();

      if (updated) {
        dispatch(setUser(updated));
      } else {
        // Fallback: forza un refetch se il backend non ha restituito data
        const fresh = await dispatch(
          userApi.endpoints.getProfile.initiate(undefined, { force: true })
        ).unwrap();
        dispatch(setUser(fresh));
      }

      Alert.alert("Successo", "Profilo aggiornato correttamente.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        "Errore",
        e?.data?.message ?? e?.message ?? "Impossibile aggiornare il profilo."
      );
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
        autoCapitalize="none"
      />

      {/* Tipo utente */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <TextInput
              label="Tipo utente"
              value={typeLabel(userType)}
              style={styles.input}
              editable={false}
              left={<TextInput.Icon icon="account-group" />}
            />
          </TouchableOpacity>
        }
      >
        <Menu.Item
          onPress={() => {
            setUserType("student");
            setMenuVisible(false);
          }}
          title="Studente"
        />
        <Menu.Item
          onPress={() => {
            setUserType("worker");
            setMenuVisible(false);
          }}
          title="Lavoratore"
        />
        <Menu.Item
          onPress={() => {
            setUserType("other");
            setMenuVisible(false);
          }}
          title="Altro"
        />
      </Menu>

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
  container: { flex: 1, padding: 24 },
  input: { marginBottom: 12 },
});
