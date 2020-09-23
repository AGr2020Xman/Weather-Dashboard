// first API call to currentWeather responses

// maximum 7 days
let forecastDayTarget = 5;

const ApiKey = "3ff9623f9027960becbeadb447702b80";
const weatherIconURL = "http://openweathermap.org/img/wn/";

// <<< Celsius || Farhenheit >>>
// if toggle = true >> + "&units=imperial"

// else if toggle = false >> + "&units=metric"

let toggleReturnedUnits = () => {
  let celsius = "&units=metric";
  let farenheit = "&units=imperial";
  if ($("#unit-switch")) {
    return farenheit;
  } else if ($("#unit-switch")) {
    return celsius;
  }
};

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

// bestpractice
//
const searchCityWeatherAPI = async (searchName) => {
  searchName = searchName.toLowerCase().trim();
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
    console.log(error);
    if (error === 404) {
      alert("Error 404: Please try again");
    }
  }
};

const searchCityButton = (event) => {
  event.preventDefault();
  let searchName = $("#searchInput").val().trim().toLowerCase();
  // $("#searchInput").val("");
  searchCityWeatherAPI(searchName);
};

$(document).ready(function () {
  let previousCities = getFromLocalstorage();
  createPreviousCityList(previousCities);
  let lastSearchedCity = Object.keys(previousCities).pop();
  if (typeof lastSearchedCity !== "undefined") {
    searchCityWeatherAPI(lastSearchedCity);
  }
  // retriveLastDisplayWeather();
});

// data can only be access from the previous function
// the called function is a promise - THEN it return another promise
// promises are asynchronous functions that need to be handled in a special manner
// here (below) (with the help of tw0v) i have got a chain of THENables (due to the promise)

// const initiate = (event) => {
//   event.preventDefault();

//   searchCallToAPI()
//     .then(function (coordinates) {
//       return oneAPICall();
//     })
//     .then(function (forecastData) {
//       dailyForecastRetrieval(forecastData.weatherDaily);
//     })
//     .catch(function (e) {
//       //do error message alert
//     });
// };

// const promiseExample = () => {

//     return $.ajax({
//         url: createURL2(latitude, longitude),
//         method: "GET",
//       }).then(function (response) {
//         // uv index value (green0-2, yellow3-5, orange6-7, red8-10, violet11+)
//         let uvIndex = response.current.uvi;
//         // daily weather in SECOND api call -
//         let weatherDaily = response.daily;
//         console.log("UV Index", uvIndex);

//         return {weatherDaily, uvIndex}
//       });

// };

const oneAPICall = (latitude, longitude) =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: createURL2(latitude, longitude),
      method: "GET",
      statusCode: {
        404: function () {
          alert("Error 404 - please try again");
        },
        400: function () {
          alert(
            "Incorrect coordinates received. Please search the city again."
          );
        },
      },
    })
      .then(function (response) {
        // uv index value (green0-2, yellow3-5, orange6-7, red8-10, violet11+)
        let uvIndex = response.current.uvi;
        // daily weather in SECOND api call -
        let weatherDaily = response.daily;

        resolve({ weatherDaily, uvIndex });
      })
      .then();
  });

const searchCallToAPI = (cityInput) =>
  new Promise((resolve, reject) => {
    // let cityInput = $("#searchInput").val().trim().toLowerCase();
    $.ajax({
      url: currentWeatherURL(cityInput),
      method: "GET",
      statusCode: {
        404: function () {
          alert("Error 404 - please try again");
        },
        400: function () {
          alert(
            "This city does not exist or is spelt incorrectly. Please try again."
          );
        },
      },
    }).then((response) => {
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
    });
  });

// const saveLastDisplayedWeather = () => {
//   const lastDisplay = retriveLastDisplayWeather();
//   localStorage.setItem("lastDisplay", JSON.stringify({}));
//   localStorage.setItem("lastDisplay", JSON.stringify(lastDisplay));
// };

// const retriveLastDisplayWeather = () => {
//   let lastDisplayStringified = localStorage.getItem("lastDisplay");
//   let lastDisplay = JSON.parse(lastDisplayStringified);
//   if (lastDisplay == null) {
//     return {};
//   }
//   renderCurrentCityEl();
// dailyForecastRetrieval();
// };

const getFromLocalstorage = () => {
  let previousCitiesStringified = localStorage.getItem("previousCities");
  let previousCities = JSON.parse(previousCitiesStringified);
  if (previousCities == null) {
    return {};
  }
  let cityKeys = Object.keys(previousCities);
  if (cityKeys.length >= 9) {
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
    $("#saved-cities").append(cityEntries);
  }
};

const renderCurrentCityEl = (currentData, uvIndex) => {
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
  renderUV(uvIndex);
};

const renderUV = (uvIndex) => {
  let uvText = $(".uv-text");
  valueInt = parseInt(uvIndex);
  console.log(uvIndex);
  uvText.text(uvIndex);
  if (0 <= uvIndex < 3) {
    uvText.addClass("lowUV");
  } else if (3 <= uvIndex < 6) {
    uvText.addClass("medUV");
  } else if (6 <= uvIndex < 8) {
    uvText.addClass("highUV");
  } else if (8 <= uvIndex < 11) {
    uvText.addClass("veryhighUV");
  } else {
    uvText.addClass("extremeUV");
  }
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
    forecastHumidity.text("H: " + dailyHumidity + "%");
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

// this function - will INITIATE the API calls
$("#searchButton").click(searchCityButton);

$("#clearHistory").click(function () {
  clearAllEvents();
  $("#saved-cities").empty();
});

$("#metric-button").click(metricButtonSelection);
$("#imperial-button").click(metricButtonSelection);

// $("#current-weather").addClass(".hide");
// $("#5dayforecast").addClass(".hide");

// $("#city-list").click((event)=>{
//     event.preventDefault();
//     let city = $(this).text();

// });

// Another option which does away with the async/await and subscribes
// more the the single responsibility behaviours that I like. Creates
// the need for a bit more daisy chaining however I think.

// function searchCityAPI(city){
//   //ajax call here and the rest of the code
//   }

//   $(#search).on("click", function(){
//   let cityInput = $("#searchInput").val().trim().toLowerCase();
//   searchCityAPI(cityInput)

//   })

//   $(".buttonHistory").on("click", function(){
//   let cityInput = $(this).text()
//   searchCityAPI(cityInput)

//   })
