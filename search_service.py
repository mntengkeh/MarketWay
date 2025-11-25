import sqlite3
import pickle
import numpy as np
import os

# Configuration
DB_PATH = "market.db"
MODEL_NAME = "all-MiniLM-L6-v2"

class SearchService:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.embed_func = self._get_embedding_model()
        self.embeddings = self._load_embeddings()

    def _get_embedding_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            print(f"Loading {MODEL_NAME} for search...")
            model = SentenceTransformer(MODEL_NAME)
            return model.encode
        except ImportError:
            print("WARNING: sentence-transformers not found. Using dummy embeddings for search.")
            return lambda text: np.random.rand(384).astype(np.float32)

    def _load_embeddings(self):
        print("Loading embeddings from DB...")
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, entity_type, entity_id, embedding FROM embeddings")
        rows = cursor.fetchall()
        
        embeddings = []
        for row in rows:
            emb_id, entity_type, entity_id, blob = row
            vector = pickle.loads(blob)
            embeddings.append({
                "id": emb_id,
                "type": entity_type,
                "entity_id": entity_id,
                "vector": vector
            })
        print(f"Loaded {len(embeddings)} embeddings.")
        return embeddings

    def search(self, query, top_k=5):
        query_vector = self.embed_func(query)
        
        results = []
        for item in self.embeddings:
            # Cosine similarity
            item_vector = item["vector"]
            similarity = np.dot(query_vector, item_vector) / (np.linalg.norm(query_vector) * np.linalg.norm(item_vector))
            results.append({
                "similarity": float(similarity),
                "type": item["type"],
                "entity_id": item["entity_id"]
            })
        
        # Sort by similarity desc
        results.sort(key=lambda x: x["similarity"], reverse=True)
        top_results = results[:top_k]
        
        # Fetch details
        enriched_results = []
        cursor = self.conn.cursor()
        for res in top_results:
            table = "lines" if res["type"] == "line" else "products"
            cursor.execute(f"SELECT name, description FROM {table} WHERE id = ?", (res["entity_id"],))
            row = cursor.fetchone()
            if row:
                enriched_results.append({
                    "name": row[0],
                    "description": row[1],
                    "type": res["type"],
                    "score": res["similarity"]
                })
                
        return enriched_results

    def close(self):
        self.conn.close()

if __name__ == "__main__":
    # Test
    service = SearchService()
    query = "fruit"
    print(f"\nSearching for '{query}'...")
    results = service.search(query)
    for r in results:
        print(f"[{r['score']:.4f}] {r['name']} ({r['type']}) - {r['description']}")
    service.close()
