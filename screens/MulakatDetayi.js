import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase bağlantıları
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function MulakatDetayi({ route, navigation }) {
  const { mulakatData } = route.params;
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  // Durum State'leri
  const [destekliyor, setDestekliyor] = useState(false);
  const [desteklemiyor, setDesteklemiyor] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  // Sayaç State'leri
  const [destekSayisi, setDestekSayisi] = useState(mulakatData.destekleyenler?.length || 0);
  const [karsiSayisi, setKarsiSayisi] = useState(mulakatData.desteklemeyenler?.length || 0);

  // Sayfa açıldığında kullanıcının daha önce oy verip vermediğini veya kaydedip kaydetmediğini kontrol et
  useEffect(() => {
    if (userId && mulakatData.id) {
      if (mulakatData.destekleyenler && mulakatData.destekleyenler.includes(userId)) {
        setDestekliyor(true);
      }
      if (mulakatData.desteklemeyenler && mulakatData.desteklemeyenler.includes(userId)) {
        setDesteklemiyor(true);
      }
      if (mulakatData.kaydedenler && mulakatData.kaydedenler.includes(userId)) {
        setKaydedildi(true);
      }
    }
  }, [userId, mulakatData]);

  // 1. DESTEKLİYORUM BUTONU İŞLEMLERİ
  const handleDestekle = async () => {
    if (!userId) {
      Alert.alert("Uyarı", "Bu işlemi yapabilmek için giriş yapmalısınız.");
      return;
    }

    const docRef = doc(db, "mulakatlar", mulakatData.id);

    try {
      if (destekliyor) {
        setDestekliyor(false);
        setDestekSayisi(prev => prev - 1);
        await updateDoc(docRef, { destekleyenler: arrayRemove(userId) });
      } else {
        setDestekliyor(true);
        setDestekSayisi(prev => prev + 1);
        await updateDoc(docRef, { destekleyenler: arrayUnion(userId) });

        if (desteklemiyor) {
          setDesteklemiyor(false);
          setKarsiSayisi(prev => prev - 1);
          await updateDoc(docRef, { desteklemeyenler: arrayRemove(userId) });
        }
      }
    } catch (error) {
      console.log("Destekleme hatası:", error);
    }
  };

  // 2. DESTEKLEMİYORUM BUTONU İŞLEMLERİ
  const handleKarsiCik = async () => {
    if (!userId) {
      Alert.alert("Uyarı", "Bu işlemi yapabilmek için giriş yapmalısınız.");
      return;
    }

    const docRef = doc(db, "mulakatlar", mulakatData.id);

    try {
      if (desteklemiyor) {
        setDesteklemiyor(false);
        setKarsiSayisi(prev => prev - 1);
        await updateDoc(docRef, { desteklemeyenler: arrayRemove(userId) });
      } else {
        setDesteklemiyor(true);
        setKarsiSayisi(prev => prev + 1);
        await updateDoc(docRef, { desteklemeyenler: arrayUnion(userId) });

        if (destekliyor) {
          setDestekliyor(false);
          setDestekSayisi(prev => prev - 1);
          await updateDoc(docRef, { destekleyenler: arrayRemove(userId) });
        }
      }
    } catch (error) {
      console.log("Karşı çıkma hatası:", error);
    }
  };

  // 3. KAYDET / FAVORİYE AL BUTONU İŞLEMLERİ
  const handleKaydet = async () => {
    if (!userId) {
      Alert.alert("Uyarı", "Bu işlemi yapabilmek için giriş yapmalısınız.");
      return;
    }

    const docRef = doc(db, "mulakatlar", mulakatData.id);

    try {
      if (kaydedildi) {
        setKaydedildi(false);
        await updateDoc(docRef, { kaydedenler: arrayRemove(userId) });
      } else {
        setKaydedildi(true);
        await updateDoc(docRef, { kaydedenler: arrayUnion(userId) });
      }
    } catch (error) {
      console.log("Kaydetme hatası:", error);
    }
  };

  // 4. ŞİKAYET ET / GERİ BİLDİRİM GÖNDER İŞLEMLERİ
  const handleSikayetEt = () => {
    if (!userId) {
      Alert.alert("Uyarı", "Şikayet bildirimi gönderebilmek için giriş yapmalısınız.");
      return;
    }

    Alert.alert(
      "Değerlendirmeyi Şikayet Et",
      "Bu içeriği neden şikayet etmek istiyorsunuz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Küfür / Hakaret", 
          onPress: () => sikayetiGonder("Küfür / Hakaret") 
        },
        { 
          text: "Yanıltıcı / Gerçek Dışı Bilgi", 
          onPress: () => sikayetiGonder("Yanıltıcı Bilgi") 
        },
        { 
          text: "Gizlilik İhlali (NDA)", 
          onPress: () => sikayetiGonder("Gizlilik İhlali") 
        },
        { 
          text: "Diğer", 
          onPress: () => sikayetiGonder("Diğer") 
        }
      ]
    );
  };

  const sikayetiGonder = async (neden) => {
    const docRef = doc(db, "mulakatlar", mulakatData.id);
    try {
      await updateDoc(docRef, {
        sikayetler: arrayUnion({
          userId: userId,
          neden: neden,
          tarih: new Date().toISOString()
        })
      });
      Alert.alert("Teşekkürler", "Geri bildiriminiz alınmıştır. İlgili değerlendirme incelemeye alınacaktır.");
    } catch (error) {
      console.log("Şikayet hatası:", error);
      Alert.alert("Hata", "Şikayet gönderilirken bir sorun oluştu.");
    }
  };

  // Güvenlik Fallbacks
  const mulakatSonucu = mulakatData.sonuc || "Belirtilmedi";
  const mPuan = mulakatData.puan || 0;
  const kAdi = mulakatData.adSoyad || "Anonim Kullanıcı";
  const mFormat = mulakatData.format || "Belirtilmedi";
  const formatliTarih = mulakatData.tarih ? mulakatData.tarih.split('T')[0] : "Tarih Belirtilmedi";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3EBF3" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A1931" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mülakat Detayı</Text>
        
        {/* SAĞ ÜST KÖŞE BUTONLARI (Şikayet Et + Kaydet) */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleSikayetEt}>
            <Ionicons name="flag-outline" size={20} color="#D93025" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerIconButton, kaydedildi && styles.saveIconButtonActive]} onPress={handleKaydet}>
            <Ionicons name={kaydedildi ? "bookmark" : "bookmark-outline"} size={20} color={kaydedildi ? "#ffffff" : "#0A1931"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.companyName}>{mulakatData.sirket}</Text>
          <Text style={styles.positionText}>{mulakatData.pozisyon}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{mPuan}.0</Text>
            <Ionicons name="star" size={16} color="#D99A29" />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={[styles.infoBox, { marginRight: 10 }]}>
              <Ionicons name="calendar-outline" size={20} color="#0A66C2" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Tarih</Text>
              <Text style={styles.infoValue}>{formatliTarih}</Text>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="videocam-outline" size={20} color="#0A66C2" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Format</Text>
              <Text style={styles.infoValue}>{mFormat}</Text>
            </View>
          </View>
          <View style={[styles.infoBox, styles.resultBox]}>
            <Ionicons name="flag-outline" size={20} color="#0A66C2" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Mülakat Sonucu</Text>
              <Text style={styles.infoValue}>{mulakatSonucu}</Text>
            </View>
          </View>
        </View>

        <View style={styles.experienceSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#0A66C2" />
            <Text style={styles.sectionTitle}>Mülakat Deneyimi</Text>
          </View>
          <Text style={styles.experienceText}>
            {mulakatData.deneyim || mulakatData.sorular || mulakatData.ozet || 'Deneyim metni girilmemiş.'}
          </Text>
        </View>

        {/* ETKİLEŞİM BUTONLARI (Destekle / Destekleme) */}
        <View style={styles.interactionSection}>
          <Text style={styles.interactionTitle}>Bu değerlendirmeyi nasıl buluyorsun?</Text>
          <View style={styles.interactionRow}>
            
            {/* Destekliyorum Butonu */}
            <TouchableOpacity 
              style={[styles.voteButton, destekliyor && styles.supportActive]} 
              onPress={handleDestekle}
            >
              <Ionicons name={destekliyor ? "thumbs-up" : "thumbs-up-outline"} size={18} color={destekliyor ? "#ffffff" : "#2E7D32"} />
              <Text style={[styles.voteText, destekliyor && styles.voteTextActive]}>
                Destekliyorum ({destekSayisi})
              </Text>
            </TouchableOpacity>

            {/* Desteklemiyorum Butonu */}
            <TouchableOpacity 
              style={[styles.voteButton, desteklemiyor && styles.againstActive]} 
              onPress={handleKarsiCik}
            >
              <Ionicons name={desteklemiyor ? "thumbs-down" : "thumbs-down-outline"} size={18} color={desteklemiyor ? "#ffffff" : "#C62828"} />
              <Text style={[styles.voteTextKarsi, desteklemiyor && styles.voteTextActive]}>
                Desteklemiyorum ({karsiSayisi})
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        <View style={styles.footerSection}>
          <View style={styles.authorBadge}>
             <Ionicons name="person-circle-outline" size={20} color="#666666" />
             <Text style={styles.authorName}>{kAdi}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#E3EBF3', borderBottomWidth: 1, borderBottomColor: '#D0DCEB' },
  backButton: { padding: 5 },
  headerTitle: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  
  headerRightActions: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: { backgroundColor: '#ffffff', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#D0DCEB', marginLeft: 8 },
  saveIconButtonActive: { backgroundColor: '#0A1931', borderColor: '#0A1931' },

  content: { padding: 20 },
  titleSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  companyName: { color: '#0A1931', fontSize: 28, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  positionText: { color: '#666666', fontSize: 16, marginBottom: 15, textAlign: 'center' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEA', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#F8C77E' },
  ratingText: { color: '#D99A29', fontWeight: 'bold', fontSize: 18, marginRight: 6 },
  
  infoContainer: { marginBottom: 25 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoBox: { flex: 1, backgroundColor: '#ffffff', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#D0DCEB', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  resultBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20 },
  infoIcon: { marginBottom: 8 },
  infoLabel: { color: '#999999', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  infoValue: { color: '#0A1931', fontSize: 14, fontWeight: 'bold' },
  
  experienceSection: { backgroundColor: '#ffffff', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#D0DCEB', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
  sectionTitle: { color: '#0A1931', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  experienceText: { color: '#444444', fontSize: 15, lineHeight: 24 },

  interactionSection: { backgroundColor: '#ffffff', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#D0DCEB', marginBottom: 20 },
  interactionTitle: { color: '#0A1931', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  interactionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  voteButton: { flex: 0.48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#C8E6C9', backgroundColor: '#F1F8E9' },
  againstActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  supportActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  voteText: { color: '#2E7D32', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  voteTextKarsi: { color: '#C62828', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  voteTextActive: { color: '#ffffff' },

  footerSection: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40, marginTop: 10 },
  authorBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3EBF3', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#D0DCEB' },
  authorName: { color: '#666666', fontWeight: '600', marginLeft: 6, fontSize: 13 }
});
