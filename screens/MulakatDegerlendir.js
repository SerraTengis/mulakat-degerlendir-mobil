import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert, Platform, Switch, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';

// Firebase bağlantıları
import { auth, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { sirketlerListesi, pozisyonlarListesi } from '../veriListeleri';

const metniNormalizeEt = (metin = '') => metin.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]/g, '');

export default function MulakatDegerlendir({ navigation }) {
  const [anonim, setAnonim] = useState(false);
  const [sirket, setSirket] = useState('');
  const [pozisyon, setPozisyon] = useState('');
  const [tarih, setTarih] = useState(new Date()); 
  const [tarihSecildi, setTarihSecildi] = useState(false); 
  const [showPicker, setShowPicker] = useState(false); 
  const [format, setFormat] = useState('');
  const [sonuc, setSonuc] = useState('');
  const [deneyim, setDeneyim] = useState('');
  const [puan, setPuan] = useState(0);
  const [listeTipi, setListeTipi] = useState(null);
  const [listeArama, setListeArama] = useState('');
  
  const [yukleniyor, setYukleniyor] = useState(false);

  const currentUser = auth.currentUser;
  const kullaniciAdi = currentUser?.displayName || "Kullanıcı";

  const anaSayfayaDon = () => {
    navigation.navigate('AnaSayfa');
  };

  const listeyiAc = (tip) => {
    setListeTipi(tip);
    setListeArama(tip === 'sirket' ? sirket : pozisyon);
  };

  const listedenSec = (deger) => {
    if (listeTipi === 'sirket') setSirket(deger);
    if (listeTipi === 'pozisyon') setPozisyon(deger);
    setListeTipi(null);
  };

  const aktifListe = listeTipi === 'sirket' ? sirketlerListesi : pozisyonlarListesi;
  const filtreliListe = aktifListe.filter((deger) => metniNormalizeEt(deger).includes(metniNormalizeEt(listeArama)));

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tarih;
    setShowPicker(Platform.OS === 'ios'); 
    setTarih(currentDate);
    setTarihSecildi(true); 
  };

  const handlePaylas = async () => {
    // Validasyonlar
    if (!sirket.trim()) { Alert.alert("Eksik Bilgi", "Lütfen şirket adını yazınız."); return; }
    
    if (!pozisyon.trim()) { Alert.alert("Eksik Bilgi", "Lütfen başvurulan pozisyonu yazınız."); return; }
    
    if (!tarihSecildi) { Alert.alert("Eksik Bilgi", "Lütfen takvimden 'Mülakat Tarihi'ni seçiniz."); return; }
    if (!format) { Alert.alert("Eksik Bilgi", "Lütfen 'Mülakat Formatı' seçiminizi yapınız."); return; }
    if (!sonuc) { Alert.alert("Eksik Bilgi", "Lütfen 'Mülakat Sonucu'nu belirtiniz."); return; }
    if (deneyim.trim().length < 20) { Alert.alert("Eksik Bilgi", "Lütfen mülakat deneyiminizi en az 20 karakterle anlatınız."); return; }
    if (puan === 0) { Alert.alert("Eksik Bilgi", "Lütfen deneyiminizi yıldızlarla puanlayınız."); return; }

    setYukleniyor(true);

    try {
      const kaydedilecekAd = anonim ? "Anonim Kullanıcı" : kullaniciAdi;
      const kaydedilecekEmail = currentUser ? currentUser.email : "bilinmeyen@email.com";
      
      await addDoc(collection(db, "mulakatlar"), {
        adSoyad: kaydedilecekAd,
        kullaniciEmail: kaydedilecekEmail,
        kullaniciId: currentUser?.uid || null,
        sirket: sirket.trim(),
        pozisyon: pozisyon.trim(),
        tarih: tarih.toISOString(), 
        format: format,
        sonuc: sonuc,
        deneyim: deneyim.trim(),
        puan: puan,
        status: "beklemede",
        faydaliSayisi: 0,
        eklenmeTarihi: new Date().toISOString()
      });

      setYukleniyor(false);
      Alert.alert(
        "Değerlendirmeniz Beklemede",
        "Değerlendirmeniz admin onayından geçtikten sonra yayınlanacaktır.",
        [{ text: "Tamam", onPress: () => navigation.navigate('AnaSayfa') }]
      );
      
    } catch (error) {
      setYukleniyor(false);
      Alert.alert("Hata", "Mülakat paylaşılırken bir sorun oluştu.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Yeni Değerlendirme</Text>
          <Text style={styles.headerSubtitle}>Mülakat tecrübeni diğerleriyle paylaş.</Text>
        </View>

        <View style={styles.ethicsNotice}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#0A66C2" />
          <Text style={styles.ethicsNoticeText}>
            Lütfen saygı çerçevesinde değerlendirme yapın. Kişisel veri, iletişim bilgisi, hakaret, ayrımcı ifade veya gizli şirket bilgisini paylaşmayın. İçerikler yayınlanmadan önce incelenir.
          </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>KİMLİK BİLGİSİ</Text>
          <View style={styles.identityBox}>
            <View style={styles.identityRow}>
              <Ionicons name={anonim ? "incognito" : "person-circle"} size={36} color={anonim ? "#666666" : "#0A66C2"} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.identityName}>{anonim ? "Anonim Kullanıcı" : kullaniciAdi}</Text>
                <Text style={styles.identityHint}>{anonim ? "Gönderiniz isimsiz yayınlanacak." : "Gönderiniz bu isimle yayınlanacak."}</Text>
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Kimliğimi Gizle (Anonim)</Text>
              <Switch value={anonim} onValueChange={setAnonim} trackColor={{ false: "#D0DCEB", true: "#0A1931" }} thumbColor="#ffffff" />
            </View>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>ŞİRKET ADI <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#0A66C2" style={styles.icon} />
            <TextInput
              accessibilityLabel="Şirket adı"
              autoCapitalize="words"
              placeholder="Örn. Trendyol"
              placeholderTextColor="#999999"
              style={styles.input}
              value={sirket}
              onChangeText={setSirket}
            />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Şirket listesini aç" style={styles.listButton} onPress={() => listeyiAc('sirket')}>
              <Ionicons name="chevron-down" size={22} color="#0A66C2" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>BAŞVURULAN POZİSYON <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputContainer}>
            <Ionicons name="briefcase-outline" size={20} color="#0A66C2" style={styles.icon} />
            <TextInput
              accessibilityLabel="Başvurulan pozisyon"
              autoCapitalize="words"
              placeholder="Örn. Yazılım Geliştirici"
              placeholderTextColor="#999999"
              style={styles.input}
              value={pozisyon}
              onChangeText={setPozisyon}
            />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Pozisyon listesini aç" style={styles.listButton} onPress={() => listeyiAc('pozisyon')}>
              <Ionicons name="chevron-down" size={22} color="#0A66C2" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>MÜLAKAT TARİHİ <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={[styles.inputContainer, { paddingVertical: 15 }]} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#0A66C2" style={styles.icon} />
            <Text style={{ flex: 1, color: tarihSecildi ? '#0A1931' : '#999999', fontSize: 15 }}>
              {tarihSecildi ? tarih.toLocaleDateString('tr-TR') : "Takvimden tarih seçiniz..."}
            </Text>
          </TouchableOpacity>
          {showPicker && <DateTimePicker value={tarih} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>MÜLAKAT FORMATI <Text style={styles.required}>*</Text></Text>
          <View style={styles.optionGrid}>
            {[
              ['people-outline', 'Yüz Yüze'],
              ['videocam-outline', 'Online (Görüntülü)'],
              ['document-text-outline', 'Teknik Test (Case Study)'],
              ['call-outline', 'Telefon Görüşmesi'],
            ].map(([icon, deger]) => (
              <TouchableOpacity
                key={deger}
                accessibilityRole="button"
                accessibilityState={{ selected: format === deger }}
                style={[styles.optionButton, format === deger && styles.optionButtonSelected]}
                onPress={() => setFormat(deger)}
              >
                <Ionicons name={icon} size={19} color={format === deger ? '#ffffff' : '#0A66C2'} />
                <Text style={[styles.optionButtonText, format === deger && styles.optionButtonTextSelected]}>{deger}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>MÜLAKAT SONUCU <Text style={styles.required}>*</Text></Text>
          <View style={styles.resultRow}>
            {[
              ['checkmark-circle-outline', 'Kabul Edildim', 'Kabul'],
              ['close-circle-outline', 'Reddedildim', 'Red'],
              ['time-outline', 'Beklemede', 'Beklemede'],
            ].map(([icon, baslik, deger]) => (
              <TouchableOpacity
                key={deger}
                accessibilityRole="button"
                accessibilityState={{ selected: sonuc === deger }}
                style={[styles.resultButton, sonuc === deger && styles.resultButtonSelected]}
                onPress={() => setSonuc(deger)}
              >
                <Ionicons name={icon} size={20} color={sonuc === deger ? '#ffffff' : '#0A66C2'} />
                <Text style={[styles.resultButtonText, sonuc === deger && styles.resultButtonTextSelected]}>{baslik}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>MÜLAKATINIZDAN BAHSEDİNİZ <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#0A66C2" style={styles.iconTop} />
            <TextInput
              accessibilityLabel="Mülakat deneyiminiz"
              placeholder="Süreçte neler yaşadığınızı, sorulan soru türlerini ve deneyiminizi saygı çerçevesinde anlatın..."
              placeholderTextColor="#999999"
              style={[styles.input, styles.textArea]}
              value={deneyim}
              onChangeText={setDeneyim}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.characterCount}>{deneyim.length}/2000</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>PUANINIZ <Text style={styles.required}>*</Text></Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((starDegeri) => (
              <TouchableOpacity key={starDegeri} onPress={() => setPuan(starDegeri)}>
                <Text style={starDegeri <= puan ? styles.starFilled : styles.starEmpty}>
                  {starDegeri <= puan ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ana sayfaya dön"
            style={styles.cancelButton}
            onPress={anaSayfayaDon}
          >
            <Ionicons name="home-outline" size={18} color="#0A1931" />
            <Text style={styles.cancelButtonText}>Ana Sayfa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Kaydet ve yayınla"
            style={[styles.submitButton, yukleniyor && { opacity: 0.7 }]}
            onPress={handlePaylas}
            disabled={yukleniyor}
          >
            {yukleniyor ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Kaydet ve Yayınla</Text>
                <Ionicons name="save-outline" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        </View>
      </ScrollView>

      <Modal visible={listeTipi !== null} transparent animationType="slide" onRequestClose={() => setListeTipi(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.listModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{listeTipi === 'sirket' ? 'Şirket Seçin' : 'Pozisyon Seçin'}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Listeyi kapat" onPress={() => setListeTipi(null)}>
                <Ionicons name="close" size={24} color="#0A1931" />
              </TouchableOpacity>
            </View>
            <TextInput
              autoFocus
              style={styles.modalSearch}
              placeholder="Listede ara..."
              placeholderTextColor="#777777"
              value={listeArama}
              onChangeText={setListeArama}
            />
            <FlatList
              data={filtreliListe}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => listedenSec(item)}>
                  <Text style={styles.listItemText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#0A66C2" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyListText}>Eşleşen kayıt yok. Listeyi kapatıp değeri kendin yazabilirsin.</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E3EBF3' },
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  content: { padding: 25, paddingTop: 50, paddingBottom: 50 },
  headerContainer: { marginBottom: 20 },
  headerTitle: { color: '#0A1931', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  headerSubtitle: { color: '#666666', fontSize: 14 },
  ethicsNotice: { flexDirection: 'row', backgroundColor: '#EAF3FF', borderColor: '#B8D6F5', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 22 },
  ethicsNoticeText: { flex: 1, color: '#35506B', fontSize: 12, lineHeight: 18, marginLeft: 10 },
  inputWrapper: { marginBottom: 20 },
  label: { color: '#666666', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  required: { color: '#D93025' },
  identityBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#D0DCEB' },
  identityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F4FA', paddingBottom: 15 },
  identityName: { color: '#0A1931', fontSize: 16, fontWeight: 'bold' },
  identityHint: { color: '#999999', fontSize: 12, marginTop: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#D0DCEB' },
  icon: { marginRight: 10 },
  iconTop: { marginRight: 10, marginTop: 15 },
  input: { flex: 1, color: '#0A1931', paddingVertical: 15, fontSize: 15 },
  listButton: { padding: 8, marginRight: -8 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  optionButton: { width: '48%', minHeight: 64, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#D0DCEB', paddingHorizontal: 8, paddingVertical: 10 },
  optionButtonSelected: { backgroundColor: '#0A1931', borderColor: '#0A1931' },
  optionButtonText: { color: '#0A1931', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  optionButtonTextSelected: { color: '#ffffff' },
  resultRow: { flexDirection: 'row', gap: 8 },
  resultButton: { flex: 1, minHeight: 78, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#D0DCEB', paddingHorizontal: 5, paddingVertical: 10 },
  resultButtonSelected: { backgroundColor: '#0A1931', borderColor: '#0A1931' },
  resultButtonText: { color: '#0A1931', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  resultButtonTextSelected: { color: '#ffffff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  switchLabel: { color: '#0A1931', fontSize: 14, fontWeight: '600' },
  textAreaContainer: { alignItems: 'flex-start' },
  textArea: { height: 100, textAlignVertical: 'top', marginTop: 12 },
  characterCount: { alignSelf: 'flex-end', color: '#666666', fontSize: 11, marginTop: 5 },
  starContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10, backgroundColor: '#ffffff', paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: '#D0DCEB' },
  starFilled: { fontSize: 35, color: '#F8C77E', marginHorizontal: 8 },
  starEmpty: { fontSize: 35, color: '#D0DCEB', marginHorizontal: 8 },
  actionBar: { flexDirection: 'row', marginTop: 10, gap: 10 },
  cancelButton: { flex: 0.4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#D0DCEB', borderRadius: 15, paddingVertical: 16 },
  cancelButtonText: { color: '#0A1931', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  submitButton: { flex: 0.6, flexDirection: 'row', backgroundColor: '#0A1931', paddingVertical: 16, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  submitButtonText: { flex: 1, color: '#ffffff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10, 25, 49, 0.35)' },
  listModal: { maxHeight: '75%', backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: '#0A1931', fontSize: 20, fontWeight: 'bold' },
  modalSearch: { backgroundColor: '#F0F4FA', color: '#0A1931', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, marginBottom: 10 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EDF1F5', paddingVertical: 16 },
  listItemText: { color: '#0A1931', fontSize: 15, flex: 1, marginRight: 8 },
  emptyListText: { color: '#666666', textAlign: 'center', paddingVertical: 28, lineHeight: 20 }
});
