// Map Manager for CU PathFinder
// Handles all map operations, markers, and visualization

class MapManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.markers = {};
        this.pathLayer = null;
        this.currentPath = null;
        this.isInitialized = false;
        this.showAllMarkers = true;
        this.animationInProgress = false;
        
        // Initialize the map
        this.initializeMap();
    }
    
    // Initialize Leaflet map
    initializeMap() {
        try {
            // Create map instance
            this.map = L.map(this.containerId, {
                center: CampusData.bounds.center,
                zoom: CampusData.bounds.zoom,
                minZoom: CampusData.bounds.minZoom,
                maxZoom: CampusData.bounds.maxZoom,
                zoomControl: true,
                attributionControl: true
            });
            
            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors | CU PathFinder',
                maxZoom: 19
            }).addTo(this.map);
            
            // Create marker clusters group
            this.markerGroup = L.layerGroup().addTo(this.map);
            
            // Initialize path layer
            this.pathLayer = L.layerGroup().addTo(this.map);
            
            // Add all building markers
            this.addAllMarkers();
            
            // Set map event listeners
            this.setupMapEvents();
            
            this.isInitialized = true;
            console.log('✅ Map initialized successfully');
            
        } catch (error) {
            console.error('❌ Map initialization failed:', error);
            this.showMapError();
        }
    }
    
    // Add all building markers to the map
    addAllMarkers() {
        for (const [buildingName, buildingData] of Object.entries(CampusData.buildings)) {
            this.addMarker(buildingName, buildingData);
        }
    }
    
    // Add a single marker
    addMarker(buildingName, buildingData) {
        const style = CampusData.utils.getBuildingStyle(buildingName);
        const [lat, lng] = buildingData.coordinates;
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-container" style="background-color: ${style.color}">
                    <i class="fas fa-${style.icon}"></i>
                    <div class="marker-label">${buildingName}</div>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Create marker
        const marker = L.marker([lat, lng], { icon: icon });
        
        // Create popup content
        const popupContent = this.createPopupContent(buildingName, buildingData);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
        
        // Add click event
        marker.on('click', (e) => {
            this.onMarkerClick(buildingName, e);
        });
        
        // Store marker reference
        this.markers[buildingName] = marker;
        
        // Add to marker group
        marker.addTo(this.markerGroup);
    }
    
    // Create popup content for building
    createPopupContent(buildingName, buildingData) {
        const style = CampusData.utils.getBuildingStyle(buildingName);
        
        let facilitiesHtml = '';
        if (buildingData.facilities) {
            facilitiesHtml = `
                <div class="popup-facilities">
                    <strong>Facilities:</strong>
                    <ul>
                        ${buildingData.facilities.map(facility => `<li>${facility}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        let additionalInfo = '';
        if (buildingData.capacity) {
            additionalInfo += `<div class="popup-info"><strong>Capacity:</strong> ${buildingData.capacity}</div>`;
        }
        if (buildingData.floors) {
            additionalInfo += `<div class="popup-info"><strong>Floors:</strong> ${buildingData.floors}</div>`;
        }
        
        return `
            <div class="building-popup">
                <div class="popup-header" style="background-color: ${style.color}">
                    <i class="fas fa-${style.icon}"></i>
                    <h3>${buildingName}</h3>
                </div>
                <div class="popup-body">
                    <p class="popup-description">${buildingData.description}</p>
                    ${additionalInfo}
                    ${facilitiesHtml}
                    <div class="popup-actions">
                        <button class="popup-btn" onclick="mapManager.setAsStart('${buildingName}')">
                            <i class="fas fa-play"></i> Set as Start
                        </button>
                        <button class="popup-btn" onclick="mapManager.setAsDestination('${buildingName}')">
                            <i class="fas fa-flag"></i> Set as Destination
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Setup map event listeners
    setupMapEvents() {
        // Map click event
        this.map.on('click', (e) => {
            this.clearHighlights();
        });
        
        // Zoom event
        this.map.on('zoomend', () => {
            this.updateMarkerVisibility();
        });
        
        // Map ready event
        this.map.whenReady(() => {
            console.log('🗺️  Map is ready');
        });
    }
    
    // Display path on map
    displayPath(pathResult) {
        this.clearPath();
        
        if (!pathResult || !pathResult.coordinates || pathResult.coordinates.length < 2) {
            console.warn('Invalid path data provided');
            return;
        }
        
        this.currentPath = pathResult;
        
        // Create path polyline
        const pathLine = L.polyline(pathResult.coordinates, {
            color: CampusData.defaultSettings.pathColor,
            weight: CampusData.defaultSettings.pathWeight,
            opacity: CampusData.defaultSettings.pathOpacity,
            dashArray: '10, 5'
        });
        
        // Add path to map
        pathLine.addTo(this.pathLayer);
        
        // Add start and end markers
        this.addStartEndMarkers(pathResult);
        
        // Add waypoint markers
        this.addWaypointMarkers(pathResult);
        
        // Fit map to path
        this.fitToPath();
        
        // Animate path if enabled
        if (CampusData.defaultSettings.animateMarkers) {
            this.animatePath(pathLine);
        }
        
        console.log(`🛣️  Path displayed: ${pathResult.path.join(' → ')}`);
    }
    
    // Add start and end markers
    addStartEndMarkers(pathResult) {
        const path = pathResult.path;
        const coordinates = pathResult.coordinates;
        
        if (path.length < 2) return;
        
        // Start marker
        const startIcon = L.divIcon({
            className: 'path-marker start-marker',
            html: '<i class="fas fa-play-circle"></i>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const startMarker = L.marker(coordinates[0], { icon: startIcon });
        startMarker.bindPopup(`<strong>Start:</strong> ${path[0]}`);
        startMarker.addTo(this.pathLayer);
        
        // End marker
        const endIcon = L.divIcon({
            className: 'path-marker end-marker',
            html: '<i class="fas fa-flag-checkered"></i>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const endMarker = L.marker(coordinates[coordinates.length - 1], { icon: endIcon });
        endMarker.bindPopup(`<strong>Destination:</strong> ${path[path.length - 1]}`);
        endMarker.addTo(this.pathLayer);
    }
    
    // Add waypoint markers
    addWaypointMarkers(pathResult) {
        const path = pathResult.path;
        const coordinates = pathResult.coordinates;
        
        // Skip start and end points
        for (let i = 1; i < path.length - 1; i++) {
            const waypointIcon = L.divIcon({
                className: 'path-marker waypoint-marker',
                html: `<span>${i}</span>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const waypointMarker = L.marker(coordinates[i], { icon: waypointIcon });
            waypointMarker.bindPopup(`<strong>Waypoint ${i}:</strong> ${path[i]}`);
            waypointMarker.addTo(this.pathLayer);
        }
    }
    
    // Animate path drawing
    animatePath(pathLine) {
        // Remove the path temporarily
        this.pathLayer.removeLayer(pathLine);
        
        // Get path coordinates
        const latlngs = pathLine.getLatLngs();
        
        // Create animated polyline
        const animatedPath = L.polyline([], {
            color: CampusData.defaultSettings.pathColor,
            weight: CampusData.defaultSettings.pathWeight + 2,
            opacity: 1,
            dashArray: '10, 5'
        }).addTo(this.pathLayer);
        
        // Animate drawing
        this.animationInProgress = true;
        let currentIndex = 0;
        
        const animateStep = () => {
            if (currentIndex < latlngs.length) {
                animatedPath.addLatLng(latlngs[currentIndex]);
                currentIndex++;
                setTimeout(animateStep, 200); // 200ms delay between points
            } else {
                this.animationInProgress = false;
                // Add the original path back
                pathLine.addTo(this.pathLayer);
                // Remove animated path
                this.pathLayer.removeLayer(animatedPath);
            }
        };
        
        animateStep();
    }
    
    // Clear current path
    clearPath() {
        if (this.pathLayer) {
            this.pathLayer.clearLayers();
        }
        this.currentPath = null;
    }
    
    // Fit map view to current path
    fitToPath() {
        if (this.currentPath && this.currentPath.coordinates) {
            const bounds = L.latLngBounds(this.currentPath.coordinates);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    
    // Highlight specific building
    highlightBuilding(buildingName) {
        this.clearHighlights();
        
        const marker = this.markers[buildingName];
        if (marker) {
            // Add highlight class
            const markerElement = marker.getElement();
            if (markerElement) {
                markerElement.classList.add('highlighted');
            }
            
            // Pan to marker
            this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 18));
            
            // Open popup
            marker.openPopup();
        }
    }
    
    // Clear all highlights
    clearHighlights() {
        Object.values(this.markers).forEach(marker => {
            const markerElement = marker.getElement();
            if (markerElement) {
                markerElement.classList.remove('highlighted');
            }
            marker.closePopup();
        });
    }
    
    // Toggle marker visibility
    toggleMarkers() {
        this.showAllMarkers = !this.showAllMarkers;
        
        if (this.showAllMarkers) {
            this.markerGroup.addTo(this.map);
        } else {
            this.map.removeLayer(this.markerGroup);
        }
        
        return this.showAllMarkers;
    }
    
    // Update marker visibility based on zoom level
    updateMarkerVisibility() {
        const currentZoom = this.map.getZoom();
        const showLabels = currentZoom >= 17;
        
        Object.values(this.markers).forEach(marker => {
            const markerElement = marker.getElement();
            if (markerElement) {
                const label = markerElement.querySelector('.marker-label');
                if (label) {
                    label.style.display = showLabels ? 'block' : 'none';
                }
            }
        });
    }
    
    // Center map on campus
    centerMap() {
        this.map.setView(CampusData.bounds.center, CampusData.bounds.zoom);
    }
    
    // Set building as start location
    setAsStart(buildingName) {
        const startSelect = document.getElementById('start-location');
        if (startSelect) {
            startSelect.value = buildingName;
            // Trigger change event
            startSelect.dispatchEvent(new Event('change'));
        }
        
        // Close any open popups
        this.map.closePopup();
        
        // Show notification
        this.showNotification(`Start location set to: ${buildingName}`, 'success');
    }
    
    // Set building as destination
    setAsDestination(buildingName) {
        const endSelect = document.getElementById('end-location');
        if (endSelect) {
            endSelect.value = buildingName;
            // Trigger change event
            endSelect.dispatchEvent(new Event('change'));
        }
        
        // Close any open popups
        this.map.closePopup();
        
        // Show notification
        this.showNotification(`Destination set to: ${buildingName}`, 'success');
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // This will be handled by the UI controller
        if (window.uiController) {
            window.uiController.showNotification(message, type);
        }
    }
    
    // Handle marker click events
    onMarkerClick(buildingName, event) {
        console.log(`📍 Clicked on: ${buildingName}`);
        
        // Highlight the clicked building
        this.highlightBuilding(buildingName);
        
        // Emit custom event for other components
        document.dispatchEvent(new CustomEvent('buildingSelected', {
            detail: { buildingName: buildingName }
        }));
    }
    
    // Show map error
    showMapError() {
        const mapContainer = document.getElementById(this.containerId);
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Map Loading Error</h3>
                    <p>Unable to load the campus map. Please check your internet connection and try again.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </div>
            `;
        }
    }
    
    // Get current map bounds
    getBounds() {
        return this.map ? this.map.getBounds() : null;
    }
    
    // Get current zoom level
    getZoom() {
        return this.map ? this.map.getZoom() : null;
    }
    
    // Check if map is initialized
    isReady() {
        return this.isInitialized && this.map;
    }
    
    // Resize map (useful for responsive layouts)
    resize() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }
    
    // Toggle fullscreen mode
    toggleFullscreen() {
        const mapContainer = document.getElementById(this.containerId);
        
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().then(() => {
                setTimeout(() => this.resize(), 200);
            });
        } else {
            document.exitFullscreen().then(() => {
                setTimeout(() => this.resize(), 200);
            });
        }
    }
    
    // Export map as image (future feature)
    async exportMap() {
        // This would require additional libraries like html2canvas
        console.log('Map export feature - coming soon!');
    }
}

// Add custom CSS for markers
const mapStyles = `
<style>
.custom-marker {
    background: none;
    border: none;
}

.marker-container {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    border: 2px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.marker-container:hover {
    transform: scale(1.2);
}

.marker-container.highlighted {
    transform: scale(1.3);
    border-color: #ffff00;
    box-shadow: 0 0 20px rgba(255,255,0,0.5);
    animation: pulse 1s infinite;
}

.marker-label {
    position: absolute;
    top: 35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    pointer-events: none;
    display: none;
}

.path-marker {
    background: none;
    border: none;
}

.start-marker {
    background: #27ae60;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 15px rgba(39,174,96,0.4);
}

.end-marker {
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 15px rgba(231,76,60,0.4);
}

.waypoint-marker {
    background: #667eea;
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(102,126,234,0.4);
}

.building-popup {
    min-width: 250px;
}

.popup-header {
    color: white;
    padding: 10px;
    margin: -10px -10px 10px -10px;
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.popup-header h3 {
    margin: 0;
    font-size: 16px;
}

.popup-description {
    margin-bottom: 10px;
    color: #555;
    line-height: 1.4;
}

.popup-info {
    margin-bottom: 5px;
    font-size: 14px;
}

.popup-facilities ul {
    margin: 5px 0 10px 20px;
    font-size: 13px;
}

.popup-actions {
    display: flex;
    gap: 5px;
    margin-top: 10px;
}

.popup-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.popup-btn:hover {
    background: #5a67d8;
}

.map-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #7f8c8d;
    text-align: center;
    padding: 40px;
}

.map-error i {
    font-size: 4rem;
    margin-bottom: 20px;
    color: #e74c3c;
}

.map-error h3 {
    margin-bottom: 10px;
    color: #2c3e50;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255,255,0,0.7); }
    70% { box-shadow: 0 0 0 10px rgba(255,255,0,0); }
    100% { box-shadow: 0 0 0 0 rgba(255,255,0,0); }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', mapStyles);