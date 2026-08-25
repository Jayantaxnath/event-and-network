from db import run_query

# EVENTS


def get_events():
    """
    Fetch all events.

    Returns:
    [
        {
            "id": "event_1",
            "name": "AI Conference",
            "date": "2026-08-20",
            "location": "Guwahati",
            "description": "..."
        }
    ]
    """

    query = """
    MATCH (e:Event)
    RETURN
        e.id AS id,
        e.name AS name,
        e.date AS date,
        e.location AS location,
        e.description AS description
    ORDER BY e.date DESC, e.name
    """

    return run_query(query)


def get_event_by_id(event_id):
    """
    Fetch one event by ID.

    Returns:
    {
        "id": "event_1",
        "name": "AI Conference",
        "date": "2026-08-20",
        "location": "Guwahati",
        "description": "..."
    }

    Returns an empty list if the event does not exist.
    """

    query = """
    MATCH (e:Event {id: $event_id})
    RETURN
        e.id AS id,
        e.name AS name,
        e.date AS date,
        e.location AS location,
        e.description AS description
    """

    return run_query(query, {"event_id": event_id})


def get_event_details(event_id):
    """
    Fetch complete event information.

    Returns:
    {
        "id": "event_1",
        "name": "AI Conference",
        "date": "2026-08-20",
        "location": "Guwahati",
        "description": "...",

        "topics": [
            {
                "id": "topic_ai",
                "name": "Artificial Intelligence",
                "relevance": 0.95
            }
        ],

        "attendee_count": 25,

        "attendees": [
            {
                "person_id": "person_1",
                "name": "Alice",
                "title": "ML Engineer",
                "role": "speaker",
                "year": 2026
            }
        ]
    }
    """

    query = """
    MATCH (e:Event {id: $event_id})

    OPTIONAL MATCH (e)-[focus:FOCUSED_ON]->(t:Topic)

    WITH
        e,
        collect(DISTINCT {
            id: t.id,
            name: t.name,
            relevance: focus.relevance
        }) AS topics

    OPTIONAL MATCH (p:Person)-[attendance:ATTENDED]->(e)

    WITH
        e,
        topics,
        count(DISTINCT p) AS attendee_count,
        collect(DISTINCT {
            person_id: p.id,
            name: p.name,
            title: p.title,
            role: attendance.role,
            year: attendance.year
        }) AS attendees

    RETURN
        e.id AS id,
        e.name AS name,
        e.date AS date,
        e.location AS location,
        e.description AS description,
        topics,
        attendee_count,
        attendees
    """

    return run_query(query, {"event_id": event_id})


def get_event_attendees(event_id):
    """
    Fetch all people who attended an event.

    Returns:
    [
        {
            "person_id": "person_1",
            "person_name": "Alice",
            "title": "ML Engineer",
            "bio": "...",
            "attendance_role": "speaker",
            "attendance_year": 2026,

            "company_id": "company_1",
            "company_name": "Google",
            "company_industry": "Technology",

            "topics": [
                {
                    "id": "topic_ai",
                    "name": "Artificial Intelligence"
                }
            ]
        }
    ]
    """

    query = """
    MATCH (p:Person)-[attendance:ATTENDED]->(e:Event {id: $event_id})

    OPTIONAL MATCH (p)-[employment:WORKS_AT]->(c:Company)

    OPTIONAL MATCH (p)-[:INTERESTED_IN]->(t:Topic)

    WITH
        p,
        attendance,
        c,
        collect(DISTINCT t) AS topic_nodes

    RETURN
        p.id AS person_id,
        p.name AS person_name,
        p.title AS title,
        p.bio AS bio,

        attendance.role AS attendance_role,
        attendance.year AS attendance_year,

        c.id AS company_id,
        c.name AS company_name,
        c.industry AS company_industry,

        [topic IN topic_nodes |
            {
                id: topic.id,
                name: topic.name
            }
        ] AS topics

    ORDER BY person_name
    """

    return run_query(query, {"event_id": event_id})


# PEOPLE


def get_person_by_id(person_id):
    """
    Fetch one person.

    Returns:
    {
        "id": "person_1",
        "name": "Alice",
        "title": "ML Engineer",
        "bio": "..."
    }
    """

    query = """
    MATCH (p:Person {id: $person_id})

    RETURN
        p.id AS id,
        p.name AS name,
        p.title AS title,
        p.bio AS bio
    """

    return run_query(query, {"person_id": person_id})


def get_people_with_common_interests(person_id, limit=20):
    """
    Find people who share topics with the given person.

    Returns:
    [
        {
            "person_id": "person_2",
            "name": "Bob",
            "title": "Software Engineer",
            "shared_topic_count": 3,
            "shared_topics": [
                {
                    "id": "topic_ai",
                    "name": "Artificial Intelligence"
                }
            ]
        }
    ]
    """

    query = """
    MATCH (me:Person {id: $person_id})
          -[:INTERESTED_IN]->(t:Topic)
          <-[:INTERESTED_IN]-(other:Person)

    WHERE other.id <> me.id

    WITH
        other,
        collect(DISTINCT t) AS shared_topic_nodes

    RETURN
        other.id AS person_id,
        other.name AS name,
        other.title AS title,
        size(shared_topic_nodes) AS shared_topic_count,

        [topic IN shared_topic_nodes |
            {
                id: topic.id,
                name: topic.name
            }
        ] AS shared_topics

    ORDER BY shared_topic_count DESC, name

    LIMIT $limit
    """

    return run_query(
        query,
        {
            "person_id": person_id,
            "limit": int(limit),
        },
    )


def shortest_path_between_people(person_a_id, person_b_id):
    """
    Find the shortest networking path between two people.

    Returns:
    A Neo4j Path object.

    The API layer converts it into:
    {
        "nodes": [...],
        "relationships": [...]
    }
    """

    query = """
    MATCH path = shortestPath(
        (a:Person {id: $a_id})
        -[:ATTENDED|WORKS_AT|INTERESTED_IN|FOCUSED_ON*1..3]-
        (b:Person {id: $b_id})
    )

    RETURN path
    """

    res = run_query(
        query,
        {
            "a_id": person_a_id,
            "b_id": person_b_id,
        },
        timeout=60  # 60 second timeout for path queries
    )

    return res[0]["path"] if res else None


def find_path_through_middle_person(person_a_id, person_b_id):
    """
    Find the best path through a middle person when no direct path exists.
    Prioritizes middle persons with strongest connections (shared events, companies, topics).

    Returns:
    A Neo4j Path object with a middle person connection.
    """

    query = """
    MATCH (a:Person {id: $a_id})
    MATCH (b:Person {id: $b_id})
    
    // Find middle persons and score their connection strength
    MATCH (a)-[r1:ATTENDED|WORKS_AT|INTERESTED_IN|FOCUSED_ON*1..2]-(middle:Person)
    MATCH (middle)-[r2:ATTENDED|WORKS_AT|INTERESTED_IN|FOCUSED_ON*1..2]-(b)
    
    WHERE middle.id <> a.id AND middle.id <> b.id
    
    // Calculate connection strength score
    WITH a, b, middle, 
         length(r1) + length(r2) as path_length,
         // Count shared connections
         size([(a)-[:ATTENDED]->(e:Event)<-[:ATTENDED]-(middle) | 1]) as shared_events_a,
         size([(middle)-[:ATTENDED]->(e:Event)<-[:ATTENDED]-(b) | 1]) as shared_events_b,
         size([(a)-[:WORKS_AT]->(c:Company)<-[:WORKS_AT]-(middle) | 1]) as shared_companies_a,
         size([(middle)-[:WORKS_AT]->(c:Company)<-[:WORKS_AT]-(b) | 1]) as shared_companies_b,
         size([(a)-[:INTERESTED_IN]->(t:Topic)<-[:INTERESTED_IN]-(middle) | 1]) as shared_topics_a,
         size([(middle)-[:INTERESTED_IN]->(t:Topic)<-[:INTERESTED_IN]-(b) | 1]) as shared_topics_b
    
    // Calculate strength score (prefer shorter paths with more shared connections)
    WITH a, b, middle, path_length,
         (shared_events_a + shared_events_b) * 3 +
         (shared_companies_a + shared_companies_b) * 2 +
         (shared_topics_a + shared_topics_b) * 1 -
         path_length * 10 as strength_score
    
    ORDER BY strength_score DESC, path_length ASC
    LIMIT 1
    
    // Reconstruct the full path
    MATCH path = (a)-[*1..2]-(middle)-[*1..2]-(b)
    
    RETURN path
    """

    res = run_query(
        query,
        {
            "a_id": person_a_id,
            "b_id": person_b_id,
        },
        timeout=90  # 90 second timeout for complex middle person queries
    )

    return res[0]["path"] if res else None


# RECOMMENDATIONS


def get_event_recommendations(event_id, user_id, limit=10):
    """
    Recommend people to a user from the same event.

    Recommendation score is based on:
    - shared topics
    - shared events
    - shortest graph path

    Returns:
    [
        {
            "person_id": "person_2",
            "person_name": "Bob",
            "title": "Software Engineer",
            "bio": "...",
            "shared_topics": 4,
            "shared_events": 2,
            "path_length": 2,
            "score": 12
        }
    ]
    """

    query = """
    MATCH (me:Person {id: $user_id})-[:ATTENDED]->(e:Event {id: $event_id})

    MATCH (candidate:Person)-[:ATTENDED]->(e)

    WHERE candidate.id <> me.id

    OPTIONAL MATCH (me)-[:INTERESTED_IN]->(shared_topic:Topic)
                   <-[:INTERESTED_IN]-(candidate)

    WITH
        me,
        candidate,
        e,
        count(DISTINCT shared_topic) AS shared_topics

    OPTIONAL MATCH (me)-[:ATTENDED]->(other_event:Event)
                   <-[:ATTENDED]-(candidate)

    WHERE other_event.id <> e.id

    WITH
        me,
        candidate,
        e,
        shared_topics,
        count(DISTINCT other_event) AS shared_events

    OPTIONAL MATCH path = shortestPath(
        (me)-[:ATTENDED|WORKS_AT|INTERESTED_IN|FOCUSED_ON*1..3]-(candidate)
    )

    WITH
        candidate,
        shared_topics,
        shared_events,

        CASE
            WHEN path IS NULL THEN null
            ELSE length(path)
        END AS path_length

    WITH
        candidate,
        shared_topics,
        shared_events,
        path_length,

        (
            shared_topics * 2
            + shared_events * 3
            - coalesce(path_length, 99)
        ) AS score

    RETURN
        candidate.id AS person_id,
        candidate.name AS person_name,
        candidate.title AS title,
        candidate.bio AS bio,
        shared_topics,
        shared_events,
        path_length,
        score

    ORDER BY score DESC, person_name

    LIMIT $limit
    """

    return run_query(
        query,
        {
            "event_id": event_id,
            "user_id": user_id,
            "limit": int(limit),
        },
    )


# COMPANIES


def get_company_people(company_id):
    """
    Fetch all people working at a company.

    Returns:
    [
        {
            "company_id": "company_1",
            "company_name": "Google",
            "industry": "Technology",

            "person_id": "person_1",
            "person_name": "Alice",
            "title": "ML Engineer",
            "role": "Engineer",

            "topics": [
                {
                    "id": "topic_ai",
                    "name": "Artificial Intelligence"
                }
            ]
        }
    ]
    """

    query = """
    MATCH (c:Company {id: $company_id})
          <-[employment:WORKS_AT]-(p:Person)

    OPTIONAL MATCH (p)-[:INTERESTED_IN]->(t:Topic)

    WITH
        c,
        p,
        employment,
        collect(DISTINCT t) AS topic_nodes

    RETURN
        c.id AS company_id,
        c.name AS company_name,
        c.industry AS industry,

        p.id AS person_id,
        p.name AS person_name,
        p.title AS title,

        employment.role AS role,

        [topic IN topic_nodes |
            {
                id: topic.id,
                name: topic.name
            }
        ] AS topics

    ORDER BY person_name
    """

    return run_query(query, {"company_id": company_id})


def get_company_by_id(company_id):
    """
    Fetch one company.

    Returns:
    {
        "id": "company_1",
        "name": "Google",
        "industry": "Technology"
    }
    """

    query = """
    MATCH (c:Company {id: $company_id})

    RETURN
        c.id AS id,
        c.name AS name,
        c.industry AS industry
    """

    return run_query(query, {"company_id": company_id})


# TOPICS


def get_topics():
    """
    Fetch all topics.

    Returns:
    [
        {
            "id": "topic_ai",
            "name": "Artificial Intelligence"
        }
    ]
    """

    query = """
    MATCH (t:Topic)

    RETURN
        t.id AS id,
        t.name AS name

    ORDER BY name
    """

    return run_query(query)


def get_topic_people(topic_id):
    """
    Fetch people interested in a topic.

    Returns:
    [
        {
            "person_id": "person_1",
            "name": "Alice",
            "title": "ML Engineer",
            "bio": "..."
        }
    ]
    """

    query = """
    MATCH (p:Person)-[:INTERESTED_IN]->(t:Topic {id: $topic_id})

    RETURN
        p.id AS person_id,
        p.name AS name,
        p.title AS title,
        p.bio AS bio

    ORDER BY name
    """

    return run_query(query, {"topic_id": topic_id})


def get_topic_events(topic_id):
    """
    Fetch events focused on a topic.

    Returns:
    [
        {
            "event_id": "event_1",
            "name": "AI Conference",
            "date": "2026-08-20",
            "location": "Guwahati",
            "relevance": 0.95
        }
    ]
    """

    query = """
    MATCH (e:Event)-[focus:FOCUSED_ON]->(t:Topic {id: $topic_id})

    RETURN
        e.id AS event_id,
        e.name AS name,
        e.date AS date,
        e.location AS location,
        e.description AS description,
        focus.relevance AS relevance

    ORDER BY e.date DESC, name
    """

    return run_query(query, {"topic_id": topic_id})


if __name__ == "__main__":
    print(get_events())
