// first API call to currentWeather responses

// maximum 7 days
let forecastDayTarget = 5;

const ApiKey = "3ff9623f9027960becbeadb447702b80";
const weatherIconURL = "http://openweathermap.org/img/wn/";

let currentWeatherURL = (cityInput) => {
  return (
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityInput +
    // toggleReturnedUnits() +
    "&appid=" +
    ApiKey
  );
};

let createURL2 = (latitude, longitude) => {
  return (
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    latitude +
    "&lon=" +
    longitude +
    // toggleReturnedUnits() +
    "&appid=" +
    ApiKey
  );
};

// const revealError404 = () => {
//   $("#error404Modal").modal("show");
// };

const showFeedback = (error) => {
  let errorDetected = $("#404");

  // flash error message
  if (error) {
    errorDetected.show().fadeOut(2500);
  }
};

const searchCityWeatherAPI = async (searchName) => {
  searchName = searchName.toLowerCase().trim();
  $("#searchInput").val("");
  try {
    const currentData = await searchCallToAPI(searchName);
    savePreviousCitySearch(searchName);
    saveSelectedCityState(searchName);
    const forecastData = await oneAPICall(
      currentData.latitude,
      currentData.longitude
    );
    // saveLastDisplayedWeather();
    renderCurrentCityEl(currentData, forecastData.uvIndex);
    dailyForecastRetrieval(forecastData.weatherDaily);
  } catch (error) {
    showFeedback(error);
  }
};

const searchCityButton = (event) => {
  event.preventDefault();
  let searchName = $("#searchInput").val().trim().toLowerCase();
  // $("#searchInput").val("");
  searchCityWeatherAPI(searchName);
};

$(document).ready(function () {
  let errorDetected = $("#404");
  errorDetected.hide();
  let previousCities = getFromLocalstorage();
  createPreviousCityList(previousCities);
  let lastSearchedCity = Object.keys(previousCities).pop();
  if (typeof lastSearchedCity !== "undefined") {
    searchCityWeatherAPI(lastSearchedCity);
  }
  // retriveLastDisplayWeather();
});

const oneAPICall = (latitude, longitude) =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: createURL2(latitude, longitude),
      method: "GET",
    }).then(function (response) {
      // uv index value (green0-2, yellow3-5, orange6-7, red8-10, violet11+)
      let uvIndex = response.current.uvi;
      // daily weather in SECOND api call -
      let weatherDaily = response.daily;

      resolve({ weatherDaily, uvIndex });
    });
  });

const searchCallToAPI = (cityInput) =>
  new Promise((resolve, reject) => {
    // let cityInput = $("#searchInput").val().trim().toLowerCase();
    $.ajax({
      url: currentWeatherURL(cityInput),
      method: "GET",
    })
      .then((response) => {
        let cityName = response.name;
        // in Kelvin - (toggle F<>C)
        let weatherStats = response.main;
        let currentWeatherTemp = weatherStats.temp;
        let weatherHumidity = weatherStats.humidity;
        // root ARRAY
        let weatherCall = response.weather;

        // (.png)
        let weatherIconVal = weatherCall[0].icon;

        // access coords
        let weatherCoord = response.coord;

        let longitude = weatherCoord.lon;

        let latitude = weatherCoord.lat;

        // open wind obj
        let weatherWind = response.wind;
        // windspeed in (mph? or kph?)
        let weatherWindSpeed = weatherWind.speed;

        let rawDateVal = response.dt;

        resolve({
          longitude,
          latitude,
          currentWeatherTemp,
          weatherHumidity,
          weatherWindSpeed,
          cityName,
          rawDateVal,
          weatherIconVal,
        });
      })
      .fail(function (error) {
        reject(error);
      });
  });

const getFromLocalstorage = () => {
  let previousCitiesStringified = localStorage.getItem("previousCities");
  let previousCities = JSON.parse(previousCitiesStringified);
  if (previousCities == null) {
    return {};
  }
  let cityKeys = Object.keys(previousCities);
  if (cityKeys.length > 9) {
    delete previousCities[cityKeys[0]];
  }
  return previousCities;
};

const savePreviousCitySearch = (cityName) => {
  if (!cityName) {
    // if cityName false OR if searchAPI returns error 404.
    return;
  }
  const previousCities = getFromLocalstorage();
  const updatedCities = { ...previousCities, [cityName]: 1 };
  localStorage.setItem("previousCities", JSON.stringify(updatedCities));
  createPreviousCityList(updatedCities);
};

const createPreviousCityList = (previousCities) => {
  $("#saved-cities").empty();

  let cityKeys = Object.keys(previousCities);

  for (i = 0; i < cityKeys.length; i++) {
    let cityEntries = $("<button>");
    cityEntries.addClass(
      "list-group list-group-item list-group-item-action savedButtons"
    );

    let stringSplit = cityKeys[i].toLowerCase().split(" ");
    for (j = 0; j < stringSplit.length; j++) {
      stringSplit[j] =
        stringSplit[j].charAt(0).toUpperCase() + stringSplit[j].substring(1);
    }
    let titleUppercaseCity = stringSplit.join(" ");
    cityEntries.text(titleUppercaseCity);

    cityEntries.on("click", function () {
      let clickedCity = $(this).text();
      searchCityWeatherAPI(clickedCity);
    });
    $("#saved-cities").prepend(cityEntries);
  }
};

const renderCurrentCityEl = (currentData, uvIndex) => {
  // debugger;
  let activeCityName = $(".city-active");
  let activeCityDate = $(".current-date");
  let activeCityIcon = $(".weather-icon");
  let currentDate = new Date(currentData.rawDateVal * 1000).toLocaleDateString(
    "en-AU"
  );
  let currentWeatherIcon =
    weatherIconURL + currentData.weatherIconVal + "@2x.png";

  activeCityName.text(currentData.cityName);
  activeCityDate.text(currentDate);
  activeCityIcon.attr("src", currentWeatherIcon);

  let isMetricOrImperial = $("#metric-button").is(":checked");

  let temperatureText = $(".temperature-text");
  let windText = $(".wind-text");
  let humidityText = $(".humidity-text");
  let uvText = $(".uv-text");
  // had to google this (ternary operator)
  let degreeSymbol = isMetricOrImperial ? "°C" : "°F";
  let windSpeedSymbol = isMetricOrImperial ? "m/s" : "mph";

  temperatureText.text(
    transformTemperatureToSelectedFormat(
      isMetricOrImperial,
      currentData.currentWeatherTemp
    ).toFixed(2) +
      " " +
      degreeSymbol
  );
  windText.text(
    transformWindspeedToSelectedUnits(
      isMetricOrImperial,
      currentData.weatherWindSpeed
    ).toFixed(2) +
      " " +
      windSpeedSymbol
  );
  humidityText.text(currentData.weatherHumidity + " " + "%");
  uvText.text(renderUV(uvIndex).toFixed(2));
};

const renderUV = (uvIndex) => {
  const uvText = $(".uv-text");

  uvText.attr("class", "uv-text");
  if (uvIndex >= 0 && uvIndex < 3) {
    uvText.addClass("lowUV");
  } else if (uvIndex >= 3 && uvIndex < 6) {
    uvText.addClass("medUV");
  } else if (uvIndex >= 6 && uvIndex < 8) {
    uvText.addClass("highUV");
  } else if (uvIndex >= 8 && uvIndex < 11) {
    uvText.addClass("veryhighUV");
  } else if (uvIndex >= 11) {
    uvText.addClass("extremeUV");
  } else {
    uvText.addClass("uv-text");
  }

  return uvIndex;
};

const convertKelvinToCelsius = (temperatureInKelvin) => {
  return temperatureInKelvin - 273.15;
};

const convertKelvinToFarenheit = (temperatureInKelvin) => {
  return ((temperatureInKelvin - 273.15) * 9) / 5 + 32;
};

const transformTemperatureToSelectedFormat = (
  isMetricOrImperial,
  temperatureInKelvin
) => {
  if (isMetricOrImperial) {
    return convertKelvinToCelsius(temperatureInKelvin);
  } else {
    return convertKelvinToFarenheit(temperatureInKelvin);
  }
};

const metricButtonSelection = () => {
  let searchName = getSelectedCityState();

  if (typeof searchName !== "undefined") {
    searchCityWeatherAPI(searchName);
  }
};

const convertMetresPerSecToMPH = (windspeedInMetres) => {
  return windspeedInMetres / 2.237;
};

const transformWindspeedToSelectedUnits = (
  isMetricOrImperial,
  windspeedInMetres
) => {
  if (isMetricOrImperial) {
    return windspeedInMetres;
  } else {
    return convertMetresPerSecToMPH(windspeedInMetres);
  }
};

const dailyForecastRetrieval = (weatherDaily) => {
  const forecastRow = $(".forecast-row");
  forecastRow.empty();
  let isMetricOrImperial = $("#metric-button").is(":checked");
  let degreeSymbol = isMetricOrImperial ? "°C" : "°F";
  for (i = 0; i < forecastDayTarget; i++) {
    let dailyMaxTemperature =
      transformTemperatureToSelectedFormat(
        isMetricOrImperial,
        weatherDaily[i].temp.max
      ).toFixed(2) +
      " " +
      degreeSymbol;

    let dailyMinTemperature =
      transformTemperatureToSelectedFormat(
        isMetricOrImperial,
        weatherDaily[i].temp.min
      ).toFixed(2) +
      " " +
      degreeSymbol;

    let dailyHumidity = weatherDaily[i].humidity;

    let dailyWeatherIcon = weatherDaily[i].weather[0].icon;

    let weatherIconImg = weatherIconURL + dailyWeatherIcon + "@2x.png";

    let dailyDates = weatherDaily[i].dt;

    let formattedDates = new Date(dailyDates * 1000).toLocaleDateString(
      "en-AU"
    );

    let forecastCard = $("<div>");
    forecastCard.attr("class", "col");

    let forecastCard1 = $("<div>");
    forecastCard1.attr("class", "card bg-light mb-3");

    let forecastCard2 = $("<div>");
    forecastCard2.attr("class", "card-body");

    let forecastHeadingDate = $("<h5>");
    forecastHeadingDate.text(formattedDates);
    forecastHeadingDate.attr({
      class: "card-title",
      "aria-label": "forecast-date",
    });
    let forecastImage = $("<img>");
    forecastImage.attr({
      src: weatherIconImg,
      alt: "weather-icon-image",
    });
    let forecastMax = $("<p>");
    let forecastMin = $("<p>");
    let forecastHumidity = $("<p>");
    forecastMax.attr("class", "cardinfo cardMaxTemperature");
    forecastMax.text("Max Temp: " + dailyMaxTemperature);
    forecastMin.attr("class", "cardinfo cardMinTemperature");
    forecastMin.text("Min Temp: " + dailyMinTemperature);
    forecastHumidity.attr("class", "cardinfo cardHumidity");
    forecastHumidity.text("Humidity: " + dailyHumidity + "%");
    forecastCard2.append(forecastHeadingDate);
    forecastCard2.append(forecastImage);
    forecastCard2.append(forecastMax);
    forecastCard2.append(forecastMin);
    forecastCard2.append(forecastHumidity);
    forecastCard1.append(forecastCard2);
    forecastCard.append(forecastCard1);
    forecastRow.append(forecastCard);
  }
};

const clearAllEvents = () => {
  clearLocalStorage();
  $(".forecast-row").empty();
  $(".city-active").empty();
  $(".current-date").empty();
  $(".weather-icon").attr("src", "");
  $(".temperature-text").empty();
  $(".wind-text").empty();
  $(".humidity-text").empty();
  $(".uv-text").empty();
};

const clearLocalStorage = () => {
  localStorage.clear();
};

const saveSelectedCityState = (selectedCityName) => {
  localStorage.setItem("selectedCity", selectedCityName);
};

const getSelectedCityState = () => {
  return localStorage.getItem("selectedCity");
};

$("#searchButton").click(searchCityButton);

$("#clearHistory").click(function () {
  clearAllEvents();
  $("#saved-cities").empty();
});

$("#metric-button").click(metricButtonSelection);

$("#imperial-button").click(metricButtonSelection);
