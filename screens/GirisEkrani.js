import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { getAuthErrorMessage, isValidEmail } from '../authUtils';

const RESET_COOLDOWN_MS = 60000;

export default function GirisEkrani({ navigation }) {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreGorunur, setSifreGorunur] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sifirlamaYukleniyor, setSifirlamaYukleniyor] = useState(false);
  const [sonSifirlamaIstegi, setSonSifirlamaIstegi] = useState(0);

  const handleGiris = async () => {
    if (!email.trim() || !sifre) return Alert.alert('Eksik Bilgi', 'Lütfen e-posta adresinizi ve şifrenizi girin.');
    if (!isValidEmail(email)) return Alert.alert('Hatalı Format', 'Lütfen geçerli bir e-posta adresi girin.');
    setYukleniyor(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), sifre);
      await credential.user.reload();
      if (!auth.currentUser?.emailVerified) {
        await signOut(auth);
        Alert.alert('E-posta Doğrulaması Gerekli', 'Lütfen önce e-posta adresinizi doğrulayın.');
        return;
      }
      navigation.reset({ index: 0, routes: [{ name: 'AnaSayfa' }] });
    } catch (error) {
      Alert.alert('Giriş Başarısız', getAuthErrorMessage(error.code));
    } finally { setYukleniyor(false); }
  };

  const handleSifremiUnuttum = async () => {
    if (!isValidEmail(email)) return Alert.alert('E-posta Gerekli', 'Şifre sıfırlamak için geçerli e-posta adresinizi girin.');
    const simdi = Date.now();
    if (simdi - sonSifirlamaIstegi < RESET_COOLDOWN_MS) return Alert.alert('Lütfen Bekleyin', 'Yeni bir şifre sıfırlama e-postası istemek için kısa süre bekleyin.');
    setSifirlamaYukleniyor(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSonSifirlamaIstegi(simdi);
      Alert.alert('E-posta Gönderildi', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.');
    } catch (error) {
      Alert.alert('İşlem Başarısız', getAuthErrorMessage(error.code));
    } finally { setSifirlamaYukleniyor(false); }
  };

  return <SafeAreaView style={styles.container}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
    <View style={styles.header}><View style={styles.logoContainer}><Ionicons name="briefcase" size={50} color="#0A66C2" /></View><Text style={styles.logoText}>Mülakat<Text style={styles.logoBold}>Değerlendir</Text></Text><Text style={styles.subtitle}>Mülakat deneyimlerini keşfet.</Text></View>
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}><Ionicons name="mail-outline" size={20} color="#0A66C2" style={styles.icon} /><TextInput style={styles.input} placeholder="E-posta Adresi" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={setEmail} editable={!yukleniyor && !sifirlamaYukleniyor} /></View>
      <View style={styles.inputContainer}><Ionicons name="lock-closed-outline" size={20} color="#0A66C2" style={styles.icon} /><TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#999" secureTextEntry={!sifreGorunur} autoComplete="current-password" value={sifre} onChangeText={setSifre} editable={!yukleniyor && !sifirlamaYukleniyor} /><TouchableOpacity onPress={() => setSifreGorunur(v => !v)} style={styles.eyeIcon} disabled={yukleniyor || sifirlamaYukleniyor}><Ionicons name={sifreGorunur ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" /></TouchableOpacity></View>
      <TouchableOpacity style={styles.forgotPassword} onPress={handleSifremiUnuttum} disabled={yukleniyor || sifirlamaYukleniyor}>{sifirlamaYukleniyor ? <ActivityIndicator size="small" color="#0A66C2" /> : <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>}</TouchableOpacity>
      <TouchableOpacity style={[styles.primaryButton, yukleniyor && styles.disabled]} onPress={handleGiris} disabled={yukleniyor || sifirlamaYukleniyor}>{yukleniyor ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryButtonText}>Giriş Yap</Text>}</TouchableOpacity>
    </View>
    <View style={styles.footer}><Text style={styles.footerText}>Henüz hesabın yok mu?</Text><TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('KayitOl')} disabled={yukleniyor || sifirlamaYukleniyor}><Ionicons name="person-add-outline" size={19} color="#0A1931" /><Text style={styles.registerButtonText}>Kayıt Ol</Text></TouchableOpacity></View>
  </KeyboardAvoidingView></SafeAreaView>;
}

const shadow = Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } });
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' }, content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 }, header: { alignItems: 'center', marginBottom: 50 }, logoContainer: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, ...shadow }, logoText: { fontSize: 32, color: '#0A1931' }, logoBold: { fontWeight: 'bold', color: '#0A66C2' }, subtitle: { fontSize: 15, color: '#666', marginTop: 8 }, formContainer: { marginBottom: 30 }, inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#D0DCEB', marginBottom: 15, height: 55 }, icon: { marginRight: 10 }, input: { flex: 1, color: '#0A1931', fontSize: 15 }, eyeIcon: { padding: 5 }, forgotPassword: { alignItems: 'flex-end', minHeight: 25, marginBottom: 25 }, forgotPasswordText: { color: '#0A66C2', fontSize: 13, fontWeight: '600' }, primaryButton: { backgroundColor: '#0A1931', paddingVertical: 16, borderRadius: 12, alignItems: 'center', ...shadow }, disabled: { opacity: 0.7 }, primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }, footer: { alignItems: 'center', marginTop: 20 }, footerText: { color: '#666', fontSize: 14, marginBottom: 10 }, registerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#0A1931', borderRadius: 12, paddingVertical: 14 }, registerButtonText: { color: '#0A1931', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
});
