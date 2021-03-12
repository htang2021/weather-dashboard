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
var weatherIconEl = document.querySelector("#weatherIcon");
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

// var weatherIcon = function(weatherSkyIcon) {
//     var iconBaseUrl = "https://openweathermap.org/img/w/";
//     switch(weatherSkyIcon) {
//         case "02n":
//             return (iconBaseUrl+"02n");
//         //case 
//     }
// }

// Display current weather
var displayCurrentWeather = function(data, uvIndex) {
    console.log(data);
    var weatherSkyIcon = data.weather[0].icon;
    cityNameDisplayEl.textContent = data.name;
    dateDisplayEl.textContent = `(${dateDisplay})`;
    weatherIconEl.innerHTML = `<img src="https://openweathermap.org/img/w/${weatherSkyIcon}.png" />`;
    temperatureDisplayEl.textContent = `Temperature: ${data.main.temp} \u00B0F`;
    humidityDisplayEl.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeedDisplayEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";
    //windSpeedDisplayEl.textContent = "Wind Speed: " + (data.wind.speed/2.237).toFixed(1) + " MPH";
    // var uvColor = document.querySelector("#uv-color");
    // uvColor.innerHTML=uvIndex;
    uvIndexDisplayEl.textContent = "UV Index: " + uvIndex;
    //uvColorCode(uvIndex);
}

// Displays 5-days forecast
var displayForecast = function(forecastData) {

    //forecast based on current time and determining next block of quarterly hour 
    //in the 24-hour period, 0, 3, 6, 9, 12, 15, 18, 21 (8 quarters of 3-hourly blocks)
    //for the next 5 days - openWeather provides 8 sets of data points per day for its forecast
    //information.
    var forecastIndex = timeBlock();
    // Loop through 

}
// Fxn to determine which of the 8 datapoints to use from openWeather
function timeBlock() {
    var currentHour = moment().format("HH");
    if (currentHour >= 21) {
        return 7;
    } else if (currentHour >= 18) {
        return 6;
    } else if (currentHour >= 15) {
        return 5;
    } else if (currentHour >= 12) {
        return 4;
    } else if (currentHour >=9) {
        return 3;
    } else if (currentHour >=6) {
        return 2;
    } else if (currentHour >=3) {
        return 1;
    } else {
        return 0;
    }
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

    // make a request to the 5-day forecast URL
    forcastApiUrl = `${oWeatherForecastApiUrl}?q=${cityNameInput}&units=imperial&appid=${apiKey}`;
    fetch(forcastApiUrl)
        .then(function(res) {
            //request was successful
            if (res.ok) {
                res.json().then(function(forecastData) {
                    console.log("Forecast data below!");
                    console.log(forecastData);
                    displayForecast(forecastData);
                });
            } else {
                alert("Error: " + res.statusText);
            }
        })
        .catch(function(error) {
            alert("Unable to connect to OpenWeather");
        });
}


searchButtonEl.addEventListener("click", searchBtnHandler);

