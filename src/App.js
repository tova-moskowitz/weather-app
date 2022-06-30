import { useState } from "react";
import "./App.css";
import countryCodes from "./countryCodes.js";
import stateCodes from "./stateCodes.js";

function App() {
  const [location, setLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [countryCode, setCountryCode] = useState();
  const [stateCode, setStateCode] = useState();
  const [stateName, setStateName] = useState();
  const [currentTemp, setCurrentTemp] = useState();
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [weather, setWeather] = useState(null);
  const [description, setDescription] = useState(null);
  const [pollutionAQI, setPollutionAQI] = useState(null);
  // check if a zip code was entered. If so, use the 'zip' param.
  // otherwise use 'q'
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
  // console.log(pollutionMapping);
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
    if (!location) {
      return;
    }

    const APIKey = "7841aaead8245e0fde0256620686a3e1";

    if (queryParam === "zip") {
      currentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${location},${countryCode}&units=imperial&appid=${APIKey}`;
    } else {
      currentWeather = `https://api.openweathermap.org/data/2.5/weather?q=${location},${stateCode},${countryCode}&units=imperial&appid=${APIKey}`;
    }
    fetch(currentWeather)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLat(data.coord.lat);
        setLon(data.coord.lon);
        setLocationName(data.name);
        setCurrentTemp(Math.round(data.main.temp));
        setHumidity(data.main.humidity);
        setWind(Math.round(data.wind.speed));
        setFeelsLike(Math.round(data.main.feels_like));
        setWeather(data.weather[0].main);
        setDescription(data.weather[0].description);
        fetch(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((data) => {
            console.log(data.list[0].main.aqi);
            setPollutionAQI(data.list[0].main.aqi);
          });
        fetch(
          `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((data) => {
            // console.log(data);
          });
        // });
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

  const displayCurrentWeather = () => {
    if (currentTemp) {
      return (
        <>
          <div className="currentTemperature">
            <div>{weather}</div>
            <div>{description}</div>
            <div>Current Temperature: {currentTemp}&deg;</div>
            <div>Humidity: {humidity}%</div>
            <div>Winds: {wind} mph</div>
            <div>RealFeel Temperature: {feelsLike}&deg;</div>
          </div>
          <div className="aqi">
            Air Quality Index: {pollutionMapping[pollutionAQI]}
          </div>
        </>
      );
    }
  };

  const fiveDayForecast = () => {
    if (currentTemp) {
      return <div className="aqi">{pollutionMapping.pollutionAQI}</div>;
    }
  };

  return (
    <>
      <div className="weatherForm">
        <h1>how's the weather out there?</h1>
        <div className="formGroup">
          <form onSubmit={handleSubmit} className="getLocation">
            <label>
              Enter ZIP code or 'city name and state', and country name
              <input
                value={location}
                onChange={onChange}
                type="text"
                className="location"
                name="location"
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
            <input
              type="submit"
              className="submitLocation"
              value="Get Results"
            />
          </form>
        </div>
      </div>
      <div className="locationName">
        {locationName}, {stateName}, {countryCode}
      </div>
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
// get lat and lon using geolocation API
// dropdown of country codes ----
// fetch endpoint with API key, and zip code/country passed in
// currentWeather.main.temp rounded up to nearest whole number ----
// fetch pollution endpoint using lat and lon
// fetch 5 - day forecast using lat and lon
// validate info they input
// (dropdown for Celsius vs Fahrenheit)
// fill out README
// get rid of spaces in location input field,
// use either zip or q in api call
// get country code from entry
// (night sky after sundown- background and font color)
// error handling
// Change background image for cloudy/rain/snow/clear/nighttime
// show state dropdown when it's not a zip
