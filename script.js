// first API call to currentWeather responses

// maximum 7 days
var forecastDayTarget = 5;

const ApiKey = "3ff9623f9027960becbeadb447702b80";

// <<< Celsius || Farhenheit >>>
// if toggle = true >> + "&units=imperial"

// else if toggle = false >> + "&units=metric"

var currentWeatherURL = (cityInput) => {
  return (
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityInput +
    // &units=metric || &units=imperial
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
    // &units=metric || &units=imperial
    "&appid=" +
    ApiKey
  );
};

console.log("Debug");
const oneAPICall = (latitude, longitude) => {
  $.ajax({
    url: createURL2(latitude, longitude),
    method: "GET",
  }).then(function (response) {
    // uv index value (green0-2, yellow3-5, orange6-7, red8-10, violet11+)
    var uvIndex = response.current.uvi;
    // daily weather in SECOND api call -
    var weatherDaily = response.daily;
    console.log("UV Index", uvIndex);

    // console.log(weatherDaily[0].dt);
    // console.log(weatherDaily[1].dt);
    // console.log(weatherDaily[2].dt);
    // console.log(weatherDaily[3].dt);
    // console.log(weatherDaily[4].dt);

    dailyForecastRetrieval(weatherDaily);
  });
};

const searchCallToAPI = () => {
  console.log("words?");
  var cityInput = $("#searchInput").val().trim();
  $.ajax({
    url: currentWeatherURL(cityInput),
    method: "GET",
  }).then((response) => {
    console.log(response);

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

    var longitude = weatherCoord.lon;

    var latitude = weatherCoord.lat;

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

    oneAPICall(latitude, longitude);
    $("#searchInput").val("");
  });
};

const dailyForecastRetrieval = (weatherDaily) => {
  for (i = 0; i < forecastDayTarget; i++) {
    // daily main temp
    var dailyTemp = weatherDaily[i].temp.day;
    // daily main humidity
    var dailyHumidity = weatherDaily[i].humidity;
    // daily main weather icon
    var dailyWeatherIcon = weatherDaily[i].icon;

    console.log(dailyTemp);
    console.log(dailyHumidity);
    console.log("iconCode", dailyWeatherIcon);
  }
};

const populateSingleCityData = (city, savedCity) => {
  var nowMoment = moment();
};

const savePreviousCity = () => {};

$("#search").click(searchCallToAPI);
