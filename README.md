## Developer notes:

For 5-day forecast, I made the assumption that we only wanted to show one weather value for each day, so I pulled the highest and lowest temps for each of the 8 hour time blocks and output those

Accounting for time zones is a larger endeavor so I chose not to address it here at this point

There are certain locations which, when I enter a certain combination of city and state, it returns the wrong location. For example, for Flushing, in the state of NY in US, the results come back as Flushing, England GB. This might be an issue with the API itself. A possible solution would be to use lon and lat as search parameters instead of city and state, country name. That might give more precise results.

I have plans to create a dropdown for users to choose between Celsius and Fahrenheit

I would like to break out the submitHandler into separate functions so that each API call is its own function

The next step would be to separate the code into components for each day to make App.js neater and more streamlined
