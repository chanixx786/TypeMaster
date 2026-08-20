from flask import Blueprint
from app.services import analyze_text 

typing = Blueprint('typing', __name__)

@typing.route('/api/analyze-text', methods=['POST'])
def analyze_routes():
    return analyze_text()