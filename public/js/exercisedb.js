$(document).ready(function() {
    // Define temperature ranges and corresponding exercises
    const exerciseCategories = {
        cold: ['waist', 'upper legs', 'lower legs', 'back', 'chest'],
        moderate: ['waist', 'upper legs', 'lower legs', 'back', 'chest', 'shoulders', 'arms'],
        hot: ['waist', 'upper legs', 'lower legs', 'back', 'chest', 'shoulders', 'arms']
    };

    // Function to fetch exercises from ExerciseDB API
    function fetchExercises() {
        return $.ajax({
            url: 'https://exercisedb.p.rapidapi.com/exercises',
            method: 'GET',
            headers: {
              'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
                'X-RapidAPI-Key': '7aa077f2b9msh45774d4728e2637p1ec486jsn783fc858bb17'
            }
        });
    }

    // Function to fetch weather data based on coordinates
    function fetchWeather(lat, lon) {
        return $.ajax({
            url: 'https://api.openweathermap.org/data/2.5/weather',
            data: {
                lat: lat,
                lon: lon,
                appid: 'e7a622538715dc590c381df263f61828',
                units: 'metric'
            }
        });
    }

    // Function to display exercises based on temperature
    function displayExercises(exercises, temperature) {
        $('#exercises').empty();

        let suitableExercises = [];

        if (temperature < 10) {
            suitableExercises = exercises.filter(exercise => {
                return exerciseCategories.cold.some(category => {
                    return exercise.bodyPart.toLowerCase().includes(category);
                });
            });
        } else if (temperature >= 10 && temperature <= 25) {
            suitableExercises = exercises.filter(exercise => {
                return exerciseCategories.moderate.some(category => {
                    return exercise.bodyPart.toLowerCase().includes(category);
                });
            });
        } else {
            suitableExercises = exercises.filter(exercise => {
                return exerciseCategories.hot.some(category => {
                    return exercise.bodyPart.toLowerCase().includes(category);
                });
            });
        }

        if (suitableExercises.length === 0) {
            $('#exercises').html('<p>No suitable exercises found for the current temperature.</p>');
        } else {
            // Filter exercises for the "waist" category
            suitableExercises = suitableExercises.filter(exercise => {
                return exercise.bodyPart.toLowerCase().includes('waist');
            });

            // Create rows for the exercises, three exercises per row
            let row;
            suitableExercises.forEach(function(exercise, index) {
                if (index % 3 === 0) {
                    row = $('<div class="row exercise-row mb-4"></div>');
                    $('#exercises').append(row);
                }

                const exerciseName = exercise.name.replace(/\b\w/g, char => char.toUpperCase());

                const col = $(`
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <img src="${exercise.gifUrl}" alt="${exercise.name}" class="card-img-top">
                            <div class="card-body">
                                <h5 class="card-title">${exerciseName}</h5>
                                <p class="card-text"><strong>Target Muscle:</strong> ${exercise.target}</p>
                                <p class="card-text"><strong>Equipment:</strong> ${exercise.equipment}</p>
                                <p class="card-text"><strong>Body Part:</strong> ${exercise.bodyPart}</p>
                            </div>
                        </div>
                    </div>
                `);
                row.append(col);
            });
        }
    }

    // Get user's location and fetch weather data
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            $.when(fetchExercises(), fetchWeather(lat, lon)).done(function(exercisesResponse, weatherResponse) {
                var exercises = exercisesResponse[0];
                var temperature = Math.round(weatherResponse[0].main.temp);
                var tempMin = Math.round(weatherResponse[0].main.temp_min);
                var tempMax = Math.round(weatherResponse[0].main.temp_max);
                var weatherDescription = weatherResponse[0].weather[0].description;

                // Capitalize first letter of weather description
                weatherDescription = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);

                displayExercises(exercises, temperature);

                $('#weather').html(`
                    <div class="weather-container">
                        <div class="weather-info">
                            <div class="alert alert-info" style="float:left;">
                                <h4>${weatherResponse[0].name}</h4>
                                <p>${weatherResponse[0].sys.country}</p>
                            </div>
                            <div style="float:right;">
                                <div style="float:left;">
                                    <p>${weatherDescription}</p>
                                    <p class="temperature">${temperature}°C</p>
                                    <p>Min: ${tempMin}°C | Max: ${tempMax}°C</p>
                                </div>
                                <div class="weather-icon" style="float:right;">
                                    <i class="wi ${getWeatherIconClass(weatherResponse[0].weather[0].icon)}"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            }).fail(function(err) {
                console.error('Error:', err);
                $('#weather').html('<p class="alert alert-danger">Unable to retrieve weather or exercise data.</p>');
            });
        }, function(error) {
            console.error('Error getting location:', error);
            $('#weather').html('<p class="alert alert-danger">Unable to retrieve your location. Please enable location services and try again.</p>');
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        $('#weather').html('<p class="alert alert-danger">Geolocation is not supported by this browser.</p>');
    }

    // Function to map OpenWeatherMap icon codes to Weather Icons class names
    function getWeatherIconClass(iconCode) {
        switch (iconCode) {
            case '01d':
                return 'wi-day-sunny'; // clear sky day
            case '01n':
                return 'wi-night-clear'; // clear sky night
            case '02d':
                return 'wi-day-cloudy'; // few clouds day
            case '02n':
                return 'wi-night-cloudy'; // few clouds night
            case '03d':
            case '03n':
                return 'wi-cloud'; // scattered clouds
            case '04d':
            case '04n':
                return 'wi-cloudy'; // broken clouds
            case '09d':
            case '09n':
                return 'wi-showers'; // shower rain
            case '10d':
                return 'wi-day-rain'; // rain day
            case '10n':
                return 'wi-night-rain'; // rain night
            case '11d':
            case '11n':
                return 'wi-thunderstorm'; // thunderstorm
            case '13d':
            case '13n':
                return 'wi-snow'; // snow
            case '50d':
            case '50n':
                return 'wi-fog'; // mist
            default:
                return 'wi-na'; // Not available
        }
    }
});
