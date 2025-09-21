// src/screens/profile/ProfileScreen.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Avatar,
  Divider,
  List,
  useTheme,
  Button,
  ActivityIndicator,
  Card,
  IconButton,
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

  const { data, isSuccess, isFetching } = useGetProfileQuery(undefined, {
    skip: !access || isAnonymous,
  });

  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data));
    }
  }, [isSuccess, data, dispatch]);

  const handleLogout = async () => {
    try {
      try {
        await logoutApi(undefined).unwrap();
      } catch {
        // fallback logout locale
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
      {/* Header utente */}
      <View
        style={[styles.header, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <View style={styles.userRow}>
          {user?.avatar ? (
            <Avatar.Image size={80} source={{ uri: user.avatar }} />
          ) : (
            <Avatar.Icon size={80} icon="account" />
          )}

          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.username ?? "Utente"}</Text>
            {user?.email ? (
              <Text style={styles.email}>{user.email}</Text>
            ) : null}
          </View>

          <IconButton
            icon="logout"
            size={28}
            iconColor={theme.colors.error}
            onPress={handleLogout}
          />
        </View>
      </View>

      {/* Card dati utente */}
      <Card style={styles.card}>
        <Card.Title
          title="Dati utente"
          titleStyle={styles.cardTitle}
          left={(props) => <List.Icon {...props} icon="account-circle" />}
        />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Username"
              description={user?.username ?? "—"}
              left={(props) => <List.Icon {...props} icon="account-outline" />}
            />
            <Divider />
            <List.Item
              title="Email"
              description={user?.email ?? "—"}
              left={(props) => <List.Icon {...props} icon="email-outline" />}
            />
            {user?.type && (
              <>
                <Divider />
                <List.Item
                  title="Tipo utente"
                  description={user.type}
                  left={(props) => (
                    <List.Icon {...props} icon="badge-account-horizontal-outline" />
                  )}
                />
              </>
            )}
            {user?.codice_fiscale && (
              <>
                <Divider />
                <List.Item
                  title="Codice fiscale"
                  description={user.codice_fiscale}
                  left={(props) => (
                    <List.Icon {...props} icon="card-account-details-outline" />
                  )}
                />
              </>
            )}
          </List.Section>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.editButton}
        contentStyle={{ paddingVertical: 6 }}
        onPress={() => navigation.navigate("EditProfile")}
      >
        Modifica profilo
      </Button>

      {/* Sezioni extra */}
      <Card style={styles.card}>
        <Card.Title
          title="Sezioni"
          titleStyle={styles.cardTitle}
          left={(props) => <List.Icon {...props} icon="dots-grid" />}
        />
        <Card.Content>
          <List.Item
            title="Preferenze di trasporto"
            left={(props) => <List.Icon {...props} icon="train-car" />}
            onPress={() => console.log("Apri Preferenze")}
          />
          <List.Item
            title="Badge e Ricompense"
            left={(props) => <List.Icon {...props} icon="star-circle-outline" />}
            onPress={() => console.log("Apri Badge")}
          />
          <List.Item
            title="Storico viaggi"
            left={(props) => <List.Icon {...props} icon="history" />}
            onPress={() => console.log("Apri Storico")}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  editButton: {
    alignSelf: "center",
    width: "40%",
    marginBottom: 24,
    borderRadius: 30,
  },
});


