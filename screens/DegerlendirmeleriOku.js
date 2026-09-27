import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

// Firebase bağlantıları
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { sirketlerListesi, pozisyonlarListesi } from '../veriListeleri';

export default function DegerlendirmeleriOku({ navigation }) {
  const [modalGorunur, setModalGorunur] = useState(false);
  
  const [mulakatlar, setMulakatlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Filtre Durumları
  const [aramaMetni, setAramaMetni] = useState(''); 
  const [seciliSirket, setSeciliSirket] = useState('');
  const [seciliPozisyon, setSeciliPozisyon] = useState('');
  const [seciliSonuc, setSeciliSonuc] = useState('');

  const verileriGetir = useCallback(async () => {
    setYukleniyor(true);
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "mulakatlar"), where("status", "==", "onaylandi"))
      );
      const liste = [];
      querySnapshot.forEach((doc) => {
        const veri = doc.data();
        liste.push({ id: doc.id, ...veri });
      });
      liste.sort((a, b) => new Date(b.eklenmeTarihi || 0) - new Date(a.eklenmeTarihi || 0));
      setMulakatlar(liste);
    } catch (error) {
      console.log("Veri çekme hatası:", error.message);
    } finally {
      setYukleniyor(false); 
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      verileriGetir();
    }, [verileriGetir])
  );

  const metniNormalizeEt = (metin) => {
    if (!metin) return '';
    return metin
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/[^a-z0-9]/g, ''); 
  };

  const filtrelenmisVeriler = mulakatlar.filter(item => {
    const aramaKriteri = metniNormalizeEt(aramaMetni);
    const sirketNormalize = metniNormalizeEt(item.sirket);
    const pozisyonNormalize = metniNormalizeEt(item.pozisyon);
    
    const aramaUyuyor = aramaKriteri === '' || 
                        sirketNormalize.includes(aramaKriteri) || 
                        pozisyonNormalize.includes(aramaKriteri);

    const sirketUyuyor = seciliSirket ? sirketNormalize.includes(metniNormalizeEt(seciliSirket)) : true;
    const pozisyonUyuyor = seciliPozisyon ? pozisyonNormalize.includes(metniNormalizeEt(seciliPozisyon)) : true;
    const sonucUyuyor = seciliSonuc ? item.sonuc === seciliSonuc : true;
    
    return aramaUyuyor && sirketUyuyor && pozisyonUyuyor && sonucUyuyor;
  });

  const filtreleriTemizle = () => {
    setSeciliSirket('');
    setSeciliPozisyon('');
    setSeciliSonuc('');
    setAramaMetni(''); 
    setModalGorunur(false);
  };

  const aktifFiltreVarMi = seciliSirket !== '' || seciliPozisyon !== '' || seciliSonuc !== '';

  const renderKart = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{item.sirket}</Text>
          <Text style={styles.positionText}>{item.pozisyon}</Text>
          <View style={styles.resultBadge}>
            <Ionicons name="flag-outline" size={16} color="#0A66C2" />
            <Text style={styles.resultLabel}>Sonuç:</Text>
            <Text style={styles.resultValue}>{item.sonuc || 'Belirtilmedi'}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.puan || 0}.0</Text>
          <Ionicons name="star" size={14} color="#D99A29" />
        </View>
      </View>

      <Text style={styles.summaryText} numberOfLines={2}>"{item.deneyim || item.sorular || item.ozet || 'Ek açıklama girilmedi.'}"</Text>

      <View style={styles.cardFooter}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={20} color="#666666" />
          <Text style={styles.userName}>{item.adSoyad || "Anonim Kullanıcı"}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.readMoreButton}
          onPress={() => navigation.navigate('MulakatDetayi', { mulakatData: item })}
        >
          <Text style={styles.readMoreText}>Detayı Oku</Text>
          <Ionicons name="chevron-forward" size={16} color="#0A66C2" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (yukleniyor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A66C2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Değerlendirmeler Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3EBF3" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AnaSayfa')}>
          <Ionicons name="arrow-back" size={24} color="#0A1931" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Değerlendirmeler</Text>
        
        <TouchableOpacity 
          style={[styles.filterButton, aktifFiltreVarMi ? styles.filterActive : null]} 
          onPress={() => setModalGorunur(true)}
        >
          <Ionicons name="options-outline" size={22} color={aktifFiltreVarMi ? "#ffffff" : "#0A1931"} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şirket veya pozisyon ara..."
            placeholderTextColor="#999999"
            value={aramaMetni}
            onChangeText={setAramaMetni}
            autoCorrect={false}
          />
          {aramaMetni.length > 0 && (
            <TouchableOpacity onPress={() => setAramaMetni('')} style={styles.clearSearchIcon}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtrelenmisVeriler}
        keyExtractor={item => item.id}
        renderItem={renderKart}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color="#999999" />
            <Text style={styles.emptyText}>Bu filtre kriterlerine veya aramaya uygun bir değerlendirme bulunamadı.</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalGorunur}
        onRequestClose={() => setModalGorunur(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detaylı Filtreleme</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={styles.filterLabel}>Şirket</Text>
              <View style={styles.pickerContainer}>
                {/* GÜNCELLENDİ: Dinamik Şirket Listesi */}
                <Picker selectedValue={seciliSirket} onValueChange={setSeciliSirket} style={styles.picker} dropdownIconColor="#0A1931">
                  <Picker.Item label="Tüm Şirketler" value="" color="#666666" />
                  {sirketlerListesi.map((sirketAdi, index) => (
                    <Picker.Item key={index} label={sirketAdi} value={sirketAdi} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterLabel}>Pozisyon</Text>
              <View style={styles.pickerContainer}>
                {/* GÜNCELLENDİ: Dinamik Pozisyon Listesi */}
                <Picker selectedValue={seciliPozisyon} onValueChange={setSeciliPozisyon} style={styles.picker} dropdownIconColor="#0A1931">
                  <Picker.Item label="Tüm Pozisyonlar" value="" color="#666666" />
                  {pozisyonlarListesi.map((pozisyonAdi, index) => (
                    <Picker.Item key={index} label={pozisyonAdi} value={pozisyonAdi} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.filterLabel}>Mülakat Sonucu</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={seciliSonuc} onValueChange={setSeciliSonuc} style={styles.picker} dropdownIconColor="#0A1931">
                  <Picker.Item label="Tüm Sonuçlar" value="" color="#666666" />
                  <Picker.Item label="Kabul Edilenler" value="Kabul" />
                  <Picker.Item label="Reddedilenler" value="Red" />
                  <Picker.Item label="Süreci Devam Edenler" value="Beklemede" />
                </Picker>
              </View>

            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalClearButton} onPress={filtreleriTemizle}>
                <Text style={styles.modalClearText}>Temizle</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalApplyButton} onPress={() => setModalGorunur(false)}>
                <Text style={styles.modalApplyText}>Filtreleri Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3EBF3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#E3EBF3' },
  backButton: { padding: 5 },
  headerTitle: { color: '#0A1931', fontSize: 18, fontWeight: 'bold' },
  filterButton: { backgroundColor: '#ffffff', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#D0DCEB' },
  filterActive: { backgroundColor: '#0A1931', borderColor: '#0A1931' },
  
  searchContainer: { paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#E3EBF3', borderBottomWidth: 1, borderBottomColor: '#D0DCEB' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#D0DCEB', height: 45 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#0A1931', fontSize: 15 },
  clearSearchIcon: { padding: 5 },

  listContainer: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { color: '#666666', textAlign: 'center', marginTop: 15, fontSize: 16, lineHeight: 24 },
  
  card: { backgroundColor: '#ffffff', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#D0DCEB', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  companyName: { color: '#0A1931', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  positionText: { color: '#666666', fontSize: 13 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#F8C77E', marginLeft: 10 },
  ratingText: { color: '#D99A29', fontWeight: 'bold', marginRight: 4, fontSize: 13 },
  summaryText: { color: '#444444', fontSize: 14, lineHeight: 22, marginBottom: 15, fontStyle: 'italic' },
  resultBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#EAF3FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginTop: 9 },
  resultLabel: { color: '#526274', fontSize: 12, fontWeight: '600', marginLeft: 5 },
  resultValue: { color: '#0A1931', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#666666', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  readMoreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3EBF3', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15 },
  readMoreText: { color: '#0A66C2', fontSize: 13, fontWeight: 'bold', marginRight: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '80%', elevation: 5 },
  modalTitle: { color: '#0A1931', fontSize: 20, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  
  filterLabel: { color: '#666666', fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  pickerContainer: { backgroundColor: '#E3EBF3', borderRadius: 12, borderWidth: 1, borderColor: '#D0DCEB', marginBottom: 20 },
  picker: { color: '#0A1931', height: 55, marginLeft: -8 },
  
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10 },
  modalClearButton: { flex: 0.35, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#D0DCEB', borderRadius: 12 },
  modalClearText: { color: '#666666', fontWeight: 'bold', fontSize: 15 },
  modalApplyButton: { flex: 0.6, backgroundColor: '#0A1931', paddingVertical: 16, alignItems: 'center', borderRadius: 12, elevation: 3 },
  modalApplyText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 }
});
