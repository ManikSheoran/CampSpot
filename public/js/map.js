mapboxgl.accessToken = mapToken;

if (camp.geometry && camp.geometry.coordinates) {
    const coordinates = camp.geometry.coordinates;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates,
        zoom: 9,
    });

    new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
} else {
    console.error('Camp coordinates are not defined');
}
