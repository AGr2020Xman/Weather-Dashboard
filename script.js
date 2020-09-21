// first API call to currentWeather responses

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

// daily weather in SECOND api call -
var weatherDaily = response.daily;

// uv index value (green0-2, yellow3-5, orange6-7, red8-10, violet11+)
var uvIndex = response.current.uvi;

var cityInput = $("#searchInput").trim().val();
// maximum 7 days
var forecastDayTarget = 5;

const ApiKey = "3ff9623f9027960becbeadb447702b80";

// <<< Celsius || Farhenheit >>>
// if toggle = true >> + "&units=imperial"

// else if toggle = false >> + "&units=metric"

var currentWeatherURL = (cityInput) => {
  return (
    "api.openweathermap.org/data/2.5/weather?q=" +
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

$("#search").click();

var oneAPICall = (latitude, longitude, weatherDaily) => {
  $.ajax({
    url: createURL2(latitude, longitude),
    method: "GET",
  }).then(dailyForecastRetrieval(weatherDaily));
};

var searchCallToAPI = () => {
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

    console.log(currentWeatherTemp);
    console.log(weatherHumidity);
    console.log(weatherWindSpeed);
    console.log(longitude);
    console.log(latitude);
    console.log(cityName);

    oneAPICall(latitude, longitude, weatherDaily);
  });
};

function() {
    dbkfjhhdeskjh
    function() {
        dhfgkjfdehgkjdfhgk
        function() {

        }
    }
}

var dailyForecastRetrieval = () => {
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
    console.log(uvIndex);
  }
};

var populateCityData = (city, savedCity) => {
  searchCallToAPI(response);
  var nowMoment = moment();
};
