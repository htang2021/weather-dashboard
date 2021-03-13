// Variable definition

var oWeatherCurrentApiUrl = "https://api.openweathermap.org/data/2.5/"; 
var oWeatherForecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast";
var apiKey = "19e33daac2abbca4e02ccd35af360aee";
var iconBaseUrl = "https://openweathermap.org/img/w/";
var savedList = [];

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
var savedListGroupEl = document.querySelector(".list-group");


// Search handler ********************************************
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

// passing lat/long to return UV Index value *********************
var getUvIndex = function(data) {

    var lat = data.coord.lat;
    var lon = data.coord.lon;
    var uVIndexApiUrl = `${oWeatherCurrentApiUrl}uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    // fetch uv index from another endpoint using lat/lon extracted
    fetch(uVIndexApiUrl)
        .then(function(response) {
            //request was successful
            if (response.ok) {
                response.json().then(function(uVdata) {
                    var uvIndexValue = uVdata.value;
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
// Color coding UV Index output *********************************
var uvColorCode = function (uvColorEl, uvIndex) {

    if (uvIndex >= 11) {
        uvColorEl.setAttribute("style", "background-color: purple; color: white;");
    } else if (uvIndex >= 8) {
        uvColorEl.setAttribute("style", "background-color: red; color: white;");
    } else if (uvIndex >= 6) {
        uvColorEl.setAttribute("style", "background-color: orange;");
    } else if (uvIndex >= 3) {
        uvColorEl.setAttribute("style", "background-color: yellow;");
    } else {
        uvColorEl.setAttribute("style", "background-color: green;");
    }
}

// Displaying what's stored in localStorage*****************
var displaySavedSearch = function() {

    savedListGroupEl.textContent = "";
    var mySearchList = JSON.parse(localStorage.getItem("searchList"));
    if (mySearchList) {
        mySearchList.forEach(createListEl);
        function createListEl(savedItem) {
            var listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.textContent = savedItem;
            savedListGroupEl.appendChild(listItem);
        }
    }
}

// Save searched city to localStorage ***********************
var saveSearch = function (cityName) {

    if (localStorage.length > 0) {
        var storedList = JSON.parse(localStorage.getItem("searchList"));
        savedList = storedList;
    }
    console.log("The new savedList now contains: " + savedList);

    // add to list if the first of the savedList is not the same as the last searched city
    if (savedList[0] !== cityName) {
        savedList.unshift(cityName);
        // Limiting search history to 10 entries
        if (savedList.length >= 11) {
            savedList.pop();
        }
        // write savedList to localStorage
        localStorage.setItem("searchList", JSON.stringify(savedList));
    }
    displaySavedSearch();
}

// Display current weather **********************************
var displayCurrentWeather = function(data, uvIndex) {
    var weatherSkyIcon = data.weather[0].icon;

    // City, Date, and weather icon
    cityNameDisplayEl.textContent = data.name; // City Name
    dateDisplayEl.textContent = `(${dateDisplay})`;  // Date
    weatherIconEl.innerHTML = `<img src="${iconBaseUrl}${weatherSkyIcon}.png" />`; // Icon
    // Weather stats
    temperatureDisplayEl.textContent = `Temperature: ${data.main.temp} \u00B0F`; // Deg Farenheit
    humidityDisplayEl.textContent = `Humidity: ${data.main.humidity}%`; 
    windSpeedDisplayEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";

    var uvColorEl = document.querySelector("#uv-color");
    uvColorEl.textContent = uvIndex;  // UV Index

    // Call the uvColorCode fxn to color code the UV Index
    uvColorCode(uvColorEl, uvIndex);

    // call saveSearch fxn to save city name to localStorage
    saveSearch(data.name);
}

// Displays 5-days forecast **********************************
var displayForecast = function(forecastData) {

    //forecast based on time of search and determining which block of quarterly hour 
    //in the 24-hour period, 0(24), 3, 6, 9, 12, 15, 18, 21 (8 quarters/day with 3-hourly blocks)
    //for the next 5 days - openWeather provides <8> sets of data points per day for its forecast
    //information.

    var forecastIndex = timeBlock(); //initial time block assignment, fxn below

    var day = 1; //initializing forecast day 1

    // Loop through response(forecastData) index for the corresponding 5 datapoints
    for (let i=0; i < 40; i+=8) {

        var newDate = moment(forecastData.list[i].dt_txt).format('l');
        var iconCode = forecastData.list[i].weather[0].icon;
        var newTemp = forecastData.list[i].main.temp;
        var newHumidity = forecastData.list[i].main.humidity;

        // Displays date, icon, temp and humidity for each day, then increment to the next day/datapoints
        document.getElementById("day"+day).textContent = newDate;
        document.getElementById("icon"+day).innerHTML = `<img src="${iconBaseUrl}${iconCode}.png" alt="weather icon" />`;
        document.getElementById("temp"+day).textContent = `Temp: ${newTemp} \u00B0F`;
        document.getElementById("humidity"+day).textContent = `Humidity: ${newHumidity}%`;
        forecastIndex += 8;
        day++;
    }
}

// Fxn to determine which of the 8 datapoints to use from the time of search
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

// get current city weather ***********************************************
var getCityWeather = function(cityNameInput) {
    // format the openWeather api url
    var apiUrl = `${oWeatherCurrentApiUrl}weather?q=${cityNameInput}&units=imperial&appid=${apiKey}`;

    // make a request to the current weather endpoint ---------------------------
    fetch(apiUrl)
        .then(function(response) {
            //request was successful
            if (response.ok) {
                response.json().then(function(data) {
                    getUvIndex(data);
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function(error) {
            alert("Unable to connect to OpenWeather");
        });

    // make a request to the 5-day forecast endpoint ------------
    forcastApiUrl = `${oWeatherForecastApiUrl}?q=${cityNameInput}&units=imperial&appid=${apiKey}`;
    fetch(forcastApiUrl)
        .then(function(res) {
            //request was successful
            if (res.ok) {
                res.json().then(function(forecastData) {
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

// Displays the last searched result when page refreshes
var landingView = function() {
    if (localStorage.length > 0) {
        var mySearchList = JSON.parse(localStorage.getItem("searchList"));
        // query the last searched city stored in localstorage
        getCityWeather(mySearchList[0]);
    }

    displaySavedSearch();
}

// Fetch city weather from the saved list with event target method
var listItemHandler = function(event) {
    event.preventDefault();

    var clickedElement = event.target;
    clickedElement.className += " active";
    var clickedCity = clickedElement.textContent

    getCityWeather(clickedCity);
}

landingView();
searchButtonEl.addEventListener("click", searchBtnHandler);

cityNameInputEl.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        searchButtonEl.click();
    }
});

savedListGroupEl.addEventListener("click", listItemHandler);


