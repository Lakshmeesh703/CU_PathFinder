"""
CU PathFinder - Main Application
===============================

Main entry point for the CU PathFinder campus navigation system.
This module integrates all components and provides the primary interface.

Author: AI Assistant
Date: September 19, 2025
"""

import sys
import argparse
from typing import Optional
from campus_graph import CampusGraph
from search_algorithms import SearchAlgorithms
from query_processor import QueryProcessor
from visualizer import CampusVisualizer
from agent_analysis import PEASAnalysis

class CUPathFinder:
    """Main CU PathFinder application class."""
    
    def __init__(self):
        """Initialize the CU PathFinder system."""
        print("🗺️  Initializing CU PathFinder...")
        
        # Initialize core components
        self.campus = CampusGraph()
        self.search = SearchAlgorithms(self.campus)
        self.processor = QueryProcessor(self.campus)
        self.visualizer = CampusVisualizer(self.campus)
        self.peas = PEASAnalysis(self.campus)
        
        print("✅ CU PathFinder initialized successfully!")
        print(f"📊 Campus loaded: {len(self.campus.get_all_nodes())} locations")
        print(f"🔗 Total connections: {sum(len(neighbors) for neighbors in self.campus.edges.values()) // 2}")
    
    def interactive_mode(self):
        """Run the interactive query processing mode."""
        print("\n🚀 Starting Interactive Mode")
        print("="*50)
        self.processor.interactive_mode()
    
    def demo_mode(self):
        """Run demonstration mode with predefined examples."""
        print("\n🎯 Running Demo Mode")
        print("="*30)
        
        # Predefined demo queries
        demo_queries = [
            "Find path from Main Gate to Library",
            "Navigate from Boys Hostel to Food Court using A*",
            "How to get from Cricket Ground to Block A with BFS",
            "Library to Girls Hostel",
            "Food Court to Medical Center using UCS"
        ]
        
        for i, query in enumerate(demo_queries, 1):
            print(f"\n--- Demo Query {i} ---")
            print(f"Query: '{query}'")
            
            result = self.processor.process_query(query)
            
            if result['success']:
                print("✅ SUCCESS!")
                path_result = result['path_result']
                print(f"Path: {' → '.join(path_result.path)}")
                print(f"Distance: {path_result.cost}m")
                print(f"Algorithm: {path_result.algorithm}")
                print(f"Nodes explored: {path_result.num_nodes_explored}")
            else:
                print(f"❌ ERROR: {result['error_message']}")
            
            print("-" * 40)
    
    def algorithm_comparison_mode(self):
        """Run algorithm comparison analysis."""
        print("\n🔬 Algorithm Comparison Mode")
        print("="*35)
        
        # Test cases for comparison
        test_cases = [
            ("Main Gate", "Library"),
            ("Boys Hostel", "Cricket Ground"),
            ("Food Court", "Girls Hostel"),
            ("Block A", "Medical Center"),
            ("Entry Gate", "Faculty Apartment")
        ]
        
        print("Running comprehensive algorithm comparison...")
        
        for i, (start, goal) in enumerate(test_cases, 1):
            print(f"\n🧪 Test Case {i}: {start} → {goal}")
            print("-" * 50)
            
            # Compare all algorithms
            results = self.search.compare_algorithms(start, goal)
            
            # Display results table
            print(f"{'Algorithm':<10} {'Distance':<10} {'Explored':<10} {'Success':<8}")
            print("-" * 40)
            
            for alg_name, result in results.items():
                if result.success:
                    print(f"{alg_name:<10} {result.cost:<10} {result.num_nodes_explored:<10} {'✅':<8}")
                else:
                    print(f"{alg_name:<10} {'N/A':<10} {'N/A':<10} {'❌':<8}")
            
            # Find best algorithm for this case
            successful_results = {name: result for name, result in results.items() if result.success}
            if successful_results:
                best_alg = min(successful_results.items(), key=lambda x: x[1].cost)
                print(f"\n🏆 Best algorithm: {best_alg[0]} ({best_alg[1].cost}m)")
    
    def visualization_mode(self):
        """Run visualization demonstrations."""
        print("\n🎨 Visualization Mode")
        print("="*25)
        
        # Create basic campus map
        print("Creating campus map...")
        fig1 = self.visualizer.create_campus_map(save_path="campus_map_demo.png")
        print("✅ Campus map created: campus_map_demo.png")
        
        # Create path visualization
        print("\nCreating path visualization...")
        result = self.search.a_star_search("Main Gate", "Boys Hostel")
        if result.success:
            fig2 = self.visualizer.create_campus_map(
                highlighted_path=result.path, 
                save_path="path_demo.png"
            )
            print("✅ Path visualization created: path_demo.png")
        
        # Create algorithm comparison visualization
        print("\nCreating algorithm comparison...")
        comparison_results = self.search.compare_algorithms("Library", "Cricket Ground")
        fig3 = self.visualizer.visualize_algorithm_comparison(
            comparison_results, 
            save_path="algorithm_comparison_demo.png"
        )
        print("✅ Algorithm comparison created: algorithm_comparison_demo.png")
    
    def analysis_mode(self):
        """Run PEAS analysis and generate reports."""
        print("\n🤖 PEAS Analysis Mode")
        print("="*25)
        
        # Generate PEAS report
        print("Generating PEAS framework analysis...")
        report = self.peas.generate_peas_report()
        
        # Save to file
        self.peas.export_peas_analysis("peas_analysis_demo.txt")
        
        # Display summary
        print("\n📋 PEAS Analysis Summary:")
        print("="*30)
        
        classification = self.peas.get_agent_classification()
        print(f"Agent Type: {classification['Primary Type']}")
        print(f"Reasoning: {classification['Reasoning']}")
        print(f"Knowledge: {classification['Knowledge']}")
        print(f"Environment: {classification['Environment']}")
        
        decision_process = self.peas.analyze_decision_making_process()
        print(f"\nDecision Process: {decision_process['process_type']}")
        print(f"Process Steps: {len(decision_process['steps'])} steps")
        print(f"Decision Criteria: {len(decision_process['decision_criteria'])} criteria")
        
        print("✅ PEAS analysis exported to: peas_analysis_demo.txt")
    
    def campus_info_mode(self):
        """Display campus information and statistics."""
        print("\n🏛️  Campus Information")
        print("="*25)
        
        # Print campus statistics
        self.campus.print_graph_stats()
        
        # Show building types
        print("\n📍 Sample Locations by Type:")
        print("-" * 30)
        
        # Group locations by type
        locations_by_type = {}
        for location in self.campus.get_all_nodes():
            building_type = self.campus.get_building_type(location)
            if building_type not in locations_by_type:
                locations_by_type[building_type] = []
            locations_by_type[building_type].append(location)
        
        for building_type, locations in sorted(locations_by_type.items()):
            print(f"\n{building_type.upper()}:")
            for location in sorted(locations)[:3]:  # Show first 3 of each type
                hours = self.campus.get_building_hours(location)
                print(f"  • {location} ({hours})")
            if len(locations) > 3:
                print(f"  ... and {len(locations) - 3} more")
    
    def run_complete_demo(self):
        """Run a complete demonstration of all features."""
        print("\n🎪 Complete CU PathFinder Demo")
        print("="*40)
        
        print("\n1. Campus Information")
        self.campus_info_mode()
        
        print("\n2. Sample Pathfinding Queries")
        self.demo_mode()
        
        print("\n3. Algorithm Performance Comparison")
        self.algorithm_comparison_mode()
        
        print("\n4. PEAS Agent Analysis")
        self.analysis_mode()
        
        print("\n5. Visualization Generation")
        self.visualization_mode()
        
        print("\n🎉 Complete demo finished!")
        print("📁 Generated files:")
        print("  • campus_map_demo.png")
        print("  • path_demo.png")
        print("  • algorithm_comparison_demo.png")
        print("  • peas_analysis_demo.txt")

def main():
    """Main function with command-line interface."""
    parser = argparse.ArgumentParser(
        description="CU PathFinder - AI-Powered Campus Navigation System",
        epilog="Example: python main.py --interactive"
    )
    
    parser.add_argument(
        "--interactive", "-i",
        action="store_true",
        help="Run in interactive query mode"
    )
    
    parser.add_argument(
        "--demo", "-d",
        action="store_true",
        help="Run demonstration mode with sample queries"
    )
    
    parser.add_argument(
        "--compare", "-c",
        action="store_true",
        help="Run algorithm comparison analysis"
    )
    
    parser.add_argument(
        "--visualize", "-v",
        action="store_true",
        help="Generate visualization demonstrations"
    )
    
    parser.add_argument(
        "--analysis", "-a",
        action="store_true",
        help="Run PEAS agent analysis"
    )
    
    parser.add_argument(
        "--info", "-n",
        action="store_true",
        help="Display campus information"
    )
    
    parser.add_argument(
        "--complete",
        action="store_true",
        help="Run complete demo (all features)"
    )
    
    parser.add_argument(
        "--query", "-q",
        type=str,
        help="Process a single query directly"
    )
    
    args = parser.parse_args()
    
    # Initialize the application
    try:
        app = CUPathFinder()
    except Exception as e:
        print(f"❌ Error initializing CU PathFinder: {e}")
        sys.exit(1)
    
    # Execute based on arguments
    try:
        if args.complete:
            app.run_complete_demo()
        elif args.interactive:
            app.interactive_mode()
        elif args.demo:
            app.demo_mode()
        elif args.compare:
            app.algorithm_comparison_mode()
        elif args.visualize:
            app.visualization_mode()
        elif args.analysis:
            app.analysis_mode()
        elif args.info:
            app.campus_info_mode()
        elif args.query:
            print(f"\n🔍 Processing query: '{args.query}'")
            result = app.processor.process_query(args.query)
            if result['success']:
                print("\n" + result['formatted_output'])
            else:
                print(f"\n❌ Error: {result['error_message']}")
                if result['suggestions']:
                    print(f"\n💡 Suggestions: {', '.join(result['suggestions'])}")
        else:
            # Default to interactive mode if no specific mode is chosen
            print("No specific mode selected. Starting interactive mode...")
            print("Use --help to see all available options.\n")
            app.interactive_mode()
    
    except KeyboardInterrupt:
        print("\n\n👋 Thank you for using CU PathFinder!")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()