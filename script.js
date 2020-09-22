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
    const coordinates = await searchCallToAPI();
    const forecastData = await oneAPICall();
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
    var cityInput = $("#searchInput").val().trim().toLowerCase();
    $.ajax({
      url: currentWeatherURL(cityInput),
      method: "GET",
    }).then((response) => {
      var weatherStats = response.main;
      var cityName = response.name;
      // in Kelvin - (toggle F<>C)
      var weatherStats = response.main;
      var currentWeatherTemp = weatherStats.temp;
      var weatherHumidity = weatherStats.humidity;
      // root ARRAY
      var weatherCall = response.weather;

      // (.png)
      var weatherIconVal = weatherCall[0].icon;

      // access coords
      var weatherCoord = response.coord;

      longitude = weatherCoord.lon;

      latitude = weatherCoord.lat;

      // open wind obj
      var weatherWind = response.wind;
      // windspeed in (mph? or kph?)
      var weatherWindSpeed = weatherWind.speed;

      console.log("CurrentTemp", currentWeatherTemp);
      console.log("Humidity", weatherHumidity);
      console.log("Wind Speed", weatherWindSpeed);
      console.log("Longitude", longitude);
      console.log("Latitude", latitude);
      console.log("City", cityName);

      $("#searchInput").val("");
      resolve({ longitude, latitude });
    });
  });

const getFromLocalstorage = () => {
  var previousCitiesStringified = localStorage.getItem("previousCities");
  var previousCities = JSON.parse(previousCitiesStringified);
  if (previousCities == null) {
    return {};
  }
  var cityKeys = Object.keys(previousCities);
  if (cityKeys.length > 10) {
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
      initiate(event);
    });
    $("#saved-cities").append(cityEntries);
  }
  // gives the button text ~ *cityName* ~ userInput
};
// re-render + fetchlist
const createForecastEl = () => {};

const createSingleCityEl = () => {
  $("#singleDayWeather").html();
};

const renderUV = () => {};

const dailyForecastRetrieval = (weatherDaily) => {
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

    $("#daily" + i + "date").text(formattedDates);
    $("#daily" + i + "image").attr("src", weatherIconImg);
    $("#daily" + i + "tempMax").text(
      "Max. Temp: " + tempMax + "degrees F or C"
    );
    $("#daily" + i + "tempMin").text(
      "Min. Temp: " + tempMin + "degrees F or C"
    );
    $("#daily" + i + "humidity").text(dailyHumidity);
    $("#daily" + i + "humidity").each(function () {
      if (0 <= uvIndex < 3) {
        $(this).addClass("lowUV");
      } else if (3 <= uvIndex < 6) {
        $(this).addClass("medUV");
      } else if (6 <= uvIndex < 8) {
        $(this).addClass("highUV");
      } else if (8 <= uvIndex < 11) {
        $(this).addClass("veryhighUV");
      } else {
        $(this).addClass("extremeUV");
      }
    });

    // console.log(tempMax);
    // console.log(tempMin);
    // console.log(dailyHumidity);
    // console.log(weatherDaily[i]);
    // console.log(weatherDaily[i].weather[0]);
    // console.log(weatherDaily[i].weather[0].icon);
    // console.log("iconURL", weatherIconImg);
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
$("#search").click(initiate);
