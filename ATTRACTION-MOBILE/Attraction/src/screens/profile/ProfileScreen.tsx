// src/screens/profile/ProfileScreen.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Avatar,
  Divider,
  TouchableRipple,
  useTheme,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setUser, clearUser } from "../../store/slices/userSlice";
import { clearAuth } from "../../store/slices/authSlice";
import { useGetProfileQuery, userApi } from "../../store/api/userApi";
import { useLogoutMutation } from "../../store/api/authApi";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);
  const { access, isAnonymous } = useSelector((state: RootState) => state.auth);

  // query profilo: parte solo se loggato e non anonimo
  const { data, isSuccess, isFetching } = useGetProfileQuery(undefined, {
    skip: !access || isAnonymous,
  });

  // mutation logout
  const [logoutApi] = useLogoutMutation();

  // aggiorno lo slice quando arrivano i dati
  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data));
console.log("✅ Profilo ricevuto:", data);

    // debug specifico
    console.log("Username:", data.username);
    console.log("Email:", data.email);

    }
  }, [isSuccess, data, dispatch]);

  const handleLogout = async () => {
    try {
      try {
        await logoutApi(undefined).unwrap();
      } catch {
        // se il server non risponde, il logout locale è sufficiente
      }
      dispatch(clearAuth());
      dispatch(clearUser());
      dispatch(userApi.util.resetApiState());
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile completare il logout.");
    }
  };

  if (isFetching) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating={true} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user?.avatar ? (
        <Avatar.Image size={90} source={{ uri: user.avatar }} />
      ) : (
        <Avatar.Icon size={90} icon="account" />
      )}
      <Text style={styles.name}>{user?.username ?? "Utente"}</Text>
      <Text style={{ marginBottom: 16 }}>{user?.email}</Text>
      {user?.type && <Text>Tipo: {user.type}</Text>}
      {user?.codice_fiscale && <Text>CF: {user.codice_fiscale}</Text>}

      <Button
        mode="contained"
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate("EditProfile")}
      >
        Modifica profilo
      </Button>

      <Divider style={{ marginVertical: 24, width: "100%" }} />

      <TouchableRipple onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: theme.colors.error }]}>
          Esci
        </Text>
      </TouchableRipple>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
});


