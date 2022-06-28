import { useState } from "react";
import "./App.css";

function App() {
  const [location, setLocation] = useState("");

  const onChange = (event) => {
    setLocation(event.target.value);
  };

  return (
    <>
      <div className="weatherForm">
        <h1>How's the Weather?</h1>
        <form className="getLocation">
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
