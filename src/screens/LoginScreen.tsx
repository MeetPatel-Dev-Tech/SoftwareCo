import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import axiosInstance from '../api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import CommonInput from '../components/CommonInput';
import CommonButton from '../components/CommonButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (isLoginValid()) {
      loginUser();
    }
  };

  const isLoginValid = (): boolean => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required.');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required.');
      return false;
    }
    return true;
  };

  const loginUser = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/login', {
        username,
        password,
      });

      // console.log('response ::', response); // Avoid logging sensitive info
      if (response.status === 200) {
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        setLoading(false);
        navigation.navigate('UserList');
      } else {
        setLoading(false);
        Alert.alert(
          'Login Failed',
          response?.data?.message || 'Invalid credentials',
        );
      }
    } catch (error: any) {
      setLoading(false);
      // console.log(error);
      Alert.alert(
        'Login Failed',
        error?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/loginImage.png')}
          style={styles.image}
          resizeMode="stretch"
        />
        <View style={{ marginHorizontal: 10, marginTop: 30 }}>
          <Text style={styles.title}>Login</Text>
          <CommonInput
            label="Username"
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
          />
          <View>
            <CommonInput
              label="Password"
              placeholder="Enter password"
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setSecureTextEntry(!secureTextEntry)}
              style={styles.toggleContainer}
            >
              <Text>{secureTextEntry ? 'Show' : 'Hide'}</Text>
            </TouchableOpacity>
          </View>

          <CommonButton
            title="Log In"
            onPress={handleLogin}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // or match your background color
  },
  container: { flex: 1, marginTop: 20 },
  image: {
    width: width,
    height: 272,
  },
  title: { fontSize: 24, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
  toggleContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    height: '100%',
    justifyContent: 'center',
  },
});
