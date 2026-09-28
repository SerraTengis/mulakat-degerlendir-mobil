# 🚀 Mülakat Değerlendir - Mobil Uygulama

Bu proje, iş ve staj başvuru süreçlerinde adayların karşılaştığı bilgi eksikliği ve belirsizlik problemlerini çözmek amacıyla tasarlanmış, **TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri Destek Programı** kapsamında geliştirilmiş bir mobil uygulamadır.

Adaylar, girdikleri mülakatlardaki deneyimlerini anonim veya açık kimlikle paylaşabilir, şirketlerin mülakat süreçleri hakkında önceden bilgi edinerek daha bilinçli bir hazırlık süreci geçirebilirler.

## 📥 Uygulamayı İndir (APK)

Uygulamanın derlenmiş en güncel Android (APK) sürümünü doğrudan indirip test edebilirsiniz (Test için cihazınızda *Bilinmeyen Kaynaklardan Yükle* seçeneğinin açık olması gerekmektedir):

*   👉 **[Mülakat Değerlendir APK dosyasını indirmek için tıklayın](https://github.com/SerraTengis/mulakat-degerlendir-mobil/releases/download/v1.0.0/application-2dfe143a-03dd-4492-acb4-4dbe66ad0e76.apk)**

## ✨ Temel Özellikler

*   **Anonim Paylaşım:** Kullanıcılar deneyimlerini paylaşırken 'Anonim Olarak Paylaş' seçeneğini kullanarak kimliklerini gizleyebilirler.
*   **Admin Onay Mekanizması:** Platformdaki bilgi kirliliğini önlemek amacıyla, girilen yeni değerlendirmeler sistem yöneticisi (admin) onayından geçtikten sonra yayınlanır.
*   **Gelişmiş Filtreleme:** Şirket adı, pozisyon, mülakat sonucu (Olumlu/Olumsuz/Beklemede) gibi kriterlere göre hızlı arama yapılabilir.
*   **Şikayet ve Moderasyon:** Topluluk kurallarını ihlal eden (Hakaret, Spam, İlgisiz İçerik) gönderiler kullanıcılar tarafından raporlanabilir.
*   **Güvenli Altyapı:** Kullanıcı kimlik doğrulama işlemleri ve veri tabanı yönetimi Firebase üzerinden güvenli bir şekilde sağlanmaktadır.

## 🛠️ Kullanılan Teknolojiler

*   **Frontend:** React Native, Expo, React Navigation
*   **Backend & Veritabanı:** Google Firebase (Authentication, Cloud Firestore)
*   **Yapay Zeka (ÜYZ) Desteği:** Geliştirme, kod optimizasyonu ve dokümantasyon süreçlerinde Gemini ve Codex modellerinden asistan olarak faydalanılmıştır.

## ⚙️ Kurulum ve Çalıştırma (Geliştiriciler İçin)

Projeyi yerel ortamınızda (local) çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Depoyu bilgisayarınıza klonlayın:
   git clone [https://github.com/SerraTengis/mulakat-degerlendir-mobil.git](https://github.com/SerraTengis/mulakat-degerlendir-mobil.git)

2. Proje dizinine gidin ve bağımlılıkları yükleyin:
   cd mulakat-degerlendir-mobil
   npm install

3. Uygulamayı başlatın:
   npx expo start

