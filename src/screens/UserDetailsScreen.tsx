// src/screens/UserDetailScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import axiosInstance from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';

type UserDetailRouteProp = RouteProp<RootStackParamList, 'UserDetails'>;

type Coordinates = {
  latitude: number;
  longitude: number;
};

const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address,
    )}&format=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyApp/1.0 (myemail@example.com)', // required by Nominatim usage policy
      },
    });
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const UserDetailScreen = () => {
  const route = useRoute<UserDetailRouteProp>();
  const { userId } = route.params;

  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [coords, setCoords] = useState<Coordinates | null>(null);

  const fetchUserDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login again.');
        setLoading(false);
        return;
      }
      const response = await axiosInstance.get(`user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserDetail(response.data);
      setAddress(response.data.data.addressress);
      const location = await geocodeAddress(response.data.data.addressress);
      if (location) setCoords(location);
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!coords) {
    return (
      <View style={styles.center}>
        <Text>Could not find location for the address.</Text>
      </View>
    );
  }

  if (!userDetail) {
    return (
      <View style={styles.container}>
        <Text>Something went wrong...</Text>
      </View>
    );
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${coords.latitude}, ${coords.longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
        L.marker([${coords.latitude}, ${coords.longitude}]).addTo(map)
          .bindPopup('${address}')
          .openPopup();
      </script>
    </body>
    </html>
  `;

  const fixedContent = `There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary.`;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.contentText}>{fixedContent}</Text>
      <View style={[styles.mapContainer]}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={{ flex: 1 }}
          scrollEnabled={false}
        />
      </View>
      <View style={styles.letlongContainer}>
        <Text style={styles.letlongHader}>Current Lat/Long:</Text>
        <Text style={styles.letlongText}>
          {coords.latitude}, {coords.longitude}
        </Text>
      </View>
    </ScrollView>
  );
};

export default UserDetailScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentText: {
    fontSize: 16,
    fontWeight: 400,
    color: '#000000',
    lineHeight: 26,
    padding: 10,
  },
  mapContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    height: 200,
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letlongContainer: { padding: 10 },
  letlongHader: { fontSize: 18, fontWeight: 600 },
  letlongText: { color: '#848484', fontSize: 14, fontWeight: 600 },
});
