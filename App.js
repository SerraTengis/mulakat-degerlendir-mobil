import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Giris from './screens/Giris';
import KayitOl from './screens/KayitOl';
import GirisEkrani from './screens/GirisEkrani';
import AnaSayfa from './screens/AnaSayfa';
import MulakatDegerlendir from './screens/MulakatDegerlendir';
import DegerlendirmeleriOku from './screens/DegerlendirmeleriOku';
import MulakatDetayi from './screens/MulakatDetayi';
// PROFİL SAYFASINI EKLEDİK
import Profil from './screens/Profil'; 
// ADMİN PANELİNİ EKLEDİK
import AdminPaneli from './screens/AdminPaneli';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Giris" component={Giris} />
        <Stack.Screen name="KayitOl" component={KayitOl} />
        <Stack.Screen name="GirisEkrani" component={GirisEkrani} />
        <Stack.Screen name="AnaSayfa" component={AnaSayfa} />
        <Stack.Screen name="MulakatDegerlendir" component={MulakatDegerlendir} />
        <Stack.Screen name="DegerlendirmeleriOku" component={DegerlendirmeleriOku} />
        <Stack.Screen name="MulakatDetayi" component={MulakatDetayi} />
        {/* LİSTEYE KAYDETTİK */}
        <Stack.Screen name="Profil" component={Profil} />
        {/* ADMİN PANELİ KAYDI */}
        <Stack.Screen name="AdminPaneli" component={AdminPaneli} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}