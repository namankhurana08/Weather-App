const usertab = document.querySelector("[data-userweather]");
const searchtab = document.querySelector("[data-searchweather]");
const usercontainer = document.querySelector(".weather-container");
const grantaccesscontainer = document.querySelector(".grant-location-container");
const searchform = document.querySelector("[data-searchform]");
const loadingscreen = document.querySelector(".loading-container");
const userinfocontainer = document.querySelector(".user-info-container");

let currenttab = usertab;
const API_Key = "a30c5f9e441086e4ad98ceac7e1693a0";
currenttab.classList.add("current-tab");
getfromsessionstorage();

function switchtab(clickedtab) {
    if (clickedtab != currenttab) {
        currenttab.classList.remove("current-tab");
        currenttab = clickedtab;
        currenttab.classList.add("current-tab");

        if (!searchform.classList.contains("active")) {
            userinfocontainer.classList.remove("active");
            grantaccesscontainer.classList.remove("active");
            searchform.classList.add("active");
        } else {
            searchform.classList.remove("active");
            userinfocontainer.classList.remove("active");
            getfromsessionstorage();
        }
    }
}

usertab.addEventListener("click", () => {
    switchtab(usertab);
})

searchtab.addEventListener("click", () => {
    switchtab(searchtab);
})

function getfromsessionstorage() {
    const localcoordinates = sessionStorage.getItem("user-coordinates");
    if (!localcoordinates) {
        grantaccesscontainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localcoordinates);
        fetchWeatherByCoordinates(coordinates);
    }
}

async function fetchWeatherByCoordinates(coordinates) {
    const { lat, lon } = coordinates;
    grantaccesscontainer.classList.remove("active");
    loadingscreen.classList.add("active");

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_Key}&units=metric`);
        const data = await res.json();

        loadingscreen.classList.remove("active");
        userinfocontainer.classList.add("active");
        renderweatherinfo(data);
    } catch (err) {
        loadingscreen.classList.remove("active");
        console.error(err);
    }
}

function renderweatherinfo(weatherinfo) {
    const cityname = document.querySelector("[data-cityname]");
    const countryicon = document.querySelector("[data-country-icon]");
    const desc = document.querySelector("[data-weatherdesc]");
    const weathericon = document.querySelector("[data-weathericon]");
    const temp = document.querySelector("[data-temperature]");
    const humidity = document.querySelector("[data-humidity]");
    const wind = document.querySelector("[data-windspeed]");
    const cloud = document.querySelector("[data-cloud]");

    cityname.innerText = weatherinfo?.name;
    countryicon.src = `https://flagcdn.com/144x108/${weatherinfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherinfo?.weather?.[0]?.description;
    weathericon.src = `https://openweathermap.org/img/w/${weatherinfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherinfo?.main?.temp}°C`;
    wind.innerText = `${weatherinfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherinfo?.main?.humidity}%`;
    cloud.innerText = `${weatherinfo?.clouds?.all}%`;
}

function getlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showposition);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function showposition(position) {
    const usercoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(usercoordinates));
    fetchWeatherByCoordinates(usercoordinates);
}

const grantaccessbutton = document.querySelector("[data-grantaccess]");
grantaccessbutton.addEventListener("click", getlocation);

const searchinput = document.querySelector("[data-searchinput]");

searchform.addEventListener("submit", (e) => {
    e.preventDefault();

    let cityname = searchinput.value;
    if (cityname === "") return;

    fetchWeatherByCity(cityname);
})

async function fetchWeatherByCity(city) {
    loadingscreen.classList.add("active");
    userinfocontainer.classList.remove("active");
    grantaccesscontainer.classList.remove("active");

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`);
        const data = await res.json();
        loadingscreen.classList.remove("active");
        userinfocontainer.classList.add("active");
        renderweatherinfo(data);
    } catch (err) {
        loadingscreen.classList.remove("active");
        console.error(err);
    }
}
