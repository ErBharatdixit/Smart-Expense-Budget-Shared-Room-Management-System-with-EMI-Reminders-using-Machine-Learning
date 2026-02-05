import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import numpy as np
from sklearn.linear_model import LinearRegression

class ExpenseCategorizer:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english')),
            ('clf', MultinomialNB()),
        ])
        
    def train_initial(self):
        # Dummy data to start with
        data = [
            # Travel (10)
            ("uber", "Travel"), ("ola", "Travel"), ("taxi", "Travel"), ("cab", "Travel"), ("bus", "Travel"),
            ("train", "Travel"), ("flight", "Travel"), ("petrol", "Travel"), ("diesel", "Travel"), ("fuel", "Travel"),
            # Food (10)
            ("tomato", "Food"), ("potato", "Food"), ("onion", "Food"), ("vegetables", "Food"), ("grocery", "Food"),
            ("milk", "Food"), ("bread", "Food"), ("eggs", "Food"), ("zomato", "Food"), ("swiggy", "Food"),
            # Entertainment (10)
            ("netflix", "Entertainment"), ("prime video", "Entertainment"), ("disney", "Entertainment"), ("hotstar", "Entertainment"), ("movie", "Entertainment"),
            ("cinema", "Entertainment"), ("spotify", "Entertainment"), ("music", "Entertainment"), ("concert", "Entertainment"), ("gaming", "Entertainment"),
            # Bills (10)
            ("recharge", "Bills"), ("electricity", "Bills"), ("water bill", "Bills"), ("internet", "Bills"), ("wifi", "Bills"),
            ("rent", "Bills"), ("maintenance", "Bills"), ("mobile bill", "Bills"), ("postpaid", "Bills"), ("prepaid", "Bills"),
            # Health (10)
            ("doctor", "Health"), ("hospital", "Health"), ("medicine", "Health"), ("pharmacy", "Health"), ("gym", "Health"),
            ("workout", "Health"), ("fitness", "Health"), ("clinic", "Health"), ("medical", "Health"), ("lab test", "Health"),
            # Education (10)
            ("fees", "Education"), ("school", "Education"), ("college", "Education"), ("tuition", "Education"), ("books", "Education"),
            ("stationary", "Education"), ("exam", "Education"), ("course", "Education"), ("udemy", "Education"), ("coursera", "Education"),
            # Shopping (10)
            ("amazon", "Shopping"), ("flipkart", "Shopping"), ("myntra", "Shopping"), ("shopping", "Shopping"), ("clothes", "Shopping"),
            ("tshirt", "Shopping"), ("jeans", "Shopping"), ("shoes", "Shopping"), ("laptop", "Shopping"), ("mall", "Shopping"),
            # Other (10)
            ("gift", "Other"), ("donation", "Other"), ("charity", "Other"), ("misc", "Other"), ("investment", "Other"),
            ("savings", "Other"), ("pocket money", "Other"), ("cash", "Other"), ("transfer", "Other"), ("presents", "Other")
        ]
        df = pd.DataFrame(data, columns=['description', 'category'])
        self.train(df.to_dict('records'))

    def train(self, expenses_data):
        # expenses_data should be list of dicts: [{'description': '...', 'category': '...'}]
        if not expenses_data:
            return 0
            
        df = pd.DataFrame(expenses_data)
        
        # Ensure we have description and category
        if 'description' not in df.columns or 'category' not in df.columns:
            return 0
            
        X = df['description']
        y = df['category']
        
        self.pipeline.fit(X, y)
        print(f"Model trained with classes: {self.pipeline.named_steps['clf'].classes_}")
        clf = self.pipeline.named_steps['clf']
        print(f"Class priors: {clf.class_log_prior_}")
        self.save_model()
        return self.pipeline.score(X, y) # Return training accuracy

    def predict(self, description):
        description_lower = description.lower()
        
        # 1. Keyword-based matching for high confidence
        keyword_map = {
            'food': ['tomato', 'potato', 'onion', 'vegetable', 'milk', 'bread', 'egg', 'grocery', 'groceries', 'zomato', 'swiggy', 'restaurant', 'dinner', 'lunch', 'breakfast', 'pizza', 'burger', 'fruit', 'biryani', 'maggi', 'chai', 'sutta', 'tea', 'coffee'],
            'travel': ['uber', 'ola', 'taxi', 'cab', 'bus', 'train', 'flight', 'petrol', 'diesel', 'fuel', 'conveyance', 'rickshaw', 'auto', 'rapido', 'metro', 'parking'],
            'entertainment': ['netflix', 'prime video', 'disney', 'hotstar', 'movie', 'cinema', 'spotify', 'music', 'concert', 'gaming', 'pubg', 'xbox', 'ps5', 'theatre', 'clubbing', 'party'],
            'bills': ['recharge', 'electricity', 'water bill', 'internet', 'wifi', 'rent', 'maintenance', 'postpaid', 'prepaid', 'gas cylinder', 'broadband', 'utility', 'dth', 'jio', 'airtel'],
            'health': ['doctor', 'hospital', 'medicine', 'pharmacy', 'gym', 'workout', 'fitness', 'clinic', 'medical', 'lab test', 'dentist', 'yoga', 'protein'],
            'education': ['fees', 'school', 'college', 'tuition', 'books', 'stationary', 'exam', 'course', 'udemy', 'coursera', 'library', 'skillshare'],
            'shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'clothes', 'tshirt', 'jeans', 'shoes', 'laptop', 'mobile phone', 'mall', 'fashion', 'gadget', 'meesho', 'ajio'],
            'other': ['gift', 'donation', 'charity', 'investment', 'savings', 'pocket money', 'cash', 'transfer', 'interest', 'tax', 'puja', 'diwali', 'festival']
        }
        
        for category, keywords in keyword_map.items():
            if any(kw in description_lower for kw in keywords):
                return category.capitalize()

        # 2. Fallback to ML Model
        try:
            prediction = self.pipeline.predict([description])
            return prediction[0]
        except Exception as e:
            print(f"Prediction error: {e}")
            return "Uncategorized"

    def save_model(self):
        joblib.dump(self.pipeline, 'expense_model.pkl')

    def load_model(self):
        try:
            self.pipeline = joblib.load('expense_model.pkl')
        except:
            self.train_initial()

class ExpenseForecaster:
    def __init__(self):
        self.model = LinearRegression()

    def predict_next_month(self, monthly_totals):
        # monthly_totals: list of numbers [amount_m1, amount_m2, ...]
        if len(monthly_totals) < 2:
            # Fallback if not enough data: return the only value or average
            return sum(monthly_totals) / len(monthly_totals) if monthly_totals else 0

        # X = month indices [[0], [1], [2], ...]
        # y = amounts
        X = np.array(range(len(monthly_totals))).reshape(-1, 1)
        y = np.array(monthly_totals)

        self.model.fit(X, y)
        
        # Predict for next month index
        next_month_index = np.array([[len(monthly_totals)]])
        prediction = self.model.predict(next_month_index)
        
        return float(max(0, prediction[0]))

    def analyze_behavior(self, category_distribution):
        # category_distribution: dict of {category: amount}
        if not category_distribution:
            return {"behavior": "Unknown", "tags": []}

        total = sum(category_distribution.values())
        stable_categories = ['Bills', 'Health', 'Education']
        variable_categories = ['Entertainment', 'Shopping', 'Travel', 'Food']

        stable_sum = sum(category_distribution.get(cat, 0) for cat in stable_categories)
        variable_sum = sum(category_distribution.get(cat, 0) for cat in variable_categories)

        tags = []
        if variable_sum > total * 0.6:
            tags.append("High Variable Spend")
        if category_distribution.get('Entertainment', 0) > total * 0.2:
            tags.append("Entertainment Heavy")
        if category_distribution.get('Shopping', 0) > total * 0.2:
            tags.append("Frequent Shopper")

        behavior = "Balanced"
        if stable_sum > total * 0.7:
            behavior = "Conservative"
        elif variable_sum > total * 0.7:
            behavior = "Aggressive"

        return {
            "behavior": behavior,
            "tags": tags,
            "stable_p": (stable_sum / total) * 100 if total > 0 else 0,
            "variable_p": (variable_sum / total) * 100 if total > 0 else 0
        }

    def predict_price(self, price_history):
        # price_history: list of numbers [price_d1, price_d2, ...]
        if len(price_history) < 2:
            return {"predicted_price": price_history[0] if price_history else 0, "trend": "Stable"}

        X = np.array(range(len(price_history))).reshape(-1, 1)
        y = np.array(price_history)

        self.model.fit(X, y)
        
        # Predict for next day/step
        next_index = np.array([[len(price_history)]])
        prediction = self.model.predict(next_index)[0]
        
        # Determine trend based on slope
        slope = self.model.coef_[0]
        trend = "Stable"
        if slope > 0.05: trend = "Increasing"
        elif slope < -0.05: trend = "Decreasing"

        return {
            "predicted_price": float(max(0, prediction)),
            "trend": trend
        }

class ExpensePersonalityAnalyzer:
    def analyze(self, category_distribution, total_spend, month_count):
        if not category_distribution or total_spend == 0:
            return {
                "personality": "Newcomer 🐣",
                "description": "Start tracking to reveal your financial persona!",
                "advice": "Add more expenses to see trends."
            }

        # Calculate percentages
        food_p = (category_distribution.get('Food', 0) + category_distribution.get('Chai/Sutta', 0)) / total_spend
        ent_p = category_distribution.get('Entertainment', 0) / total_spend
        shop_p = category_distribution.get('Shopping', 0) / total_spend
        bill_p = category_distribution.get('Bills', 0) / total_spend
        
        if bill_p > 0.6:
            return {
                "personality": "Saver Monk 🧘",
                "description": "You prioritize essentials and keep a tight ship.",
                "advice": "Don't forget to treat yourself once in a while!"
            }
        elif food_p > 0.4 or ent_p > 0.3:
            return {
                "personality": "Comfort Spender 🍔",
                "description": "You value quality of life and good experiences.",
                "advice": "Try to cut one subscription or one order per week."
            }
        elif shop_p > 0.3:
            return {
                "personality": "Impulse Buyer ⚡",
                "description": "You love the thrill of a new purchase!",
                "advice": "Wait 24 hours before any non-essential purchase."
            }
        else:
            return {
                "personality": "Balanced Planner 🎯",
                "description": "A perfect mix of fun and responsibility.",
                "advice": "Keep it up! You are in the top 10% of budgeters."
            }
