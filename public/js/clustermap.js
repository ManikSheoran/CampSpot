mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [75.8577, 22.7196],
    zoom: 3.2
});

map.on('load', () => {
    map.addSource('camps', {
        type: 'geojson',
        data: {features: camps},
        cluster: true,
        clusterMaxZoom: 14, 
        clusterRadius: 50 
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'camps',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#FFC0D9',
                5,
                '#FF90BC',
                15,
                '#CD8D7A'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                5,
                25,
                15,
                30
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'camps',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'camps',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#8ACDD7',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('camps').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const mag = e.features[0].properties.mag;
        const tsunami =
            e.features[0].properties.tsunami === 1 ? 'yes' : 'no';

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});