"""
Scaled seed data for Event Networking Graph.
Fits comfortably in CognoDB free tier (1 GiB, 50k result rows).

Adjust these params at the top to scale up/down:
"""

from neo4j import GraphDatabase
from db import driver
import random

# ============ CONFIG ============
NUM_PEOPLE = 300
NUM_EVENTS = 12
NUM_COMPANIES = 50
NUM_TOPICS = 25
PEOPLE_PER_EVENT_MIN = 15
PEOPLE_PER_EVENT_MAX = 60
# ================================

FIRST_NAMES = [
    "Alice",
    "Bob",
    "Carol",
    "Dave",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
    "Iris",
    "Jack",
    "Kate",
    "Leo",
    "Mona",
    "Neil",
    "Olivia",
    "Paul",
    "Quinn",
    "Rachel",
    "Sam",
    "Tina",
    "Uma",
    "Victor",
    "Wendy",
    "Xavier",
    "Yara",
    "Zoe",
    "Aaron",
    "Bella",
    "Chris",
    "Diana",
    "Ethan",
    "Fiona",
    "George",
    "Hannah",
    "Ian",
    "Julia",
    "Kevin",
    "Liam",
    "Maya",
    "Noah",
    "Pia",
    "Quinn",
    "Ruth",
    "Stefan",
    "Tara",
    "Uri",
    "Vera",
    "Will",
]

LAST_NAMES = [
    "Johnson",
    "Smith",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Kumar",
    "Singh",
    "Chen",
    "Wang",
    "Kim",
    "Park",
    "Oh",
    "Silva",
    "Santos",
    "Perez",
    "Fernandez",
    "Gomez",
    "Reyes",
    "Moreno",
]

TITLES = [
    "ML Engineer",
    "Data Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "DevOps Engineer",
    "Product Manager",
    "CTO",
    "VP Engineering",
    "Engineering Lead",
    "Senior Engineer",
    "Junior Engineer",
    "Data Scientist",
    "AI Researcher",
    "Solutions Architect",
    "Tech Lead",
    "Engineering Manager",
    "Principal Engineer",
    "Staff Engineer",
    "Intern",
]

COMPANY_NAMES = [
    "Acme Corp",
    "DataCo",
    "FinBank",
    "DevTools Inc",
    "CloudSync",
    "Neural Networks Ltd",
    "DataFlow Systems",
    "FinTech Labs",
    "DevTools Pro",
    "AI Innovations",
    "NextGen Data",
    "QuickBank",
    "CodeStream",
    "TechStack",
    "BrainWave AI",
    "Analytics Pro",
    "MoneyFlow",
    "BuildTools",
    "Quantum AI",
    "DataVault",
    "FinanceFlow",
    "Deployment Engine",
    "SmartAI",
    "DataHub",
    "SecureBank",
    "FastCode",
    "Intelligence Systems",
    "InfoTech",
    "CloudBase",
]

INDUSTRIES = ["AI", "Data", "Fintech", "DevTools", "Cloud", "Analytics", "Security"]

TOPICS_LIST = [
    "AI",
    "LLMs",
    "Machine Learning",
    "Deep Learning",
    "Data Engineering",
    "Fintech",
    "DevTools",
    "Cloud Computing",
    "Kubernetes",
    "Docker",
    "Python",
    "JavaScript",
    "Go",
    "Rust",
    "Web3",
    "Blockchain",
    "API Design",
    "Microservices",
    "Backend",
    "Frontend",
    "Full Stack",
    "MLOps",
    "Data Science",
    "Analytics",
    "NoSQL",
    "Graph Databases",
]

LOCATIONS = [
    "San Francisco",
    "New York",
    "London",
    "Berlin",
    "Singapore",
    "Tokyo",
    "Toronto",
    "Sydney",
    "Mumbai",
    "São Paulo",
    "Seattle",
]


def generate_person_id(first, last):
    """Generate clean ID from name."""
    return f"{first.lower()}_{last.lower()}".replace(" ", "_")


def seed():
    with driver.session() as session:
        # Clear existing data
        print("Clearing existing data...")
        session.run("MATCH (n) DETACH DELETE n")

        # Create topics
        print(f"Creating {NUM_TOPICS} topics...")
        for i, topic_name in enumerate(TOPICS_LIST[:NUM_TOPICS]):
            topic_id = f"topic_{topic_name.lower().replace(' ', '_')}"
            session.run(
                "CREATE (t:Topic {id: $id, name: $name})",
                {"id": topic_id, "name": topic_name},
            )

        # Create companies
        print(f"Creating {NUM_COMPANIES} companies...")
        companies = []
        for i in range(NUM_COMPANIES):
            company_name = COMPANY_NAMES[i % len(COMPANY_NAMES)]
            if i >= len(COMPANY_NAMES):
                company_name += f" {i}"
            company_id = f"company_{i}"
            industry = random.choice(INDUSTRIES)
            session.run(
                "CREATE (c:Company {id: $id, name: $name, industry: $industry})",
                {"id": company_id, "name": company_name, "industry": industry},
            )
            companies.append(company_id)

        # Create events
        print(f"Creating {NUM_EVENTS} events...")
        events = []
        event_names = [
            "AI Summit 2025",
            "Data Day 2025",
            "Fintech Forum",
            "DevTools Conf",
            "Cloud Native 2025",
            "AI for Business",
            "Data Engineering Summit",
            "Blockchain Conference",
            "API Design Summit",
            "MLOps Workshop",
            "Startup Pitch Day",
            "Tech Leaders Summit",
        ]
        
        for i in range(NUM_EVENTS):
            event_id = f"event_{i}"
            event_name = event_names[i % len(event_names)]
            if i >= len(event_names):
                event_name += f" {i}"
            date = f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
            location = random.choice(LOCATIONS)
            description = f"A conference on {event_name.lower()}."

            session.run(
                """
                CREATE (e:Event {
                    id: $id,
                    name: $name,
                    date: $date,
                    location: $location,
                    description: $description
                })
                """,
                {
                    "id": event_id,
                    "name": event_name,
                    "date": date,
                    "location": location,
                    "description": description,
                },
            )
            events.append(event_id)

        # Link events to random topics (3-6 per event)
        print("Linking events to topics...")
        session.run("MATCH (t:Topic) RETURN t.id AS id")
        for event_id in events:
            num_topics = random.randint(3, 6)
            topic_ids = [
                f"topic_{TOPICS_LIST[j].lower().replace(' ', '_')}"
                for j in random.sample(
                    range(len(TOPICS_LIST[:NUM_TOPICS])), min(num_topics, NUM_TOPICS)
                )
            ]
            for t_id in topic_ids:
                session.run(
                    """
                    MATCH (e:Event {id: $e_id}), (t:Topic {id: $t_id})
                    CREATE (e)-[:FOCUSED_ON {relevance: $rel}]->(t)
                    """,
                    {
                        "e_id": event_id,
                        "t_id": t_id,
                        "rel": round(random.uniform(0.5, 1.0), 2),
                    },
                )

        # Create people
        print(f"Creating {NUM_PEOPLE} people...")
        people = []
        for i in range(NUM_PEOPLE):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            person_id = generate_person_id(first, last)
            # Handle collisions
            counter = 1
            base_id = person_id
            while person_id in people:
                person_id = f"{base_id}_{counter}"
                counter += 1

            title = random.choice(TITLES)
            bio = f"{first} is a passionate {title.lower()} interested in building great things."

            session.run(
                "CREATE (p:Person {id: $id, name: $name, title: $title, bio: $bio})",
                {
                    "id": person_id,
                    "name": f"{first} {last}",
                    "title": title,
                    "bio": bio,
                },
            )
            people.append(person_id)

        # Link people to companies (1 per person)
        print("Linking people to companies...")
        for person_id in people:
            company_id = random.choice(companies)
            role = random.choice(["Engineer", "Senior Engineer", "Manager", "Intern"])
            session.run(
                """
                MATCH (p:Person {id: $p_id}), (c:Company {id: $c_id})
                CREATE (p)-[:WORKS_AT {role: $role}]->(c)
                """,
                {"p_id": person_id, "c_id": company_id, "role": role},
            )

        # Link people to topics (2-5 per person)
        print("Linking people to topics...")
        for person_id in people:
            num_topics = random.randint(2, 5)
            topic_indices = random.sample(
                range(NUM_TOPICS), min(num_topics, NUM_TOPICS)
            )
            for idx in topic_indices:
                topic_name = TOPICS_LIST[idx]
                topic_id = f"topic_{topic_name.lower().replace(' ', '_')}"
                strength = round(random.uniform(0.3, 1.0), 2)
                session.run(
                    """
                    MATCH (p:Person {id: $p_id}), (t:Topic {id: $t_id})
                    CREATE (p)-[:INTERESTED_IN {strength: $strength}]->(t)
                    """,
                    {
                        "p_id": person_id,
                        "t_id": topic_id,
                        "strength": strength,
                    },
                )

        # Link people to events (each event gets 15-40 attendees)
        print("Linking people to events...")
        for event_id in events:
            num_attendees = random.randint(PEOPLE_PER_EVENT_MIN, PEOPLE_PER_EVENT_MAX)
            attendee_ids = random.sample(people, min(num_attendees, len(people)))
            for person_id in attendee_ids:
                role = random.choice(["attendee", "speaker", "organizer"])
                year = 2025
                session.run(
                    """
                    MATCH (p:Person {id: $p_id}), (e:Event {id: $e_id})
                    CREATE (p)-[:ATTENDED {role: $role, year: $year}]->(e)
                    """,
                    {
                        "p_id": person_id,
                        "e_id": event_id,
                        "role": role,
                        "year": year,
                    },
                )

        print("✓ Seed data loaded successfully!")
        print(f"  - {NUM_PEOPLE} people")
        print(f"  - {NUM_EVENTS} events")
        print(f"  - {NUM_COMPANIES} companies")
        print(f"  - {NUM_TOPICS} topics")

        # Verify
        counts = session.run("""
            RETURN 
                size([() | 1]) AS total,
                size([(n:Person) | 1]) AS people,
                size([(e:Event) | 1]) AS events,
                size([(c:Company) | 1]) AS companies,
                size([(t:Topic) | 1]) AS topics
        """).single()

        if counts:
            print("\nDatabase counts:")
            for key in ["people", "events", "companies", "topics"]:
                print(f"  {key}: {counts[key]}")

    driver.close()


if __name__ == "__main__":
    seed()
