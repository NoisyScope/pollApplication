// Google Maps Integration for Restaurant Poll

let maps = {};
let markers = {};
let mapsLoaded = false;

// Initialize all maps - called when Google Maps API loads
function initMaps() {
    try {
        console.log('Google Maps API loaded successfully');
        mapsLoaded = true;
        initVotingMaps();
        initManageMaps();
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
        showMapError();
    }
}

// Show error message if maps fail to load
function showMapError() {
    document.querySelectorAll('.option-map, .mini-map').forEach(element => {
        element.innerHTML = `
            <div class="d-flex align-items-center justify-content-center h-100" 
                 style="background: #f8f9fa; color: #6c757d;">
                <small><i class="fas fa-exclamation-triangle"></i> Map unavailable</small>
            </div>
        `;
    });
}

// Extract coordinates from Google Maps URL
function extractCoordinatesFromUrl(url) {
    if (!url) return null;
    
    try {
        console.log('Parsing URL:', url);
        
        // Decode URL in case it's encoded
        const decodedUrl = decodeURIComponent(url);
        
        // Format 1: @lat,lng,zoom (most common)
        const atMatch = decodedUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (atMatch) {
            console.log('Found coordinates using @ format');
            return {
                lat: parseFloat(atMatch[1]),
                lng: parseFloat(atMatch[2])
            };
        }
        
        // Format 2: ll=lat,lng
        const llMatch = decodedUrl.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (llMatch) {
            console.log('Found coordinates using ll= format');
            return {
                lat: parseFloat(llMatch[1]),
                lng: parseFloat(llMatch[2])
            };
        }
        
        // Format 3: q=lat,lng (direct coordinate search)
        const qMatch = decodedUrl.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (qMatch) {
            console.log('Found coordinates using q= format');
            return {
                lat: parseFloat(qMatch[1]),
                lng: parseFloat(qMatch[2])
            };
        }
        
        // Format 4: /place/name/@lat,lng (place URLs)
        const placeMatch = decodedUrl.match(/\/place\/[^\/]*\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (placeMatch) {
            console.log('Found coordinates using place format');
            return {
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2])
            };
        }
        
        // Format 5: dir/destination/@lat,lng (directions URLs)
        const dirMatch = decodedUrl.match(/\/dir\/[^\/]*\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (dirMatch) {
            console.log('Found coordinates using directions format');
            return {
                lat: parseFloat(dirMatch[1]),
                lng: parseFloat(dirMatch[2])
            };
        }
        
        // Format 6: Short URLs (goo.gl/maps) - we can't parse these directly
        if (decodedUrl.includes('goo.gl/maps') || decodedUrl.includes('maps.app.goo.gl')) {
            console.warn('Short URL detected - cannot parse coordinates directly:', url);
            console.log('Tip: Please expand the short URL first by visiting it');
            return 'SHORT_URL';
        }
        
        // Format 7: Try to extract place name for geocoding
        const placeNameMatch = decodedUrl.match(/\/place\/([^\/\?@]+)/);
        if (placeNameMatch) {
            const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
            console.log('Found place name for geocoding:', placeName);
            return { placeName: placeName, needsGeocoding: true };
        }
        
        // Format 8: Search query in URL
        const searchMatch = decodedUrl.match(/[?&]q=([^&@]+)/);
        if (searchMatch && !searchMatch[1].match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
            const searchQuery = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
            console.log('Found search query for geocoding:', searchQuery);
            return { placeName: searchQuery, needsGeocoding: true };
        }
        
        console.warn('Could not extract coordinates from URL:', url);
        console.log('Supported formats:');
        console.log('1. https://maps.google.com/maps?ll=lat,lng');
        console.log('2. https://maps.google.com/@lat,lng,zoom');
        console.log('3. https://maps.google.com/maps/place/Name/@lat,lng');
        console.log('4. https://maps.google.com/maps?q=lat,lng');
        
        return null;
        
    } catch (error) {
        console.error('Error parsing Google Maps URL:', error);
        return null;
    }
}

// Extract place ID from Google Maps URL for more accurate mapping
function extractPlaceIdFromUrl(url) {
    if (!url) return null;
    
    const placeMatch = url.match(/place\/([^\/]+)/);
    if (placeMatch) {
        return decodeURIComponent(placeMatch[1]);
    }
    
    const ftidMatch = url.match(/ftid=([^&]+)/);
    if (ftidMatch) {
        return ftidMatch[1];
    }
    
    return null;
}

// Initialize maps for voting page
function initVotingMaps() {
    const mapElements = document.querySelectorAll('.option-map');
    
    mapElements.forEach((mapElement) => {
        const mapId = mapElement.id;
        const locationUrl = mapElement.dataset.location;
        
        if (locationUrl) {
            const parseResult = extractCoordinatesFromUrl(locationUrl);
            const placeName = extractPlaceIdFromUrl(locationUrl);
            
            if (parseResult && parseResult.lat && parseResult.lng) {
                // Create map with extracted coordinates
                const map = new google.maps.Map(mapElement, {
                    zoom: 15,
                    center: parseResult,
                    mapId: 'restaurant_poll_map', // Required for AdvancedMarkerElement
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                    zoomControl: true,
                    scrollwheel: false,
                    gestureHandling: 'none',
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels.text',
                            stylers: [{ visibility: 'on' }]
                        }
                    ]
                });
                
                // Create custom marker element
                const markerElement = document.createElement('div');
                markerElement.style.width = '32px';
                markerElement.style.height = '32px';
                markerElement.style.backgroundImage = 'url(https://maps.google.com/mapfiles/ms/icons/restaurant.png)';
                markerElement.style.backgroundSize = 'contain';
                markerElement.style.backgroundRepeat = 'no-repeat';
                markerElement.style.backgroundPosition = 'center';
                markerElement.title = placeName || 'Restaurant Location';
                
                // Add marker using AdvancedMarkerElement
                const marker = new google.maps.marker.AdvancedMarkerElement({
                    position: parseResult,
                    map: map,
                    title: placeName || 'Restaurant Location',
                    content: markerElement
                });
                
                // Store references
                maps[mapId] = map;
                markers[mapId] = marker;
                
                // Add click handler to open full Google Maps
                mapElement.style.cursor = 'pointer';
                mapElement.addEventListener('click', () => {
                    window.open(locationUrl, '_blank');
                });
                
                // Add loaded class to remove loading spinner
                mapElement.classList.add('loaded');
                
            } else if (parseResult === 'SHORT_URL') {
                // Handle short URLs
                mapElement.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100" 
                         style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; cursor: pointer;"
                         onclick="window.open('${locationUrl}', '_blank')">
                        <div class="text-center">
                            <i class="fas fa-external-link-alt fa-2x mb-2"></i><br>
                            <small>Short URL - Click to expand</small>
                        </div>
                    </div>
                `;
            } else if (parseResult && parseResult.needsGeocoding) {
                // Handle place names that need geocoding
                mapElement.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100" 
                         style="background: linear-gradient(135deg, #6c757d, #495057); color: white; cursor: pointer;"
                         onclick="window.open('${locationUrl}', '_blank')">
                        <div class="text-center">
                            <i class="fas fa-search-location fa-2x mb-2"></i><br>
                            <small>${parseResult.placeName}<br>Click to view</small>
                        </div>
                    </div>
                `;
            } else {
                // If we can't parse coordinates, show a placeholder with link
                mapElement.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100" 
                         style="background: linear-gradient(135deg, #4285f4, #34a853); color: white; cursor: pointer;"
                         onclick="window.open('${locationUrl}', '_blank')">
                        <div class="text-center">
                            <i class="fas fa-map-marked-alt fa-2x mb-2"></i><br>
                            <small>Click to view location</small>
                        </div>
                    </div>
                `;
            }
        }
    });
}

// Initialize mini maps for manage page
function initManageMaps() {
    const miniMapElements = document.querySelectorAll('.mini-map');
    
    miniMapElements.forEach((mapElement) => {
        const mapId = mapElement.id;
        const optionIndex = mapId.replace('miniMap', '');
        
        // Get location from the data (you might need to pass this differently)
        // For now, we'll check if there's a corresponding option-map
        const votingMap = maps[`map${optionIndex}`];
        
        if (votingMap) {
            const center = votingMap.getCenter();
            
            const miniMap = new google.maps.Map(mapElement, {
                zoom: 14,
                center: center,
                mapId: 'restaurant_poll_mini_map', // Required for AdvancedMarkerElement
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                gestureHandling: 'none',
                clickableIcons: false
            });
            
            // Create mini marker element
            const miniMarkerElement = document.createElement('div');
            miniMarkerElement.style.width = '24px';
            miniMarkerElement.style.height = '24px';
            miniMarkerElement.style.backgroundImage = 'url(https://maps.google.com/mapfiles/ms/icons/restaurant.png)';
            miniMarkerElement.style.backgroundSize = 'contain';
            miniMarkerElement.style.backgroundRepeat = 'no-repeat';
            miniMarkerElement.style.backgroundPosition = 'center';
            
            const miniMarker = new google.maps.marker.AdvancedMarkerElement({
                position: center,
                map: miniMap,
                content: miniMarkerElement
            });
            
            maps[mapId] = miniMap;
            markers[mapId] = miniMarker;
        }
    });
}

// Utility function to refresh maps after dynamic content changes
function refreshMaps() {
    Object.values(maps).forEach(map => {
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    });
}

// Make functions globally available
window.initMaps = initMaps;
window.refreshMaps = refreshMaps;