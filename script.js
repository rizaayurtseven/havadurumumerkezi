// Tema Değiştirme İşlevselliği
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.className = savedTheme + '-theme'; // Kayıtlı temayı uygula
        updateButtonText(savedTheme);
    } else {
        // Başlangıçta HTML'deki class neyse onu kontrol et veya light yap
        let initialTheme = 'light';
        if (body.classList.contains('dark-theme')) {
            initialTheme = 'dark';
        } else if (body.classList.contains('fenerbahce-theme')) {
             initialTheme = 'fenerbahce';
        } else {
           body.classList.add('light-theme'); // Yoksa light ekle
        }
        updateButtonText(initialTheme);
    }
    // Hava durumu uygulamasını jQuery hazır olduğunda başlat
    $(document).ready(initializeWeatherApp);
});

themeToggle.addEventListener('click', () => {
    let currentTheme = '';
    if (body.classList.contains('light-theme')) currentTheme = 'light';
    else if (body.classList.contains('dark-theme')) currentTheme = 'dark';
    else if (body.classList.contains('fenerbahce-theme')) currentTheme = 'fenerbahce';
    else currentTheme = 'light'; // Varsayılan

    let nextTheme = '';
    body.classList.remove('light-theme', 'dark-theme', 'fenerbahce-theme'); // Önce tümünü kaldır

    // Tema döngüsü
    if (currentTheme === 'light') nextTheme = 'dark';
    else if (currentTheme === 'dark') nextTheme = 'fenerbahce';
    else if (currentTheme === 'fenerbahce') nextTheme = 'light';
    else nextTheme = 'dark'; // Hata durumunda koyuya geç

    body.classList.add(nextTheme + '-theme'); // Yeni temayı ekle
    updateButtonText(nextTheme);
    localStorage.setItem('theme', nextTheme); // Seçimi kaydet
});

function updateButtonText(currentActiveTheme) {
    // Buton metnini bir sonraki temaya geçişi gösterecek şekilde ayarla
    if (themeToggle) {
        if (currentActiveTheme === 'light') themeToggle.textContent = 'ACİK Tema';
        else if (currentActiveTheme === 'dark') themeToggle.textContent = 'KOYU Tema'; // Fenerbahçe'ye geçiş
        else if (currentActiveTheme === 'fenerbahce') themeToggle.textContent ='RENKLİ Tema';
        else themeToggle.textContent = 'Koyu Tema'; // Varsayılan
    }
}


// Hava Durumu Uygulaması İşlevselliği
function initializeWeatherApp() {

    const apiKey = '5c03ce0373390aff630bcb6f7aac303b'; // DİKKAT: API Anahtarını burada tutmak güvensizdir!
    const apiUrlBase = 'https://api.openweathermap.org/data/2.5/weather';

    // jQuery Element Seçimleri
    const $favoriteCitiesContainer = $('#favorite-cities-container');
    const $searchResultBox = $('#weather-result');
    const $searchWeatherContent = $searchResultBox.find('.weather-content');
    const $searchLoadingSpinner = $searchResultBox.find('.loading-spinner');
    const $searchErrorMessage = $searchResultBox.find('.error-message');
    const $addFavoriteBtn = $searchResultBox.find('.add-favorite-btn');
    const $cityInput = $('#city-input');
    const $getWeatherBtn = $('#get-weather-btn');
    const $initialPlaceholderMsg = $favoriteCitiesContainer.find('.placeholder-message');

    // Değişkenler
    let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    let currentSearchCity = null; // O an aranan ve sonuç kutusunda gösterilen şehir
    const MAX_FAVORITES = 5; // Maksimum favori sayısı

    // --- Hava Durumu Verisi Getirme Fonksiyonu ---
    function getWeatherForCity(city, targetElement) {
        const $target = $(targetElement); // jQuery nesnesi olmalı
        const isSearchResult = $target.is('#weather-result'); // Arama kutusu mu? ID ile kontrol
        const isFavoriteCard = $target.hasClass('weather-card'); // Favori kartı mı? Class ile kontrol

        let $loading, $errorMsg, $contentContainer;

        // Hedefe göre ilgili elementleri belirle
        if (isSearchResult) {
            $loading = $searchLoadingSpinner;
            $errorMsg = $searchErrorMessage;
            $contentContainer = $searchWeatherContent;
            currentSearchCity = city; // Arama yapılan şehri sakla
            $addFavoriteBtn.addClass('d-none'); // Favori butonunu başlangıçta gizle
        } else if (isFavoriteCard) {
            $loading = $target.find('.loading-spinner');
            $errorMsg = $target.find('.error-message');
            $contentContainer = $target.find('.card-body'); // İçerik favori kartının body'sine eklenecek
        } else {
            console.error("Bilinmeyen hedef element:", targetElement);
            return; // Hatalı hedefse çık
        }

        // Başlangıç durumu: Yükleniyor göster, hata/içeriği gizle
        $loading.show();
        $errorMsg.hide().text('');
        if (isSearchResult) {
            $contentContainer.hide(); // Arama kutusu içeriğini gizle
             $searchResultBox.removeClass('gunesli bulutlu yagmurlu karli diger hata loaded error'); // Önceki durumları temizle
        } else if (isFavoriteCard) {
             $target.removeClass('gunesli bulutlu yagmurlu karli diger hata loaded error'); // Önceki durumları temizle
             $contentContainer.find('.weather-info-loaded').remove(); // Eski favori içeriğini temizle
        }

        // API İsteği
        const requestUrl = `${apiUrlBase}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=tr`;

        $.ajax({
            url: requestUrl,
            method: 'GET',
            success: function(data) {
                console.log(`Veri alındı (${city}):`, data);
                // Temel veri kontrolü
                if (!data || !data.weather || data.weather.length === 0 || !data.main || !data.name) {
                    throw new Error('API yanıtı eksik veya hatalı.'); // Hata bloğuna yönlendir
                }

                // Gerekli verileri çek
                const cityName = data.name;
                const temperature = data.main.temp;
                const description = data.weather[0].description;
                const mainWeather = data.weather[0].main; // 'Clear', 'Clouds', 'Rain' etc.
                const iconCode = data.weather[0].icon;
                const tempMin = data.main.temp_min;
                const tempMax = data.main.temp_max;

                const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);

                // --- Veriyi ilgili yere bas ---
                if (isSearchResult) {
                    // Arama sonuç kutusunu doldur
                    $contentContainer.find('.sehir-adi').text(cityName);
                    $contentContainer.find('.anlik-sicaklik').text(Math.round(temperature) + '°');
                    $contentContainer.find('.aciklama').text(formattedDesc);
                    $contentContainer.find('.dusuk-sic').text(Math.round(tempMin));
                    $contentContainer.find('.yuksek-sic').text(Math.round(tempMax));

                    // Arka Planı Ayarla (Sadece Arama Sonucu İçin)
                    setArkaPlanForResultBox(mainWeather, $target); // $target = #weather-result

                    // Favorilere Ekle Butonunu Kontrol Et
                    const isAlreadyFavorite = favoriteCities.some(favCity => favCity.toLowerCase() === cityName.toLowerCase());
                    const isLimitReached = favoriteCities.length >= MAX_FAVORITES;
                    if (!isAlreadyFavorite && !isLimitReached) {
                        $addFavoriteBtn.removeClass('d-none'); // Eklenebilirse göster
                    } else {
                         $addFavoriteBtn.addClass('d-none'); // Eklenemezse gizle
                    }
                    $contentContainer.show(); // İçeriği göster

                } else if (isFavoriteCard) {
                    // Favori kartını doldur
                    const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

                    // Favori kartının içeriğini oluştur (YORUM SATIRI KALDIRILDI)
                    const cardBodyContent = `
                        <div class="weather-info-loaded"> 
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">${cityName}</h5>
                                <p class="display-6 mb-0 ms-2">${Math.round(temperature)}°</p>
                            </div>
                            <div class="weather-info-bottom d-flex align-items-center">
                                <div class="weather-icon">
                                    <img src="${iconUrl}" alt="${formattedDesc}" width="35" height="35">
                                </div>
                                <div class="weather-text-details ms-2">
                                    <p class="card-text weather-description mb-0">${formattedDesc}</p>
                                    <p class="boot-suggestion text-info mt-1 mb-0" style="display: none;"></p> 
                                </div>
                            </div>
                            <button class="btn btn-danger btn-sm mt-2 remove-favorite">Sil</button>
                       </div> 
                    `;
                    // Önceki içeriği temizle ve yenisini ekle
                    $contentContainer.find('.weather-info-loaded').remove();
                    $contentContainer.append(cardBodyContent);

                    // ***** Favori kartı için de arka planı ayarla *****
                    setArkaPlanForResultBox(mainWeather, $target); // $target favori kart elementidir

                    // Bot önerisini kontrol et ve göster/gizle
                    const rainyKeywords = ['yağmur', 'çiseleyen', 'sağanak', 'fırtına', 'gök gürültülü'];
                    const isRainy = mainWeather === 'Rain' || mainWeather === 'Drizzle' || mainWeather === 'Thunderstorm' ||
                                     rainyKeywords.some(keyword => description.toLowerCase().includes(keyword));
                    if (isRainy) {
                        $target.find('.boot-suggestion').text('Bot giymeniz önerilir 👢').show();
                    } else {
                        $target.find('.boot-suggestion').hide();
                    }
                }

                $target.addClass('loaded'); // Yüklendi sınıfını ekle (CSS ile spinner gizlenebilir)

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(`API Hatası (${city}):`, textStatus, errorThrown, jqXHR);
                // Kullanıcı dostu hata mesajı oluştur
                let errorMessageTxt = 'Bilgi alınamadı.';
                if (jqXHR.status === 404) errorMessageTxt = 'Şehir bulunamadı.';
                else if (jqXHR.status === 401) errorMessageTxt = 'API Anahtarı geçersiz.';
                else if (jqXHR.status === 0) errorMessageTxt = 'Ağ bağlantısı kurulamadı.';
                else errorMessageTxt = `Hata: ${jqXHR.statusText || textStatus}`;

                $errorMsg.text(errorMessageTxt).show(); // Hata mesajını göster
                $target.addClass('error'); // Hata sınıfını ekle

                // Arama kutusunda veya favori kartında hata varsa arka planı 'hata' durumuna getir
                 if (isSearchResult) {
                    setArkaPlanForResultBox('hata', $target); // $target is #weather-result
                    currentSearchCity = null; // Hata varsa aranan şehri sıfırla
                } else if (isFavoriteCard) {
                    setArkaPlanForResultBox('hata', $target); // $target is the favorite card element
                }
            },
            complete: function() {
                $loading.hide(); // Her durumda yükleniyor animasyonunu gizle
                if (isSearchResult) {
                    $getWeatherBtn.prop('disabled', false).text('Getir'); // Arama butonunu tekrar aktif et
                }
            }
        });
    } // --- getWeatherForCity Sonu ---


    // --- Arka Plan Ayarlama Fonksiyonu (Hem arama hem favori için) ---
    function setArkaPlanForResultBox(mainWeather, $targetBox) {
        // Gelen mainWeather null veya undefined ise 'diger' kabul et
        const durum = (mainWeather || 'other').toLowerCase();

        // Önceki tüm durum sınıflarını temizle
        $targetBox.removeClass('gunesli bulutlu yagmurlu karli diger hata');

        let yeniSinif = '';
        if (durum.includes('clear')) yeniSinif = 'gunesli';
        else if (durum.includes('clouds')) yeniSinif = 'bulutlu';
        else if (durum.includes('rain') || durum.includes('drizzle') || durum.includes('thunderstorm')) yeniSinif = 'yagmurlu';
        else if (durum.includes('snow')) yeniSinif = 'karli';
        else if (durum === 'hata') yeniSinif = 'hata'; // Explicit hata durumu
        else yeniSinif = 'diger'; // Diğer tüm durumlar (Mist, Fog, Haze, Dust, Sand, Ash, Squall, Tornado)

        $targetBox.addClass(yeniSinif); // Yeni sınıfı ekle
        console.log("Arka plan ayarlandı:", $targetBox.attr('id') || $targetBox.data('city'), "->", yeniSinif);
    } // --- setArkaPlanForResultBox Sonu ---


    // --- Favori Şehirleri Yükle ve Göster ---
    function renderFavoriteCities() {
        $favoriteCitiesContainer.empty(); // Önceki kartları temizle
        if (favoriteCities.length === 0) {
            $favoriteCitiesContainer.html('<p class="placeholder-message col-12 text-center">Henüz favori şehir eklenmemiş.</p>');
        } else {
            favoriteCities.forEach(city => {
                // Her şehir için kart HTML'ini oluştur (Başlangıçta sadece yükleniyor spinner'ı var)
                const cardHtml = `
                    <div class="col">
                        <div class="card h-100 weather-card" data-city="${city}"> ,
                            <div class="card-body">,
                                <div class="loading-spinner" style="display: block;"></div> ,
                                <p class="error-message" style="display: none;"></p>,
                                ,
                            </div>
                        </div>
                    </div>
                `;
                const $newCardCol = $(cardHtml); // jQuery nesnesine çevir
                $favoriteCitiesContainer.append($newCardCol); // Konteynere ekle

                // Kart eklendikten hemen sonra o şehir için hava durumunu çek
                // Hedef olarak yeni oluşturulan kartın içindeki .weather-card'ı ver
                getWeatherForCity(city, $newCardCol.find('.weather-card'));
            });
        }
    } // --- renderFavoriteCities Sonu ---

    // --- Olay Dinleyicileri ---

    // Sayfa ilk yüklendiğinde favorileri render et
    renderFavoriteCities();

    // Arama Butonu Tıklama Olayı
    $getWeatherBtn.on('click', function() {
        const city = $cityInput.val().trim(); // Input değerini al ve boşlukları temizle
        if (city) {
            $(this).prop('disabled', true).text('Aranıyor...'); // Butonu geçici olarak pasif yap
            $searchResultBox.removeClass('d-none'); // Sonuç kutusunu görünür yap (varsa)
            getWeatherForCity(city, $searchResultBox); // Arama sonucu için hava durumunu çek
        } else {
            // Hata mesajını arama kutusunda gösterelim
             $searchResultBox.removeClass('d-none');
             $searchLoadingSpinner.hide();
             $searchWeatherContent.hide();
             $searchErrorMessage.text('Lütfen bir şehir adı girin.').show();
             setArkaPlanForResultBox('hata', $searchResultBox); // Hata arka planı
             currentSearchCity = null;
        }
    });

    // Input Alanında Enter Tuşu ile Arama
    $cityInput.keypress(function(event) {
        if (event.which === 13) { // Enter tuşunun kodu 13'tür
            event.preventDefault(); // Formun gönderilmesini engelle (varsa)
            $getWeatherBtn.click(); // Arama butonunun tıklanma olayını tetikle
        }
    });

    // Favorilere Ekle Butonu Tıklama Olayı
    $addFavoriteBtn.on('click', function() {
        // `currentSearchCity` değişkeni arama başarılı olduğunda set edilmiş olmalı
        const cityToAdd = currentSearchCity;
        if (!cityToAdd) {
            console.warn("Favoriye eklenecek geçerli bir şehir bulunamadı (currentSearchCity boş).");
            alert("Favoriye eklemek için önce geçerli bir şehir arayın.");
            return;
        }

        // Aynı şehir zaten var mı diye kontrol et (küçük/büyük harf duyarsız)
        const isAlreadyFavorite = favoriteCities.some(favCity => favCity.toLowerCase() === cityToAdd.toLowerCase());
        const isLimitReached = favoriteCities.length >= MAX_FAVORITES;

        if (isAlreadyFavorite) {
            alert(`"${cityToAdd}" zaten favorilerinizde!`);
        } else if (isLimitReached) {
            alert(`En fazla ${MAX_FAVORITES} favori şehir ekleyebilirsiniz.`);
        } else {
            favoriteCities.push(cityToAdd); // Listeye ekle
            localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities)); // localStorage'a kaydet
            renderFavoriteCities(); // Favori listesini güncelleyerek yeniden çiz
            alert(`"${cityToAdd}" favorilerinize eklendi!`);
            $(this).addClass('d-none'); // Eklendikten sonra butonu gizle
        }
    });

    // Favori Kaldırma (Event Delegation kullanarak dinamik eklenen butonlar için)
    $favoriteCitiesContainer.on('click', '.remove-favorite', function() {
        const $card = $(this).closest('.weather-card'); // En yakın .weather-card'ı bul
        const cityToRemove = $card.data('city'); // data-city attribute'undan şehir adını al

        // Favori listesinden şehri filtrele (küçük/büyük harf duyarsız)
        favoriteCities = favoriteCities.filter(city => city.toLowerCase() !== cityToRemove.toLowerCase());
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities)); // localStorage'ı güncelle

        // Kartı animasyonlu olarak kaldır
        $card.closest('.col').fadeOut(300, function() {
            $(this).remove(); // Animasyon bitince DOM'dan kaldır
            // Eğer favori kalmazsa placeholder mesajını göster
            if (favoriteCities.length === 0) {
                 $favoriteCitiesContainer.html('<p class="placeholder-message col-12 text-center">Henüz favori şehir eklenmemiş.</p>');
            }
        });

        // Eğer silinen şehir o an arama sonucunda gösteriliyorsa,
        // ve limit aşılmadıysa, Favorilere Ekle butonunu tekrar görünür yap
        if (currentSearchCity && currentSearchCity.toLowerCase() === cityToRemove.toLowerCase()) {
            const isLimitReached = favoriteCities.length >= MAX_FAVORITES;
             // Arama kutusunda hata olmaması durumunu da kontrol edelim
            if (!isLimitReached && !$searchResultBox.hasClass('error')) {
                $addFavoriteBtn.removeClass('d-none');
            }
        }
    });

} // --- initializeWeatherApp Sonu ---
