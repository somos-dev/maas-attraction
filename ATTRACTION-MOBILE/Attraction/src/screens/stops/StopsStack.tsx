import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from 'react-native-paper';
import StopsScreen from './StopsScreen';
import StopDetailScreen from './StopDetailScreen';
import type {StopsStackParamList} from '../../navigation/types';
import LineDetailScreen from '../lines/LineDetailScreen';

const Stack = createNativeStackNavigator<StopsStackParamList>();

export default function StopsStack() {
  const theme = useTheme(); // 👈 accedi al tema

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {backgroundColor: theme.colors.surface},
        headerTintColor: theme.colors.onSurface, // 👈 testo coerente
      }}>
      <Stack.Screen
        name="Stops"
        component={StopsScreen}
        options={{title: 'Fermate'}}
      />
      <Stack.Screen
        name="StopDetail"
        component={StopDetailScreen}
        options={{title: 'Dettaglio fermata'}}
      />
      <Stack.Screen
        name="LineDetailStop"
        component={LineDetailScreen}
        options={{title: 'Dettagli linea'}}
      />
    </Stack.Navigator>
  );
}
