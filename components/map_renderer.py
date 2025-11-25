import streamlit as st
import math

def render_map(graph, path_nodes=None, current_node=None):
    """
    Renders a simple SVG map of the market layout.
    
    Args:
        graph: The adjacency graph from NavigationService (not strictly needed for visual layout if we hardcode positions for MVP).
        path_nodes: List of node IDs representing the path to highlight.
        current_node: The ID of the current user location.
    """
    
    # Hardcoded positions for the MVP layout (Grid-like)
    # IDs assumed to be 0..N based on database_builder.py logic (auto-increment)
    # Let's assume a simple layout:
    # 0 (Entrance) -> (50, 250)
    # 1 (Produce) -> (150, 150)
    # 2 (Bakery) -> (150, 350)
    # 3 (Dairy) -> (250, 150)
    # 4 (Meat) -> (250, 350)
    # 5 (Checkout) -> (350, 250)
    
    positions = {
        0: (50, 250),   # Entrance
        1: (150, 150),  # Produce
        2: (150, 350),  # Bakery
        3: (250, 150),  # Dairy
        4: (250, 350),  # Meat
        5: (350, 250),  # Checkout
    }
    
    # Define connections for drawing lines (undirected visual)
    connections = [
        (0, 1), (0, 2),
        (1, 3), (2, 4),
        (3, 5), (4, 5),
        (1, 2), (3, 4) # Cross connections
    ]
    
    svg_width = 400
    svg_height = 500
    
    svg_elements = []
    
    # 1. Draw all connections (gray background lines)
    for u, v in connections:
        if u in positions and v in positions:
            x1, y1 = positions[u]
            x2, y2 = positions[v]
            svg_elements.append(
                f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#e0e0e0" stroke-width="4" />'
            )

    # 2. Draw Path (Animated)
    if path_nodes and len(path_nodes) > 1:
        path_d = []
        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i+1]
            if u in positions and v in positions:
                x1, y1 = positions[u]
                x2, y2 = positions[v]
                # We draw individual segments or a polyline. Polyline is better for single dash animation.
                if i == 0:
                    path_d.append(f"M {x1} {y1}")
                path_d.append(f"L {x2} {y2}")
        
        path_str = " ".join(path_d)
        
        # Add animated path
        svg_elements.append(
            f'''
            <path d="{path_str}" fill="none" stroke="#4CAF50" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
                <animate attributeName="stroke-dasharray" from="0, 1000" to="1000, 0" dur="2s" fill="freeze" />
            </path>
            '''
        )

    # 3. Draw Nodes
    for node_id, (cx, cy) in positions.items():
        color = "#333"
        radius = 10
        
        # Highlight start and end
        if path_nodes:
            if node_id == path_nodes[0]:
                color = "#2196F3" # Blue for start
                radius = 12
            elif node_id == path_nodes[-1]:
                color = "#F44336" # Red for target
                radius = 12
        
        svg_elements.append(
            f'<circle cx="{cx}" cy="{cy}" r="{radius}" fill="{color}" stroke="white" stroke-width="2" />'
        )
        
        # Labels
        label = f"Line {node_id}"
        # Simple mapping for demo
        names = {0: "Entrance", 1: "Produce", 2: "Bakery", 3: "Dairy", 4: "Meat", 5: "Checkout"}
        if node_id in names:
            label = names[node_id]
            
        svg_elements.append(
            f'<text x="{cx}" y="{cy+25}" font-family="Arial" font-size="12" text-anchor="middle" fill="#555">{label}</text>'
        )

    svg_content = "".join(svg_elements)
    
    html_code = f"""
    <div style="display: flex; justify-content: center; margin: 20px 0;">
        <svg width="{svg_width}" height="{svg_height}" viewBox="0 0 {svg_width} {svg_height}" style="background: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
            {svg_content}
        </svg>
    </div>
    """
    
    st.components.v1.html(html_code, height=svg_height+20)
