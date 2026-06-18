// Campus Data for CU PathFinder
// Contains all buildings, coordinates, connections, and metadata

const CampusData = {
    // Campus bounds and center - updated from real campus map
    bounds: {
        center: [23.000, 72.000], // Center of campus based on coordinate range
        zoom: 17,
        minZoom: 16,
        maxZoom: 19
    },
    
    // Campus buildings with real coordinates from Campus Map.html
    // Converted from pixel coordinates to lat/lng
    buildings: {
        "Admin Office": {
            coordinates: [22.99738, 72.00232], // Same as Library (central location)
            type: "administrative",
            description: "Main administrative office for university operations",
            facilities: ["Reception", "Student Services", "Records"]
        },
        "Auditorium": {
            coordinates: [22.99738, 72.00232], // Same as Library (central location)
            type: "academic",
            description: "Main auditorium for events and presentations",
            capacity: 500,
            facilities: ["Stage", "Audio/Visual", "Seating"]
        },
        "Badminton Court": {
            coordinates: [23.00477, 72.00260], // Left side of Water Tank
            type: "sports",
            description: "Indoor badminton facility",
            facilities: ["Courts", "Equipment"]
        },
        "Basketball Court": {
            coordinates: [23.00718, 72.00382], // Moved to right side (increased longitude)
            type: "sports",
            description: "Outdoor basketball court",
            facilities: ["Court", "Scoreboard"]
        },
        "Block A": {
            coordinates: [22.99738, 72.00232], // From campus map x=410, y=360
            type: "academic",
            description: "Academic Block A - Main teaching building",
            floors: 4,
            facilities: ["Classrooms", "Faculty Offices", "Computer Labs"]
        },
        "Block B": {
            coordinates: [22.99850, 72.00232], // From campus map x=410, y=200
            type: "academic",
            description: "Academic Block B - Secondary teaching building",
            floors: 3,
            facilities: ["Classrooms", "Laboratories", "Seminar Halls"]
        },
        "Boys Hostel": {
            coordinates: [23.00504, 72.00518], // From campus map x=780, y=-217.5
            type: "residential",
            description: "Male student accommodation facility",
            capacity: 200,
            facilities: ["Rooms", "Common Area", "Mess"]
        },
        "Canteen": {
            coordinates: [23.00392, 72.00499], // Near Water Treatment Area (same as Food Court)
            type: "food",
            description: "Main dining facility for students and staff",
            capacity: 150,
            facilities: ["Dining Hall", "Kitchen", "Outdoor Seating"]
        },
        "Cricket Ground": {
            coordinates: [23.00659, 72.00129], // From campus map x=177.5, y=-940
            type: "sports",
            description: "Full-size cricket field",
            facilities: ["Pitch", "Pavilion", "Practice Nets"]
        },
        "DG Yard": {
            coordinates: [22.99850, 72.00488], // From campus map x=730, y=200
            type: "utility",
            description: "Diesel generator and utilities area",
            facilities: ["Generator", "Maintenance"]
        },
        "Entry Gate": {
            coordinates: [22.99477, 72.00188], // From campus map x=350, y=710
            type: "entrance",
            description: "Main entry point to campus",
            facilities: ["Security Check", "Visitor Registration"]
        },
        "Exit Gate": {
            coordinates: [22.99527, 72.00293], // Moved up (increased latitude by 0.005)
            type: "entrance",
            description: "Secondary exit from campus",
            facilities: ["Security Check"]
        },
        "Faculty Apartment": {
            coordinates: [23.00003, 72.00357], // From campus map x=572.5, y=70
            type: "residential",
            description: "Faculty housing complex",
            units: 20,
            facilities: ["Apartments", "Parking", "Garden"]
        },
        "Flag Post": {
            coordinates: [22.99726, 72.00226], // From campus map x=397.5, y=407.5
            type: "landmark",
            description: "Central flag post and assembly area",
            facilities: ["Flag", "Assembly Ground"]
        },
        "Food Court": {
            coordinates: [23.00477, 72.00260], // Left side of Water Tank
            type: "food",
            description: "Multi-vendor food court",
            vendors: 8,
            facilities: ["Food Stalls", "Seating", "Outdoor Area"]
        },
        "Football Ground": {
            coordinates: [23.00600, 72.00022], // From campus map x=120, y=-724
            type: "sports",
            description: "Football field with track",
            facilities: ["Field", "Goal Posts", "Running Track"]
        },
        "Girls Hostel": {
            coordinates: [23.00564, 72.00579], // From campus map x=855, y=-292.5
            type: "residential",
            description: "Female student accommodation facility",
            capacity: 180,
            facilities: ["Rooms", "Common Area", "Mess", "Study Hall"]
        },
        "Guest House": {
            coordinates: [22.99896, 72.00067], // From campus map x=180, y=235
            type: "residential",
            description: "Accommodation for visitors and guests",
            rooms: 12,
            facilities: ["Rooms", "Reception", "Dining"]
        },
        "Gym": {
            coordinates: [23.00477, 72.00260], // Left side of Water Tank
            type: "sports",
            description: "Fitness center and gymnasium",
            facilities: ["Equipment", "Changing Rooms", "Trainer"]
        },
        "Library": {
            coordinates: [22.99738, 72.00232], // Same as Block A
            type: "academic",
            description: "Central library with extensive collection",
            floors: 3,
            capacity: 200,
            facilities: ["Books", "Digital Resources", "Study Areas", "Computer Lab"]
        },
        "Main Gate": {
            coordinates: [22.99714, 72.00252], // From campus map x=430, y=442.5
            type: "entrance",
            description: "Primary entrance to university campus",
            facilities: ["Security Office", "Parking", "Information Desk"]
        },
        "Mart": {
            coordinates: [23.00564, 72.00579], // Same as Girls Hostel complex
            type: "commercial",
            description: "Campus convenience store",
            facilities: ["Groceries", "Stationery", "Snacks"]
        },
        "Medical Center": {
            coordinates: [22.99738, 72.00232], // Same as Library (central location)
            type: "healthcare",
            description: "Campus health clinic",
            facilities: ["Clinic", "First Aid", "Pharmacy"]
        },
        "Playing Ground": {
            coordinates: [22.99580, 72.00007], // From campus map x=100, y=480
            type: "sports",
            description: "Multi-purpose playing field",
            facilities: ["Open Field", "Equipment Storage"]
        },
        "Pottery Making Area": {
            coordinates: [22.99823, 71.99996], // From campus map x=90, y=280
            type: "creative",
            description: "Arts and crafts workshop area",
            facilities: ["Pottery Wheels", "Kilns", "Studio Space"]
        },
        "Security Office": {
            coordinates: [22.99709, 72.00207], // From campus map x=370, y=445
            type: "security",
            description: "Campus security headquarters",
            facilities: ["Control Room", "Lost & Found", "Emergency Response"]
        },
        "Student Center": {
            coordinates: [22.99738, 72.00232], // Same as Library (central location)
            type: "student services",
            description: "Hub for student activities and services",
            facilities: ["Meeting Rooms", "Study Areas", "Recreation"]
        },
        "Tennis Court": {
            coordinates: [23.00674, 72.00444], // From campus map x=580, y=-950
            type: "sports",
            description: "Tennis court facility",
            courts: 2,
            facilities: ["Courts", "Net", "Seating"]
        },
        "Volleyball Court": {
            coordinates: [23.00717, 72.00466], // From campus map x=610, y=-1010
            type: "sports",
            description: "Beach volleyball court",
            facilities: ["Court", "Net", "Sand"]
        },
        "Water Treatment Area": {
            coordinates: [23.00392, 72.00499], // From campus map x=765, y=-135
            type: "utility",
            description: "Water treatment and storage facility",
            facilities: ["Treatment Plant", "Storage Tanks"]
        },
        "Water Tank": {
            coordinates: [23.00477, 72.00330], // Moved down (decreased latitude by 0.005)
            type: "utility",
            description: "Water storage facility",
            facilities: ["Storage Tanks", "Distribution"]
        }
    },
    
    // Campus connections (edges) with distances in meters
    connections: [
        {from: "Admin Office", to: "Block A", distance: 130},
        {from: "Admin Office", to: "Security Office", distance: 150},
        {from: "Auditorium", to: "Main Gate", distance: 160},
        {from: "Auditorium", to: "Flag Post", distance: 120},
        {from: "Badminton Court", to: "Gym", distance: 90},
        {from: "Badminton Court", to: "Boys Hostel", distance: 110},
        {from: "Basketball Court", to: "Football Ground", distance: 85},
        {from: "Basketball Court", to: "Volleyball Court", distance: 70},
        {from: "Block A", to: "Main Gate", distance: 80},
        {from: "Block A", to: "Security Office", distance: 150},
        {from: "Block B", to: "Main Gate", distance: 120},
        {from: "Block B", to: "Student Center", distance: 90},
        {from: "Block B", to: "Food Court", distance: 140},
        {from: "Boys Hostel", to: "Water Treatment Area", distance: 110},
        {from: "Boys Hostel", to: "DG Yard", distance: 80},
        {from: "Boys Hostel", to: "Food Court", distance: 95},
        {from: "Canteen", to: "Library", distance: 80},
        {from: "Cricket Ground", to: "Girls Hostel", distance: 120},
        {from: "Cricket Ground", to: "Mart", distance: 100},
        {from: "DG Yard", to: "Water Treatment Area", distance: 90},
        {from: "DG Yard", to: "Pottery Making Area", distance: 85},
        {from: "Entry Gate", to: "Security Office", distance: 180},
        {from: "Entry Gate", to: "Playing Ground", distance: 95},
        {from: "Exit Gate", to: "Football Ground", distance: 140},
        {from: "Faculty Apartment", to: "Student Center", distance: 160},
        {from: "Faculty Apartment", to: "Water Treatment Area", distance: 120},
        {from: "Flag Post", to: "Student Center", distance: 110},
        {from: "Flag Post", to: "Security Office", distance: 150},
        {from: "Food Court", to: "Gym", distance: 75},
        {from: "Food Court", to: "Mart", distance: 160},
        {from: "Football Ground", to: "Volleyball Court", distance: 120},
        {from: "Football Ground", to: "Tennis Court", distance: 95},
        {from: "Girls Hostel", to: "Mart", distance: 180},
        {from: "Girls Hostel", to: "Exit Gate", distance: 220},
        {from: "Guest House", to: "Block B", distance: 170},
        {from: "Guest House", to: "Pottery Making Area", distance: 85},
        {from: "Gym", to: "Medical Center", distance: 140},
        {from: "Library", to: "Student Center", distance: 80},
        {from: "Library", to: "Main Gate", distance: 80},
        {from: "Main Gate", to: "Student Center", distance: 120},
        {from: "Main Gate", to: "Security Office", distance: 150},
        {from: "Main Gate", to: "Exit Gate", distance: 390},
        {from: "Mart", to: "Medical Center", distance: 95},
        {from: "Medical Center", to: "Water Treatment Area", distance: 85},
        {from: "Playing Ground", to: "Guest House", distance: 110},
        {from: "Pottery Making Area", to: "DG Yard", distance: 85},
        {from: "Student Center", to: "Flag Post", distance: 110},
        {from: "Tennis Court", to: "Medical Center", distance: 130},
        {from: "Volleyball Court", to: "Basketball Court", distance: 70}
    ],
    
    // Building categories for filtering and display
    categories: {
        "Academic": ["Block A", "Block B", "Library", "Auditorium"],
        "Residential": ["Boys Hostel", "Girls Hostel", "Faculty Apartment", "Guest House"],
        "Sports & Recreation": ["Gym", "Cricket Ground", "Football Ground", "Basketball Court", "Volleyball Court", "Tennis Court", "Badminton Court", "Playing Ground"],
        "Food & Dining": ["Canteen", "Food Court", "Mart"],
        "Administrative": ["Admin Office", "Security Office", "Main Gate", "Entry Gate", "Exit Gate"],
        "Student Services": ["Student Center", "Medical Center"],
        "Utilities": ["DG Yard", "Water Treatment Area", "Water Tank"],
        "Special Areas": ["Flag Post", "Pottery Making Area"]
    },
    
    // Location aliases for natural language processing
    aliases: {
        // Academic buildings
        "cs building": "Block A",
        "computer science": "Block A",
        "academic block 1": "Block A",
        "main academic building": "Block A",
        "academic block 2": "Block B",
        "second block": "Block B",
        "central library": "Library",
        "lib": "Library",
        "books": "Library",
        "main auditorium": "Auditorium",
        "assembly hall": "Auditorium",
        
        // Residential
        "boys dorm": "Boys Hostel",
        "male hostel": "Boys Hostel",
        "girls dorm": "Girls Hostel",
        "female hostel": "Girls Hostel",
        "faculty housing": "Faculty Apartment",
        "teacher quarters": "Faculty Apartment",
        "visitor accommodation": "Guest House",
        
        // Sports facilities
        "fitness center": "Gym",
        "workout": "Gym",
        "exercise": "Gym",
        "cricket field": "Cricket Ground",
        "football field": "Football Ground",
        "soccer field": "Football Ground",
        "basketball": "Basketball Court",
        "volleyball": "Volleyball Court",
        "tennis": "Tennis Court",
        "badminton": "Badminton Court",
        
        // Food and dining
        "dining hall": "Canteen",
        "mess": "Canteen",
        "cafeteria": "Canteen",
        "food court": "Food Court",
        "restaurants": "Food Court",
        "shop": "Mart",
        "store": "Mart",
        "grocery": "Mart",
        
        // Administrative and services
        "administration": "Admin Office",
        "admin": "Admin Office",
        "security": "Security Office",
        "main entrance": "Main Gate",
        "front gate": "Main Gate",
        "entrance": "Entry Gate",
        "exit": "Exit Gate",
        "back gate": "Exit Gate",
        "student services": "Student Center",
        "student hub": "Student Center",
        "clinic": "Medical Center",
        "health center": "Medical Center",
        "hospital": "Medical Center",
        "first aid": "Medical Center",
        
        // Utilities and special areas
        "generator": "DG Yard",
        "power": "DG Yard",
        "water plant": "Water Treatment Area",
        "water": "Water Treatment Area",
        "water tank": "Water Tank",
        "tank": "Water Tank",
        "flag": "Flag Post",
        "assembly": "Flag Post",
        "pottery": "Pottery Making Area",
        "arts": "Pottery Making Area",
        "crafts": "Pottery Making Area"
    },
    
    // Map styling and markers
    mapStyles: {
        academic: {
            color: '#3498db',
            icon: 'graduation-cap'
        },
        residential: {
            color: '#e74c3c',
            icon: 'home'
        },
        sports: {
            color: '#27ae60',
            icon: 'dumbbell'
        },
        food: {
            color: '#f39c12',
            icon: 'utensils'
        },
        administrative: {
            color: '#9b59b6',
            icon: 'building'
        },
        'student services': {
            color: '#1abc9c',
            icon: 'users'
        },
        healthcare: {
            color: '#e67e22',
            icon: 'heartbeat'
        },
        utility: {
            color: '#95a5a6',
            icon: 'cog'
        },
        creative: {
            color: '#f1c40f',
            icon: 'palette'
        },
        security: {
            color: '#34495e',
            icon: 'shield-alt'
        },
        entrance: {
            color: '#8e44ad',
            icon: 'door-open'
        },
        landmark: {
            color: '#e74c3c',
            icon: 'flag'
        },
        commercial: {
            color: '#16a085',
            icon: 'shopping-bag'
        }
    },
    
    // Default map settings
    defaultSettings: {
        showAllMarkers: true,
        showConnections: false,
        pathColor: '#667eea',
        pathWeight: 4,
        pathOpacity: 0.8,
        markerSize: 25,
        animateMarkers: true,
        clustersEnabled: false
    },
    
    // Helper functions
    utils: {
        // Get building by name (case insensitive)
        getBuildingByName: function(name) {
            const normalizedName = name.toLowerCase().trim();
            
            // Check exact match first
            for (const building in CampusData.buildings) {
                if (building.toLowerCase() === normalizedName) {
                    return {
                        name: building,
                        data: CampusData.buildings[building]
                    };
                }
            }
            
            // Check aliases
            for (const alias in CampusData.aliases) {
                if (alias.toLowerCase() === normalizedName) {
                    const buildingName = CampusData.aliases[alias];
                    return {
                        name: buildingName,
                        data: CampusData.buildings[buildingName]
                    };
                }
            }
            
            return null;
        },
        
        // Get all building names
        getAllBuildingNames: function() {
            return Object.keys(CampusData.buildings).sort();
        },
        
        // Get buildings by category
        getBuildingsByCategory: function(category) {
            return CampusData.categories[category] || [];
        },
        
        // Get connection between two buildings
        getConnection: function(building1, building2) {
            return CampusData.connections.find(conn => 
                (conn.from === building1 && conn.to === building2) ||
                (conn.from === building2 && conn.to === building1)
            );
        },
        
        // Get all connections for a building
        getBuildingConnections: function(buildingName) {
            return CampusData.connections.filter(conn => 
                conn.from === buildingName || conn.to === buildingName
            );
        },
        
        // Calculate distance between two coordinates
        calculateDistance: function(coord1, coord2) {
            const R = 6371000; // Earth's radius in meters
            const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
            const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        },
        
        // Format distance for display
        formatDistance: function(meters) {
            if (meters < 1000) {
                return Math.round(meters) + " m";
            } else {
                return (meters / 1000).toFixed(1) + " km";
            }
        },
        
        // Calculate walking time
        calculateWalkingTime: function(distanceMeters, walkingSpeedMPS = 1.4) {
            const timeSeconds = distanceMeters / walkingSpeedMPS;
            const minutes = Math.floor(timeSeconds / 60);
            const seconds = Math.round(timeSeconds % 60);
            
            if (minutes === 0) {
                return `${seconds}s`;
            } else if (seconds === 0) {
                return `${minutes}m`;
            } else {
                return `${minutes}m ${seconds}s`;
            }
        },
        
        // Get building style by type
        getBuildingStyle: function(building) {
            const buildingData = CampusData.buildings[building];
            if (!buildingData) return CampusData.mapStyles.academic;
            
            const type = buildingData.type;
            return CampusData.mapStyles[type] || CampusData.mapStyles.academic;
        },
        
        // Search buildings by partial name
        searchBuildings: function(query) {
            const normalizedQuery = query.toLowerCase().trim();
            const results = [];
            
            // Direct name matches
            for (const building in CampusData.buildings) {
                if (building.toLowerCase().includes(normalizedQuery)) {
                    results.push({
                        name: building,
                        type: 'direct',
                        score: 1
                    });
                }
            }
            
            // Alias matches
            for (const alias in CampusData.aliases) {
                if (alias.toLowerCase().includes(normalizedQuery)) {
                    const buildingName = CampusData.aliases[alias];
                    if (!results.find(r => r.name === buildingName)) {
                        results.push({
                            name: buildingName,
                            type: 'alias',
                            score: 0.8
                        });
                    }
                }
            }
            
            // Sort by score and name
            return results.sort((a, b) => {
                if (a.score !== b.score) return b.score - a.score;
                return a.name.localeCompare(b.name);
            });
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampusData;
}