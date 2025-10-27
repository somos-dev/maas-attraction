import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {useTheme, Appbar, Text, Divider, Icon} from 'react-native-paper';
import {View, StyleSheet, Share, Image, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import AppFooter from '../components/common/footer/AppFooter';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/drawer/SettingsScreen';
import FeedbackScreen from '../screens/drawer/FeedbackScreen';

import type {DrawerParamList} from './types';
import {SCREEN_TITLES} from './screenTitles';

const Drawer = createDrawerNavigator<DrawerParamList>();
const {width} = Dimensions.get('window');

function CustomDrawerContent(props: any) {
  const theme = useTheme();

  const handleMenuItemPress = (routeName: string) => {
    props.navigation.navigate(routeName);
    props.navigation.closeDrawer();
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Fai conoscere Attraction',
        message:
          'Scopri Attraction \nL’app per muoverti in modo sostenibile!\nhttps://maas.somos.srl',
      });
    } catch (err) {
      console.log('Share error', err);
    }
  };

  return (
    <View
      style={[styles.drawerContainer, {backgroundColor: theme.colors.surface}]}>
      {/* HEADER con gradiente responsive */}
      <SafeAreaView edges={['top']} style={{backgroundColor: 'transparent'}}>
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.primary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>all your mobility</Text>
            <Image
              source={require('../assets/images/logo/logo.png')}
              style={styles.logo}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>

      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 0}}>
        {/* Sezione App */}
        <View style={styles.menuSection}>
          <Text
            variant="labelLarge"
            style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            Menù
          </Text>

          <DrawerItem
            label={SCREEN_TITLES.Settings}
            icon={({color, size}) => (
              <Icon source="cog-outline" color={color} size={size} />
            )}
            onPress={() => handleMenuItemPress('Settings')}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />

          <DrawerItem
            label={SCREEN_TITLES.Feedback}
            icon={({color, size}) => (
              <Icon source="message-text-outline" color={color} size={size} />
            )}
            onPress={() => handleMenuItemPress('Feedback')}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />

          <DrawerItem
            label="Fai conoscere Attraction"
            icon={({color, size}) => (
              <Icon source="share-variant-outline" color={color} size={size} />
            )}
            onPress={handleShareApp}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Sezione Supporto */}
        <View style={styles.menuSection}>
          <Text
            variant="labelLarge"
            style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            Supporto
          </Text>

          {/* <DrawerItem
            label="Aiuto"
            icon={({color, size}) => (
              <Icon source="help-circle-outline" color={color} size={size} />
            )}
            onPress={() => {
              console.log('Apri sezione aiuto');
              props.navigation.closeDrawer();
            }}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          /> */}

          <DrawerItem
            label="Informazioni"
            icon={({color, size}) => (
              <Icon source="information-outline" color={color} size={size} />
            )}
            onPress={() => {
              console.log('Apri informazioni app');
              props.navigation.closeDrawer();
            }}
            style={styles.drawerItem}
            labelStyle={styles.drawerLabel}
          />
        </View>
      </DrawerContentScrollView>

      {/* Footer fisso in basso */}
      <AppFooter />
    </View>
  );
}

export default function DrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="TabsRoot"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {backgroundColor: theme.colors.surface, width: '80%'},
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurface,
        drawerType: 'front',
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}>
      <Drawer.Screen
        name="TabsRoot"
        component={TabNavigator}
        options={{drawerItemStyle: {display: 'none'}}}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({navigation}) => ({
          title: SCREEN_TITLES.Settings,
          headerShown: true,
          header: () => (
            <Appbar.Header>
              <Appbar.BackAction
                color={theme.colors.onSurface}
                onPress={() => navigation.goBack()}
              />
              <Appbar.Content
                title={SCREEN_TITLES.Settings}
                titleStyle={[
                  theme.typography?.headerTitle,
                  {color: theme.colors.onSurface},
                ]}
              />
            </Appbar.Header>
          ),
        })}
      />

      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={({navigation}) => ({
          title: SCREEN_TITLES.Feedback,
          headerShown: true,
          header: () => (
            <Appbar.Header>
              <Appbar.BackAction
                color={theme.colors.onSurface}
                onPress={() => navigation.goBack()}
              />
              <Appbar.Content
                title={SCREEN_TITLES.Feedback}
                titleStyle={[
                  theme.typography?.headerTitle,
                  {color: theme.colors.onSurface},
                ]}
              />
            </Appbar.Header>
          ),
        })}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {flex: 1},

  headerContainer: {
    width: '100%',
    minHeight: 160,
    justifyContent: 'center',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },

  headerText: {
    fontSize: width > 600 ? 22 : 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: width > 600 ? 20 : 12,
  },

  logo: {
    width: width > 600 ? 120 : 80,
    height: width > 600 ? 120 : 80,
    resizeMode: 'contain',
    marginRight: width > 600 ? 30 : 20,
  },

  menuSection: {marginTop: 10},
  sectionTitle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontWeight: '600',
  },
  drawerItem: {marginHorizontal: 10, borderRadius: 8},
  drawerLabel: {fontSize: 15, marginLeft: 8, fontWeight: '400'},
  divider: {marginVertical: 15, marginHorizontal: 20},
  footer: {alignItems: 'center', marginTop: 'auto'},
});
