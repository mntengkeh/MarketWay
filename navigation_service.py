import sqlite3
import heapq

DB_PATH = "market.db"

class NavigationService:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.graph = self._build_graph()

    def _build_graph(self):
        """
        Builds an adjacency list from the connections table.
        Graph structure: { source_id: [(target_id, distance, direction), ...], ... }
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT source_id, target_id, distance, direction FROM connections")
        rows = cursor.fetchall()
        
        graph = {}
        for src, tgt, dist, direction in rows:
            if src not in graph: graph[src] = []
            if tgt not in graph: graph[tgt] = []
            
            # Add forward edge
            graph[src].append((tgt, dist, direction))
            
            # Add reverse edge (assuming undirected for walking, but with reverse direction)
            # Simple reverse direction logic for demo
            rev_dir = f"Reverse of {direction}"
            graph[tgt].append((src, dist, rev_dir))
            
        return graph

    def get_line_name(self, line_id):
        cursor = self.conn.cursor()
        cursor.execute("SELECT name FROM lines WHERE id = ?", (line_id,))
        row = cursor.fetchone()
        return row[0] if row else f"Line {line_id}"

    def find_product_line(self, product_name):
        """
        Finds the line ID that sells the given product (exact match for MVP).
        For semantic search, use SearchService.
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT line_id, name FROM products WHERE name LIKE ?", (f"%{product_name}%",))
        row = cursor.fetchone()
        if row:
            return row[0], row[1]
        return None, None

    def dijkstra(self, start_node, end_node):
        """
        Finds the shortest path using Dijkstra's algorithm.
        Returns (total_distance, path_of_nodes, directions)
        """
        if start_node not in self.graph or end_node not in self.graph:
            return None, None, ["One of the locations is not on the map."]

        # Priority queue: (current_distance, current_node, path_list, direction_list)
        pq = [(0, start_node, [start_node], [])]
        visited = set()

        while pq:
            curr_dist, curr_node, path, dirs = heapq.heappop(pq)

            if curr_node in visited:
                continue
            visited.add(curr_node)

            if curr_node == end_node:
                return curr_dist, path, dirs

            for neighbor, weight, direction in self.graph.get(curr_node, []):
                if neighbor not in visited:
                    new_dist = curr_dist + weight
                    new_path = path + [neighbor]
                    
                    # Format instruction
                    neighbor_name = self.get_line_name(neighbor)
                    instruction = f"Go {direction} for {weight}m to {neighbor_name}"
                    new_dirs = dirs + [instruction]
                    
                    heapq.heappush(pq, (new_dist, neighbor, new_path, new_dirs))

        return None, None, ["No path found."]

    def navigate(self, start_line_id, product_query):
        """
        Full navigation flow: Find product -> Get Line -> Calculate Path
        """
        target_line_id, product_name = self.find_product_line(product_query)
        
        if not target_line_id:
            return {
                "error": f"Product '{product_query}' not found."
            }

        distance, path, steps = self.dijkstra(start_line_id, target_line_id)
        
        if distance is None:
            return {
                "error": "Could not find a path."
            }

        return {
            "product": product_name,
            "target_location": self.get_line_name(target_line_id),
            "total_distance": f"{distance}m",
            "steps": steps
        }

    def close(self):
        self.conn.close()

if __name__ == "__main__":
    nav = NavigationService()
    
    # Test: Navigate from Entrance (0) to Organic Bananas
    print("Navigating from Main Entrance to 'Organic Bananas'...")
    result = nav.navigate(0, "Organic Bananas")
    
    if "error" in result:
        print(result["error"])
    else:
        print(f"Found {result['product']} at {result['target_location']}")
        print(f"Total Distance: {result['total_distance']}")
        print("Instructions:")
        for i, step in enumerate(result['steps'], 1):
            print(f"{i}. {step}")
            
    nav.close()
