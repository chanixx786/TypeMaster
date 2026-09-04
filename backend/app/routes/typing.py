from flask import Blueprint, jsonify, request
from sqlalchemy import func

from app.extension import db
from app.models.text import Text
from app.services.typing_service import analyze_and_save

typing_bp = Blueprint("typing", __name__, url_prefix="/api/typing")


@typing_bp.route("/texts", methods=["GET"])
def get_all_texts():
    """List all texts, optionally filtered by category."""
    category = request.args.get("category")
    query = Text.query
    if category:
        query = query.filter_by(category=category)
    texts = query.all()
    return jsonify([
        {"id": t.id, "title": t.title, "category": t.category, "content": t.content}
        for t in texts
    ])


@typing_bp.route("/texts/random", methods=["GET"])
def get_random_text():
    """Get one random text, optionally filtered by category."""
    category = request.args.get("category")
    query = Text.query
    if category:
        query = query.filter_by(category=category)

    text = query.order_by(func.random()).first()  # func.rand() if using MySQL
    if not text:
        return jsonify({"error": "No text found"}), 404

    return jsonify({
        "id": text.id,
        "title": text.title,
        "category": text.category,
        "content": text.content,
    })


@typing_bp.route("/categories", methods=["GET"])
def get_categories():
    """List distinct categories so the frontend can build a filter dropdown."""
    categories = db.session.query(Text.category).distinct().all()
    return jsonify([c[0] for c in categories if c[0]])


@typing_bp.route("/submit", methods=["POST"])
def submit_test():
    """
    Single source of truth for a finished test run.
    Expects: { user_id, text_id, typed_text, time_taken }
    Computes wpm/accuracy/errors/AI feedback server-side, saves TestResult,
    and returns the full result payload to the frontend.
    """
    return analyze_and_save()