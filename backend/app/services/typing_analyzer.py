from transformers import pipeline
import torch
from google import genai
from typing import Dict
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Get Gemini API key
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in the .env file.")

# Create Gemini client
client = genai.Client(api_key=gemini_api_key)


class TypingAnalyzer:
    def __init__(self):
        print("Loading models...")

        try:
            # Use GPU if available, otherwise CPU
            device = 0 if torch.cuda.is_available() else -1
            precision = (
                torch.float16
                if torch.cuda.is_available()
                else None
            )

            # Load Hugging Face zero-shot classification model
            self.performance_classifier = pipeline(
                "zero-shot-classification",
                model="valhalla/distilbart-mnli-12-6",
                device=device,
                torch_dtype=precision
            )

            # Store Gemini client
            self.gemini_client = client

            print("Gemini client loaded successfully!")
            print("Models loaded successfully!")

        except Exception as e:
            print(f"Error loading models: {str(e)}")

            self.performance_classifier = None
            self.gemini_client = None

    def analyze_session(
        self,
        typed_text: str,
        reference_text: str,
        time_taken: float,
        accuracy: float = None
    ) -> Dict:

        if not typed_text or not reference_text:
            raise ValueError(
                "Both typed text and reference text are required"
            )

        # -------------------------
        # Basic typing calculations
        # -------------------------

        total_characters = len(typed_text)

        words = len(typed_text.split())

        minutes = time_taken / 60

        wpm = words / minutes if minutes > 0 else 0

        # -------------------------
        # Calculate accuracy
        # -------------------------

        if accuracy is None:

            correct_chars = sum(
                1
                for typed, reference
                in zip(typed_text, reference_text)
                if typed == reference
            )

            accuracy = (
                correct_chars / len(reference_text)
            ) * 100 if reference_text else 0

        # -------------------------
        # Find typing errors
        # -------------------------

        errors = [
            {
                "position": i,
                "typed": typed,
                "expected": reference
            }
            for i, (typed, reference)
            in enumerate(zip(typed_text, reference_text))
            if typed != reference
        ]

        # -------------------------
        # Performance categories
        # -------------------------

        performance_categories = [
            "Needs Practice",
            "Showing Improvement",
            "Good Performance",
            "Excellent Performance"
        ]

        # -------------------------
        # Performance classification
        # -------------------------

        try:

            performance = self.performance_classifier(
                f"WPM: {wpm:.1f}, Accuracy: {accuracy:.1f}%",
                candidate_labels=performance_categories
            )

            performance_level = performance["labels"][0]

        except Exception as e:

            performance_level = "Performance analysis unavailable"

            print(
                f"Classification error: {str(e)}"
            )

        # -------------------------
        # Generate AI feedback
        # -------------------------

        feedback = self._generate_feedback_ai(
            wpm,
            accuracy,
            len(errors)
        )

        # -------------------------
        # Return results
        # -------------------------

        return {
            "metrics": {
                "wpm": round(wpm, 1),
                "accuracy": round(accuracy, 1),
                "total_characters": total_characters,
                "error_count": len(errors)
            },

            "performance_level": performance_level,

            "feedback": feedback,

            "error_analysis": errors
        }

    def _generate_feedback_ai(
        self,
        wpm: float,
        accuracy: float,
        error_count: int
    ) -> str:

        # Check Gemini client
        if self.gemini_client is None:

            return (
                "Feedback generation is unavailable "
                "due to model initialization failure."
            )

        # Validate metrics
        if (
            wpm <= 0
            or accuracy < 0
            or accuracy > 100
            or error_count < 0
        ):

            return (
                "Invalid input metrics detected. "
                "Please provide realistic values for "
                "WPM, accuracy, and error count."
            )

        # -------------------------
        # Create Gemini prompt
        # -------------------------

        prompt = (
            "Analyze the following typing session:\n\n"
            f"- Typing Speed: {wpm:.1f} WPM\n"
            f"- Accuracy: {accuracy:.1f}%\n"
            f"- Errors: {error_count}\n\n"
            "Provide a short summary of actionable advice "
            "to improve typing speed and accuracy. "
            "Limit your response to one paragraph."
        )

        try:

            # Generate response using new Google GenAI SDK
            response = self.gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )

            # Return generated text
            return response.text.strip()

        except Exception as e:

            return (
                f"Failed to generate feedback "
                f"due to an error: {str(e)}"
            )