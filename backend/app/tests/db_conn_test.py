from backend import app
from flask import jsonify

@app.route('/test', methods=['GET'])
def DBConn_Testing():
    try:
        # Execute a simple query to test the database connection
        result = app.db.session.execute('SELECT 1')
        return jsonify({'message': 'Database connection successful', 'result': result.scalar()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500