from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .db import verify_connection

from queries import (
    # Events
    get_events,
    get_event_by_id,
    get_event_details,
    get_event_attendees,
    get_event_recommendations,
    # People
    get_person_by_id,
    get_people_with_common_interests,
    shortest_path_between_people,
    # Companies
    get_company_by_id,
    get_company_people,
    # Topics
    get_topics,
    get_topic_people,
    get_topic_events,
)

app = FastAPI(
    title="Event Networking Graph API",
    description="Backend API for the Event Networking Graph",
    version="1.0.0",
)


# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# GENERAL


@app.get("/")
def home():
    """
    Returns:
    {
        "result": "Starting backend server.",
        "verdict": "Check /health endpoints."
    }
    """

    return {
        "result": "Starting backend server.",
        "verdict": "Check /health endpoints.",
    }


@app.get("/health")
def health():
    """
    Returns:
    {
        "status": "ok",
        "db": "connected"
    }

    Error:
    HTTP 503 if Neo4j is not reachable.
    """

    if verify_connection():
        return {
            "status": "ok",
            "db": "connected",
        }

    raise HTTPException(
        status_code=503,
        detail="DB not reachable",
    )


# EVENTS


@app.get("/events")
def list_events():
    """
    GET /events

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

    rows = get_events()

    return [dict(row) for row in rows]


@app.get("/events/{event_id}")
def get_event(event_id: str):
    """
    GET /events/{event_id}

    Returns:
    {
        "id": "event_1",
        "name": "AI Conference",
        "date": "2026-08-20",
        "location": "Guwahati",
        "description": "..."
    }

    Errors:
    404 if event does not exist.
    """

    rows = get_event_by_id(event_id)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return dict(rows[0])


@app.get("/events/{event_id}/details")
def event_details(event_id: str):
    """
    GET /events/{event_id}/details

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

    Errors:
    404 if event does not exist.
    """

    rows = get_event_details(event_id)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return dict(rows[0])


@app.get("/events/{event_id}/attendees")
def list_attendees(event_id: str):
    """
    GET /events/{event_id}/attendees

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

    rows = get_event_attendees(event_id)

    return [dict(row) for row in rows]


@app.get("/events/{event_id}/recommendations")
def event_recommendations(
    event_id: str,
    user_id: str,
    limit: int = Query(default=10, ge=1, le=100),
):
    """
    GET /events/{event_id}/recommendations?user_id=person_1&limit=10

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

    rows = get_event_recommendations(
        event_id,
        user_id,
        limit,
    )

    return [dict(row) for row in rows]


# PEOPLE


@app.get("/people/{person_id}")
def get_person(person_id: str):
    """
    GET /people/{person_id}

    Returns:
    {
        "id": "person_1",
        "name": "Alice",
        "title": "ML Engineer",
        "bio": "..."
    }

    Errors:
    404 if person does not exist.
    """

    rows = get_person_by_id(person_id)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Person not found",
        )

    return dict(rows[0])


@app.get("/people/{person_id}/common-interests")
def common_interests(
    person_id: str,
    limit: int = Query(default=20, ge=1, le=100),
):
    """
    GET /people/{person_id}/common-interests?limit=20

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

    rows = get_people_with_common_interests(
        person_id,
        limit,
    )

    return [dict(row) for row in rows]


@app.get("/people/{person_a_id}/path-to/{person_b_id}")
def person_path(
    person_a_id: str,
    person_b_id: str,
):
    """
    GET /people/{person_a_id}/path-to/{person_b_id}

    Returns:
    {
        "nodes": [
            {
                "id": "person_1",
                "name": "Alice",
                "title": "ML Engineer",
                "bio": "..."
            },
            {
                "id": "event_1",
                "name": "AI Conference",
                "date": "2026-08-20",
                "location": "Guwahati",
                "description": "..."
            }
        ],

        "relationships": [
            {
                "type": "ATTENDED"
            }
        ]
    }

    Errors:
    404 if no path exists.
    """

    path = shortest_path_between_people(
        person_a_id,
        person_b_id,
    )

    if not path:
        raise HTTPException(
            status_code=404,
            detail="No path found",
        )

    nodes = [dict(node) for node in path.nodes]

    relationships = [
        {
            "type": relationship.type,
            "properties": dict(relationship),
        }
        for relationship in path.relationships
    ]

    return {
        "nodes": nodes,
        "relationships": relationships,
    }


# COMPANIES


@app.get("/companies/{company_id}")
def get_company(company_id: str):
    """
    GET /companies/{company_id}

    Returns:
    {
        "id": "company_1",
        "name": "Google",
        "industry": "Technology"
    }

    Errors:
    404 if company does not exist.
    """

    rows = get_company_by_id(company_id)

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return dict(rows[0])


@app.get("/companies/{company_id}/people")
def company_people(company_id: str):
    """
    GET /companies/{company_id}/people

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

    rows = get_company_people(company_id)

    return [dict(row) for row in rows]


# TOPICS


@app.get("/topics")
def list_topics():
    """
    GET /topics

    Returns:
    [
        {
            "id": "topic_ai",
            "name": "Artificial Intelligence"
        }
    ]
    """

    rows = get_topics()

    return [dict(row) for row in rows]


@app.get("/topics/{topic_id}/people")
def topic_people(topic_id: str):
    """
    GET /topics/{topic_id}/people

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

    rows = get_topic_people(topic_id)

    return [dict(row) for row in rows]


@app.get("/topics/{topic_id}/events")
def topic_events(topic_id: str):
    """
    GET /topics/{topic_id}/events

    Returns:
    [
        {
            "event_id": "event_1",
            "name": "AI Conference",
            "date": "2026-08-20",
            "location": "Guwahati",
            "description": "...",
            "relevance": 0.95
        }
    ]
    """

    rows = get_topic_events(topic_id)

    return [dict(row) for row in rows]


# SERVER

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )
