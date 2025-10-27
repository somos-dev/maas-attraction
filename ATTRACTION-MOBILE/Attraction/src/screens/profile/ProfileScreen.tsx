// src/screens/profile/ProfileScreen.tsx
import React, {useEffect} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Text,
  Avatar,
  Divider,
  useTheme,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../store/store';
import {setUser, clearUser} from '../../store/slices/userSlice';
import {clearAuth} from '../../store/slices/authSlice';
import {useGetProfileQuery, userApi} from '../../store/api/userApi';
import {useLogoutMutation} from '../../store/api/authApi';
import {useNavigation} from '@react-navigation/native';

// componenti riutilizzabili
import AppCard from '../../components/common/card/AppCard';
import AppButton from '../../components/common/button/AppButton';
import AppListItem from '../../components/common/list/AppListItem';
import RestrictedAccess from '../../components/common/RestrictedAccess';

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const user = useSelector((state: RootState) => state.user);
  const {access, refresh, isAnonymous} = useSelector(
    (state: RootState) => state.auth,
  );

  if (isAnonymous) {
    return <RestrictedAccess />;
  }

  const {data, isSuccess, isFetching} = useGetProfileQuery(undefined, {
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
      //  backend richiede il refresh nel body
      if (refresh) {
        try {
          await logoutApi({refresh}).unwrap();
        } catch {
          // Se la chiamata fallisce, proseguiamo con il logout locale
        }
      }
      // Logout locale (sempre)
      dispatch(clearAuth());
      dispatch(clearUser());
      dispatch(userApi.util.resetApiState());
    } catch (e: any) {
      Alert.alert('Errore', e?.message ?? 'Impossibile completare il logout.');
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
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}
      showsVerticalScrollIndicator={false}>
      {/* Card unica: Dati utente */}
      <AppCard title="Dati utente">
        {/* Riga con avatar, nome, email + logout */}
        <View style={styles.userRow}>
          {user?.avatar ? (
            <Avatar.Image size={80} source={{uri: user.avatar}} />
          ) : (
            <Avatar.Icon size={80} icon="account" />
          )}

          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.username ?? 'Utente'}</Text>
            {user?.email && <Text style={styles.email}>{user.email}</Text>}
          </View>

          <IconButton
            icon="logout"
            size={28}
            iconColor={theme.colors.error}
            onPress={handleLogout}
          />
        </View>

        {/* Lista dati utente */}
        <AppListItem
          icon="account-outline"
          title="Username"
          description={user?.username ?? '—'}
        />
        <Divider />
        <AppListItem
          icon="email-outline"
          title="Email"
          description={user?.email ?? '—'}
        />
        {user?.type && (
          <>
            <Divider />
            <AppListItem
              icon="badge-account-horizontal-outline"
              title="Tipo utente"
              description={user.type}
            />
          </>
        )}
        {user?.codice_fiscale && (
          <>
            <Divider />
            <AppListItem
              icon="card-account-details-outline"
              title="Codice fiscale"
              description={user.codice_fiscale}
            />
          </>
        )}

        {/* Pulsante Modifica */}
        <AppButton
          label="Modifica"
          onPress={() => navigation.navigate('EditProfile')}
          style={{marginTop: 16}}
        />
      </AppCard>

      {/* Sezioni extra */}
      <AppCard title="Preferenze">
        <AppListItem
          icon="train-car"
          title="Preferenze di trasporto"
          onPress={() => navigation.navigate('TransportPreferences')}
          rightIcon="chevron-right"
        />
        <Divider />
        <AppListItem
          icon="star-circle-outline"
          title="Badge e Ricompense"
          onPress={() => navigation.navigate('Gamification')}
          rightIcon="chevron-right"
        />
        <Divider />
        <AppListItem
          icon="history"
          title="Storico viaggi"
          onPress={() => navigation.navigate('TripsHistory')}
          rightIcon="chevron-right"
        />
      </AppCard>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
});
