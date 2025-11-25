import streamlit as st
import os
from unified_backend import UnifiedBackend
from components.map_renderer import render_map

def show_navigation_screen():
    st.title("MarketWay Navigation")
    
    # Initialize Backend
    if 'backend' not in st.session_state:
        st.session_state.backend = UnifiedBackend()
        
    # State Management
    if 'nav_result' not in st.session_state:
        st.session_state.nav_result = None
    if 'last_query' not in st.session_state:
        st.session_state.last_query = ""

    # Input Section
    st.subheader("Where do you want to go?")
    
    input_method = st.radio("Input Method", ["Text", "Voice"], horizontal=True)
    
    query = None
    input_type = "text"
    
    if input_method == "Text":
        query = st.text_input("Search for a product...", value=st.session_state.last_query)
        if st.button("Go"):
            pass # Trigger processing below
    else:
        st.info("Record your voice query.")
        # Streamlit 1.40+ supports st.audio_input. Fallback to file uploader for older versions.
        try:
            audio_value = st.audio_input("Record")
            if audio_value:
                # Save to temp file for processing
                with open("temp_voice_query.wav", "wb") as f:
                    f.write(audio_value.read())
                query = "temp_voice_query.wav"
                input_type = "voice"
        except AttributeError:
            st.warning("st.audio_input not supported in this Streamlit version. Using file uploader.")
            uploaded_file = st.file_uploader("Upload Audio", type=["wav", "mp3"])
            if uploaded_file:
                with open("temp_voice_query.wav", "wb") as f:
                    f.write(uploaded_file.read())
                query = "temp_voice_query.wav"
                input_type = "voice"

    # Process Query
    if query and query != st.session_state.last_query:
        with st.spinner("Finding product and path..."):
            result = st.session_state.backend.process_request(query, input_type=input_type)
            st.session_state.nav_result = result
            st.session_state.last_query = query if input_type == "text" else "" # Don't save filename as query text
            
            # Clean up temp file
            if input_type == "voice" and os.path.exists("temp_voice_query.wav"):
                os.remove("temp_voice_query.wav")

    # Display Results
    if st.session_state.nav_result:
        res = st.session_state.nav_result
        
        if res.get("error"):
            st.error(res["error"])
        else:
            st.success(f"Found: **{res['product']}**")
            st.info(f"Location: **{res['target_location']}**")
            
            # Render Map
            steps = res.get("navigation", {}).get("steps", [])
            
            # Extract path nodes from steps (This is a bit hacky, ideally backend returns node IDs)
            # For MVP, we'll parse the steps or just show the start/end if we can't parse.
            # Actually, NavigationService.dijkstra returns 'path' (list of nodes) but UnifiedBackend only exposes 'steps'.
            # Let's modify UnifiedBackend to return 'path_ids' as well for the map.
            
            # For now, let's just show the map with start (0) and end (inferred).
            # We need to map target_location name back to ID for the map renderer.
            # Simple reverse mapping for MVP:
            name_to_id = {"Entrance": 0, "Produce": 1, "Bakery": 2, "Dairy": 3, "Meat": 4, "Checkout": 5}
            target_id = name_to_id.get(res['target_location'])
            
            path_ids = [0, target_id] if target_id is not None else None
            
            # If we had the full path from backend, it would be better.
            # But for now, let's just highlight start and end.
            
            render_map(None, path_nodes=path_ids)
            
            st.subheader("Directions")
            for step in steps:
                st.write(f"- {step}")

