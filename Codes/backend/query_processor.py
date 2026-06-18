"""
Query Processor Module for CU PathFinder
========================================

This module handles natural language query processing for campus navigation.
It parses user queries, extracts locations and algorithms, and provides
formatted results.

Author: AI Assistant  
Date: September 19, 2025
"""

import re
from typing import Optional, Tuple, Dict, List
from search_algorithms import SearchAlgorithms, SearchResult
from campus_graph import CampusGraph


class QueryProcessor:
    """Processes natural language queries for campus navigation."""
    
    def __init__(self, campus_graph: CampusGraph, search_algorithms: SearchAlgorithms):
        """
        Initialize the query processor.
        
        Args:
            campus_graph: CampusGraph instance
            search_algorithms: SearchAlgorithms instance
        """
        self.graph = campus_graph
        self.search_algorithms = search_algorithms
        
        # Location aliases for flexible query processing
        self.location_aliases = {
            # Common variations and nicknames
            'main entrance': 'Main Gate',
            'entrance': 'Main Gate', 
            'gate': 'Main Gate',
            'main gate': 'Main Gate',
            'library': 'Library',
            'lib': 'Library',
            'boys hostel': 'Boys Hostel',
            'boy hostel': 'Boys Hostel',
            'boys dorm': 'Boys Hostel',
            'boys': 'Boys Hostel',
            'girls hostel': 'Girls Hostel',
            'girl hostel': 'Girls Hostel', 
            'girls dorm': 'Girls Hostel',
            'girls': 'Girls Hostel',
            'food court': 'Food Court',
            'canteen': 'Food Court',
            'cafeteria': 'Food Court',
            'dining': 'Food Court',
            'cricket ground': 'Cricket Ground',
            'cricket': 'Cricket Ground',
            'cricket field': 'Cricket Ground',
            'football ground': 'Football Ground',
            'football': 'Football Ground',
            'football field': 'Football Ground',
            'basketball court': 'Basketball Court',
            'basketball': 'Basketball Court',
            'block a': 'Block A',
            'blocka': 'Block A',
            'block b': 'Block B',
            'blockb': 'Block B',
            'auditorium': 'Auditorium',
            'audit': 'Auditorium',
            'medical center': 'Medical Center',
            'medical': 'Medical Center',
            'hospital': 'Medical Center',
            'clinic': 'Medical Center',
            'admin office': 'Admin Office',
            'admin': 'Admin Office',
            'administration': 'Admin Office',
            'guest house': 'Guest House',
            'guesthouse': 'Guest House',
            'guest': 'Guest House',
            'security office': 'Security Office',
            'security': 'Security Office',
            'gym': 'Gym',
            'gymnasium': 'Gym',
            'fitness': 'Gym',
            'parking area': 'Parking Area',
            'parking': 'Parking Area',
            'car park': 'Parking Area',
            'tennis court': 'Tennis Court',
            'tennis': 'Tennis Court',
            'volleyball court': 'Volleyball Court',
            'volleyball': 'Volleyball Court',
            'playing ground': 'Playing Ground',
            'playground': 'Playing Ground',
            'play area': 'Playing Ground',
            'water treatment area': 'Water Treatment Area',
            'water treatment': 'Water Treatment Area',
            'water plant': 'Water Treatment Area',
            'dg yard': 'DG Yard',
            'generator': 'DG Yard',
            'power house': 'DG Yard',
            'faculty house': 'Faculty House',
            'faculty apartment': 'Faculty House',
            'faculty': 'Faculty House',
            'mart': 'Mart',
            'shop': 'Mart',
            'store': 'Mart',
            'pottery making area': 'Pottery Making Area',
            'pottery': 'Pottery Making Area',
            'art area': 'Pottery Making Area'
        }
        
        # Algorithm mapping for flexible algorithm selection
        self.algorithm_mapping = {
            'bfs': 'breadth_first_search',
            'breadth': 'breadth_first_search',
            'breadth-first': 'breadth_first_search',
            'breadth first': 'breadth_first_search',
            'dfs': 'depth_first_search',
            'depth': 'depth_first_search', 
            'depth-first': 'depth_first_search',
            'depth first': 'depth_first_search',
            'ucs': 'uniform_cost_search',
            'uniform': 'uniform_cost_search',
            'uniform-cost': 'uniform_cost_search',
            'uniform cost': 'uniform_cost_search',
            'dijkstra': 'uniform_cost_search',
            'a*': 'a_star_search',
            'astar': 'a_star_search',
            'a-star': 'a_star_search',
            'a star': 'a_star_search',
            'heuristic': 'a_star_search'
        }
    
    def parse_query(self, query: str) -> Optional[Dict[str, str]]:
        """
        Parse a natural language query to extract start, goal, and algorithm.
        
        Args:
            query: Natural language query string
            
        Returns:
            Dictionary with 'start', 'goal', and 'algorithm' keys, or None if parsing fails
        """
        if not query or not query.strip():
            return None
            
        query = query.lower().strip()
        
        # Initialize result
        result = {
            'start': None,
            'goal': None, 
            'algorithm': 'A*'  # Default algorithm
        }
        
        # Extract algorithm if specified
        algorithm = self._extract_algorithm(query)
        if algorithm:
            result['algorithm'] = algorithm
            # Remove algorithm part from query
            for keyword in self.algorithm_mapping.keys():
                patterns = [f' using {keyword}', f' with {keyword}', f' via {keyword}', f' {keyword}']
                for pattern in patterns:
                    query = query.replace(pattern, '')
        
        # Extract locations using various patterns
        locations = self._extract_locations(query)
        
        if len(locations) >= 2:
            result['start'] = locations[0]
            result['goal'] = locations[1]
            return result
        elif len(locations) == 1:
            # Try to find if it's a "to" pattern
            if ' to ' in query:
                parts = query.split(' to ')
                if len(parts) == 2:
                    start_location = self._resolve_location(parts[0].strip())
                    goal_location = self._resolve_location(parts[1].strip())
                    if start_location and goal_location:
                        result['start'] = start_location
                        result['goal'] = goal_location
                        return result
        
        return None
    
    def _extract_algorithm(self, query: str) -> str:
        """Extract algorithm from query."""
        for keyword, algorithm in self.algorithm_mapping.items():
            if keyword in query:
                return algorithm.replace('_', ' ').title().replace(' ', '*') if 'star' in algorithm else algorithm.replace('_', ' ').upper()
        return 'A*'  # Default
    
    def _extract_locations(self, query: str) -> List[str]:
        """Extract location names from query."""
        locations = []
        
        # Common patterns for location extraction
        patterns = [
            r'from\s+(.+?)\s+to\s+(.+)',
            r'(.+?)\s+to\s+(.+)',
            r'navigate\s+from\s+(.+?)\s+to\s+(.+)',
            r'path\s+from\s+(.+?)\s+to\s+(.+)',
            r'route\s+from\s+(.+?)\s+to\s+(.+)',
            r'get\s+from\s+(.+?)\s+to\s+(.+)',
            r'go\s+from\s+(.+?)\s+to\s+(.+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                start_text = match.group(1).strip()
                goal_text = match.group(2).strip()
                
                # Clean up algorithm keywords
                for keyword in self.algorithm_mapping.keys():
                    start_text = start_text.replace(f' using {keyword}', '').replace(f' with {keyword}', '')
                    goal_text = goal_text.replace(f' using {keyword}', '').replace(f' with {keyword}', '')
                
                start_location = self._resolve_location(start_text)
                goal_location = self._resolve_location(goal_text)
                
                if start_location and goal_location:
                    return [start_location, goal_location]
        
        return locations
    
    def _resolve_location(self, location_text: str) -> Optional[str]:
        """
        Resolve location text to actual building name.
        
        Args:
            location_text: Raw location text from query
            
        Returns:
            Resolved building name or None if not found
        """
        if not location_text:
            return None
            
        location_text = location_text.lower().strip()
        
        # Remove common stop words
        stop_words = ['the', 'at', 'in', 'of', 'near', 'by']
        for word in stop_words:
            location_text = location_text.replace(f' {word} ', ' ')
            if location_text.startswith(f'{word} '):
                location_text = location_text[len(word):].strip()
            if location_text.endswith(f' {word}'):
                location_text = location_text[:-len(word)].strip()
        
        # Direct lookup
        if location_text in self.location_aliases:
            return self.location_aliases[location_text]
        
        # Fuzzy matching
        for alias, building in self.location_aliases.items():
            if location_text in alias or alias in location_text:
                return building
        
        # Check if it's already a valid building name
        all_buildings = self.graph.get_all_buildings()
        for building in all_buildings:
            if location_text.lower() == building.lower():
                return building
            if location_text.lower() in building.lower() or building.lower() in location_text.lower():
                return building
        
        return None
    
    def process_query(self, start: str, goal: str, algorithm: str = 'A*') -> SearchResult:
        """
        Process a pathfinding query.
        
        Args:
            start: Starting location
            goal: Destination location  
            algorithm: Search algorithm to use
            
        Returns:
            SearchResult object
        """
        # Map algorithm name to method
        algorithm_map = {
            'BFS': 'breadth_first_search',
            'DFS': 'depth_first_search', 
            'UCS': 'uniform_cost_search',
            'A*': 'a_star_search'
        }
        
        method_name = algorithm_map.get(algorithm, 'a_star_search')
        search_method = getattr(self.search_algorithms, method_name)
        
        return search_method(start, goal)


# Test function
if __name__ == "__main__":
    # Test the query processor
    from campus_graph import CampusGraph
    from search_algorithms import SearchAlgorithms
    
    campus = CampusGraph()
    search = SearchAlgorithms(campus)
    processor = QueryProcessor(campus, search)
    
    test_queries = [
        "Find path from Main Gate to Library",
        "Navigate from boys hostel to food court using A*",
        "How to get from cricket ground to block a",
        "lib to gym with bfs"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        parsed = processor.parse_query(query)
        if parsed:
            print(f"Start: {parsed['start']}, Goal: {parsed['goal']}, Algorithm: {parsed['algorithm']}")
            result = processor.process_query(parsed['start'], parsed['goal'], parsed['algorithm'])
            if result.success:
                print(f"Path: {' -> '.join(result.path)}")
                print(f"Distance: {result.cost}m")
            else:
                print("No path found")
        else:
            print("Failed to parse query")