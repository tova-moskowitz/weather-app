import { useState } from "react";
import "./App.css";
import countryCodes from "./countryCodes.js";
import stateCodes from "./stateCodes.js";
const dayjs = require("dayjs");

function App() {
  const APIKey = "7841aaead8245e0fde0256620686a3e1";
  const [location, setLocation] = useState("");
  const [cityName, setCityName] = useState("");
  const [countryCode, setCountryCode] = useState();
  const [countryName, setCountryName] = useState();
  const [stateCode, setStateCode] = useState();
  const [stateName, setStateName] = useState();
  const [currentTemp, setCurrentTemp] = useState();
  // const [lat, setLat] = useState(null);
  // const [lon, setLon] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [weather, setWeather] = useState(null);
  const [description, setDescription] = useState(null);
  const [pollutionAQI, setPollutionAQI] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // check if a US zip code was entered
  const regex = /^\d{5}(?:[-\s]\d{4})?$/;
  const queryParam = location.match(regex) ? "zip" : "city";
  let currentWeather = "";

  const pollutionMapping = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  };

  const onChange = (event) => {
    setLocation(event.target.value);
  };

  const onStateChange = (event) => {
    setStateCode(event.target.value);
  };

  const onCountryChange = (event) => {
    setCountryCode(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (queryParam === "zip") {
      currentWeather = `https://api.openweathermap.org/data/2.5/weather?zip=${location},${countryCode}&units=imperial&appid=${APIKey}`;
    } else {
      currentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${location},${stateCode},${countryCode}&units=imperial&appid=${APIKey}`;
    }
    // fetch current weather
    fetch(currentWeather)
      .then((response) => {
        if (response.status !== 200) {
          setErrorMsg(
            <div className="errorMsg">
              Please enter a valid US ZIP code or city, state country code
              combination
            </div>
          );
        } else {
          setErrorMsg("");
        }
        return response.json();
      })
      .then((data) => {
        // setLat(data.coord.lat);
        // setLon(data.coord.lon);
        setCityName(data.name);
        setCurrentTemp(Math.round(data.main.temp));
        setHumidity(data.main.humidity);
        setWind(Math.round(data.wind.speed));
        setFeelsLike(Math.round(data.main.feels_like));
        setWeather(data.weather[0].main);
        setDescription(data.weather[0].description);

        // fetch air pollution
        fetch(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((data) => {
            setPollutionAQI(data.list[0].main.aqi);
          });

        // fetch 5-day forecast
        fetch(
          `http://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=imperial&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((data) => {
            const highs = [];
            const lows = [];
            let highest = 0;
            let lowest = 0;

            data.list.forEach((day) => {
              // this is just for one hard-coded day, must next...
              // check if days are the same date instead of hard-coding date
              if (day.dt_txt.split(" ")[0] === "2022-07-04") {
                highs.push(day.main.temp_max);
                lows.push(day.main.temp_min);
              }
            });
            highest = Math.round(highs.sort((a, b) => a - b)[0]);
            lowest = Math.round(lows.sort((a, b) => b - a)[0]);

            // console.log(highest);
            // console.log(lowest);
          });

        // reverse geolocation to get full state and full country names
        fetch(
          `http://api.openweathermap.org/geo/1.0/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
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
    return cityName && countryName
      ? cityName + ", " + stateName + ", " + countryName
      : errorMsg;
  };

  const displayCurrentWeather = () => {
    if (currentTemp && cityName && countryName) {
      return (
        <>
          <div className="currentTemperature">
            <div className="centered">
              <span className="bolded">
                {weather}- {description}
              </span>
            </div>
            <div>
              <span className="bolded">Current Temperature:</span> {currentTemp}
              &deg;
            </div>
            <div>
              <span className="bolded">RealFeel Temperature:</span> {feelsLike}
              &deg;
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
    }
  };

  const fiveDayForecast = () => {
    return;
  };

  return (
    <>
      <div className="weatherForm">
        {/* <h1>how's the weather out there?</h1> */}
        <h1>HOW'S THE WEATHER OUT THERE?</h1>
        <div className="formGroup">
          <form onSubmit={handleSubmit} className="getLocation">
            <label>
              Enter a US ZIP code or city, state, and country name
              <input
                value={location}
                onChange={onChange}
                type="text"
                className="location"
                name="location"
              />
            </label>
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
            {showStateSelect()}
            <input
              type="submit"
              className="submitLocation"
              value="Get Results"
            />
          </form>
        </div>
      </div>
      <div className="cityName">{outputLocation()}</div>
      <div className="weatherDetails">
        {displayCurrentWeather()}
        {fiveDayForecast()}
      </div>
    </>
  );
}
export default App;

// create input field for zip, country/country ----
// event.target.location.value ----
// get lat and lon using geolocation API ----
// dropdown of country codes ----
// fetch endpoint with API key, and zip code/country passed in ----
// currentWeather.main.temp rounded up to nearest whole number ----
// fetch pollution endpoint using lat and lon ----
// fetch 5 - day forecast using lat and lon
// validate info they input
// (dropdown for Celsius vs Fahrenheit)
// fill out README
// use either zip or q in api call ----
// get country code from entry ----
// (night sky after sundown- background and font color)
// error handling----
// Change background image for cloudy/rain/snow/clear/nighttime
// show state dropdown when it's not a zip ----
// the commas----
// styling
// some cities return the wrong results. for example, flushing and forest hills and blank location
// still shows results even when you have the wrong city/country combination
