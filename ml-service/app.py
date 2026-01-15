from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "ML Service is running"})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
