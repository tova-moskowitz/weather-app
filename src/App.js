import { useState } from "react";
import Weather from "./weather.js";
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
  const [todayDate, setTodayDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dayName, setDayName] = useState();
  // const [lat, setLat] = useState(null);
  // const [lon, setLon] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [weather, setWeather] = useState(null);
  const [description, setDescription] = useState(null);
  const [pollutionAQI, setPollutionAQI] = useState(null);
  const [highs, setHighs] = useState([]);
  const [lows, setLows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  // check if a US zip code was entered
  const regex = /^\d{5}(?:[-\s]\d{4})?$/;
  const queryParam = location.match(regex) ? "zip" : "city";
  let currentWeather = "";

  const getDaysOfWeek = (unixTimestamp) => {
    const dayOfWeek = new Date(dayjs.unix(unixTimestamp));
    const options = { weekday: "long" };
    // console.log(Intl.DateTimeFormat("en-US", options).format(dayOfWeek));
    return new Intl.DateTimeFormat("en-US", options).format(dayOfWeek);
  };

  const pollutionMapping = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  };

  const onLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const onStateChange = (e) => {
    // if a state was selected and then country other than US is selected, reset dropdown to empty so that it doesn't pass the prev stateName value
    let stateCode = countryCode === "US" ? e.target.value : "";
    setStateCode(stateCode);
    //todo
    // // setSelectedState(e.target.selectedOptions[0].innerHTML);
    // setSelectedState(e.target.value);
  };

  const onCountryChange = (e) => {
    setCountryCode(e.target.value);
    setSelectedCountry(e.target.value);
  };

  //todo
  // const fetchCurrentWeather = () => {};

  const handleSubmit = (e) => {
    e.preventDefault();

    const baseUrl = "https://api.openweathermap.org/data/2.5/weather?";
    const suffix = "&units=imperial&appid=7841aaead8245e0fde0256620686a3e1";
    const state = stateCode ? stateCode + "," : "";

    if (queryParam === "zip") {
      currentWeather = `${baseUrl}zip=${location},${countryCode}${suffix}`;
    } else {
      currentWeather = `${baseUrl}q=${location},${state}${countryCode}${suffix}`;
    }
    //todo
    //change order of API calls:
    //call geoLocation to get lat/lon of entered city
    // THE STATE THEY ENTER AND THE STATE THAT COMES BACK HAVE TO MATCH
    // SAME FOR COUNTRY

    // fetch current weather
    fetch(currentWeather)
      .then((response) => {
        if (response.status !== 200) {
          //BETTER ERROR MSGS, to check for more cases, like when no such zip
          setErrorMsg(
            <div className="errorMsg">
              Please enter a valid US ZIP code or city, state country code
              combination
            </div>
          );
          // todo doesn't work yet bec it still goes to the next .then()
          return;
        } else {
          setErrorMsg("");
        }
        //const json = response.json(); instead of data
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

        // fetchAirPollution();
        fetch(
          // todo split into variables so not repeating same baseUrl
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((pollutionData) => {
            setPollutionAQI(pollutionData.list[0].main.aqi);
          });

        // fetch 5-day forecast
        fetch(
          `http://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=imperial&appid=${APIKey}`
        )
          .then((res) => res.json())
          .then((forecastData) => {
            let dates = [];
            let uniqueDates = [];
            let highest = {};
            let lowest = {};

            dates = forecastData.list.map((day) => {
              // TODO don't include current day's weather in 5-day forecast--already done just need to test in morning
              const formattedDate = day.dt_txt.split(" ")[0];
              if (formattedDate !== todayDate) {
                return formattedDate;
              }
            });
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
              // highest.push(w.highs.sort((a, b) => b - a)[0]);
              highest[w.dayOfWeek] = w.highs.sort((a, b) => b - a)[0];

              w.lows = w.timeChunks.map((timeChunk) => {
                return Math.round(timeChunk.main.temp_min);
              });
              lowest[w.dayOfWeek] = w.lows.sort((a, b) => a - b)[0];
            });
            // setHighs(highest);
            setHighs(highest);
            setLows(lowest);
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
    const state = stateName ? stateName + ", " : "";
    return dayName + " " + cityName && countryName
      ? cityName + ", " + state + countryName
      : errorMsg;
  };

  const displayCurrentWeather = () => {
    if (currentTemp && cityName && countryName) {
      return (
        <>
          <div className="currentTemperature">
            <div>
              <div>{dayName}</div>

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

  const highTemps = () => {
    let output = [];

    for (let day in highs) {
      output.push(
        <>
          <div className="dayOfTheWeek">{day}</div>
          <div className="dailyHigh">{highs[day]}&deg;F</div>
        </>
      );
    }
    return output;
  };

  const lowTemps = () => {
    let output = [];

    for (let day in lows) {
      output.push(
        <>
          <div className="dayOfTheWeek">{day}</div>
          <div className="dailyLow">{lows[day]}&deg;F</div>
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
                value={location}
                onChange={onLocationChange}
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
        <div className="fiveDayForecast">
          <div className="highs">{highTemps()}</div>
          <div className="lows">{lowTemps()}</div>
        </div>
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
// error handling----
// Change background image for cloudy/rain/snow/clear/nighttime
// show state dropdown when it's not a zip ----
// the commas----
// styling
// some cities return the wrong results. for example, flushing and forest hills and blank location
// still shows results even when you have the wrong city/country combination
