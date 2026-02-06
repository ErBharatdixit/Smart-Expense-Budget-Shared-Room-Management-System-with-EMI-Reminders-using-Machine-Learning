from flask import Flask, request, jsonify
from flask_cors import CORS
from model import ExpenseCategorizer, ExpenseForecaster, ExpensePersonalityAnalyzer
import os

app = Flask(__name__)
# Trivial change to force reload
CORS(app)

# Initialize and train models on startup (or load if exists)
model = ExpenseCategorizer()
forecaster = ExpenseForecaster()
personality_analyzer = ExpensePersonalityAnalyzer()

if os.path.exists('expense_model.pkl'):
    model.load_model()
else:
    model.train_initial()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "ExpenseML Engine"})

@app.route('/predict_category', methods=['POST'])
def predict_category():
    data = request.get_json(silent=True)
    
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
        
    description = data.get('description', '')
    
    if not description:
        return jsonify({"error": "No description provided"}), 400
        
    category = model.predict(description)
    return jsonify({"category": category})

@app.route('/predict_next_month', methods=['POST'])
def predict_next_month():
    data = request.get_json(silent=True)
    if not data or 'monthly_totals' not in data:
        return jsonify({"error": "No monthly totals provided"}), 400
    
    monthly_totals = data.get('monthly_totals', [])
    prediction = forecaster.predict_next_month(monthly_totals)
    return jsonify({"predicted_expense": prediction})

@app.route('/analyze_behavior', methods=['POST'])
def analyze_behavior():
    data = request.get_json(silent=True)
    if not data or 'category_distribution' not in data:
        return jsonify({"error": "No category data provided"}), 400
    
    analysis = forecaster.analyze_behavior(data['category_distribution'])
    return jsonify(analysis)

@app.route('/analyze_personality', methods=['POST'])
def analyze_personality():
    data = request.get_json(silent=True)
    if not data or 'category_distribution' not in data:
        return jsonify({"error": "No category data provided"}), 400
    
    total_spend = data.get('total_spend', 0)
    month_count = data.get('month_count', 1)
    
    personality = personality_analyzer.analyze(data['category_distribution'], total_spend, month_count)
    return jsonify(personality)

@app.route('/predict_price', methods=['POST'])
def predict_price():
    data = request.get_json(silent=True)
    if not data or 'prices' not in data:
        return jsonify({"error": "No price history provided"}), 400
    
    analysis = forecaster.predict_price(data['prices'])
    return jsonify(analysis)

@app.route('/train', methods=['POST'])
def train():
    # endpoint to retrain with new data from Node.js backend
    data = request.json
    expenses = data.get('expenses', [])
    
    if not expenses:
        return jsonify({"message": "No data to train"}), 400
        
    metric = model.train(expenses)
    return jsonify({"message": "Training complete", "accuracy": metric})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
