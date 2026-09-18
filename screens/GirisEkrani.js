import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Firebase bağlantısı
import { auth } from '../firebaseConfig'; 
// YENİ: Şifre sıfırlama için sendPasswordResetEmail eklendi
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export default function GirisEkrani({ navigation }) {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  
  // YENİ: Eklenen state'ler
  const [sifreGorunur, setSifreGorunur] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  // YENİ: E-posta formatını kontrol eden fonksiyon (Regex)
  const isEmailValid = (emailAdresi) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAdresi);
  };

  // YENİ: Firebase hatalarını Türkçeye çeviren yardımcı fonksiyon
  const getFirebaseHataMesaji = (hataKodu) => {
    switch (hataKodu) {
      case 'auth/invalid-email': return "Geçersiz bir e-posta adresi formatı.";
      case 'auth/user-disabled': return "Bu hesap askıya alınmış.";
      case 'auth/user-not-found': return "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.";
      case 'auth/wrong-password': return "Şifrenizi yanlış girdiniz.";
      case 'auth/invalid-credential': return "E-posta adresiniz veya şifreniz hatalı.";
      case 'auth/too-many-requests': return "Çok fazla başarısız deneme yaptınız. Lütfen daha sonra tekrar deneyin.";
      default: return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
    }
  };

  const handleGiris = async () => {
    // 1. Boş alan kontrolü
    if (!email.trim() || !sifre.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen e-posta adresinizi ve şifrenizi girin.");
      return;
    }

    // 2. E-posta format kontrolü
    if (!isEmailValid(email)) {
      Alert.alert("Hatalı Format", "Lütfen geçerli bir e-posta adresi girin. (Örn: isim@sirket.com)");
      return;
    }

    setYukleniyor(true);

    try {
      // 3. Firebase giriş kontrolü
      await signInWithEmailAndPassword(auth, email.trim(), sifre);
      setYukleniyor(false);
      navigation.navigate('AnaSayfa');
    } catch (error) {
      setYukleniyor(false);
      // 4. Hata durumunda Türkçe bildirim göster
      Alert.alert("Giriş Başarısız", getFirebaseHataMesaji(error.code));
    }
  };

  // YENİ: Şifremi unuttum fonksiyonu
  const handleSifremiUnuttum = async () => {
    if (!email.trim()) {
      Alert.alert("Bilgi Eksik", "Şifrenizi sıfırlamak için lütfen önce e-posta adresinizi yukarıdaki alana yazın.");
      return;
    }

    if (!isEmailValid(email)) {
      Alert.alert("Hatalı Format", "Lütfen geçerli bir e-posta adresi yazın.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "E-posta Gönderildi! 📧", 
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin."
      );
    } catch (error) {
      Alert.alert("İşlem Başarısız", getFirebaseHataMesaji(error.code));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="briefcase" size={50} color="#0A66C2" />
          </View>
          <Text style={styles.logoText}>Mülakat<Text style={styles.logoBold}>Değerlendir</Text></Text>
          <Text style={styles.subtitle}>Mülakat deneyimlerini keşfet.</Text>
        </View>

        <View style={styles.formContainer}>
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
              secureTextEntry={!sifreGorunur} // GÜNCELLENDİ: State'e bağlandı
              value={sifre} 
              onChangeText={setSifre} 
            />
            {/* YENİ: Şifre göster/gizle ikonu */}
            <TouchableOpacity onPress={() => setSifreGorunur(!sifreGorunur)} style={styles.eyeIcon}>
              <Ionicons name={sifreGorunur ? "eye-off-outline" : "eye-outline"} size={22} color="#999999" />
            </TouchableOpacity>
          </View>

          {/* GÜNCELLENDİ: onPress olayı eklendi */}
          <TouchableOpacity style={styles.forgotPassword} onPress={handleSifremiUnuttum}>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, yukleniyor && { opacity: 0.7 }]} 
            onPress={handleGiris}
            disabled={yukleniyor}
          >
            {yukleniyor ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Henüz hesabın yok mu?</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.registerButton}
            onPress={() => navigation.navigate('KayitOl')}
          >
            <Ionicons name="person-add-outline" size={19} color="#0A1931" />
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  logoContainer: { width: 80, height: 80, backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  logoText: { fontSize: 32, color: '#0A1931', letterSpacing: -0.5 },
  logoBold: { fontWeight: 'bold', color: '#0A66C2' },
  subtitle: { fontSize: 15, color: '#666666', marginTop: 8 },
  formContainer: { marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#D0DCEB', marginBottom: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#0A1931', fontSize: 15 },
  eyeIcon: { padding: 5 }, // YENİ: Göz ikonu için padding
  forgotPassword: { alignItems: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#0A66C2', fontSize: 13, fontWeight: '600' },
  primaryButton: { backgroundColor: '#0A1931', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: '#0A1931', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { color: '#666666', fontSize: 14, marginBottom: 10 },
  registerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#0A1931', borderRadius: 12, paddingVertical: 14 },
  registerButtonText: { color: '#0A1931', fontSize: 15, fontWeight: 'bold', marginLeft: 8 }
});
