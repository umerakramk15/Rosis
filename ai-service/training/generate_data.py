import pandas as pd
import numpy as np
import os

np.random.seed(42)

# ─── Sales Data (for forecast model) ───────────────────────────────────────────
categories = ["shirts", "shoes", "electronics", "bags", "watches", "trousers", "jackets"]
product_ids = [f"prod_{i:03d}" for i in range(1, 51)]  # 50 products

sales_records = []
for product_id in product_ids:
    category = np.random.choice(categories)
    base_demand = np.random.randint(5, 50)

    for day in range(180):  # 6 months of daily data
        date = pd.Timestamp("2024-07-01") + pd.Timedelta(days=day)

        # Weekend boost
        weekend_boost = 1.3 if date.weekday() >= 5 else 1.0
        # Seasonal trend
        seasonal = 1 + 0.2 * np.sin(2 * np.pi * day / 30)
        # Random noise
        noise = np.random.normal(1, 0.15)

        units_sold = max(0, int(base_demand * weekend_boost * seasonal * noise))
        price = np.random.randint(500, 5000)
        revenue = units_sold * price

        sales_records.append({
            "product_id": product_id,
            "category": category,
            "date": date.strftime("%Y-%m-%d"),
            "day_of_week": date.weekday(),
            "month": date.month,
            "units_sold": units_sold,
            "price": price,
            "revenue": revenue
        })

sales_df = pd.DataFrame(sales_records)
sales_df.to_csv(os.path.join(os.path.dirname(__file__), "../data/sales_data.csv"), index=False)
print(f"✅ Sales data generated: {len(sales_df)} records")

# ─── Return Data (for return prediction model) ──────────────────────────────────
return_records = []
categories_return = ["shirts", "shoes", "electronics", "bags", "watches", "trousers", "jackets"]

for _ in range(2000):
    category = np.random.choice(categories_return)
    avg_rating = round(np.random.uniform(1.5, 5.0), 1)
    price = np.random.randint(200, 8000)
    num_reviews = np.random.randint(0, 500)

    # Logic: high price + low rating + electronics = more returns
    return_prob = 0.1
    if avg_rating < 3.0:
        return_prob += 0.3
    elif avg_rating < 4.0:
        return_prob += 0.1
    if price > 5000:
        return_prob += 0.15
    if category == "electronics":
        return_prob += 0.1
    if num_reviews < 10:
        return_prob += 0.05

    return_prob = min(return_prob, 0.95)

    # 0 = low, 1 = medium, 2 = high
    if return_prob < 0.2:
        return_level = 0
    elif return_prob < 0.45:
        return_level = 1
    else:
        return_level = 2

    return_records.append({
        "category": category,
        "avg_rating": avg_rating,
        "price": price,
        "num_reviews": num_reviews,
        "return_level": return_level
    })

return_df = pd.DataFrame(return_records)
return_df.to_csv(os.path.join(os.path.dirname(__file__), "../data/return_data.csv"), index=False)
print(f"✅ Return data generated: {len(return_df)} records")
print("Done! Check data/ folder.")
