// first API call to currentWeather responses

var longitude;

var latitude;

// maximum 7 days
var forecastDayTarget = 5;

const ApiKey = "3ff9623f9027960becbeadb447702b80";
const weatherIconURL = "http://openweathermap.org/img/wn/";

// <<< Celsius || Farhenheit >>>
// if toggle = true >> + "&units=imperial"

// else if toggle = false >> + "&units=metric"

var toggleReturnedUnits = () => {
  var celsius = "&units=metric";
  var farenheit = "&units=imperial";
  if ($("#unit-switch")) {
    return farenheit;
  } else if ($("#unit-switch")) {
    return celsius;
  }
};

var currentWeatherURL = (cityInput) => {
  return (
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityInput +
    // toggleReturnedUnits() +
    "&appid=" +
    ApiKey
  );
};

var createURL2 = (latitude, longitude) => {
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
const initiate = async (event) => {
  event.preventDefault();
  savePreviousCity($("#searchInput").val().trim().toLowerCase());
  try {
    const currentData = await searchCallToAPI();
    const forecastData = await oneAPICall();
    createSingleCityEl(forecastData, currentData);
    dailyForecastRetrieval(forecastData.weatherDaily);
  } catch (error) {
    console.log(error);
    if (error.statusCode === 404) {
      alert("Please try again");
    }
  }
};

$(document).ready(function () {
  let previousCities = getFromLocalstorage();
  createPreviousCityList(previousCities);
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
//         var uvIndex = response.current.uvi;
//         // daily weather in SECOND api call -
//         var weatherDaily = response.daily;
//         console.log("UV Index", uvIndex);

//         return {weatherDaily, uvIndex}
//       });

// };

const oneAPICall = () =>
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
        var uvIndex = response.current.uvi;
        // daily weather in SECOND api call -
        var weatherDaily = response.daily;
        console.log("UV Index", uvIndex);

        resolve({ weatherDaily, uvIndex });
      })
      .then();
  });

const searchCallToAPI = () =>
  new Promise((resolve, reject) => {
    let cityInput = $("#searchInput").val().trim().toLowerCase();
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

      longitude = weatherCoord.lon;

      latitude = weatherCoord.lat;

      // open wind obj
      let weatherWind = response.wind;
      // windspeed in (mph? or kph?)
      let weatherWindSpeed = weatherWind.speed;

      let rawDateVal = response.dt;

      console.log("CurrentTemp", currentWeatherTemp);
      console.log("Humidity", weatherHumidity);
      console.log("Wind Speed", weatherWindSpeed);
      console.log("Longitude", longitude);
      console.log("Latitude", latitude);
      console.log("City", cityName);

      $("#searchInput").val("");
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

const getFromLocalstorage = () => {
  var previousCitiesStringified = localStorage.getItem("previousCities");
  var previousCities = JSON.parse(previousCitiesStringified);
  if (previousCities == null) {
    return {};
  }
  var cityKeys = Object.keys(previousCities);
  if (cityKeys.length >= 9) {
    delete previousCities[cityKeys[0]];
  }
  return previousCities;
};

const savePreviousCity = (cityName) => {
  if (!cityName) {
    return;
  }
  const previousCities = getFromLocalstorage();
  const updatedCities = { ...previousCities, [cityName]: 1 };
  localStorage.setItem("previousCities", JSON.stringify(updatedCities));
  createPreviousCityList(updatedCities);
};

const createPreviousCityList = (previousCities) => {
  $("#saved-cities").empty();

  var cityKeys = Object.keys(previousCities);
  for (i = 0; i < cityKeys.length; i++) {
    var cityEntries = $("<button>");
    cityEntries.addClass(
      "list-group list-group-item list-group-item-action savedButtons"
    );

    var stringSplit = cityKeys[i].toLowerCase().split(" ");
    for (j = 0; j < stringSplit.length; j++) {
      stringSplit[j] =
        stringSplit[j].charAt(0).toUpperCase() + stringSplit[j].substring(1);
    }
    var titleUppercaseCity = stringSplit.join(" ");
    cityEntries.text(titleUppercaseCity);

    cityEntries.on("click", function (event) {
      $("#searchInput").val($(this).text());
      initiate(event);
    });
    $("#saved-cities").append(cityEntries);
  }
  // gives the button text ~ *cityName* ~ userInput
};
// re-render + fetchlist
const createForecastEl = () => {};

const createSingleCityEl = (currentData, forecastData) => {
  $(".jumbotron").empty();
  let activeCityName = $(".city-active");
  let activeCityDate = $(".current-date");
  let activeCityIcon = $(".weather-icon");
  let currentDate = new Date(currentData.rawDateVal * 1000).toLocaleDateString(
    "en-AU"
  );
  let currentWeatherIcon = weatherIconURL + currentData.weatherIconVal + ".png";
  activeCityName.html(currentData.cityName);
  activeCityDate.html(currentDate);
  activeCityIcon.attr("src", currentWeatherIcon);

  let temperatureText = $(".temperature-text");
  let windText = $(".wind-text");
  let humidityText = $(".humidity-text");
  let uvText = $(".uv-text");

  temperatureText.html(currentData.currentWeatherTemp);
  windText.html(currentData.weatherWindSpeed);
  humidityText.html(currentData.weatherHumidity);

  uvText.html(forecastData.uvIndex);
  if (0 <= uvIndex < 3) {
    $(uvText).addClass("lowUV");
  } else if (3 <= uvIndex < 6) {
    $(uvText).addClass("medUV");
  } else if (6 <= uvIndex < 8) {
    $(uvText).addClass("highUV");
  } else if (8 <= uvIndex < 11) {
    $(uvText).addClass("veryhighUV");
  } else {
    $(uvText).addClass("extremeUV");
  }
};

const dailyForecastRetrieval = (weatherDaily) => {
  const forecastRow = $(".forecast-row");
  forecastRow.empty();
  for (i = 0; i < forecastDayTarget; i++) {
    // daily main max
    let tempMax = weatherDaily[i].temp.max;
    // daily main min
    let tempMin = weatherDaily[i].temp.min;
    // daily main humidity
    let dailyHumidity = weatherDaily[i].humidity;
    // daily main weather icon
    let dailyWeatherIcon = weatherDaily[i].weather[0].icon;
    // weatherIcon URL
    let weatherIconImg = weatherIconURL + dailyWeatherIcon + ".png";
    // forecast date
    let dailyDates = weatherDaily[i].dt;
    // format the date
    let formattedDates = new Date(dailyDates * 1000).toLocaleDateString(
      "en-AU"
    );

    // console.log(formattedDates);
    // console.log(weatherIconImg);
    // console.log(tempMax);
    // console.log(tempMin);
    // console.log(dailyHumidity);

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
    forecastMax.text("Max Temp: " + tempMax);
    forecastMin.attr("class", "cardinfo cardMinTemperature");
    forecastMin.text("Min Temp: " + tempMin);
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

const populateForecastEl = () => {};

const populateSingleCityData = () => {
  var nowMoment = moment();
};

// $("#current-weather").addClass(".hide");
// $("#5dayforecast").addClass(".hide");

// $("#city-list").click((event)=>{
//     event.preventDefault();
//     var city = $(this).text();

// });

// this function - will INITIATE the API calls
$("#searchButton").click(initiate);

// Another option which does away with the async/await and subscribes
// more the the single responsibility behaviours that I like. Creates
// the need for a bit more daisy chaining however I think.

// function searchCityAPI(city){
//   //ajax call here and the rest of the code
//   }

//   $(#search).on("click", function(){
//   var cityInput = $("#searchInput").val().trim().toLowerCase();
//   searchCityAPI(cityInput)

//   })

//   $(".buttonHistory").on("click", function(){
//   var cityInput = $(this).text()
//   searchCityAPI(cityInput)

//   })
