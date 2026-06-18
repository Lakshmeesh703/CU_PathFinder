// Pathfinding Module for CU PathFinder Frontend
// Handles all pathfinding operations and backend communication

class PathfindingEngine {
    constructor() {
        this.baseURL = 'http://localhost:5000'; // Flask backend URL
        this.isOnline = false;
        this.fallbackMode = true; // Use client-side algorithms when backend unavailable
        this.lastResult = null;
        this.algorithm = 'A*'; // Fixed to A* only
        
        // Initialize connection to backend
        this.checkBackendConnection();
    }
    
    // Check if backend is available
    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                timeout: 3000
            });
            
            if (response.ok) {
                this.isOnline = true;
                console.log('✅ Backend connection established');
                return true;
            }
        } catch (error) {
            console.log('⚠️  Backend unavailable, using fallback mode');
            this.isOnline = false;
        }
        return false;
    }
    
    // Main pathfinding function
    async findPath(startLocation, endLocation, stops = []) {
        // Validate inputs
        if (!startLocation || !endLocation) {
            throw new Error('Start and end locations are required');
        }
        
        // Normalize location names
        const start = this.normalizeLocationName(startLocation);
        const end = this.normalizeLocationName(endLocation);
        
        if (!start || !end) {
            throw new Error('Invalid location names provided');
        }
        
        // Prepare request data
        const requestData = {
            start: start,
            end: end,
            algorithm: 'A*', // Fixed to A* algorithm
            stops: stops.map(stop => this.normalizeLocationName(stop)).filter(Boolean)
        };
        
        try {
            let result;
            
            if (this.isOnline) {
                // Try backend first
                result = await this.findPathOnline(requestData);
            } else {
                // Use fallback client-side algorithm
                result = await this.findPathOffline(requestData);
            }
            
            this.lastResult = result;
            return result;
            
        } catch (error) {
            console.error('Pathfinding error:', error);
            
            // If online fails, try offline
            if (this.isOnline) {
                console.log('Backend failed, falling back to client-side algorithm');
                return await this.findPathOffline(requestData);
            }
            
            throw error;
        }
    }
    
    // Backend pathfinding
    async findPathOnline(requestData) {
        const response = await fetch(`${this.baseURL}/api/pathfind`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
            success: true,
            algorithm: data.algorithm,
            path: data.path,
            distance: data.distance,
            walkingTime: data.walkingTime || CampusData.utils.calculateWalkingTime(data.distance),
            executionTime: data.executionTime,
            nodesExplored: data.nodesExplored,
            isOptimal: data.isOptimal,
            steps: data.steps || this.generateSteps(data.path),
            coordinates: this.getPathCoordinates(data.path),
            source: 'backend'
        };
    }
    
    // Client-side fallback pathfinding using UCS
    async findPathOffline(requestData) {
        const { start, end, algorithm } = requestData;
        
        // Build graph from campus data
        const graph = this.buildGraph();
        
        // Select algorithm (default to UCS for offline mode)
        let pathResult;
        switch (algorithm) {
            case 'BFS':
                pathResult = this.breadthFirstSearch(graph, start, end);
                break;
            case 'DFS':
                pathResult = this.depthFirstSearch(graph, start, end);
                break;
            case 'A*':
                pathResult = this.aStarSearch(graph, start, end);
                break;
            case 'UCS':
            default:
                pathResult = this.uniformCostSearch(graph, start, end);
                break;
        }
        
        if (!pathResult.path) {
            throw new Error(`No path found from ${start} to ${end}`);
        }
        
        return {
            success: true,
            algorithm: algorithm,
            path: pathResult.path,
            distance: pathResult.distance,
            walkingTime: CampusData.utils.calculateWalkingTime(pathResult.distance),
            executionTime: pathResult.executionTime,
            nodesExplored: pathResult.nodesExplored,
            isOptimal: algorithm === 'UCS' || algorithm === 'A*',
            steps: this.generateSteps(pathResult.path),
            coordinates: this.getPathCoordinates(pathResult.path),
            source: 'client'
        };
    }
    
    // Compare all algorithms
    async compareAlgorithms(startLocation, endLocation) {
        const start = this.normalizeLocationName(startLocation);
        const end = this.normalizeLocationName(endLocation);
        
        if (!start || !end) {
            throw new Error('Invalid location names provided');
        }
        
        const results = [];
        const algorithms = ['BFS', 'DFS', 'UCS', 'A*'];
        
        for (const algorithm of algorithms) {
            try {
                const result = await this.findPath(start, end, algorithm);
                results.push({
                    algorithm: algorithm,
                    distance: result.distance,
                    nodesExplored: result.nodesExplored,
                    executionTime: result.executionTime,
                    isOptimal: result.isOptimal,
                    path: result.path
                });
            } catch (error) {
                results.push({
                    algorithm: algorithm,
                    error: error.message,
                    distance: null,
                    nodesExplored: null,
                    executionTime: null,
                    isOptimal: false
                });
            }
        }
        
        return results;
    }
    
    // Build graph from campus data
    buildGraph() {
        const graph = {};
        
        // Initialize nodes
        for (const building of Object.keys(CampusData.buildings)) {
            graph[building] = {};
        }
        
        // Add edges
        for (const connection of CampusData.connections) {
            graph[connection.from][connection.to] = connection.distance;
            graph[connection.to][connection.from] = connection.distance;
        }
        
        return graph;
    }
    
    // Uniform Cost Search (Dijkstra's Algorithm)
    uniformCostSearch(graph, start, end) {
        const startTime = performance.now();
        
        const distances = {};
        const previous = {};
        const visited = new Set();
        const queue = [{node: start, cost: 0}];
        let nodesExplored = 0;
        
        // Initialize distances
        for (const node of Object.keys(graph)) {
            distances[node] = Infinity;
        }
        distances[start] = 0;
        
        while (queue.length > 0) {
            // Sort queue by cost (min-heap simulation)
            queue.sort((a, b) => a.cost - b.cost);
            const current = queue.shift();
            
            if (visited.has(current.node)) continue;
            
            visited.add(current.node);
            nodesExplored++;
            
            if (current.node === end) {
                break;
            }
            
            // Explore neighbors
            for (const neighbor of Object.keys(graph[current.node])) {
                if (visited.has(neighbor)) continue;
                
                const newCost = distances[current.node] + graph[current.node][neighbor];
                
                if (newCost < distances[neighbor]) {
                    distances[neighbor] = newCost;
                    previous[neighbor] = current.node;
                    queue.push({node: neighbor, cost: newCost});
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== undefined) {
            path.unshift(current);
            current = previous[current];
        }
        
        const executionTime = (performance.now() - startTime).toFixed(2);
        
        return {
            path: path.length > 1 ? path : null,
            distance: distances[end] === Infinity ? null : distances[end],
            nodesExplored: nodesExplored,
            executionTime: parseFloat(executionTime)
        };
    }
    
    // Breadth-First Search
    breadthFirstSearch(graph, start, end) {
        const startTime = performance.now();
        
        const queue = [start];
        const visited = new Set([start]);
        const previous = {};
        let nodesExplored = 0;
        
        while (queue.length > 0) {
            const current = queue.shift();
            nodesExplored++;
            
            if (current === end) {
                break;
            }
            
            for (const neighbor of Object.keys(graph[current])) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    previous[neighbor] = current;
                    queue.push(neighbor);
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== undefined) {
            path.unshift(current);
            current = previous[current];
        }
        
        // Calculate distance
        let distance = 0;
        if (path.length > 1) {
            for (let i = 0; i < path.length - 1; i++) {
                distance += graph[path[i]][path[i + 1]] || 0;
            }
        }
        
        const executionTime = (performance.now() - startTime).toFixed(2);
        
        return {
            path: path.length > 1 ? path : null,
            distance: path.length > 1 ? distance : null,
            nodesExplored: nodesExplored,
            executionTime: parseFloat(executionTime)
        };
    }
    
    // Depth-First Search
    depthFirstSearch(graph, start, end) {
        const startTime = performance.now();
        
        const stack = [start];
        const visited = new Set();
        const previous = {};
        let nodesExplored = 0;
        
        while (stack.length > 0) {
            const current = stack.pop();
            
            if (visited.has(current)) continue;
            
            visited.add(current);
            nodesExplored++;
            
            if (current === end) {
                break;
            }
            
            const neighbors = Object.keys(graph[current]).reverse(); // Reverse for consistent ordering
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    previous[neighbor] = current;
                    stack.push(neighbor);
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== undefined) {
            path.unshift(current);
            current = previous[current];
        }
        
        // Calculate distance
        let distance = 0;
        if (path.length > 1) {
            for (let i = 0; i < path.length - 1; i++) {
                distance += graph[path[i]][path[i + 1]] || 0;
            }
        }
        
        const executionTime = (performance.now() - startTime).toFixed(2);
        
        return {
            path: path.length > 1 ? path : null,
            distance: path.length > 1 ? distance : null,
            nodesExplored: nodesExplored,
            executionTime: parseFloat(executionTime)
        };
    }
    
    // A* Search
    aStarSearch(graph, start, end) {
        const startTime = performance.now();
        
        const openSet = [{node: start, g: 0, f: this.heuristic(start, end)}];
        const closedSet = new Set();
        const gScore = {[start]: 0};
        const previous = {};
        let nodesExplored = 0;
        
        while (openSet.length > 0) {
            // Sort by f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            if (closedSet.has(current.node)) continue;
            
            closedSet.add(current.node);
            nodesExplored++;
            
            if (current.node === end) {
                break;
            }
            
            for (const neighbor of Object.keys(graph[current.node])) {
                if (closedSet.has(neighbor)) continue;
                
                const tentativeG = gScore[current.node] + graph[current.node][neighbor];
                
                if (tentativeG < (gScore[neighbor] || Infinity)) {
                    previous[neighbor] = current.node;
                    gScore[neighbor] = tentativeG;
                    const f = tentativeG + this.heuristic(neighbor, end);
                    openSet.push({node: neighbor, g: tentativeG, f: f});
                }
            }
        }
        
        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== undefined) {
            path.unshift(current);
            current = previous[current];
        }
        
        const executionTime = (performance.now() - startTime).toFixed(2);
        
        return {
            path: path.length > 1 ? path : null,
            distance: gScore[end] || null,
            nodesExplored: nodesExplored,
            executionTime: parseFloat(executionTime)
        };
    }
    
    // Heuristic function for A* (Euclidean distance)
    heuristic(node1, node2) {
        const building1 = CampusData.buildings[node1];
        const building2 = CampusData.buildings[node2];
        
        if (!building1 || !building2) return 0;
        
        return CampusData.utils.calculateDistance(
            building1.coordinates,
            building2.coordinates
        );
    }
    
    // Normalize location name using campus data
    normalizeLocationName(locationName) {
        if (!locationName) return null;
        
        const building = CampusData.utils.getBuildingByName(locationName);
        return building ? building.name : null;
    }
    
    // Generate step-by-step directions
    generateSteps(path) {
        if (!path || path.length < 2) return [];
        
        const steps = [];
        
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const connection = CampusData.utils.getConnection(from, to);
            const distance = connection ? connection.distance : 0;
            
            steps.push({
                step: i + 1,
                from: from,
                to: to,
                instruction: `Walk from ${from} to ${to}`,
                distance: distance,
                formattedDistance: CampusData.utils.formatDistance(distance),
                walkingTime: CampusData.utils.calculateWalkingTime(distance)
            });
        }
        
        return steps;
    }
    
    // Get coordinates for path visualization
    getPathCoordinates(path) {
        if (!path) return [];
        
        return path.map(building => {
            const buildingData = CampusData.buildings[building];
            return buildingData ? buildingData.coordinates : null;
        }).filter(Boolean);
    }
    
    // Get available locations
    getAvailableLocations() {
        return CampusData.utils.getAllBuildingNames();
    }
    
    // Search locations
    searchLocations(query) {
        return CampusData.utils.searchBuildings(query);
    }
    
    // Get location details
    getLocationDetails(locationName) {
        const building = CampusData.utils.getBuildingByName(locationName);
        if (!building) return null;
        
        return {
            name: building.name,
            ...building.data,
            connections: CampusData.utils.getBuildingConnections(building.name),
            style: CampusData.utils.getBuildingStyle(building.name)
        };
    }
}

// Export the pathfinding engine
const pathfindingEngine = new PathfindingEngine();