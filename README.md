<div align="center">

# 🌤️ Hava Durumu Merkezi

[![Android](https://img.shields.io/badge/Android-Native-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Anlık hava durumu verilerini şık bir arayüzle sunan Native Android uygulaması.**

[Özellikler](#-özellikler) • [Ekran Görüntüleri](#️-ekran-görüntüleri) • [Kurulum](#️-kurulum) • [API](#-api)

</div>

---

## 🖼️ Ekran Görüntüleri

> Uygulama ekran görüntüleri buraya eklenecektir.

---

## ✨ Özellikler

- 🌡️ **Anlık Sıcaklık** — Güncel hava durumu verisi
- 📅 **Günlük / Haftalık Tahmin** — İlerleyen günlere ait hava tahmini
- 🌙 **Karanlık / Aydınlık Tema** — Göze uygun tema seçeneği
- 📍 **Konum Desteği** — GPS ile otomatik şehir algılama
- 🔍 **Şehir Arama** — İstediğin şehri manuel olarak ara
- 💧 **Nem, Rüzgar, UV** — Detaylı hava bilgileri

---

## ⚙️ Kurulum

### Gereksinimler

- Android Studio Hedgehog veya üzeri
- Android SDK 24+ (Android 7.0)
- Hava durumu API anahtarı (OpenWeatherMap önerilir)

### Adımlar

```bash
# Repoyu klonla
git clone https://github.com/rizaayurtseven/havadurumumerkezi.git
cd havadurumumerkezi
```

1. **Android Studio** ile projeyi aç
2. `app/src/main/res/values/strings.xml` dosyasında API anahtarını ekle:
```xml
<string name="weather_api_key">BURAYA_API_ANAHTARINI_YAZ</string>
```
3. Projeyi **Sync** et ve çalıştır

---

## 🔑 API

Bu proje hava durumu verisi için harici bir API kullanır.

**Önerilen:** [OpenWeatherMap](https://openweathermap.org/api) — Ücretsiz plan yeterlidir.

1. [openweathermap.org](https://openweathermap.org) adresine kaydol
2. API anahtarını al
3. Projeye ekle (yukarıdaki adıma bakın)

---

## 📁 Proje Yapısı

```
havadurumumerkezi/
├── app/
│   └── src/
│       └── main/
│           ├── java/          # Java / Kotlin kaynak dosyaları
│           ├── res/
│           │   ├── layout/    # XML arayüz dosyaları
│           │   ├── drawable/  # Görseller ve ikonlar
│           │   └── values/    # Renkler, stringler, temalar
│           └── AndroidManifest.xml
├── gradle/
└── README.md
```

---

## 🛠️ Kullanılan Teknolojiler

| Teknoloji | Amaç |
|-----------|------|
| Java / Kotlin | Ana uygulama dili |
| XML | Arayüz tasarımı |
| Retrofit | API istekleri |
| Glide | Görsel yükleme |
| OpenWeatherMap API | Hava durumu verisi |

---

## 🤝 Katkıda Bulun

1. Fork et → Branch oluştur → Değişiklik yap → Pull Request aç

---

## 📄 Lisans

[MIT](LICENSE) © Rıza Ayurtseven

<div align="center">

⭐ Beğendiyseniz yıldız vermeyi unutmayın!

</div>
