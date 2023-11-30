document.addEventListener('DOMContentLoaded', () => {
    const locationButton = document.getElementById('locationButton');
    const citySearchbar = document.getElementById('citySearchbar');
    const searchButton = document.getElementById('searchButton');

    locationButton.addEventListener('click', getUserLocation);
    searchButton.addEventListener('click', getGeoData);

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchSunriseSunsetData(lat, lon, 'today');
                    fetchSunriseSunsetData(lat, lon, 'tomorrow');
                },
                showError
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function getGeoData() {
        const location = citySearchbar.value.trim();
        if (!location) {
            alert("Please enter a city name.");
            return;
        }

        const geocodeApiUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(location)}`;
        fetch(geocodeApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    alert("Invalid city name.");
                    return;
                }
                const lat = data[0].lat;
                const lon = data[0].lon;
                fetchSunriseSunsetData(lat, lon, 'today');
                fetchSunriseSunsetData(lat, lon, 'tomorrow');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error fetching location data. Please try again.');
            });
    }

    function fetchSunriseSunsetData(lat, lon, dayIdentifier) {
        const date = dayIdentifier === 'today' ? new Date() : new Date(new Date().setDate(new Date().getDate() + 1));
        const formattedDate = formatDate(date);
        const apiUrl = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${formattedDate}&formatted=0`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'OK') {
                    throw new Error('Error in API response');
                }
                updateDashboard(data.results, dayIdentifier);
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Error fetching sunrise/sunset data for ${dayIdentifier}. Please try again.`);
            });
    }

    function updateDashboard(data, dayIdentifier) {
        const panel = document.getElementById(`Panel${dayIdentifier.charAt(0).toUpperCase() + dayIdentifier.slice(1)}`);
        panel.querySelector(`.date-${dayIdentifier}`).textContent = formatDate(new Date());
        panel.querySelector(`.sunrise-${dayIdentifier}`).textContent = new Date(data.sunrise).toLocaleTimeString();
        panel.querySelector(`.sunset-${dayIdentifier}`).textContent = new Date(data.sunset).toLocaleTimeString();
        panel.querySelector(`.dawn-${dayIdentifier}`).textContent = new Date(data.civil_twilight_begin).toLocaleTimeString();
        panel.querySelector(`.dusk-${dayIdentifier}`).textContent = new Date(data.civil_twilight_end).toLocaleTimeString();
        panel.querySelector(`.daylength-${dayIdentifier}`).textContent = data.day_length;
        panel.querySelector(`.solarnoon-${dayIdentifier}`).textContent = new Date(data.solar_noon).toLocaleTimeString();
        panel.querySelector(`.timezone-${dayIdentifier}`).textContent = data.timezone;
    }

    function formatDate(date) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return `${daysOfWeek[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }
});
