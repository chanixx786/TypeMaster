from backend import app
from flask import jsonify

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Backend is working!'})