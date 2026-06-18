from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import heapq
import json
import os
import sys
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Campus data structure (matching frontend)
CAMPUS_BUILDINGS = {
    "Library": {"lat": 40.0150, "lng": -105.2705, "type": "academic"},
    "Engineering Center": {"lat": 40.0068, "lng": -105.2645, "type": "academic"},
    "Student Center": {"lat": 40.0107, "lng": -105.2776, "type": "student_services"},
    "Rec Center": {"lat": 40.0100, "lng": -105.2700, "type": "recreation"},
    "UMC": {"lat": 40.0107, "lng": -105.2776, "type": "student_services"},
    "CASE": {"lat": 40.0068, "lng": -105.2645, "type": "academic"},
    "ATLAS": {"lat": 40.0120, "lng": -105.2720, "type": "technology"},
    "C4C": {"lat": 40.0107, "lng": -105.2776, "type": "dining"},
    "Folsom Field": {"lat": 40.0100, "lng": -105.2650, "type": "athletics"},
    "CEC": {"lat": 40.0070, "lng": -105.2660, "type": "events"},
    "Boulder Creek": {"lat": 40.0140, "lng": -105.2750, "type": "nature"},
    "Main Campus": {"lat": 40.0100, "lng": -105.2700, "type": "general"},
    "East Campus": {"lat": 40.0080, "lng": -105.2600, "type": "general"},
    "West Campus": {"lat": 40.0120, "lng": -105.2800, "type": "general"},
    "North Campus": {"lat": 40.0150, "lng": -105.2700, "type": "general"},
    "South Campus": {"lat": 40.0070, "lng": -105.2700, "type": "general"},
    "Math Building": {"lat": 40.0080, "lng": -105.2720, "type": "academic"},
    "Physics Building": {"lat": 40.0090, "lng": -105.2680, "type": "academic"},
    "Chemistry Building": {"lat": 40.0085, "lng": -105.2690, "type": "academic"},
    "Business School": {"lat": 40.0110, "lng": -105.2730, "type": "academic"},
    "Law School": {"lat": 40.0130, "lng": -105.2740, "type": "academic"},
    "Medical Center": {"lat": 40.0120, "lng": -105.2790, "type": "health"},
    "Parking Garage": {"lat": 40.0090, "lng": -105.2750, "type": "parking"},
    "Bookstore": {"lat": 40.0105, "lng": -105.2770, "type": "services"},
    "Health Center": {"lat": 40.0110, "lng": -105.2780, "type": "health"},
    "Career Services": {"lat": 40.0100, "lng": -105.2760, "type": "student_services"},
    "Financial Aid": {"lat": 40.0095, "lng": -105.2765, "type": "student_services"},
    "Admissions": {"lat": 40.0120, "lng": -105.2750, "type": "administrative"},
    "Registrar": {"lat": 40.0115, "lng": -105.2755, "type": "administrative"},
    "IT Services": {"lat": 40.0085, "lng": -105.2745, "type": "technology"},
    "Sports Complex": {"lat": 40.0095, "lng": -105.2620, "type": "athletics"},
    "Auditorium": {"lat": 40.0110, "lng": -105.2735, "type": "events"},
    "Food Court": {"lat": 40.0105, "lng": -105.2775, "type": "dining"}
}

# Campus connections (edges for graph)
CAMPUS_CONNECTIONS = [
    ("Library", "Engineering Center", 0.8),
    ("Library", "Student Center", 0.6),
    ("Library", "ATLAS", 0.4),
    ("Engineering Center", "CASE", 0.2),
    ("Engineering Center", "Physics Building", 0.3),
    ("Student Center", "UMC", 0.1),
    ("Student Center", "C4C", 0.1),
    ("Student Center", "Bookstore", 0.2),
    ("Rec Center", "Library", 0.5),
    ("Rec Center", "Student Center", 0.4),
    ("ATLAS", "Library", 0.4),
    ("ATLAS", "Math Building", 0.3),
    ("Folsom Field", "Engineering Center", 0.7),
    ("Folsom Field", "South Campus", 0.4),
    ("CEC", "Engineering Center", 0.3),
    ("CEC", "Folsom Field", 0.5),
    ("Boulder Creek", "Library", 0.8),
    ("Boulder Creek", "West Campus", 0.6),
    ("Main Campus", "Library", 0.3),
    ("Main Campus", "Student Center", 0.3),
    ("Main Campus", "Rec Center", 0.4),
    ("East Campus", "Engineering Center", 0.5),
    ("East Campus", "Folsom Field", 0.6),
    ("West Campus", "Student Center", 0.7),
    ("West Campus", "Boulder Creek", 0.6),
    ("North Campus", "Library", 0.5),
    ("North Campus", "Boulder Creek", 0.4),
    ("South Campus", "Engineering Center", 0.6),
    ("South Campus", "Folsom Field", 0.4),
    ("Math Building", "Physics Building", 0.2),
    ("Math Building", "Chemistry Building", 0.3),
    ("Physics Building", "Chemistry Building", 0.2),
    ("Physics Building", "Engineering Center", 0.3),
    ("Chemistry Building", "Library", 0.4),
    ("Business School", "Student Center", 0.3),
    ("Business School", "Library", 0.4),
    ("Law School", "Business School", 0.2),
    ("Law School", "Library", 0.5),
    ("Medical Center", "Health Center", 0.2),
    ("Medical Center", "West Campus", 0.4),
    ("Parking Garage", "Student Center", 0.3),
    ("Parking Garage", "Rec Center", 0.3),
    ("Health Center", "Student Center", 0.4),
    ("Health Center", "Career Services", 0.2),
    ("Career Services", "Student Center", 0.2),
    ("Career Services", "Financial Aid", 0.1),
    ("Financial Aid", "Student Center", 0.3),
    ("Financial Aid", "Registrar", 0.2),
    ("Admissions", "Library", 0.4),
    ("Admissions", "Registrar", 0.1),
    ("Registrar", "Student Center", 0.3),
    ("IT Services", "Engineering Center", 0.4),
    ("IT Services", "ATLAS", 0.3),
    ("Sports Complex", "Folsom Field", 0.2),
    ("Sports Complex", "Rec Center", 0.3),
    ("Auditorium", "Student Center", 0.2),
    ("Food Court", "C4C", 0.1),
    ("Food Court", "Student Center", 0.2)
]

def build_graph():
    """Build adjacency graph from connections"""
    graph = {}
    
    # Initialize all buildings
    for building in CAMPUS_BUILDINGS:
        graph[building] = []
    
    # Add connections (bidirectional)
    for source, dest, distance in CAMPUS_CONNECTIONS:
        if source in graph and dest in graph:
            graph[source].append((dest, distance))
            graph[dest].append((source, distance))
    
    return graph

def calculate_distance(building1, building2):
    """Calculate Euclidean distance between two buildings"""
    if building1 not in CAMPUS_BUILDINGS or building2 not in CAMPUS_BUILDINGS:
        return float('inf')
    
    b1 = CAMPUS_BUILDINGS[building1]
    b2 = CAMPUS_BUILDINGS[building2]
    
    # Simple distance calculation (in km, roughly)
    lat_diff = (b1['lat'] - b2['lat']) * 111.0  # 1 degree lat ≈ 111 km
    lng_diff = (b1['lng'] - b2['lng']) * 85.0   # 1 degree lng ≈ 85 km at this latitude
    
    return (lat_diff**2 + lng_diff**2)**0.5

def bfs_pathfinding(graph, start, goal):
    """Breadth-First Search pathfinding"""
    if start == goal:
        return [start], 0, ['Start and destination are the same']
    
    queue = [(start, [start], 0)]
    visited = {start}
    steps = [f"Starting BFS from {start}"]
    
    while queue:
        current, path, cost = queue.pop(0)
        steps.append(f"Exploring {current}")
        
        for neighbor, distance in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                new_path = path + [neighbor]
                new_cost = cost + distance
                
                if neighbor == goal:
                    steps.append(f"Found destination {goal}")
                    return new_path, new_cost, steps
                
                queue.append((neighbor, new_path, new_cost))
                steps.append(f"Added {neighbor} to queue")
    
    steps.append("No path found")
    return None, float('inf'), steps

def dfs_pathfinding(graph, start, goal):
    """Depth-First Search pathfinding"""
    if start == goal:
        return [start], 0, ['Start and destination are the same']
    
    stack = [(start, [start], 0)]
    visited = set()
    steps = [f"Starting DFS from {start}"]
    
    while stack:
        current, path, cost = stack.pop()
        
        if current in visited:
            continue
            
        visited.add(current)
        steps.append(f"Visiting {current}")
        
        if current == goal:
            steps.append(f"Found destination {goal}")
            return path, cost, steps
        
        for neighbor, distance in graph.get(current, []):
            if neighbor not in visited:
                stack.append((neighbor, path + [neighbor], cost + distance))
                steps.append(f"Added {neighbor} to stack")
    
    steps.append("No path found")
    return None, float('inf'), steps

def ucs_pathfinding(graph, start, goal):
    """Uniform Cost Search pathfinding"""
    if start == goal:
        return [start], 0, ['Start and destination are the same']
    
    priority_queue = [(0, start, [start])]
    visited = set()
    steps = [f"Starting UCS from {start}"]
    
    while priority_queue:
        cost, current, path = heapq.heappop(priority_queue)
        
        if current in visited:
            continue
            
        visited.add(current)
        steps.append(f"Visiting {current} with cost {cost:.2f}")
        
        if current == goal:
            steps.append(f"Found optimal path to {goal} with cost {cost:.2f}")
            return path, cost, steps
        
        for neighbor, distance in graph.get(current, []):
            if neighbor not in visited:
                new_cost = cost + distance
                new_path = path + [neighbor]
                heapq.heappush(priority_queue, (new_cost, neighbor, new_path))
                steps.append(f"Added {neighbor} to queue with cost {new_cost:.2f}")
    
    steps.append("No path found")
    return None, float('inf'), steps

def a_star_pathfinding(graph, start, goal):
    """A* Search pathfinding"""
    if start == goal:
        return [start], 0, ['Start and destination are the same']
    
    def heuristic(node):
        return calculate_distance(node, goal)
    
    priority_queue = [(heuristic(start), 0, start, [start])]
    visited = set()
    steps = [f"Starting A* from {start} to {goal}"]
    
    while priority_queue:
        f_cost, g_cost, current, path = heapq.heappop(priority_queue)
        
        if current in visited:
            continue
            
        visited.add(current)
        h_cost = f_cost - g_cost
        steps.append(f"Visiting {current}: g={g_cost:.2f}, h={h_cost:.2f}, f={f_cost:.2f}")
        
        if current == goal:
            steps.append(f"Found optimal path to {goal} with cost {g_cost:.2f}")
            return path, g_cost, steps
        
        for neighbor, distance in graph.get(current, []):
            if neighbor not in visited:
                new_g_cost = g_cost + distance
                new_h_cost = heuristic(neighbor)
                new_f_cost = new_g_cost + new_h_cost
                new_path = path + [neighbor]
                heapq.heappush(priority_queue, (new_f_cost, new_g_cost, neighbor, new_path))
                steps.append(f"Added {neighbor}: g={new_g_cost:.2f}, h={new_h_cost:.2f}, f={new_f_cost:.2f}")
    
    steps.append("No path found")
    return None, float('inf'), steps

# Build the campus graph
campus_graph = build_graph()

# Algorithm mapping
ALGORITHMS = {
    'BFS': bfs_pathfinding,
    'DFS': dfs_pathfinding,
    'UCS': ucs_pathfinding,
    'A*': a_star_pathfinding
}

@app.route('/')
def serve_index():
    """Serve the main HTML file"""
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files from frontend directory"""
    try:
        return send_from_directory('../frontend', filename)
    except:
        return "File not found", 404

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'message': 'CU PathFinder API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/buildings')
def get_buildings():
    """Get all available buildings"""
    buildings = []
    for name, data in CAMPUS_BUILDINGS.items():
        buildings.append({
            'name': name,
            'lat': data['lat'],
            'lng': data['lng'],
            'type': data['type']
        })
    
    return jsonify({
        'buildings': buildings,
        'count': len(buildings)
    })

@app.route('/api/pathfind', methods=['POST'])
def find_path():
    """Find path between two buildings using A* algorithm"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        start = data.get('start')
        end = data.get('end')
        algorithm = 'A*'  # Fixed to A* algorithm only
        
        # Validate inputs
        if not start or not end:
            return jsonify({'error': 'Start and end locations are required'}), 400
        
        if start not in CAMPUS_BUILDINGS:
            return jsonify({'error': f'Unknown start location: {start}'}), 400
        
        if end not in CAMPUS_BUILDINGS:
            return jsonify({'error': f'Unknown end location: {end}'}), 400
        
        # Find path using A* algorithm only
        logger.info(f"Finding path from {start} to {end} using A* algorithm")
        
        path_func = ALGORITHMS['A*']
        path, cost, steps = path_func(campus_graph, start, end)
        
        if path is None:
            return jsonify({
                'success': False,
                'error': 'No path found',
                'steps': steps
            }), 404
        
        # Calculate additional metrics
        walking_speed_kmh = 5.0  # Average walking speed
        walking_time_hours = cost / walking_speed_kmh
        walking_time_minutes = walking_time_hours * 60
        
        # Get coordinates for path
        coordinates = []
        for building in path:
            if building in CAMPUS_BUILDINGS:
                building_data = CAMPUS_BUILDINGS[building]
                coordinates.append([building_data['lat'], building_data['lng']])
        
        response = {
            'success': True,
            'path': path,
            'cost': round(cost, 3),
            'distance_km': round(cost, 3),
            'walking_time_minutes': round(walking_time_minutes, 1),
            'num_stops': len(path) - 2,  # Excluding start and end
            'algorithm': algorithm,
            'coordinates': coordinates,
            'steps': steps,
            'start': start,
            'end': end,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Path found: {' -> '.join(path)} (Cost: {cost:.3f}km, Time: {walking_time_minutes:.1f}min)")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in pathfinding: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/compare', methods=['POST'])
def compare_algorithms():
    """Compare multiple algorithms for the same path"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        start = data.get('start')
        end = data.get('end')
        algorithms = data.get('algorithms', ['BFS', 'DFS', 'UCS', 'A*'])
        
        # Validate inputs
        if not start or not end:
            return jsonify({'error': 'Start and end locations are required'}), 400
        
        if start not in CAMPUS_BUILDINGS:
            return jsonify({'error': f'Unknown start location: {start}'}), 400
        
        if end not in CAMPUS_BUILDINGS:
            return jsonify({'error': f'Unknown end location: {end}'}), 400
        
        results = {}
        
        for algorithm in algorithms:
            if algorithm in ALGORITHMS:
                logger.info(f"Running {algorithm} for comparison")
                
                path_func = ALGORITHMS[algorithm]
                path, cost, steps = path_func(campus_graph, start, end)
                
                if path is not None:
                    walking_speed_kmh = 5.0
                    walking_time_hours = cost / walking_speed_kmh
                    walking_time_minutes = walking_time_hours * 60
                    
                    results[algorithm] = {
                        'path': path,
                        'cost': round(cost, 3),
                        'distance_km': round(cost, 3),
                        'walking_time_minutes': round(walking_time_minutes, 1),
                        'num_stops': len(path) - 2,
                        'steps_count': len(steps),
                        'found': True
                    }
                else:
                    results[algorithm] = {
                        'path': None,
                        'cost': float('inf'),
                        'distance_km': float('inf'),
                        'walking_time_minutes': float('inf'),
                        'num_stops': 0,
                        'steps_count': len(steps),
                        'found': False
                    }
        
        response = {
            'success': True,
            'start': start,
            'end': end,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in algorithm comparison: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/building/<building_name>')
def get_building_info(building_name):
    """Get information about a specific building"""
    if building_name not in CAMPUS_BUILDINGS:
        return jsonify({'error': f'Building not found: {building_name}'}), 404
    
    building_data = CAMPUS_BUILDINGS[building_name]
    
    # Find connected buildings
    connections = []
    for neighbor, distance in campus_graph.get(building_name, []):
        connections.append({
            'building': neighbor,
            'distance_km': round(distance, 3),
            'walking_time_minutes': round(distance / 5.0 * 60, 1)
        })
    
    response = {
        'name': building_name,
        'coordinates': {
            'lat': building_data['lat'],
            'lng': building_data['lng']
        },
        'type': building_data['type'],
        'connections': connections,
        'connection_count': len(connections)
    }
    
    return jsonify(response)

@app.route('/api/chatbot', methods=['POST'])
def chatbot_query():
    """Process chatbot queries with simple pattern matching"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        logger.info(f"Processing chatbot query: {user_message}")
        
        # Simple pattern matching for pathfinding queries
        message_lower = user_message.lower()
        
        # Building mapping for easier recognition
        building_keywords = {
            'library': 'Library',
            'engineering center': 'Engineering Center',
            'engineering': 'Engineering Center',
            'student center': 'Student Center', 
            'canteen': 'C4C',
            'food court': 'Food Court',
            'c4c': 'C4C',
            'gym': 'Rec Center',
            'rec center': 'Rec Center',
            'recreation': 'Rec Center',
            'medical center': 'Medical Center',
            'bookstore': 'Bookstore',
            'parking': 'Parking Garage',
            'sports complex': 'Sports Complex',
            'sports': 'Sports Complex',
            'auditorium': 'Auditorium'
        }
        
        # Check for "where is" queries or "tell me about" queries
        if 'where is' in message_lower or 'tell me about' in message_lower:
            for keyword, building_name in building_keywords.items():
                if keyword in message_lower and building_name in CAMPUS_BUILDINGS:
                    building_data = CAMPUS_BUILDINGS[building_name]
                    
                    response_text = f"📍 **{building_name}**\n\n"
                    response_text += f"**Type:** {building_data['type'].title()}\n"
                    response_text += f"**Coordinates:** {building_data['lat']:.4f}, {building_data['lng']:.4f}\n\n"
                    
                    # Find connections
                    connections = []
                    for neighbor, distance in campus_graph.get(building_name, []):
                        connections.append(f"• {neighbor} ({round(distance * 1000)}m away)")
                    
                    if connections:
                        response_text += f"**Connected to:**\n"
                        response_text += "\n".join(connections[:3])  # Show first 3 connections
                        if len(connections) > 3:
                            response_text += f"\n... and {len(connections) - 3} more locations"
                    
                    response_text += f"\n\nWould you like directions to {building_name}? Just ask!"
                    
                    return jsonify({
                        'success': True,
                        'response': response_text,
                        'type': 'information'
                    })
        
        # Check for pathfinding patterns
        elif ('from' in message_lower and 'to' in message_lower) or 'get' in message_lower or 'route' in message_lower:
            start = None
            end = None
            
            # Handle "from X to Y" pattern
            if 'from' in message_lower and 'to' in message_lower:
                parts = message_lower.split('from')[1].split('to')
                if len(parts) >= 2:
                    from_part = parts[0].strip()
                    to_part = parts[1].strip()
                    
                    for keyword, building_name in building_keywords.items():
                        if keyword in from_part:
                            start = building_name
                        if keyword in to_part:
                            end = building_name
            else:
                # Find any building mentioned and assume Student Center as start
                for keyword, building_name in building_keywords.items():
                    if keyword in message_lower:
                        end = building_name
                        start = 'Student Center'  # Central location as default
                        break
            
            if start and end and start in CAMPUS_BUILDINGS and end in CAMPUS_BUILDINGS:
                # Find path using A* algorithm
                path_func = ALGORITHMS['A*']
                path, cost, steps = path_func(campus_graph, start, end)
                
                if path is None:
                    return jsonify({
                        'success': True,
                        'response': f"I couldn't find a path from {start} to {end}.",
                        'type': 'error'
                    })
                
                # Calculate walking time
                walking_speed_kmh = 5.0
                walking_time_minutes = (cost / walking_speed_kmh) * 60
                
                response_text = f"�️ **Route found from {start} to {end}!**\n\n"
                response_text += f"📏 **Distance:** {round(cost * 1000)}m\n"
                response_text += f"🚶 **Walking time:** {round(walking_time_minutes, 1)} minutes\n\n"
                response_text += f"The shortest route has been found using A* algorithm! 🎯"
                
                return jsonify({
                    'success': True,
                    'response': response_text,
                    'type': 'pathfinding',
                    'path_data': {
                        'path': path,
                        'cost': round(cost, 3),
                        'distance_meters': round(cost * 1000),
                        'walking_time_minutes': round(walking_time_minutes, 1),
                        'algorithm': 'A*'
                    }
                })
        
        # Handle help queries
        elif 'help' in message_lower:
            response_text = "🤖 **I'm your AI campus navigation assistant!**\n\n"
            response_text += "**🛣️ Find Routes:**\n"
            response_text += "• \"How do I get from Engineering Center to Library?\"\n"
            response_text += "• \"Find route to Rec Center\"\n\n"
            response_text += "**📍 Get Information:**\n"
            response_text += "• \"Where is the Library?\"\n"
            response_text += "• \"Where is the Student Center?\"\n\n"
            response_text += "Just ask me and I'll help you navigate! 🗺️"
            
            return jsonify({
                'success': True,
                'response': response_text,
                'type': 'help'
            })
        
        # Handle greetings
        elif any(greeting in message_lower for greeting in ['hello', 'hi', 'hey']):
            response_text = "Hello! I'm your AI campus navigation assistant. Ask me for directions or building locations!"
            
            return jsonify({
                'success': True,
                'response': response_text,
                'type': 'greeting'
            })
        
        # Default response
        else:
            response_text = "Try asking:\n"
            response_text += "• 'How do I get from Engineering Center to Library?'\n"
            response_text += "• 'Find route to Rec Center'\n"
            response_text += "• 'Where is the Student Center?'\n\n"
            response_text += "What can I help you with?"
            
            return jsonify({
                'success': True,
                'response': response_text,
                'type': 'help'
            })
            
    except Exception as e:
        logger.error(f"Error in chatbot query: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}',
            'response': "I'm sorry, I encountered an error. Please try again."
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting CU PathFinder API server on port {port}")
    logger.info(f"Available buildings: {len(CAMPUS_BUILDINGS)}")
    logger.info(f"Available connections: {len(CAMPUS_CONNECTIONS)}")
    logger.info(f"Available algorithms: {list(ALGORITHMS.keys())}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
