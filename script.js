var city = "";
var cityName = $("#city-name");
var searchButton = $("#search-button");
var currentCity = $("#current-city");
var currentTemp = $("#current-temperature");
var currentHumidty = $("#humidity");
var windSpeed = $("#wind-speed");
var uvIndex = $("#uv-index");
var searchCity = [];

function displayWeather(event) {
  event.preventDefault();
  if (cityName.val() !== "") {
    city = cityName.val();
    console.log(city);
    currentWeather(city);
  }
}

var APIKEY = "d8537fe64cbe9815b6703c961bec2827";

function currentWeather(city) {
  // gets data from API server
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKEY;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    var getIcon = response.weather[0].icon;
    var iconSrc = "https://openweathermap.org/img/wn/" + getIcon + "@4x.png";
    var date = new Date(response.dt * 1000).toLocaleDateString();
    $(currentCity).html(
      response.name + "(" + date + ")" + "<img src=" + iconSrc + ">"
    );
    //temperature in fahrenheit
    var fahrenheit = (response.main.temp - 273.15) * 1.8 + 32;
    $(currentTemp).html(fahrenheit.toFixed() + "&#8457");

    //Humidity
    $(currentHumidty).html(response.main.humidity + "%");
    //Wind speed in MPH
    var ws = response.wind.speed;
    var windsmph = (ws * 2.237).toFixed(1);
    $(windSpeed).html(windsmph + "MPH");
    UVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);
    if (response.cod == 200) {
      searchCity = JSON.parse(localStorage.getItem("cityname"));
      console.log(searchCity);
      if (searchCity == null) {
        searchCity = [];
        searchCity.push(city);
        localStorage.setItem("cityname", JSON.stringify(searchCity));
        cityList(city);
      } else {
        if (find(city) > 0) {
          searchCity.push(city);
          localStorage.setItem("cityname", JSON.stringify(searchCity));
          cityList(city);
        }
      }
    }
  });
}
// UV Index
function UVIndex(ln, lt) {
  var uvSrc =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKEY +
    "&lat=" +
    lt +
    "&lon=" +
    ln;
  $.ajax({
    url: uvSrc,
    method: "GET",
  }).then(function (response) {
    $(uvIndex).html(response.value);
  });
}

// 5 days forecast
function forecast(cityid) {
  var forcastSrc =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&appid=" +
    APIKEY;
  $.ajax({
    url: forcastSrc,
    method: "GET",
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      var date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      var iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      var iconSrc = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      var tempK = response.list[(i + 1) * 8 - 1].main.temp;
      var fahrenheit = ((tempK - 273.5) * 1.8 + 32).toFixed(0);
      var humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $("#fDate" + i).html(date);
      $("#fImg" + i).html("<img src=" + iconSrc + ">");
      $("#fTemp" + i).html(fahrenheit + "&#8457");
      $("#fHumidity" + i).html(humidity + "%");
    }
  });
}

//add the city to the search history
function cityList(c) {
  var listEl = $("<li>" + c + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c);
  $(".list-group").append(listEl);
}
// display the weather when click on the city in history
function previousForcast(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

$("#search-button").on("click", displayWeather);
$(document).on("click", previousForcast);
$(window).on("load", lastCity);
