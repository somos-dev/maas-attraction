import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from 'react-native-paper';
import {Image} from 'react-native';

import MainStack from '../screens/main/MainStack';
import LinesStack from '../screens/lines/LinesStack';
import StopsStack from '../screens/stops/StopsStack';
import ProfileStack from '../screens/profile/ProfileStack';

import type {TabNavigatorParamList} from './types';

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

export default function TabNavigator() {
  const theme = useTheme();

  const renderIcon = (
    focused: boolean,
    activeSource: any,
    inactiveSource: any,
  ) => (
    <Image
      source={focused ? activeSource : inactiveSource}
      style={{
        width: 40,
        height: 40,
        resizeMode: 'cover',
      }}
    />
  );

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {fontSize: 13},
        tabBarIconStyle: {marginBottom: 1}, // spazio tra icona e testo
      }}>
      <Tab.Screen
        name="HomeTab"
        component={MainStack}
        options={{
          title: 'Home',
          tabBarIcon: ({focused}) =>
            renderIcon(
              focused,
              require('../assets/images/icons/map.png'),
              require('../assets/images/icons/map-grey.png'),
            ),
        }}
      />
      <Tab.Screen
        name="LinesTab"
        component={LinesStack}
        options={{
          title: 'Linee',
          tabBarIcon: ({focused}) =>
            renderIcon(
              focused,
              require('../assets/images/icons/trip.png'),
              require('../assets/images/icons/trip-grey.png'),
            ),
        }}
      />
      <Tab.Screen
        name="StopsTab"
        component={StopsStack}
        options={{
          title: 'Fermate',
          tabBarIcon: ({focused}) =>
            renderIcon(
              focused,
              require('../assets/images/icons/flag.png'),
              require('../assets/images/icons/flag-grey.png'),
            ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profilo',
          tabBarIcon: ({focused}) =>
            renderIcon(
              focused,
              require('../assets/images/icons/a.png'),
              require('../assets/images/icons/a-grey.png'),
            ),
        }}
      />
    </Tab.Navigator>
  );
}
