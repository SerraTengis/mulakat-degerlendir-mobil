import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnaSayfa({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3EBF3" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>Mülakat<Text style={styles.logoBold}>Değerlendir</Text></Text>
          <Text style={styles.subtitle}>Kariyer yolculuğunu paylaş</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Profilim"
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profil')}
        >
          <Ionicons name="person-circle" size={42} color="#0A1931" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('MulakatDegerlendir')}>
          <View style={styles.buttonIconContainer}>
            <Ionicons name="add-circle" size={28} color="#ffffff" />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.primaryButtonText}>Mülakat Değerlendir</Text>
            <Text style={styles.buttonSubtitle}>Yeni bir deneyim ekle</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('DegerlendirmeleriOku')}>
          <View style={[styles.buttonIconContainer, { backgroundColor: '#E3EBF3' }]}>
            <Ionicons name="reader" size={28} color="#0A1931" />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.secondaryButtonText}>Değerlendirmeleri Oku</Text>
            <Text style={styles.secondaryButtonSubtitle}>Diğer adayların tecrübeleri</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#0A1931" style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20 },
  logoText: { fontSize: 26, color: '#0A1931', letterSpacing: -0.5 },
  logoBold: { fontWeight: 'bold', color: '#0A66C2' },
  subtitle: { fontSize: 14, color: '#666666', marginTop: 4 },
  profileButton: { justifyContent: 'center', alignItems: 'center' },
  
  menuContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, marginTop: -50 },
  
  primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1931', paddingVertical: 20, paddingHorizontal: 20, borderRadius: 16, marginBottom: 20, elevation: 4, shadowColor: '#0A1931', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  buttonSubtitle: { color: '#A0B4D6', fontSize: 13, marginTop: 2 },

  secondaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: 20, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#D0DCEB', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 4 },
  secondaryButtonText: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  secondaryButtonSubtitle: { color: '#666666', fontSize: 13, marginTop: 2 },

  buttonIconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  buttonTextContainer: { flex: 1 },
  arrowIcon: { opacity: 0.8 }
});
