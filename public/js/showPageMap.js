mapboxgl.accessToken = mapToken;
const coordinates = campground.geometry.coordinates;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left')

new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3>
                <p>${campground.location}</>`
            )
    )
    .addTo(map);