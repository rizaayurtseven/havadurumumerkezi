function initializeWeatherApp() {

    const apiKey = '5c03ce0373390aff630bcb6f7aac303b'; 
    const forecastApiUrlBase = 'https://api.openweathermap.org/data/2.5/forecast';
    const currentWeatherApiUrlBase = 'https://api.openweathermap.org/data/2.5/weather';

    const $favoriteCitiesContainer = $('#favorite-cities-container');
    const $forecastResultContainer = $('#forecast-result-container');
    const $forecastCityName = $('#forecast-city-name');
    const $forecastCardsContainer = $('#forecast-cards-container');
    const $forecastLoadingSpinner = $('#forecast-loading-spinner');
    const $forecastErrorMessage = $('#forecast-error-message');
    const $addFavoriteBtn = $('<button class="btn btn-success btn-sm mt-2" style="display:none;">Favorilere Ekle</button>');

    const $cityInput = $('#city-input');
    const $getWeatherBtn = $('#get-weather-btn');

    let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    let currentSearchCityData = null;
    const MAX_FAVORITES = 5;

    function processForecastData(forecastList) {
        const dailyData = {};
        forecastList.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [], weather: [], icons: [], descriptions: [],
                    humidity: [], wind_speed: []
                };
            }
            dailyData[date].temps.push(item.main.temp);
            dailyData[date].weather.push(item.weather[0].main);
            dailyData[date].icons.push(item.weather[0].icon);
            dailyData[date].descriptions.push(item.weather[0].description);
            dailyData[date].humidity.push(item.main.humidity);
            dailyData[date].wind_speed.push(item.wind.speed);
        });

        const processedDailyArray = [];
        for (const date in dailyData) {
            const day = dailyData[date];
            const minTemp = Math.min(...day.temps);
            const maxTemp = Math.max(...day.temps);
            const representativeIndex = Math.floor(day.icons.length / 2);
            const icon = day.icons[representativeIndex];
            const description = day.descriptions[representativeIndex].charAt(0).toUpperCase() + day.descriptions[representativeIndex].slice(1);
            const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
            const avgWindSpeed = day.wind_speed.reduce((a, b) => a + b, 0) / day.wind_speed.length;

            processedDailyArray.push({
                date: new Date(date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'short' }),
                minTemp: Math.round(minTemp), maxTemp: Math.round(maxTemp),
                icon: icon, description: description,
                avgHumidity: Math.round(avgHumidity), avgWindSpeed: avgWindSpeed.toFixed(1)
            });
        }
        return processedDailyArray.slice(0, 5);
    }

    function displayFiveDayForecast(dailyForecasts, cityName) {
        $forecastCardsContainer.empty();
        $forecastCityName.text(cityName + " İçin 5 Günlük Tahmin").show();

        if (!dailyForecasts || dailyForecasts.length === 0) {
            $forecastErrorMessage.text('Günlük tahmin verisi bulunamadı.').show();
            return;
        }

        dailyForecasts.forEach(day => {
            const iconUrl = `https://openweathermap.org/img/w/${day.icon}.png`;
            const cardHtml = `
                <div class="col">
                    <div class="card h-100 forecast-day-card shadow-sm">
                        <div class="card-body text-center">
                            <h5 class="card-title">${day.date}</h5>
                            <img src="${iconUrl}" alt="${day.description}" class="my-2" style="width: 60px; height: 60px;">
                            <p class="card-text mb-1"><strong>${day.description}</strong></p>
                            <p class="card-text h4">${day.maxTemp}° <span class="text-muted">/ ${day.minTemp}°</span></p>
                            <p class="card-text small text-muted mt-2">Nem: %${day.avgHumidity} | Rüzgar: ${day.avgWindSpeed} m/s</p>
                        </div>
                    </div>
                </div>
            `;
            $forecastCardsContainer.append(cardHtml);
        });

        const isAlreadyFavorite = favoriteCities.some(favCity => favCity.toLowerCase() === cityName.toLowerCase());
        const isLimitReached = favoriteCities.length >= MAX_FAVORITES;

        $addFavoriteBtn.remove();
        if (currentSearchCityData && currentSearchCityData.name) {
            $forecastCityName.after($addFavoriteBtn);
            if (!isAlreadyFavorite && !isLimitReached) {
                $addFavoriteBtn.text(`${cityName}'i Favorilere Ekle`).removeClass('disabled').show();
            } else if (isAlreadyFavorite) {
                $addFavoriteBtn.text('Zaten Favorilerde').addClass('disabled').show();
            } else {
                $addFavoriteBtn.hide();
            }
        }
    }

    function getFiveDayForecastForCity(city) {
        currentSearchCityData = null;
        $forecastLoadingSpinner.show();
        $forecastErrorMessage.hide().text('');
        $forecastCardsContainer.empty();
        $forecastCityName.hide();
        $addFavoriteBtn.hide();

        const requestUrl = `${forecastApiUrlBase}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=tr`;

        $.ajax({
            url: requestUrl, method: 'GET',
            success: function(data) {
                if (!data || !data.list || data.list.length === 0 || !data.city) {
                    throw new Error('API yanıtı eksik veya hatalı.');
                }
                const cityName = data.city.name;
                currentSearchCityData = { name: cityName, forecast: data.list };
                const dailyForecasts = processForecastData(data.list);
                displayFiveDayForecast(dailyForecasts, cityName);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error(`5 Günlük API Hatası (${city}):`, textStatus, errorThrown, jqXHR);
                let errorMessageTxt = 'Bilgi alınamadı.';
                if (jqXHR.status === 404) errorMessageTxt = 'Şehir bulunamadı.';
                else if (jqXHR.status === 401) errorMessageTxt = 'API Anahtarı geçersiz.';
                else if (jqXHR.status === 0) errorMessageTxt = 'Ağ bağlantısı kurulamadı.';
                else errorMessageTxt = `Hata: ${jqXHR.statusText || textStatus}`;
                $forecastErrorMessage.text(errorMessageTxt).show();
                currentSearchCityData = null;
            },
            complete: function() {
                $forecastLoadingSpinner.hide();
                $getWeatherBtn.prop('disabled', false).text('Getir');
            }
        });
    }

    function getWeatherForFavoriteCity(city, $targetCard) {
        const $loading = $targetCard.find('.loading-spinner');
        const $errorMsg = $targetCard.find('.error-message');
        const $cardBody = $targetCard.find('.card-body');

        $loading.show();
        $errorMsg.hide().text('');
        $targetCard.removeClass('gunesli bulutlu yagmurlu karli diger hata loaded error');
        $cardBody.find('.weather-info-loaded').remove();

        const requestUrl = `${currentWeatherApiUrlBase}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=tr`;

        $.ajax({
            url: requestUrl, method: 'GET',
            success: function(data) {
                if (!data || !data.weather || data.weather.length === 0 || !data.main || !data.name) {
                    throw new Error('Favori için API yanıtı eksik veya hatalı.');
                }
                const cityName = data.name;
                const temperature = data.main.temp;
                const description = data.weather[0].description;
                const iconCode = data.weather[0].icon;
                const mainWeather = data.weather[0].main.toLowerCase();

                const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);
                const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

                const cardBodyContent = `
                    <div class="weather-info-loaded">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${cityName}</h5>
                            <p class="display-6 mb-0 ms-2">${Math.round(temperature)}°</p>
                        </div>
                        <div class="weather-info-bottom d-flex align-items-center">
                            <div class="weather-icon"> <img src="${iconUrl}" alt="${formattedDesc}"> </div>
                            <div class="weather-text-details ms-2">
                                <p class="card-text weather-description mb-0">${formattedDesc}</p>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm mt-auto remove-favorite align-self-end">Sil</button>
                    </div> `;
                $cardBody.append(cardBodyContent);
                $targetCard.addClass('loaded');
                setCardBackground($targetCard, mainWeather);
            },
            error: function() {
                $errorMsg.text('Veri alınamadı').show();
                $targetCard.addClass('error');
                setCardBackground($targetCard, 'hata');
            },
            complete: function() { $loading.hide(); }
        });
    }

    function setCardBackground($card, weatherMain) {
        $card.removeClass('gunesli bulutlu yagmurlu karli diger hata');
        let newClass = 'diger';
        if (weatherMain.includes('clear')) newClass = 'gunesli';
        else if (weatherMain.includes('clouds')) newClass = 'bulutlu';
        else if (weatherMain.includes('rain') || weatherMain.includes('drizzle') || weatherMain.includes('thunderstorm')) newClass = 'yagmurlu';
        else if (weatherMain.includes('snow')) newClass = 'karli';
        else if (weatherMain === 'hata') newClass = 'hata';
        $card.addClass(newClass);
    }

    function renderFavoriteCities() {
        $favoriteCitiesContainer.empty();
        if (favoriteCities.length === 0) {
            $favoriteCitiesContainer.html('<p class="placeholder-message col-12 text-center">Henüz favori şehir eklenmemiş.</p>');
        } else {
            favoriteCities.forEach(city => {
                const cardHtml = `
                    <div class="col">
                        <div class="card h-100 weather-card favorite-weather-card" data-city="${city}">
                            <div class="card-body d-flex flex-column">
                                <div class="loading-spinner" style="display: block; margin: auto;"></div>
                                <p class="error-message text-danger text-center" style="display: none; margin:auto;"></p>
                            </div>
                        </div>
                    </div> `;
                const $newCardCol = $(cardHtml);
                $favoriteCitiesContainer.append($newCardCol);
                getWeatherForFavoriteCity(city, $newCardCol.find('.weather-card'));
            });
        }
    }

    renderFavoriteCities();

    $getWeatherBtn.on('click', function() {
        const city = $cityInput.val().trim();
        if (city) {
            $(this).prop('disabled', true).text('Aranıyor...');
            getFiveDayForecastForCity(city);
        } else {
            $forecastErrorMessage.text('Lütfen bir şehir adı girin.').show();
            $forecastCardsContainer.empty(); $forecastCityName.hide();
            $forecastLoadingSpinner.hide(); currentSearchCityData = null;
        }
    });

    $cityInput.keypress(function(event) {
        if (event.which === 13) { event.preventDefault(); $getWeatherBtn.click(); }
    });

    $forecastResultContainer.on('click', '.btn-success', function() {
        if (!currentSearchCityData || !currentSearchCityData.name) {
            alert("Favoriye eklemek için önce geçerli bir şehir arayın."); return;
        }
        const cityToAdd = currentSearchCityData.name;
        const isAlreadyFavorite = favoriteCities.some(favCity => favCity.toLowerCase() === cityToAdd.toLowerCase());
        const isLimitReached = favoriteCities.length >= MAX_FAVORITES;

        if (isAlreadyFavorite) {
            alert(`"${cityToAdd}" zaten favorilerinizde!`);
            $(this).text('Zaten Favorilerde').addClass('disabled');
        } else if (isLimitReached) {
            alert(`En fazla ${MAX_FAVORITES} favori şehir ekleyebilirsiniz.`); $(this).hide();
        } else {
            favoriteCities.push(cityToAdd);
            localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
            renderFavoriteCities();
            alert(`"${cityToAdd}" favorilerinize eklendi!`);
            $(this).text('Favorilere Eklendi').addClass('disabled');
        }
    });

    $favoriteCitiesContainer.on('click', '.remove-favorite', function() {
        const $card = $(this).closest('.weather-card');
        const cityToRemove = $card.data('city');
        favoriteCities = favoriteCities.filter(city => city.toLowerCase() !== cityToRemove.toLowerCase());
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
        $card.closest('.col').fadeOut(300, function() {
            $(this).remove();
            if (favoriteCities.length === 0) {
                $favoriteCitiesContainer.html('<p class="placeholder-message col-12 text-center">Henüz favori şehir eklenmemiş.</p>');
            }
        });
        if (currentSearchCityData && currentSearchCityData.name && currentSearchCityData.name.toLowerCase() === cityToRemove.toLowerCase()) {
            const isLimitReachedAfterRemove = favoriteCities.length >= MAX_FAVORITES;
            if (!isLimitReachedAfterRemove) {
                const $dynamicAddBtn = $forecastResultContainer.find('.btn-success');
                if ($dynamicAddBtn.length > 0) {
                    $dynamicAddBtn.text(`${currentSearchCityData.name}'i Favorilere Ekle`).removeClass('disabled').show();
                }
            }
        }
    });

} 
$(document).ready(initializeWeatherApp);
