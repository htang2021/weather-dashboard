// Variable definition

var oWeatherCurrentApiUrl = "https://api.openweathermap.org/data/2.5/"; //weather";
var oWeatherForecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast";
var apiKey = "19e33daac2abbca4e02ccd35af360aee";

// 5 day weather forecast 
// Call 5 day / 3 hour forecast data
// https://openweathermap.org/forecast5 (where the api call details can be found)

// api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code}&appid={API key}
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code},{country code}&appid={API key}

// 5-day forecast needs to display:
// ---- Date (in 3/10/2021 format) ----------------------
// ---- Icon (showing sunny, cloudy, raining, etc.) -----
// ---- Temperature (in F) ------------------------------
// ---- Humidity (%) ------------------------------------

// moment.js for date formatting
var dateDisplay = moment().format('l');

var cityNameInputEl = document.querySelector("#cityname-input");
var searchButtonEl = document.querySelector(".btn");
var cityNameDisplayEl = document.querySelector("#display-cityname");
var dateDisplayEl = document.querySelector("#date");
var temperatureDisplayEl = document.querySelector("#temperature");
var humidityDisplayEl = document.querySelector("#humidity");
var windSpeedDisplayEl = document.querySelector("#wind-speed");
var uvIndexDisplayEl = document.querySelector("#uv-index");


var searchBtnHandler = function(event) {
    event.preventDefault();

    // get value from input element
    var cityNameInput = cityNameInputEl.value;

    if (cityNameInput) {
        getCityWeather(cityNameInput);
        cityNameInputEl.value = "";
    } else {
        alert("Please Enter a City Name.");
    }
};

// passing lat/long to return UV Index value
var getUvIndex = function(data) {

    var lat = data.coord.lat;
    var lon = data.coord.lon;
    // console.log(`Long is ${lon} and Lat is ${lat}.`);
    var uVIndexApiUrl = `${oWeatherCurrentApiUrl}uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    // fetch uv index from another endpoint using lat/lon extracted
    fetch(uVIndexApiUrl)
        .then(function(response) {
            //request was successful
            if (response.ok) {
                response.json().then(function(uVdata) {

                    var uvIndexValue = uVdata.value;
                    console.log("going into displayCurrentWeather function");
                    
                    displayCurrentWeather(data, uvIndexValue);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function(error) {
            alert("Unable to connect to OpenWeather");
        });
}

var uvColorCode = function (uvIndex) {
    var uvColor = "";

    if (uvIndex >= 11) {
        uvColor = "purple";
        uvIndexDisplayEl.setAttribute("style", "background-color: purple; color: white;");
    } else if (uvIndex >= 8) {
        uvColor = "red";
        uvIndexDisplayEl.setAttribute("style", "background-color: red; color: white;");
    } else if (uvIndex >= 6) {
        uvColor = "orange";
        uvIndexDisplayEl.setAttribute("style", "background-color: orange;");
    } else if (uvIndex >= 3) {
        uvColor = "yellow";
        uvIndexDisplayEl.setAttribute("style", "background-color: yellow;");
    } else {
        uvColor = "green";
        uvIndexDisplayEl.setAttribute("style", "background-color: green;");
    }
}

// Display current weather
var displayCurrentWeather = function(data, uvIndex) {
    console.log(data);
    cityNameDisplayEl.textContent = data.name;
    dateDisplayEl.textContent = `(${dateDisplay})`;
    temperatureDisplayEl.textContent = `Temperature: ${data.main.temp} <span>&#8457;</span>`;
    humidityDisplayEl.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeedDisplayEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";
    //windSpeedDisplayEl.textContent = "Wind Speed: " + (data.wind.speed/2.237).toFixed(1) + " MPH";
    uvIndexDisplayEl.textContent = "UV Index: " + uvIndex;
    uvColorCode(uvIndex);
}
// get city weather
var getCityWeather = function(cityNameInput) {
    // format the openWeather api url
    var apiUrl = `${oWeatherCurrentApiUrl}weather?q=${cityNameInput}&units=imperial&appid=${apiKey}`;

    // make a request to the url
    fetch(apiUrl)
        .then(function(response) {
            //request was successful
            if (response.ok) {
                response.json().then(function(data) {
                    console.log("Going into getUvIndex function.");
                    getUvIndex(data);
                    //displayCurrentWeather(data, cityNameInput);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function(error) {
            alert("Unable to connect to OpenWeather");
        });
}


searchButtonEl.addEventListener("click", searchBtnHandler);

