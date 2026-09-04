from app.extension import db

class TestResult(db.Model):
    __tablename__ = "test_results"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    text_id = db.Column(db.Integer, db.ForeignKey("texts.id"), nullable=False)
    date_taken = db.Column(db.DateTime, nullable=False)
    wpm = db.Column(db.Integer, nullable=False)
    accuracy = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, nullable=False)

    user = db.relationship("User", back_populates="test_results")
    text = db.relationship("Text", back_populates="test_results")