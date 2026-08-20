from flask import app, request, jsonify
from .typing_analyzer import TypingAnalyzer

analyzer = TypingAnalyzer()

def analyze_text():
    try:
        if analyzer.performance_classifier is None or analyzer.feedback_generator is None:
            return jsonify({'error': 'Models not initialized. Please check the server logs.'}), 500

        data = request.json
        typed_text = data.get('text', '')
        reference_text = data.get('reference_text', '')
        time_taken = float(data.get('time_taken', 0))
        accuracy = float(data.get('accuracy')) if 'accuracy' in data else None

        if not typed_text.strip() or not reference_text.strip():
            return jsonify({'error': 'Both typed text and reference text are required.'}), 400

        if time_taken <= 0:
            return jsonify({'error': 'Time taken must be greater than zero.'}), 400

        results = analyzer.analyze_session(
            typed_text=typed_text,
            reference_text=reference_text,
            time_taken=time_taken,
            accuracy=accuracy
        )

        return jsonify(results)

    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred. Please try again later.'}), 500