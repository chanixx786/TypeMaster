from datetime import datetime, timezone
from flask import request, jsonify, current_app

from app.extension import db
from app.models.text import Text
from app.models.test_result import TestResult
from .typing_analyzer import TypingAnalyzer

# Instantiated once at import time — module caching means this only loads
# the models a single time per process, not per-request.
analyzer = TypingAnalyzer()


def analyze_and_save():
    try:
        if analyzer.performance_classifier is None or analyzer.gemini_client is None:
            return jsonify({"error": "Models not initialized. Please check the server logs."}), 500

        data = request.json or {}

        user_id = data.get("user_id")
        text_id = data.get("text_id")
        typed_text = data.get("typed_text", "")
        time_taken = float(data.get("time_taken", 0))

        # --- Validation ---
        if not user_id or not text_id:
            return jsonify({"error": "user_id and text_id are required."}), 400

        if not typed_text.strip():
            return jsonify({"error": "typed_text is required."}), 400

        if time_taken <= 0:
            return jsonify({"error": "time_taken must be greater than zero."}), 400

        # --- Pull the canonical reference text from the DB (never trust the client for this) ---
        text_obj = Text.query.get(text_id)
        if not text_obj:
            return jsonify({"error": "Invalid text_id."}), 404

        reference_text = text_obj.content

        # --- Run analysis (wpm, accuracy, error list, AI feedback all computed here) ---
        results = analyzer.analyze_session(
            typed_text=typed_text,
            reference_text=reference_text,
            time_taken=time_taken,
        )

        # --- Persist the result ---
        test_result = TestResult(
            user_id=user_id,
            text_id=text_id,
            date_taken=datetime.now(timezone.utc),
            wpm=round(results["metrics"]["wpm"]),
            accuracy=round(results["metrics"]["accuracy"]),
            duration=round(time_taken),
        )
        db.session.add(test_result)
        db.session.commit()

        results["result_id"] = test_result.id
        return jsonify(results), 201

    except Exception as e:
        current_app.logger.error(f"Unexpected error in analyze_and_save: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500