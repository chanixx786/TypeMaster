from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import torch
from typing import Dict, List
import os

app = Flask(__name__)
CORS(app)

class TypingAnalyzer:
    def __init__(self):
        print("Loading models...")
        try:
            self.performance_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if torch.cuda.is_available() else -1
            )
            print("Models loaded successfully!")
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            self.performance_classifier = None

    def analyze_session(self, typed_text: str, reference_text: str, time_taken: float, accuracy: float = None) -> Dict:
        """
        Analyze a typing test session with optional provided accuracy
        """
        if not typed_text or not reference_text:
            raise ValueError("Both typed text and reference text are required")

        total_characters = len(typed_text)
        words = len(typed_text.split())
        minutes = time_taken / 60
        
        wpm = words / minutes if minutes > 0 else 0
        
        if accuracy is None:
            correct_chars = sum(1 for i, j in zip(typed_text, reference_text) if i == j)
            accuracy = (correct_chars / len(reference_text)) * 100 if reference_text else 0

        errors = []
        for i, (typed, ref) in enumerate(zip(typed_text, reference_text)):
            if typed != ref:
                errors.append({
                    'position': i,
                    'typed': typed,
                    'expected': ref
                })

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

        feedback = self._generate_feedback(wpm, accuracy, len(errors))

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

    def _generate_feedback(self, wpm: float, accuracy: float, error_count: int) -> str:
        """Generate personalized feedback based on performance metrics"""
        feedback = []
        
        if wpm < 30:
            feedback.append("Your typing speed needs improvement. Focus on building muscle memory through regular practice.")
        elif wpm < 50:
            feedback.append("You're typing at a moderate pace. Keep practicing to increase your speed while maintaining accuracy.")
        elif wpm < 70:
            feedback.append("Good typing speed! You're above average. Work on consistency to maintain this level.")
        else:
            feedback.append("Excellent typing speed! You're performing at an advanced level.")
        
        if accuracy < 90:
            feedback.append("Focus on accuracy over speed. Take time to type each character correctly.")
        elif accuracy < 95:
            feedback.append("Good accuracy, but there's room for improvement. Pay attention to common error patterns.")
        else:
            feedback.append("Outstanding accuracy! Keep up the great work.")
        
        if error_count > 10:
            feedback.append("Consider slowing down to reduce errors. Practice with shorter texts first.")
        elif error_count > 5:
            feedback.append("Work on reducing errors by practicing problem areas.")
        
        return " ".join(feedback)

analyzer = TypingAnalyzer()

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Backend is working!'})

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    try:
        if analyzer.performance_classifier is None:
            return jsonify({'error': 'Models not initialized. Please check the server logs.'}), 500

        data = request.json
        typed_text = data.get('text', '')
        reference_text = data.get('reference_text', '')
        time_taken = float(data.get('time_taken', 0))
        accuracy = float(data.get('accuracy')) if 'accuracy' in data else None

        if not typed_text.strip() or not reference_text.strip():
            return jsonify({'error': 'Both typed text and reference text are required.'}), 400

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
    app.run(debug=True, port=int(os.environ.get('PORT', 5000)), threaded=True)