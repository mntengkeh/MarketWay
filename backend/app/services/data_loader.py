import json
import os
from typing import Dict, List, Optional
from pypdf import PdfReader
from app.core.config import settings

class DataLoader:
    def __init__(self):
        self.market_data: Dict = {}
        self.history_text: str = ""
        self.lines: List[Dict] = []
        self._load_data()

    def _load_data(self):
        # Load JSON
        if os.path.exists(settings.JSON_PATH):
            try:
                with open(settings.JSON_PATH, 'r') as f:
                    self.market_data = json.load(f)
                    self.lines = self.market_data.get("lines", [])
            except Exception as e:
                print(f"Error loading JSON: {e}")
                self.market_data = {}
                self.lines = []
        else:
            print(f"Warning: JSON file not found at {settings.JSON_PATH}")

        # Load PDF
        if os.path.exists(settings.PDF_PATH):
            try:
                reader = PdfReader(settings.PDF_PATH)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                self.history_text = text
            except Exception as e:
                print(f"Error loading PDF: {e}")
                self.history_text = "Error loading history data."
        else:
            print(f"Warning: PDF file not found at {settings.PDF_PATH}")
            self.history_text = "History data not available (PDF missing)."

    def get_all_lines(self) -> List[Dict]:
        return self.lines

    def get_line_by_name(self, name: str) -> Optional[Dict]:
        for line in self.lines:
            if line.get("line_name", "").lower() == name.lower():
                return line
        return None

    def search_products(self, query: str) -> List[Dict]:
        results = []
        query = query.lower()
        for line in self.lines:
            line_name = line.get("line_name", "")
            items = line.get("items_sold", [])
            # Check if query matches line name or any item
            # We check if the item is in the query (e.g. "shoes" in "where are the shoes")
            # OR if the query is in the line name (e.g. "godly" in "godly line")
            # OR if the line name is in the query (e.g. "godly line" in "where is godly line")
            
            if query in line_name.lower() or line_name.lower() in query:
                results.append(line)
                continue
            
            for item in items:
                if item.lower() in query or query in item.lower():
                    results.append(line)
                    break
        return results

    def get_history(self) -> str:
        return self.history_text

# Global instance
data_loader = DataLoader()
