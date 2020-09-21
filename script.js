var weatherCall = response.weather;
var weatherId = weatherCall.id;
var weatherMain = weatherCall.main;
var weatherDescription = weatherCall.description;
var weatherIconVal = weatherCall.icon;

var weatherStats = response.main;
// in Kelvin
var weatherTemp = weatherStats[0].temp;
var weatherTempMin = weatherStats[2].temp_min;
var weatherTempMax = weatherStats[3].temp_max;
var weatherHumidity = weatherStats[5].humidity;

var weatherWind = response.wind;
var weatherWindSpeed = weatherWind.speed;
var weatherWindDirection = weatherWind.deg;

var weatherCoord = response.coord;
var longitude = weatherCoord.lon;
var latitude = weatherCoord.lat;

var uvIndex = response.current.uvi;

// daily weather in SECOND api call - 
var weatherDaily = response.daily[i];
var weatherDays = weatherDaily[i];

var myApiKey = "3ff9623f9027960becbeadb447702b80";

var queryURL = "api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + myApiKey;
var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude "&lon=" + longitude + "&appid=" + myApiKey;


$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response) {

    
})

$.ajax({
    url: queryURL2,
    method: "GET"
}).then(function(response) {
    
})