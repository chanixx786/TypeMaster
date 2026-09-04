import os
from datetime import datetime, timezone, timedelta

from app import create_app
from app.extension import db
from app.models import User, Text, TestResult

app = create_app()

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

CATEGORY_FILES = {
    "programming": ("Learning to Code", "programming.txt"),
    "literature": ("The Lighthouse", "literature.txt"),
    "motivation": ("On Discipline and Growth", "motivation.txt"),
    "science": ("How Things Work", "science.txt"),
}


def load_text_file(filename: str) -> str:
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


def seed_texts():
    for category, (title, filename) in CATEGORY_FILES.items():
        content = load_text_file(filename)
        text = Text(title=title, category=category, content=content)
        db.session.add(text)
    db.session.commit()
    print(f"Seeded {len(CATEGORY_FILES)} texts.")


def seed_users():
    users = [
        User(username="chris_dev", email="chris@example.com", password="hashed_pw_1", is_registered=True),
        User(username="guest_typist", email=None, password=None, is_registered=False),
        User(username="jane_doe", email="jane@example.com", password="hashed_pw_2", is_registered=True),
    ]
    db.session.add_all(users)
    db.session.commit()
    print(f"Seeded {len(users)} users.")
    return users


def seed_test_results(users):
    texts = Text.query.all()
    if not texts or not users:
        print("Skipping test results — need texts and users first.")
        return

    sample_results = [
        TestResult(user_id=users[0].id, text_id=texts[0].id,
                   date_taken=datetime.now(timezone.utc) - timedelta(days=2),
                   wpm=68, accuracy=95, duration=60),
        TestResult(user_id=users[0].id, text_id=texts[1].id,
                   date_taken=datetime.now(timezone.utc) - timedelta(days=1),
                   wpm=72, accuracy=97, duration=90),
        TestResult(user_id=users[2].id, text_id=texts[2].id,
                   date_taken=datetime.now(timezone.utc),
                   wpm=55, accuracy=90, duration=60),
    ]
    db.session.add_all(sample_results)
    db.session.commit()
    print(f"Seeded {len(sample_results)} test results.")


if __name__ == "__main__":
    with app.app_context():
        seed_texts()
        users = seed_users()
        seed_test_results(users)
        print("Done seeding.")