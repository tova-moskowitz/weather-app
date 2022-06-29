import { useState } from "react";
import "./App.css";
import countryCodes from "./countryCodes.js";

function App() {
  const [location, setLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [countryCode, setCountryCode] = useState();
  const [currentTemp, setCurrentTemp] = useState();
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [weather, setWeather] = useState(null);
  const [description, setDescription] = useState(null);

  const onChange = (event) => {
    setLocation(event.target.value);
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
    // check if a zip code was entered. If so, use the 'zip' param.
    // otherwise use 'q'

    const regex = /^\d{5}(?:[-\s]\d{4})?$/;
    const queryParam = location.match(regex) ? "zip?zip" : "direct?q";
    const geoCoding = `http://api.openweathermap.org/geo/1.0/${queryParam}=${location},${countryCode}&limit=5&appid=${APIKey}`;

    fetch(geoCoding)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLat(data.lat);
        setLon(data.lon);
      });
    // const countryCode = "";

    const currentWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;

    fetch(currentWeather)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLocationName(data.name);
        setCurrentTemp(Math.round(data.main.temp));
        setHumidity(data.main.humidity);
        setWind(data.wind.speed);
        setFeelsLike(Math.round(data.main.feels_like));
        setWeather(data.weather[0].main);
        setDescription(data.weather[0].description);
        fetch(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
        ).then((res) => res.json());
        fetch(
          `http://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
        ).then((res) => res.json());
      });
  };

  const currentWeather = () => {
    if (currentTemp) {
      return (
        <div className="currentTemperature">
          <div>{weather}</div>
          <div>{description}</div>
          <div>Current Temperature: {currentTemp}&deg;</div>
          <div>Humidity: {humidity}%</div>
          <div>Winds: {wind} mph</div>
          <div>RealFeel Temperature: {feelsLike}&deg;</div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="weatherResults">
        <h1>How's the Weather?</h1>
        <form onSubmit={handleSubmit} className="getLocation">
          <label>
            Please enter a ZIP code or a city name
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
            <option value="US">United States</option>
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
            value="Find Weather for Location"
          />
        </form>
      </div>
      <div className="locationName">{locationName}</div>
      {currentWeather()}
    </>
  );
}
export default App;

// create input field for zip, country/country
// event.target.location.value
// get lat and lon using geolocation API
// dropdown of country codes
// fetch endpoint with API key, and zip code/country passed in
// currentWeather.main.temp rounded up to nearest whole number
// fetch pollution endpoint using lat and lon
// fetch 5 - day forecast using lat and lon
// validate info they input
// dropdown for Celsius vs Fahrenheit
// fill out README
// get rid of spaces in location input field,
// use either zip or q in api call
// get country code from entry
// night sky after sundown- background and font color
