import { useState } from "react";
import Weather from "./weather.js";
import "./App.css";
import countryCodes from "./countryCodes.js";
import stateCodes from "./stateCodes.js";
const dayjs = require("dayjs");

function App() {
  const APIKey = "7841aaead8245e0fde0256620686a3e1";
  const [input, setInput] = useState("");
  const [cityName, setCityName] = useState("");
  const [countryCode, setCountryCode] = useState();
  const [countryName, setCountryName] = useState();
  const [stateCode, setStateCode] = useState();
  const [stateName, setStateName] = useState();
  const [currentTemp, setCurrentTemp] = useState();
  const [todayDate, setTodayDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dayName, setDayName] = useState();
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [weather, setWeather] = useState(null);
  const [description, setDescription] = useState(null);
  const [pollutionAQI, setPollutionAQI] = useState(null);
  const [dailyHighs, setDailyHighs] = useState([]);
  const [dailyLows, setDailyLows] = useState([]);
  const [dailyWeather, setDailyWeather] = useState([]);
  const [dailyIcons, setDailyIcons] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  // check if a US zip code was entered
  const regex = /^\d{5}(?:[-\s]\d{4})?$/;
  const queryParam = input.match(regex) ? "zip" : "city";
  let currentWeatherUrl = "";

  const getDaysOfWeek = (unixTimestamp) => {
    const date = new Date(dayjs.unix(unixTimestamp));
    const options = { weekday: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const pollutionMapping = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  };

  const onInputChange = (e) => {
    setInput(e.target.value);
  };

  const onStateChange = (e) => {
    // if a state was selected and then country other than US is selected, reset dropdown to empty so that it doesn't pass the prev stateName value
    let stateCode = countryCode === "US" ? e.target.value : "";
    setStateCode(stateCode);
  };

  const onCountryChange = (e) => {
    setCountryCode(e.target.value);
  };

  //todo
  // const fetchCurrentWeather = () => {};

  const handleSubmit = (e) => {
    e.preventDefault();

    const baseUrl = "https://api.openweathermap.org/data/2.5/";
    const suffix = "&units=imperial&appid=7841aaead8245e0fde0256620686a3e1";
    const state = stateCode ? stateCode + "," : "";

    if (queryParam === "zip") {
      currentWeatherUrl = `${baseUrl}weather?zip=${input},${countryCode}${suffix}`;
    } else {
      currentWeatherUrl = `${baseUrl}weather?q=${input},${state}${countryCode}${suffix}`;
    }

    // fetch current weather
    fetch(currentWeatherUrl)
      .then((response) => {
        setStatusCode(response.status);
        if (response.status !== 200) {
          setStatusCode(response.status);
          setErrorMsg(
            <div className="errorMsg">
              Please enter a valid US ZIP code or city, state, country
              combination
            </div>
          );
          // todo doesn't work yet bec it still goes to the next .then()
          return "";
        } else {
          setErrorMsg(null);
        }
        //TODO const json = response.json(); instead of data
        return response.json();
      })
      .then((data) => {
        setCityName(data.name);
        setCurrentTemp(Math.round(data.main.temp));
        setHumidity(data.main.humidity);
        setWind(Math.round(data.wind.speed));
        setFeelsLike(Math.round(data.main.feels_like));
        setWeather(data.weather[0].description);

        // fetchAirPollution();
        fetch(
          `${baseUrl}/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((pollutionData) => {
            setPollutionAQI(pollutionData.list[0].main.aqi);
          });

        // fetch 5-day forecast
        // TODO make this more React-y instead of using JS classes
        fetch(
          `${baseUrl}/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=imperial&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((forecastData) => {
            let uniqueDates = [];
            let highest = {};
            let lowest = {};

            let dates = forecastData.list.filter(
              //TODO explain why used dayjs over vanilla
              // (day) => day.dt_txt.split(" ")[0] !== todayDate
              (day) => dayjs(day.dt_txt).format("YYYY-MM-DD") !== todayDate
            );

            dates = dates.map((date) => date.dt_txt.split(" ")[0]);
            uniqueDates = [...new Set(dates)];

            const weatherObjs = uniqueDates.map((date) => {
              let w = new Weather();
              w.date = date;
              w.timeChunks = forecastData.list.filter((threeHours) => {
                return w.date === threeHours.dt_txt.split(" ")[0];
              });
              return w;
            });

            weatherObjs.forEach((w) => {
              w.highs = w.timeChunks.map((timeChunk) => {
                w.dayOfWeek = getDaysOfWeek(timeChunk.dt);
                return Math.round(timeChunk.main.temp_max);
              });
              highest[w.dayOfWeek] = w.highs.sort((a, b) => b - a)[0];
              setDailyHighs(highest);

              w.lows = w.timeChunks.map((timeChunk) => {
                return Math.round(timeChunk.main.temp_min);
              });
              lowest[w.dayOfWeek] = w.lows.sort((a, b) => a - b)[0];
              setDailyLows(lowest);

              w.weatherDescription = w.timeChunks[0].weather[0].description;
              w.icons = w.timeChunks[0].weather[0].icon;
            });

            const icons = weatherObjs.map((obj) => {
              return obj.icons;
            });
            setDailyIcons(icons);

            const descriptions = weatherObjs.map((obj) => {
              return obj.description;
            });
            setDailyWeather(descriptions);
          });

        // reverse geolocation to get full state and full country names
        fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((data) => {
            setStateName(data[0].state);
            setCountryName(data[0].country);
          });
      });
  };

  const showStateSelect = () => {
    if (queryParam !== "zip" && countryCode === "US") {
      return (
        <select
          onChange={onStateChange}
          name="selectState"
          className="selectState"
        >
          {stateCodes.map((state) => {
            return (
              <option value={state.props.value}>{state.props.children}</option>
            );
          })}
        </select>
      );
    }
  };

  const outputLocation = () => {
    const state = stateName ? stateName + ", " : "";
    const country = countryName ? countryName + ", " : "";
    return errorMsg ? errorMsg : cityName + " " + state + country;
  };

  const displayCurrentWeather = () => {
    if (currentTemp && cityName && countryName) {
      return (
        <>
          <div className="currentTemperature">
            <div>
              <div>{dayName}</div>

              <span className="bolded weather">{weather}</span>
            </div>
            <div className="currentTemp">{currentTemp}&deg;F</div>
            <div>
              <span className="bolded">RealFeel Temperature:</span> {feelsLike}
              &deg;F
            </div>
            <div>
              <span className="bolded">Humidity:</span> {humidity}%
            </div>
            <div>
              <span className="bolded">Winds:</span> {wind} mph
            </div>
            <div>
              <span className="bolded">Air Quality Rating:</span>{" "}
              {pollutionMapping[pollutionAQI]}
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className="onloadMsg">
          <img
            className="sunImg"
            src={require("./sun-png-transparent-19.png")}
            alt="sun icon"
          />
        </div>
      );
    }
  };

  const highTemps = () => {
    let output = [];

    for (let high in dailyHighs) {
      output.push(
        <>
          <div className="dailyHigh">{dailyHighs[high]}&deg;F</div>
        </>
      );
    }
    return output;
  };

  const lowTemps = () => {
    let output = [];
    for (let low in dailyLows) {
      output.push(
        <>
          <div className="dailyLow">{dailyLows[low]}&deg;F</div>
        </>
      );
    }
    return output;
  };

  const daysOfTheWeek = () => {
    let output = [];
    for (let day in dailyHighs) {
      output.push(
        <>
          <div className="dayOfTheWeek">{day}</div>
        </>
      );
    }
    return output;
  };

  const icons = () => {
    let output = [];

    for (let icon of dailyIcons) {
      output.push(
        <>
          <div className="dailyIcon">
            <img src={`http://openweathermap.org/img/wn/${icon}@2x.png`} />
          </div>
        </>
      );
    }
    return output;
  };

  return (
    <>
      <div className="weatherForm">
        <div className="formGroup">
          <form onSubmit={handleSubmit} className="getLocation">
            <label>
              <span className="beforeInput">how's the weather in </span>
              <input
                value={input}
                onChange={onInputChange}
                type="text"
                className="location"
                name="location"
                placeholder="Enter a city or US zip code"
              />
            </label>
            {showStateSelect()}
            <select
              onChange={onCountryChange}
              name="selectCountry"
              className="selectCountry"
            >
              {countryCodes.map((country) => {
                return (
                  <option value={country.props.value}>
                    {country.props.children}
                  </option>
                );
              })}
            </select>
            <input type="submit" className="submitLocation" value=" " />
            <input
              className="searchIcon"
              type="image"
              src="white-search-icon.png"
              border="0"
              alt="Submit"
            />
          </form>
        </div>
      </div>
      <div className="cityName">{outputLocation()}</div>
      <div className="weatherDetails">
        {displayCurrentWeather()}
        {statusCode === 200 && (
          <div className="fiveDayForecast">
            <div className="daysOfTheWeek">{daysOfTheWeek()}</div>
            <div className="highs">{highTemps()}</div>
            <div className="icons">{icons()}</div>
            <div className="lows">{lowTemps()}</div>
          </div>
        )}
      </div>
    </>
  );
}
export default App;
// create input field for zip, country/country ----
// e.target.location.value ----
// get lat and lon using geolocation API ----
// dropdown of country codes ----
// fetch endpoint with API key, and zip code/country passed in ----
// currentWeather.main.temp rounded up to nearest whole number ----
// fetch pollution endpoint using lat and lon ----
// fetch 5 - day forecast using lat and lon ----
// validate info they input
// (dropdown for Celsius vs Fahrenheit)
// fill out README
// use either zip or q in api call ----
// get country code from entry ----
// (night sky after sundown- background and font color)
// error handling ----
// Change background image for cloudy/rain/snow/clear/nighttime
// show state dropdown when it's not a zip ----
// the commas ----
// styling:
//    RESPONSIVE!!
//    Icons/weather symbols
//    center days of week above temperatures ----
//    fix where submit button is placed - magnifying glass?
//    center the 5 days forecast in the middle of the page ----
//    change background image for nighttime or different weather
// some cities return the wrong results. for example, flushing and forest hills and blank location
// still shows results even when you have the wrong city/country combination
// shows today + 4 days ahead instead of starting tomorrow ----
// create error messages for failed API calls that come after successful ones (right now it just leaves the previous result on the page with no error message) ----
// BUG there are 2 Fridays so the last day doesn't show temperatures
// remove weather when an error msg comes up
