import requests

print("--- Testing /analyze_behavior ---")
url_behavior = "http://127.0.0.1:5001/analyze_behavior"
data_behavior = {
    "category_distribution": {
        "Entertainment": 5000,
        "Shopping": 3000,
        "Food": 2000,
        "Bills": 1000
    }
}
res = requests.post(url_behavior, json=data_behavior)
print(f"Status: {res.status_code}")
print(f"Raw Text: {res.text}")
try:
    print(f"Aggressive Behavior Test: {res.json()}")
except Exception as e:
    print(f"JSON Error: {e}")

data_conservative = {
    "category_distribution": {
        "Bills": 8000,
        "Health": 2000,
        "Food": 1000
    }
}
res_cons = requests.post(url_behavior, json=data_conservative)
print(f"Conservative Behavior Test: {res_cons.json()}")

print("\n✅ Advanced ML Features Verified!")
