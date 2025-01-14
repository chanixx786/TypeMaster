from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import torch
from typing import Dict, List

import google.generativeai as genai

genai.configure(api_key="AIzaSyA4TdT6kuzZhagiKG742xs3Ve4gRenpDLg")
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)

class TypingAnalyzer:
    def __init__(self):
        print("Loading models...")
        try:
            device = 0 if torch.cuda.is_available() else -1
            precision = torch.float16 if torch.cuda.is_available() else None 

            self.performance_classifier = pipeline(
                "zero-shot-classification",
                model="valhalla/distilbart-mnli-12-6",
                device=device,
                torch_dtype=precision
            )

            self.feedback_generator = genai.GenerativeModel("gemini-1.5-flash")
            print("Gemini model loaded successfully!")

            print("Models loaded successfully!")
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            self.performance_classifier = None
            self.feedback_generator = None

    def analyze_session(self, typed_text: str, reference_text: str, time_taken: float, accuracy: float = None) -> Dict:
        if not typed_text or not reference_text:
            raise ValueError("Both typed text and reference text are required")

        total_characters = len(typed_text)
        words = len(typed_text.split())
        minutes = time_taken / 60
        wpm = words / minutes if minutes > 0 else 0

        if accuracy is None:
            correct_chars = sum(1 for i, j in zip(typed_text, reference_text) if i == j)
            accuracy = (correct_chars / len(reference_text)) * 100 if reference_text else 0

        errors = [
            {'position': i, 'typed': typed, 'expected': ref}
            for i, (typed, ref) in enumerate(zip(typed_text, reference_text))
            if typed != ref
        ]

        performance_categories = [
            "Needs Practice",
            "Showing Improvement",
            "Good Performance",
            "Excellent Performance"
        ]

        try:
            performance = self.performance_classifier(
                f"WPM: {wpm:.1f}, Accuracy: {accuracy:.1f}%",
                candidate_labels=performance_categories
            )
            performance_level = performance['labels'][0]
        except Exception as e:
            performance_level = "performance analysis unavailable"
            print(f"Classification error: {str(e)}")

        feedback = self._generate_feedback_ai(wpm, accuracy, len(errors))

        return {
            'metrics': {
                'wpm': round(wpm, 1),
                'accuracy': round(accuracy, 1),
                'total_characters': total_characters,
                'error_count': len(errors)
            },
            'performance_level': performance_level,
            'feedback': feedback,
            'error_analysis': errors
        }

    def _generate_feedback_ai(self, wpm: float, accuracy: float, error_count: int) -> str:
        if self.feedback_generator is None:
            return "Feedback generation is unavailable due to model initialization failure."

        if wpm <= 0 or accuracy < 0 or accuracy > 100 or error_count < 0:
            return "Invalid input metrics detected. Please provide realistic values for WPM, accuracy, and error count."

        prompt = (
            f"Analyze the typing session with the following metrics:\n"
            f"- Typing Speed: {wpm:.1f} WPM\n"
            f"- Accuracy: {accuracy:.1f}%\n"
            f"- Error Count: {error_count}\n"
            f"Provide a short summary of actionable advice to improve typing speed and accuracy. limit your response to 1 paragraph."
        )

        try:
            # Use the Gemini model to generate content
            response = self.feedback_generator.generate_content(prompt)
            feedback = response.text.strip()
        except Exception as e:
            feedback = f"Failed to generate feedback due to an error: {str(e)}"

        return feedback

analyzer = TypingAnalyzer()

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Backend is working!'})

@app.route('/api/analyze-text', methods=['POST'])
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

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)
