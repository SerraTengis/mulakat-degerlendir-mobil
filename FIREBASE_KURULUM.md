# Firebase kayıt ve veritabanı ayarı

Bu proje Firebase Authentication ve Cloud Firestore kullanır. Kayıt sırasında
Authentication hesabı oluşturulduktan sonra `users/{uid}` belgesine yazılır.

1. Firebase Console > **Authentication** > **Sign-in method** ekranında
   **Email/Password** sağlayıcısını etkinleştirin.
2. Proje klasöründe Firebase CLI ile `firebase deploy --only firestore:rules`
   komutunu çalıştırın. Bu, repodaki `firestore.rules` dosyasını yayınlar.

Kurallar, kullanıcının yalnızca kendi `users/{uid}` profil belgesini
okuyup/yazabilmesine izin verir. Mülakat değerlendirmeleri herkese okunabilir;
oluşturma işlemi oturum açmış kullanıcının kendi kimliğiyle sınırlandırılır.

Yeni değerlendirmeler `beklemede` durumunda kaydedilir. Genel değerlendirme
listesi yalnızca `onaylandi` kayıtlarını sorgular; bekleyen kayıtlar yalnızca
gönderi sahibi ve yönetici tarafından görülebilir.

Admin paneli kullanılacaksa ilgili Firebase kullanıcısına sunucu tarafından
`admin: true` custom claim'i verilmelidir. Bu yetki istemci uygulamasından
verilmemelidir.
