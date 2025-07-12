import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

interface User {
  _id: string;
  name: string;
  email: string;
  // Add more fields as per API response if needed
}

type UserListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UserList'
>;

const UserListScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation<UserListNavigationProp>();
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('user/list?skip=0&limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('response user list ::', response);

      if (response.status === 200 && response.data) {
        setUsers(response.data.data || []); // Adjust if API uses a different key
      } else {
        Alert.alert('Error', 'Failed to fetch user list.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const userImages = [
    require('../assets/images/user1.png'),
    require('../assets/images/user2.jpg'),
    require('../assets/images/user3.jpg'),
    require('../assets/images/user4.jpg'),
    require('../assets/images/user5.jpg'),
  ];

  const renderItem = ({ item, index }: { item: User; index: number }) => {
    const imageSource = userImages[index % userImages.length]; // cycles 0-4, repeats

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('UserDetails', { userId: item._id })}
        style={styles.shadowContainer}
      >
        <Image source={imageSource} style={styles.avatar} />
        <Text style={styles.centeredText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {users.length === 0 ? (
        <View style={styles.centered}>
          <Text>No users found.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemContainer: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  emailText: { fontSize: 14, color: '#555' },

  shadowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
    zIndex: 1,
  },
  centeredText: {
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    fontSize: 18,
    fontWeight: '600',
    zIndex: 0,
  },
});

export default UserListScreen;
