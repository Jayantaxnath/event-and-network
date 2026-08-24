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
    
def run_query(query, parameters=None):
    with driver.session() as session:
        result = session.run(query, parameters or {})
        return list(result)
    
if __name__=="__main__":
    print(verify_connection())