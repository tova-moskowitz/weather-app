import { useState } from "react";
import "./App.css";

function App() {
  const [location, setLocation] = useState("");

  const onChange = (event) => {
    setLocation(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!event.target.location.value) {
      return;
    }

    const APIKey = "7841aaead8245e0fde0256620686a3e1";
    const zip = event.target.location.value;
    const countryCode = "US";
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},${countryCode}&units=imperial&appid=${APIKey}`;
    let lat = 0;
    let lon = 0;
    let currentTemp = 0;

    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        currentTemp = Math.round(data.main.temp);
        lat = data.coord.lat;
        lon = data.coord.lon;
      });
  };

  return (
    <>
      <div className="weatherForm">
        <h1>How's the Weather?</h1>
        <form onSubmit={handleSubmit} className="getLocation">
          <input
            value={location}
            onChange={onChange}
            type="text"
            className="location"
            name="location"
          />
          <input
            type="submit"
            className="submitLocation"
            value="ENTER LOCATION"
          />
        </form>
      </div>
    </>
  );
}
export default App;

// create input field for zip, country/country
// event.target.value
// fetch endpoint with API key, and zip code/country passed in
// currentWeather.main.temp rounded up to nearest whole number
// fetch pollution endpoint using lat and lon
// fetch 5 - day forecast using lat and lon
