import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase Bağlantıları
import { auth, db } from '../firebaseConfig';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function Profil({ navigation }) {
  // 'paylasimlar', 'kaydedilenler', 'desteklenenler', 'desteklenmeyenler'
  const [aktifSekme, setAktifSekme] = useState('paylasimlar'); 
  
  const [paylasimlar, setPaylasimlar] = useState([]);
  const [kaydedilenler, setKaydedilenler] = useState([]);
  const [desteklenenler, setDesteklenenler] = useState([]);
  const [desteklenmeyenler, setDesteklenmeyenler] = useState([]);
  
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silmeModalAcik, setSilmeModalAcik] = useState(false);
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [hesapSiliniyor, setHesapSiliniyor] = useState(false);

  const kullaniciAd = auth.currentUser?.displayName || "Kullanıcı";
  const kullaniciEmail = auth.currentUser?.email || "E-posta bulunamadı";
  const userId = auth.currentUser?.uid;
  const profilBasHarf = kullaniciAd.charAt(0).toUpperCase();

  // Tüm verileri kullanıcının durumuna göre çekiyoruz
  const verileriGetir = async () => {
    if (!auth.currentUser) return;
    try {
      const mulakatlarRef = collection(db, "mulakatlar");
      const [yayindakiSnapshot, kendiIdSnapshot, kendiEmailSnapshot] = await Promise.all([
        getDocs(query(mulakatlarRef, where("status", "==", "onaylandi"))),
        getDocs(query(mulakatlarRef, where("kullaniciId", "==", userId))),
        getDocs(query(mulakatlarRef, where("kullaniciEmail", "==", auth.currentUser.email)))
      ]);

      const benimPaylasimlarim = [];
      const kaydedilenListe = [];
      const desteklenenListe = [];
      const desteklenmeyenListe = [];
      const benimPaylasimlarimMap = new Map();

      yayindakiSnapshot.forEach((document) => {
        const veri = { id: document.id, ...document.data() };

        if (userId && veri.kaydedenler && veri.kaydedenler.includes(userId)) {
          kaydedilenListe.push(veri);
        }
        if (userId && veri.destekleyenler && veri.destekleyenler.includes(userId)) {
          desteklenenListe.push(veri);
        }
        if (userId && veri.desteklemeyenler && veri.desteklemeyenler.includes(userId)) {
          desteklenmeyenListe.push(veri);
        }
      });

      [kendiIdSnapshot, kendiEmailSnapshot].forEach((snapshot) => {
        snapshot.forEach((document) => {
          benimPaylasimlarimMap.set(document.id, { id: document.id, ...document.data() });
        });
      });
      benimPaylasimlarim.push(...benimPaylasimlarimMap.values());

      setPaylasimlar(benimPaylasimlarim);
      setKaydedilenler(kaydedilenListe);
      setDesteklenenler(desteklenenListe);
      setDesteklenmeyenler(desteklenmeyenListe);

    } catch (error) {
      console.log("Veri çekme hatası:", error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    verileriGetir();
  }, []);

  // Aktif sekkeye göre gösterilecek veriyi seç
  const gosterilecekVeriler = 
    aktifSekme === 'paylasimlar' ? paylasimlar :
    aktifSekme === 'kaydedilenler' ? kaydedilenler : 
    aktifSekme === 'desteklenenler' ? desteklenenler : desteklenmeyenler;

  const silmeOnayi = (id) => {
    Alert.alert("Değerlendirmeyi Sil", "Bu değerlendirme her yerden kalıcı olarak silinecektir. Emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Sil", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "mulakatlar", id));
            setPaylasimlar(paylasimlar.filter(item => item.id !== id));
            setKaydedilenler(kaydedilenler.filter(item => item.id !== id));
            setDesteklenenler(desteklenenler.filter(item => item.id !== id));
            setDesteklenmeyenler(desteklenmeyenler.filter(item => item.id !== id));
          } catch (error) {
            Alert.alert("Hata", "Silme işlemi başarısız oldu.");
          }
        } 
      }
    ]);
  };

  const hesapSilmeOnayi = () => {
    Alert.alert('Hesabı Kapat', 'Hesabınız ve yazdığınız tüm değerlendirmeler kalıcı olarak silinecektir. Bu işlem geri alınamaz. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => setSilmeModalAcik(true) },
    ]);
  };

  const handleHesapSil = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;
    if (!mevcutSifre) return Alert.alert('Şifre Gerekli', 'Devam etmek için mevcut şifrenizi girin.');

    setHesapSiliniyor(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, mevcutSifre));
      const snapshot = await getDocs(query(collection(db, 'mulakatlar'), where('kullaniciId', '==', user.uid)));
      await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      setSilmeModalAcik(false);
      setMevcutSifre('');
      navigation.reset({ index: 0, routes: [{ name: 'Giris' }] });
    } catch (error) {
      Alert.alert('Hesap Silinemedi', error.code === 'auth/requires-recent-login' ? 'Güvenliğiniz için yeniden giriş yapmanız gerekiyor.' : error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' ? 'Giriş bilgileri hatalı.' : error.code === 'auth/too-many-requests' ? 'Çok fazla başarısız deneme yaptınız, lütfen daha sonra tekrar deneyin.' : 'İşlem tamamlanamadı. Lütfen tekrar deneyin.');
    } finally {
      setHesapSiliniyor(false);
    }
  };

  const handleAyarlar = () => {
    Alert.alert("Hesap Ayarları", "Lütfen yapmak istediğiniz işlemi seçin:", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Çıkış Yap", 
        onPress: () => {
          signOut(auth).then(() => {
            navigation.replace('Giris'); 
          }).catch(error => console.log("Çıkış hatası:", error));
        } 
      },
      { text: "Hesabı Kapat", style: "destructive", onPress: hesapSilmeOnayi }
    ]);
  };

  const renderKart = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.companyName}>{item.sirket}</Text>
            
            {item.status === 'beklemede' && (
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={12} color="#D99A29" />
                <Text style={styles.pendingText}>Onay Bekliyor</Text>
              </View>
            )}
            {item.status === 'onaylandi' && (
              <View style={styles.approvedBadge}>
                <Ionicons name="checkmark-circle-outline" size={12} color="#0F9D58" />
                <Text style={styles.approvedText}>Yayında</Text>
              </View>
            )}
          </View>
          <Text style={styles.positionText}>{item.pozisyon}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.puan || 0}.0</Text>
          <Ionicons name="star" size={14} color="#D99A29" />
        </View>
      </View>
      
      <Text style={styles.summaryText} numberOfLines={2}>"{item.deneyim || item.sorular || item.ozet || "Açıklama girilmemiş."}"</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color="#666666" />
          <Text style={styles.dateText}>{item.tarih ? item.tarih.split('T')[0] : "Tarih Yok"}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.readMoreButton} onPress={() => navigation.navigate('MulakatDetayi', { mulakatData: item })}>
            <Text style={styles.readMoreText}>Detay</Text>
            <Ionicons name="chevron-forward" size={14} color="#0A66C2" />
          </TouchableOpacity>

          {aktifSekme === 'paylasimlar' && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => silmeOnayi(item.id)}>
              <Ionicons name="trash-outline" size={16} color="#D93025" />
              <Text style={styles.deleteText}>Sil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (yukleniyor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A66C2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3EBF3" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A1931" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleAyarlar}>
          <Ionicons name="settings-outline" size={24} color="#0A1931" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileIconContainer}>
          <Text style={styles.profileIconText}>{profilBasHarf}</Text>
        </View>
        <Text style={styles.userName}>{kullaniciAd}</Text> 
        <Text style={styles.userSubtitle}>{kullaniciEmail}</Text>
      </View>

      {/* 4'LÜ SEKME (TAB) MENÜSÜ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, aktifSekme === 'paylasimlar' && styles.tabButtonActive]} 
          onPress={() => setAktifSekme('paylasimlar')}
        >
          <Text style={[styles.tabText, aktifSekme === 'paylasimlar' && styles.tabTextActive]}>Paylaşımlar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, aktifSekme === 'kaydedilenler' && styles.tabButtonActive]} 
          onPress={() => setAktifSekme('kaydedilenler')}
        >
          <Text style={[styles.tabText, aktifSekme === 'kaydedilenler' && styles.tabTextActive]}>Kaydedilenler</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, aktifSekme === 'desteklenenler' && styles.tabButtonActive]} 
          onPress={() => setAktifSekme('desteklenenler')}
        >
          <Text style={[styles.tabText, aktifSekme === 'desteklenenler' && styles.tabTextActive]}>Desteklenen</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, aktifSekme === 'desteklenmeyenler' && styles.tabButtonActive]} 
          onPress={() => setAktifSekme('desteklenmeyenler')}
        >
          <Text style={[styles.tabText, aktifSekme === 'desteklenmeyenler' && styles.tabTextActive]}>Desteklenmeyen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {aktifSekme === 'paylasimlar' ? 'Paylaştığım Mülakatlar' : 
           aktifSekme === 'kaydedilenler' ? 'Kaydettiğim Mülakatlar' : 
           aktifSekme === 'desteklenenler' ? 'Desteklediğim Mülakatlar' : 'Desteklemediğim Mülakatlar'}
        </Text>
        <Text style={styles.listCount}>{gosterilecekVeriler.length} kayıt</Text>
      </View>

      <FlatList
        data={gosterilecekVeriler}
        keyExtractor={item => item.id}
        renderItem={renderKart}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={40} color="#999" style={{ marginBottom: 10 }} />
            <Text style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
              {aktifSekme === 'paylasimlar' ? 'Henüz bir mülakat paylaşmadınız.' :
               aktifSekme === 'kaydedilenler' ? 'Henüz kaydedilmiş bir mülakatınız yok.' : 
               aktifSekme === 'desteklenenler' ? 'Henüz desteklediğiniz bir mülakat yok.' : 'Henüz desteklemediğiniz bir mülakat yok.'}
            </Text>
          </View>
        }
      />
      <Modal visible={silmeModalAcik} transparent animationType="fade" onRequestClose={() => !hesapSiliniyor && setSilmeModalAcik(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.passwordModal}>
            <Ionicons name="shield-checkmark-outline" size={34} color="#D93025" />
            <Text style={styles.passwordModalTitle}>Kimliğinizi Doğrulayın</Text>
            <Text style={styles.passwordModalText}>Hesabınızı kalıcı olarak silmek için mevcut şifrenizi girin.</Text>
            <TextInput style={styles.passwordInput} placeholder="Mevcut şifreniz" placeholderTextColor="#777" secureTextEntry value={mevcutSifre} onChangeText={setMevcutSifre} editable={!hesapSiliniyor} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => { setSilmeModalAcik(false); setMevcutSifre(''); }} disabled={hesapSiliniyor}><Text style={styles.modalCancelText}>İptal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalDeleteButton, hesapSiliniyor && { opacity: 0.7 }]} onPress={handleHesapSil} disabled={hesapSiliniyor}>{hesapSiliniyor ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalDeleteText}>Hesabı Sil</Text>}</TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#E3EBF3', borderBottomWidth: 1, borderBottomColor: '#D0DCEB' },
  backButton: { padding: 5 },
  headerTitle: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  settingsButton: { padding: 5 },
  profileSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#D0DCEB' },
  
  profileIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0A1931', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5 },
  profileIconText: { color: '#ffffff', fontSize: 35, fontWeight: 'bold' },
  
  userName: { color: '#0A1931', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  userSubtitle: { color: '#666666', fontSize: 13 },

  // Sekme Stilleri (4'lü yapıya uygun daraltılmış padding)
  tabContainer: { flexDirection: 'row', backgroundColor: '#ffffff', paddingHorizontal: 5, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#D0DCEB', justifyContent: 'space-between' },
  tabButton: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 15 },
  tabButtonActive: { backgroundColor: '#0A1931' },
  tabText: { color: '#666666', fontSize: 11, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  listTitle: { color: '#0A1931', fontSize: 16, fontWeight: 'bold' },
  listCount: { color: '#666666', fontSize: 13, backgroundColor: '#ffffff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#D0DCEB', overflow: 'hidden' },
  
  listContainer: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },

  card: { backgroundColor: '#ffffff', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#D0DCEB', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' },
  companyName: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  
  pendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEA', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#F8C77E', marginLeft: 8 },
  pendingText: { color: '#D99A29', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  approvedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4EA', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#CEEAD6', marginLeft: 8 },
  approvedText: { color: '#0F9D58', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },

  positionText: { color: '#666666', fontSize: 13 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#F8C77E' },
  ratingText: { color: '#D99A29', fontWeight: 'bold', fontSize: 13, marginRight: 4 },
  summaryText: { color: '#444444', fontSize: 14, lineHeight: 22, marginBottom: 15, fontStyle: 'italic' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  dateInfo: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: '#666666', fontSize: 12, marginLeft: 5 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  readMoreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3EBF3', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  readMoreText: { color: '#0A66C2', fontSize: 12, fontWeight: 'bold', marginRight: 4 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCE8E6', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  deleteText: { color: '#D93025', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  passwordModal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  passwordModalTitle: { color: '#0A1931', fontSize: 19, fontWeight: 'bold', marginTop: 10 },
  passwordModalText: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 18 },
  passwordInput: { width: '100%', borderWidth: 1, borderColor: '#D0DCEB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: '#0A1931' },
  modalActions: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancelButton: { flex: 1, borderWidth: 1, borderColor: '#D0DCEB', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  modalCancelText: { color: '#0A1931', fontWeight: 'bold' },
  modalDeleteButton: { flex: 1, minHeight: 47, backgroundColor: '#D93025', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalDeleteText: { color: '#fff', fontWeight: 'bold' },
});
