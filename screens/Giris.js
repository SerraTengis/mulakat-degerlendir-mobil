import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Giris({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3EBF3" />
      
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Ionicons name="briefcase" size={50} color="#0A66C2" />
        </View>
        <Text style={styles.logoText}>Mülakat<Text style={styles.logoBold}>Değerlendir</Text></Text>
        <Text style={styles.subtitle}>Deneyimlerini paylaş</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('GirisEkrani')}
        >
          <Text style={styles.buttonTextPrimary}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('KayitOl')}
        >
          <Text style={styles.buttonTextSecondary}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3EBF3', // YENİ: Buz Mavisi
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  logoBox: { width: 100, height: 100, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } }) },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#0A1931' },
  logoBold: { color: '#0A66C2' },
  subtitle: { fontSize: 16, color: '#666666', marginTop: 8 },
  
  buttonContainer: { width: '100%', paddingHorizontal: 30, marginBottom: 20 },
  buttonPrimary: { width: '100%', backgroundColor: '#0A1931', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15, elevation: 2 },
  buttonTextPrimary: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  buttonSecondary: { width: '100%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#0A1931', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  buttonTextSecondary: { color: '#0A1931', fontSize: 16, fontWeight: 'bold' },
});
