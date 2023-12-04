// William Huang - U53888747

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');
var fetch = import('node-fetch');

const config = require('../config');
const thekey = config.apiKey;


router.use(bodyParser.json());

/* get page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'ps4' });
});

// retrieve weather data from open weather API given lat and long
const getWeatherData = (lat, long) => {
    const apiKey = thekey;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`;

    return new Promise((resolve, reject) => {
        // Making the HTTP request
        request(apiUrl, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
};

// find lat and long given a location keyword
const getLatLong = (city) => {
    const input = city;
    const apiKey = thekey;
    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=3&appid=${apiKey}`;

    return new Promise((resolve, reject) => {
        // Making the HTTP request
        request(apiUrl, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
};

// post route to retrieve weather data via promise
router.post('/getWeather', async (req, res) => {

    try {
        const location = req.body.location;
        // get coordinates of the location
        const latlong = await getLatLong(location);
        console.log(latlong);
        // get weather based on coordinates
        const weatherData = await getWeatherData(latlong[0].lat, latlong[0].lon);
        console.log(weatherData);

        // send the weather data as the response
        res.json(weatherData.weather[0].main);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// post route to retrieve weather data via async/await
router.post('/getWeatherAsync', async (req, res) => {
    const location = req.body.location;

    try {
        const apiKey = thekey;
        const latlongUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=3&appid=${apiKey}`;

        // this doesnt work, i assume i can't nest async awaits, but i need to call one api for lat and long from location keyword, then call another
        // for the actual weather. i'm pretty sure if i only had one await (maybe just have user input lat and long), this would work.

        // in fact, i could probably just the first try{} fill a variable with lat and long, and have a second try{} do the second call... but i'd rather not
        const latlong = await fetch(latlongUrl);
        console.log(latlong);
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latlong[0].lat}&lon=${latlong[0].lon}&appid=${apiKey}`)

        if (!response.ok) {
            throw new Error('Failed to retrieve weather data.');
        }

        const weatherData = await response.json();
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// post route to retrieve weather data via callback
router.post('/getWeatherCallback', (req, res) => {
    const location = req.body.location;
    const apiKey = thekey;
    const latlongURL = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=3&appid=${apiKey}`;

    var latlong;

    // this one only returns the name of the city based on the input field
    // i couldn't get it to work with two api calls like async.await
    // this is still an api call and it parses a response!
    request(latlongURL, (error, response, body) => {
        if (error) {
            res.status(500).json({ error: 'Failed to retrieve weather data.' });
        } else {
            const parsedData = JSON.parse(body);
            console.log(parsedData);
            //latlong = parsedData;
            res.json(parsedData[0].name);
        }
    });

    // const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latlong[0].lat}&lon=${latlong[0].lon}&appid=${apiKey}`;
    // request(apiURL, (error, response, body) => {
    //     if (error) {
    //         res.status(500).json({ error: 'Failed to retrieve weather data.' });
    //     } else {
    //         const parsedData = JSON.parse(body);
    //         res.json(parsedData);
    //     }
    // });
});

module.exports = router;
