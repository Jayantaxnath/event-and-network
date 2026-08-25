from neo4j import GraphDatabase
from config import COGNODB_URI, COGNODB_PASSWORD, COGNODB_USER

driver = GraphDatabase.driver(COGNODB_URI, auth=(COGNODB_USER, COGNODB_PASSWORD))

def verify_connection():
    try:
        driver.verify_connectivity()
        return True
    except Exception as e:
        print(e)
        return False
    
def run_query(query, parameters=None, timeout=30):
    try:
        with driver.session() as session:
            result = session.run(query, parameters or {}, timeout=timeout)
            return list(result)
    except Exception as e:
        print(f"Query failed: {e}")
        raise
    
if __name__=="__main__":
    print(verify_connection())