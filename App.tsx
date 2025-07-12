import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen.tsx';
import UserListScreen from './src/screens/UserListScreen';
import UserDetailsScreen from './src/screens/UserDetailsScreen';
import { StatusBar } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  UserList: undefined;
  UserDetails: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#F5F5F5' },
            headerBackVisible: false,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserList"
            component={UserListScreen}
            options={{ title: 'List' }}
          />
          <Stack.Screen
            name="UserDetails"
            component={UserDetailsScreen}
            options={{ title: 'Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
