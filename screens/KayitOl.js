import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Firebase bağlantıları
import { auth, db } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getAuthErrorMessage, isValidEmail } from '../authUtils';

export default function KayitOl({ navigation }) {
  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  
  const [sifreGorunur, setSifreGorunur] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  // E-posta formatını kontrol eden fonksiyon (Regex)
  const isEmailValid = (emailAdresi) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAdresi);
  };

  // YENİ: Şifre zorluğunu kontrol eden fonksiyon (Regex)
  const isPasswordValid = (password) => {
    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password); // En az bir büyük harf
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>_]/.test(password); // En az bir sembol
    
    return minLength && hasUppercase && hasSymbol;
  };

  // Firebase hatalarını Türkçeye çeviren fonksiyon
  const getFirebaseHataMesaji = (hataKodu) => {
    switch (hataKodu) {
      case 'auth/email-already-in-use': return "Bu e-posta adresi zaten kullanımda. Lütfen farklı bir e-posta deneyin veya giriş yapın.";
      case 'auth/invalid-email': return "Geçersiz bir e-posta adresi formatı.";
      case 'auth/weak-password': return "Şifreniz çok zayıf. Lütfen daha güçlü bir şifre belirleyin.";
      case 'auth/network-request-failed': return "Ağ bağlantısı hatası. Lütfen internetinizi kontrol edin.";
      case 'auth/operation-not-allowed': return "E-posta/şifre ile kayıt Firebase konsolunda etkin değil.";
      case 'auth/configuration-not-found': return "Firebase Authentication yapılandırması bulunamadı.";
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid': return "Firebase API anahtarı geçersiz veya bu uygulama için yetkili değil.";
      default: return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
    }
  };

  const handleKayit = async () => {
    // 1. Boş alan kontrolü
    if (!adSoyad.trim() || !email.trim() || !sifre.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    // 2. E-posta format kontrolü
    if (!isValidEmail(email)) {
      Alert.alert("Hatalı Format", "Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    // 3. GÜNCELLENDİ: Şifre karmaşıklığı kontrolü
    if (!isPasswordValid(sifre)) {
      Alert.alert(
        "Zayıf Şifre", 
        "Şifreniz güvenlik kriterlerini karşılamıyor. Lütfen en az 6 karakter, 1 büyük harf ve 1 sembol (!@#$ vb.) içeren bir şifre oluşturun."
      );
      return;
    }

    setYukleniyor(true);

    try {
      // Firebase Authentication ile hesap oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), sifre);
      const user = userCredential.user;

      // Kullanıcının adını Firebase profiline ekle
      await updateProfile(user, {
        displayName: adSoyad.trim()
      });
      await sendEmailVerification(user);

      // Authentication hesabı oluşturulduktan sonra profil belgesini yaz.
      // Firestore kuralı bu adımı engellerse hesap yine de geçerlidir.
      try {
        await setDoc(doc(db, "users", user.uid), {
          adSoyad: adSoyad.trim(),
          email: user.email,
          kayitTarihi: serverTimestamp()
        });
      } catch (firestoreError) {
        console.warn("Kullanıcı profili Firestore'a yazılamadı:", firestoreError.code, firestoreError.message);
        throw firestoreError;
      }

      await signOut(auth);
      Alert.alert('Kayıt Başarılı', 'Kayıt başarılı. Lütfen e-posta adresinize gelen linke tıklayarak hesabınızı doğrulayın.');
      navigation.reset({ index: 0, routes: [{ name: 'GirisEkrani' }] });
      
    } catch (error) {
      setYukleniyor(false);
      console.warn("Kayıt hatası:", error.code, error.message);
      Alert.alert("Kayıt Hatası", getAuthErrorMessage(error.code));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3EBF3" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="briefcase" size={50} color="#0A66C2" />
            </View>
            <Text style={styles.logoText}>Mülakat<Text style={styles.logoBold}>Değerlendir</Text></Text>
            <Text style={styles.subtitle}>Kariyer yolculuğuna ilk adımı at.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#0A66C2" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ad Soyad" 
                placeholderTextColor="#999999"
                value={adSoyad} 
                onChangeText={setAdSoyad} 
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#0A66C2" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="E-posta Adresi" 
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email} 
                onChangeText={setEmail} 
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#0A66C2" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Şifre" 
                placeholderTextColor="#999999"
                secureTextEntry={!sifreGorunur} 
                value={sifre} 
                onChangeText={setSifre} 
              />
              <TouchableOpacity onPress={() => setSifreGorunur(!sifreGorunur)} style={styles.eyeIcon}>
                <Ionicons name={sifreGorunur ? "eye-off-outline" : "eye-outline"} size={22} color="#999999" />
              </TouchableOpacity>
            </View>

            {/* YENİ: Şifre bilgilendirme metni */}
            <Text style={styles.passwordHint}>
              * Şifreniz en az 6 karakter, 1 büyük harf ve 1 sembol (!, @, #, $, vb.) içermelidir.
            </Text>

            <TouchableOpacity 
              style={[styles.primaryButton, yukleniyor && { opacity: 0.7 }]} 
              onPress={handleKayit}
              disabled={yukleniyor}
            >
              {yukleniyor ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten bir hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('GirisEkrani')}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 80, height: 80, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  logoText: { fontSize: 32, color: '#0A1931', letterSpacing: -0.5 },
  logoBold: { fontWeight: 'bold', color: '#0A66C2' },
  subtitle: { fontSize: 15, color: '#666666', marginTop: 8 },
  formContainer: { marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#D0DCEB', marginBottom: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#0A1931', fontSize: 15 },
  eyeIcon: { padding: 5 }, 
  passwordHint: { color: '#666666', fontSize: 12, marginTop: -5, marginBottom: 15, marginLeft: 5 }, // YENİ: Bilgilendirme metni stili
  primaryButton: { backgroundColor: '#0A1931', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 5, elevation: 3, shadowColor: '#0A1931', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  footerText: { color: '#666666', fontSize: 14 },
  footerLink: { color: '#0A66C2', fontSize: 14, fontWeight: 'bold' }
});
