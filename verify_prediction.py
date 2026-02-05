import requests

url = "http://127.0.0.1:5001/predict_next_month"
data = {
    "monthly_totals": [1000, 1200, 1400, 1600]
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.json()}")

expected_prediction = 1800.0
actual_prediction = response.json().get('predicted_expense')

if actual_prediction == expected_prediction:
    print("✅ Prediction logic is correct (Linear trend [1000, 1200, 1400, 1600] -> 1800)")
else:
    print(f"❌ Prediction mismatch: Expected {expected_prediction}, got {actual_prediction}")
