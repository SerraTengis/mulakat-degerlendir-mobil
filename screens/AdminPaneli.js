import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPaneli({ navigation }) {
  const [bekleyenler, setBekleyenler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yetkili, setYetkili] = useState(false);

  // Sadece "beklemede" olan mülakatları çek
  const bekleyenleriGetir = async () => {
    try {
      const q = query(collection(db, "mulakatlar"), where("status", "==", "beklemede"));
      const querySnapshot = await getDocs(q);
      const liste = [];
      querySnapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      setBekleyenler(liste);
    } catch (error) {
      Alert.alert("Hata", "Veriler çekilirken bir sorun oluştu.");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    const yetkiyiKontrolEt = async () => {
      try {
        const kullanici = auth.currentUser;
        if (!kullanici) throw new Error('Oturum bulunamadı');

        const token = await kullanici.getIdTokenResult();
        if (token.claims.admin !== true) throw new Error('Yönetici yetkisi yok');

        setYetkili(true);
        await bekleyenleriGetir();
      } catch (error) {
        setYukleniyor(false);
        Alert.alert("Yetkisiz Erişim", "Bu sayfayı görüntüleme yetkiniz yok.", [
          { text: "Tamam", onPress: () => navigation.replace('AnaSayfa') }
        ]);
      }
    };

    yetkiyiKontrolEt();
  }, []);

  // Mülakatı Onayla (status değerini "onaylandi" yap)
  const mulakatiOnayla = async (id) => {
    try {
      const mulakatRef = doc(db, "mulakatlar", id);
      await updateDoc(mulakatRef, {
        status: "onaylandi"
      });
      Alert.alert("Başarılı", "Mülakat onaylandı ve ana sayfada yayınlandı!");
      bekleyenleriGetir(); // Listeyi yenile
    } catch (error) {
      Alert.alert("Hata", "Onaylama işlemi başarısız oldu.");
    }
  };

  // Mülakatı Reddet (Veritabanından tamamen sil)
  const mulakatiReddet = (id) => {
    Alert.alert(
      "Mülakatı Reddet",
      "Bu mülakatı tamamen silmek istediğine emin misin?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "mulakatlar", id));
              Alert.alert("Silindi", "Mülakat başarıyla silindi.");
              bekleyenleriGetir(); // Listeyi yenile
            } catch (error) {
              Alert.alert("Hata", "Silme işlemi başarısız oldu.");
            }
          }
        }
      ]
    );
  };

  if (yukleniyor || !yetkili) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0A66C2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Bekleyenler Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A1931" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Kontrol Paneli</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={bekleyenler}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.companyName}>{item.sirket}</Text>
              <Text style={styles.positionText}>{item.pozisyon}</Text>
            </View>
            
            <Text style={styles.summaryText} numberOfLines={3}>"{item.deneyim || item.sorular || item.ozet || 'Deneyim metni girilmemiş.'}"</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => mulakatiReddet(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                <Text style={styles.rejectText}>Reddet (Sil)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => mulakatiOnayla(item.id)}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                <Text style={styles.approveText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="#4CAF50" />
            <Text style={styles.emptyText}>Bekleyen mülakat bulunmuyor. Her şey onaylanmış!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#E3EBF3', borderBottomWidth: 1, borderBottomColor: '#D0DCEB' },
  headerTitle: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 5 },
  listContainer: { padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#D0DCEB', elevation: 2 },
  cardHeader: { marginBottom: 10 },
  companyName: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  positionText: { color: '#666666', fontSize: 14, marginTop: 2 },
  summaryText: { color: '#444444', fontSize: 14, fontStyle: 'italic', marginBottom: 15 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, flex: 0.48, justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  rejectText: { color: '#D32F2F', fontWeight: 'bold', marginLeft: 6 },
  approveBtn: { backgroundColor: '#4CAF50' },
  approveText: { color: '#ffffff', fontWeight: 'bold', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#666666', fontSize: 16, marginTop: 15, textAlign: 'center' }
});
