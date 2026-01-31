# Demo User Profile & Data - "Sarah Chen"

---

## **👤 User Profile**

**Name:** Sarah Chen  
**Role:** Owner & Manager  
**Business:** "Fresh Valley Market" - Regional organic grocery chain  
**Locations:** 3 stores (Downtown, Westside, Suburban)  
**Years in Business:** 5 years  
**Monthly Revenue:** ~$85,000 across all locations  
**Pain Points Before Visionary ERP:**
- Lost $8,500/year to spoiled organic produce and dairy
- Spent 25 hours/month on manual spreadsheets
- Frequently ran out of popular items (kombucha, almond milk)
- Overstocked slow-moving specialty items
- Couldn't predict seasonal demand shifts

---

## **📦 Product Catalog (30 Products)**

### **Category: Dairy & Eggs (8 products)**

```javascript
[
  {
    id: "PROD-001",
    name: "Organic Whole Milk",
    sku: "MILK-ORG-001",
    category: "Dairy",
    quantity: 65,
    costPrice: 2.80,
    sellingPrice: 5.49,
    expiryDate: "2026-02-08",
    velocity: 28, // units/day - FAST MOVER
    supplier: "Green Valley Farms",
    lastRestocked: "2026-01-29"
  },
  {
    id: "PROD-002",
    name: "Almond Milk (Unsweetened)",
    sku: "MILK-ALM-002",
    category: "Dairy",
    quantity: 42,
    costPrice: 2.50,
    sellingPrice: 4.99,
    expiryDate: "2026-02-12",
    velocity: 18, // FAST MOVER
    supplier: "Nutty Delights Co",
    lastRestocked: "2026-01-30"
  },
  {
    id: "PROD-003",
    name: "Greek Yogurt (Vanilla)",
    sku: "YOG-GRK-003",
    category: "Dairy",
    quantity: 88,
    costPrice: 1.20,
    sellingPrice: 2.99,
    expiryDate: "2026-02-15",
    velocity: 12, // FAST MOVER
    supplier: "Olympus Dairy",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-004",
    name: "Artisan Blue Cheese",
    sku: "CHZ-BLU-004",
    category: "Dairy",
    quantity: 18,
    costPrice: 6.50,
    sellingPrice: 12.99,
    expiryDate: "2026-02-04", // CRITICAL - 3 DAYS!
    velocity: 2, // SLOW MOVER - HIGH RISK!
    supplier: "Craft Cheese Co",
    lastRestocked: "2026-01-15"
  },
  {
    id: "PROD-005",
    name: "Organic Free-Range Eggs (Dozen)",
    sku: "EGG-ORG-005",
    category: "Dairy",
    quantity: 95,
    costPrice: 3.20,
    sellingPrice: 6.99,
    expiryDate: "2026-02-18",
    velocity: 22, // FAST MOVER
    supplier: "Happy Hens Farm",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-006",
    name: "Goat Cheese Log",
    sku: "CHZ-GOT-006",
    category: "Dairy",
    quantity: 12,
    costPrice: 4.00,
    sellingPrice: 8.99,
    expiryDate: "2026-02-06", // WARNING - 5 DAYS
    velocity: 3, // SLOW MOVER
    supplier: "Meadow Goats",
    lastRestocked: "2026-01-20"
  },
  {
    id: "PROD-007",
    name: "Kefir (Plain)",
    sku: "KEF-PLN-007",
    category: "Dairy",
    quantity: 24,
    costPrice: 2.10,
    sellingPrice: 4.49,
    expiryDate: "2026-02-10",
    velocity: 6, // MEDIUM MOVER
    supplier: "Probiotic Pros",
    lastRestocked: "2026-01-28"
  },
  {
    id: "PROD-008",
    name: "Vegan Cream Cheese",
    sku: "CHZ-VGN-008",
    category: "Dairy",
    quantity: 31,
    costPrice: 2.80,
    sellingPrice: 5.99,
    expiryDate: "2026-02-20",
    velocity: 8, // MEDIUM MOVER
    supplier: "Plant-Based Paradise",
    lastRestocked: "2026-01-31"
  }
]
```

---

### **Category: Produce (7 products)**

```javascript
[
  {
    id: "PROD-009",
    name: "Organic Spinach (5oz)",
    sku: "VEG-SPN-009",
    category: "Produce",
    quantity: 48,
    costPrice: 1.50,
    sellingPrice: 3.99,
    expiryDate: "2026-02-05", // WARNING - 4 DAYS
    velocity: 15, // FAST MOVER
    supplier: "Fresh Fields Co",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-010",
    name: "Avocados (Each)",
    sku: "FRT-AVO-010",
    category: "Produce",
    quantity: 120,
    costPrice: 0.80,
    sellingPrice: 2.49,
    expiryDate: "2026-02-07",
    velocity: 35, // FAST MOVER - TOP SELLER!
    supplier: "Tropical Imports",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-011",
    name: "Organic Kale Bundle",
    sku: "VEG-KLE-011",
    category: "Produce",
    quantity: 22,
    costPrice: 1.20,
    sellingPrice: 2.99,
    expiryDate: "2026-02-06",
    velocity: 9, // MEDIUM MOVER
    supplier: "Green Harvest",
    lastRestocked: "2026-01-31"
  },
  {
    id: "PROD-012",
    name: "Heirloom Tomatoes (lb)",
    sku: "VEG-TOM-012",
    category: "Produce",
    quantity: 8,
    costPrice: 2.50,
    sellingPrice: 5.99,
    expiryDate: "2026-02-04", // CRITICAL - 3 DAYS!
    velocity: 4, // SLOW MOVER - RISK!
    supplier: "Heritage Gardens",
    lastRestocked: "2026-01-27"
  },
  {
    id: "PROD-013",
    name: "Organic Baby Carrots (1lb)",
    sku: "VEG-CRT-013",
    category: "Produce",
    quantity: 56,
    costPrice: 1.00,
    sellingPrice: 2.49,
    expiryDate: "2026-02-14",
    velocity: 11, // FAST MOVER
    supplier: "Root Veggie Co",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-014",
    name: "Dragon Fruit (Each)",
    sku: "FRT-DRG-014",
    category: "Produce",
    quantity: 14,
    costPrice: 3.00,
    sellingPrice: 6.99,
    expiryDate: "2026-02-05",
    velocity: 2, // SLOW MOVER
    supplier: "Exotic Fruits Inc",
    lastRestocked: "2026-01-28"
  },
  {
    id: "PROD-015",
    name: "Mixed Salad Greens (10oz)",
    sku: "VEG-SLD-015",
    category: "Produce",
    quantity: 38,
    costPrice: 2.20,
    sellingPrice: 4.99,
    expiryDate: "2026-02-07",
    velocity: 13, // FAST MOVER
    supplier: "Fresh Fields Co",
    lastRestocked: "2026-02-01"
  }
]
```

---

### **Category: Bakery (5 products)**

```javascript
[
  {
    id: "PROD-016",
    name: "Sourdough Bread Loaf",
    sku: "BKY-SRD-016",
    category: "Bakery",
    quantity: 28,
    costPrice: 2.50,
    sellingPrice: 5.99,
    expiryDate: "2026-02-04",
    velocity: 16, // FAST MOVER
    supplier: "Artisan Bakers",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-017",
    name: "Gluten-Free Muffins (4-pack)",
    sku: "BKY-MFN-017",
    category: "Bakery",
    quantity: 18,
    costPrice: 3.00,
    sellingPrice: 7.99,
    expiryDate: "2026-02-06",
    velocity: 7, // MEDIUM MOVER
    supplier: "Free & Delicious",
    lastRestocked: "2026-01-30"
  },
  {
    id: "PROD-018",
    name: "Organic Bagels (6-pack)",
    sku: "BKY-BGL-018",
    category: "Bakery",
    quantity: 42,
    costPrice: 2.20,
    sellingPrice: 4.99,
    expiryDate: "2026-02-08",
    velocity: 14, // FAST MOVER
    supplier: "Bagel Bros",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-019",
    name: "Vegan Croissants (Each)",
    sku: "BKY-CRS-019",
    category: "Bakery",
    quantity: 9,
    costPrice: 1.80,
    sellingPrice: 3.99,
    expiryDate: "2026-02-03", // CRITICAL - 2 DAYS!
    velocity: 3, // SLOW MOVER - HIGH RISK!
    supplier: "Plant Pastries",
    lastRestocked: "2026-01-27"
  },
  {
    id: "PROD-020",
    name: "Whole Wheat Tortillas (12-pack)",
    sku: "BKY-TRT-020",
    category: "Bakery",
    quantity: 54,
    costPrice: 1.50,
    sellingPrice: 3.49,
    expiryDate: "2026-02-15",
    velocity: 10, // FAST MOVER
    supplier: "Wrap It Up Co",
    lastRestocked: "2026-02-01"
  }
]
```

---

### **Category: Beverages (6 products)**

```javascript
[
  {
    id: "PROD-021",
    name: "Kombucha - Ginger Lemon",
    sku: "BEV-KOM-021",
    category: "Beverages",
    quantity: 72,
    costPrice: 1.80,
    sellingPrice: 3.99,
    expiryDate: "2026-03-01",
    velocity: 24, // FAST MOVER - TRENDING!
    supplier: "Booch Masters",
    lastRestocked: "2026-02-01"
  },
  {
    id: "PROD-022",
    name: "Cold Pressed Orange Juice",
    sku: "BEV-OJ-022",
    category: "Beverages",
    quantity: 35,
    costPrice: 3.50,
    sellingPrice: 7.99,
    expiryDate: "2026-02-06",
    velocity: 11, // FAST MOVER
    supplier: "Fresh Squeeze Inc",
    lastRestocked: "2026-01-31"
  },
  {
    id: "PROD-023",
    name: "Coconut Water (1L)",
    sku: "BEV-COC-023",
    category: "Beverages",
    quantity: 48,
    costPrice: 2.00,
    sellingPrice: 4.49,
    expiryDate: "2026-04-15",
    velocity: 9, // MEDIUM MOVER
    supplier: "Tropical Hydration",
    lastRestocked: "2026-01-28"
  },
  {
    id: "PROD-024",
    name: "Organic Green Tea (16 bags)",
    sku: "BEV-TEA-024",
    category: "Beverages",
    quantity: 62,
    costPrice: 2.50,
    sellingPrice: 5.99,
    expiryDate: "2026-08-01",
    velocity: 6, // MEDIUM MOVER
    supplier: "Zen Leaf Teas",
    lastRestocked: "2026-01-20"
  },
  {
    id: "PROD-025",
    name: "Sparkling Elderflower Water",
    sku: "BEV-ELD-025",
    category: "Beverages",
    quantity: 16,
    costPrice: 1.50,
    sellingPrice: 3.99,
    expiryDate: "2026-02-20",
    velocity: 3, // SLOW MOVER
    supplier: "Fancy Fizz Co",
    lastRestocked: "2026-01-22"
  },
  {
    id: "PROD-026",
    name: "Protein Smoothie - Chocolate",
    sku: "BEV-SMO-026",
    category: "Beverages",
    quantity: 28,
    costPrice: 2.80,
    sellingPrice: 5.99,
    expiryDate: "2026-02-09",
    velocity: 8, // MEDIUM MOVER
    supplier: "Power Blend",
    lastRestocked: "2026-01-30"
  }
]
```

---

### **Category: Specialty Items (4 products)**

```javascript
[
  {
    id: "PROD-027",
    name: "Organic Honey (12oz)",
    sku: "SPC-HNY-027",
    category: "Specialty",
    quantity: 34,
    costPrice: 4.00,
    sellingPrice: 9.99,
    expiryDate: "2027-01-01", // Long shelf life
    velocity: 5, // MEDIUM MOVER
    supplier: "Bee Happy Apiaries",
    lastRestocked: "2026-01-15"
  },
  {
    id: "PROD-028",
    name: "Truffle-Infused Olive Oil",
    sku: "SPC-OIL-028",
    category: "Specialty",
    quantity: 8,
    costPrice: 12.00,
    sellingPrice: 24.99,
    expiryDate: "2026-06-30",
    velocity: 1, // VERY SLOW MOVER
    supplier: "Gourmet Imports",
    lastRestocked: "2025-12-10"
  },
  {
    id: "PROD-029",
    name: "Matcha Powder (4oz)",
    sku: "SPC-MAT-029",
    category: "Specialty",
    quantity: 22,
    costPrice: 8.00,
    sellingPrice: 16.99,
    expiryDate: "2026-09-01",
    velocity: 4, // SLOW MOVER
    supplier: "Japanese Tea Masters",
    lastRestocked: "2026-01-18"
  },
  {
    id: "PROD-030",
    name: "Himalayan Pink Salt (8oz)",
    sku: "SPC-SLT-030",
    category: "Specialty",
    quantity: 45,
    costPrice: 3.00,
    sellingPrice: 7.99,
    expiryDate: "2028-01-01", // Very long shelf life
    velocity: 6, // MEDIUM MOVER
    supplier: "Mountain Minerals",
    lastRestocked: "2026-01-05"
  }
]
```

---

## **📊 Sales Transactions (Last 30 Days Sample)**

```javascript
// Example transactions showing different patterns
[
  // Day 1 (Jan 2, 2026)
  { date: "2026-01-02", productId: "PROD-010", quantity: 38, revenue: 94.62, cost: 30.40 }, // Avocados
  { date: "2026-01-02", productId: "PROD-001", quantity: 25, revenue: 137.25, cost: 70.00 }, // Milk
  { date: "2026-01-02", productId: "PROD-021", quantity: 22, revenue: 87.78, cost: 39.60 }, // Kombucha
  
  // Day 2 (Jan 3, 2026)
  { date: "2026-01-03", productId: "PROD-010", quantity: 42, revenue: 104.58, cost: 33.60 },
  { date: "2026-01-03", productId: "PROD-001", quantity: 28, revenue: 153.72, cost: 78.40 },
  { date: "2026-01-03", productId: "PROD-005", quantity: 20, revenue: 139.80, cost: 64.00 }, // Eggs
  
  // Weekend spike (Jan 4-5, 2026)
  { date: "2026-01-04", productId: "PROD-010", quantity: 55, revenue: 136.95, cost: 44.00 }, // Saturday avocado spike
  { date: "2026-01-04", productId: "PROD-021", quantity: 35, revenue: 139.65, cost: 63.00 }, // Kombucha weekend boost
  { date: "2026-01-05", productId: "PROD-016", quantity: 24, revenue: 143.76, cost: 60.00 }, // Sunday bread sales
  
  // Slow sellers barely moving
  { date: "2026-01-10", productId: "PROD-004", quantity: 2, revenue: 25.98, cost: 13.00 }, // Blue cheese
  { date: "2026-01-15", productId: "PROD-028", quantity: 1, revenue: 24.99, cost: 12.00 }, // Truffle oil
  { date: "2026-01-18", productId: "PROD-004", quantity: 1, revenue: 12.99, cost: 6.50 }, // Blue cheese again
  { date: "2026-01-25", productId: "PROD-019", quantity: 3, revenue: 11.97, cost: 5.40 }, // Vegan croissant
  
  // Recent trend - Kombucha increasing
  { date: "2026-01-28", productId: "PROD-021", quantity: 28, revenue: 111.72, cost: 50.40 },
  { date: "2026-01-29", productId: "PROD-021", quantity: 30, revenue: 119.70, cost: 54.00 },
  { date: "2026-01-30", productId: "PROD-021", quantity: 32, revenue: 127.68, cost: 57.60 },
  { date: "2026-01-31", productId: "PROD-021", quantity: 35, revenue: 139.65, cost: 63.00 },
  
  // ... (Generate 300+ more transactions across all 30 products)
]
```

---

## **💰 Monthly Expenses**

```javascript
{
  january2026: {
    utilities: [
      { date: "2026-01-05", description: "Electricity - All Locations", amount: 1850.00 },
      { date: "2026-01-10", description: "Water & Sewer", amount: 320.00 },
      { date: "2026-01-12", description: "Gas Heating", amount: 480.00 },
      { date: "2026-01-15", description: "Internet & POS Systems", amount: 295.00 }
    ],
    salaries: [
      { date: "2026-01-01", description: "Store Manager - Downtown", amount: 4200.00 },
      { date: "2026-01-01", description: "Store Manager - Westside", amount: 4000.00 },
      { date: "2026-01-01", description: "Store Manager - Suburban", amount: 3800.00 },
      { date: "2026-01-15", description: "Staff Salaries (8 employees)", amount: 12400.00 }
    ],
    rent: [
      { date: "2026-01-01", description: "Rent - Downtown Location", amount: 4500.00 },
      { date: "2026-01-01", description: "Rent - Westside Location", amount: 3800.00 },
      { date: "2026-01-01", description: "Rent - Suburban Location", amount: 2900.00 }
    ],
    other: [
      { date: "2026-01-08", description: "Marketing - Social Media Ads", amount: 650.00 },
      { date: "2026-01-12", description: "Equipment Repair - Refrigeration", amount: 890.00 },
      { date: "2026-01-18", description: "Cleaning Supplies", amount: 240.00 },
      { date: "2026-01-22", description: "Business Insurance", amount: 1200.00 },
      { date: "2026-01-28", description: "Accounting Software", amount: 89.00 }
    ]
  },
  
  // Calculated totals
  totalUtilities: 2945.00,
  totalSalaries: 24400.00,
  totalRent: 11200.00,
  totalOther: 3069.00,
  totalExpenses: 41614.00
}
```

---

## **⚠️ CRITICAL ALERTS (Current Situation)**

### **Alert 1: CRITICAL - Blue Cheese Spoilage**
```javascript
{
  productId: "PROD-004",
  productName: "Artisan Blue Cheese",
  riskScore: 92,
  priority: "CRITICAL",
  quantity: 18,
  expiryDate: "2026-02-04",
  daysUntilExpiry: 3,
  currentVelocity: 2, // units/day
  potentialLoss: 117.00, // 18 × $6.50
  recommendation: "URGENT: Apply 40% discount immediately or donate to food bank. At current rate, only 6 units will sell before expiry.",
  suggestedAction: "Discount to $7.79 (40% off) to move all units in 2 days",
  timestamp: "2026-02-01T07:30:00Z"
}
```

### **Alert 2: CRITICAL - Vegan Croissants**
```javascript
{
  productId: "PROD-019",
  productName: "Vegan Croissants",
  riskScore: 88,
  priority: "CRITICAL",
  quantity: 9,
  expiryDate: "2026-02-03",
  daysUntilExpiry: 2,
  currentVelocity: 3,
  potentialLoss: 16.20, // 9 × $1.80
  recommendation: "Discount by 35% today. Bundle with coffee promotion at Downtown location.",
  suggestedAction: "Discount to $2.59 and create 'Breakfast Combo' deal",
  timestamp: "2026-02-01T07:30:00Z"
}
```

### **Alert 3: WARNING - Heirloom Tomatoes**
```javascript
{
  productId: "PROD-012",
  productName: "Heirloom Tomatoes",
  riskScore: 76,
  priority: "WARNING",
  quantity: 8,
  expiryDate: "2026-02-04",
  daysUntilExpiry: 3,
  currentVelocity: 4,
  potentialLoss: 20.00, // 8 × $2.50
  recommendation: "Reduce price by 25% or create 'Chef's Special' promotion",
  suggestedAction: "Feature in store recipe cards and discount to $4.49/lb",
  timestamp: "2026-02-01T07:30:00Z"
}
```

### **Alert 4: WARNING - Goat Cheese**
```javascript
{
  productId: "PROD-006",
  productName: "Goat Cheese Log",
  riskScore: 64,
  priority: "WARNING",
  quantity: 12,
  expiryDate: "2026-02-06",
  daysUntilExpiry: 5,
  currentVelocity: 3,
  potentialLoss: 48.00, // 12 × $4.00
  recommendation: "Monitor closely. Consider 20% discount in 2 days if velocity doesn't improve.",
  suggestedAction: "Pair with crackers display or create cheese board promotion",
  timestamp: "2026-02-01T08:00:00Z"
}
```

### **Alert 5: INFO - Dragon Fruit Low Sales**
```javascript
{
  productId: "PROD-014",
  productName: "Dragon Fruit",
  riskScore: 52,
  priority: "INFO",
  quantity: 14,
  expiryDate: "2026-02-05",
  daysUntilExpiry: 4,
  currentVelocity: 2,
  potentialLoss: 42.00, // 14 × $3.00
  recommendation: "Consider reducing future orders. Create smoothie recipe promotion.",
  suggestedAction: "Reduce next order to 6 units instead of 15",
  timestamp: "2026-02-01T09:00:00Z"
}
```

---

## **✨ AI INSIGHTS FEED**

### **Insight 1: Velocity Spike Alert**
```javascript
{
  type: "velocity_increase",
  priority: "IMPORTANT",
  timestamp: "2026-02-01T06:00:00Z",
  title: "Kombucha sales surging! 📈",
  message: "Kombucha - Ginger Lemon velocity increased 45% this week (from 16 to 24 units/day).",
  data: {
    productId: "PROD-021",
    previousVelocity: 16,
    currentVelocity: 24,
    changePercent: 45
  },
  recommendation: "Increase next order from 60 to 90 units. Consider adding new kombucha flavors.",
  actionable: true
}
```

### **Insight 2: Stockout Warning**
```javascript
{
  type: "stockout_risk",
  priority: "CRITICAL",
  timestamp: "2026-02-01T07:15:00Z",
  title: "Avocados running low! 🥑",
  message: "At current velocity (35 units/day), avocados will stock out in 3.4 days.",
  data: {
    productId: "PROD-010",
    currentStock: 120,
    velocity: 35,
    daysToStockout: 3.4
  },
  recommendation: "URGENT: Place emergency order for 150 units today. Avocados are your #1 revenue driver.",
  actionable: true
}
```

### **Insight 3: Profit Forecast Positive**
```javascript
{
  type: "profit_forecast",
  priority: "INFO",
  timestamp: "2026-02-01T05:00:00Z",
  title: "Great news - profit trending up! 💰",
  message: "February profit forecast: $8,240 (+12% vs January)",
  data: {
    currentMonth: "January",
    actualProfit: 7357.50,
    nextMonth: "February",
    predictedProfit: 8240.00,
    changePercent: 12
  },
  recommendation: "Keep up the momentum! Top drivers: Kombucha (+45%), Avocados (stable), Organic Milk (+8%)",
  actionable: false
}
```

### **Insight 4: Slow Mover Overstocked**
```javascript
{
  type: "overstock_warning",
  priority: "WARNING",
  timestamp: "2026-02-01T08:30:00Z",
  title: "Truffle oil not moving ⚠️",
  message: "Truffle-Infused Olive Oil: Only 1 unit sold in 30 days. 8 units still in stock.",
  data: {
    productId: "PROD-028",
    velocity: 1,
    stockLevel: 8,
    daysOfInventory: 240 // Way too high!
  },
  recommendation: "Stop reordering. Create premium gift basket promotion or discount by 30%.",
  actionable: true
}
```

### **Insight 5: Seasonal Opportunity**
```javascript
{
  type: "seasonal_trend",
  priority: "INFO",
  timestamp: "2026-02-01T09:00:00Z",
  title: "Valentine's Day opportunity 💝",
  message: "Specialty items and organic products typically see 20% sales boost during Valentine's week (Feb 10-14).",
  data: {
    event: "Valentine's Day",
    daysUntil: 9,
    expectedBoost: 0.20
  },
  recommendation: "Stock up on: Artisan cheeses, organic chocolates, fresh flowers, champagne alternatives. Create gift basket bundles.",
  actionable: true
}
```

### **Insight 6: Weekend Pattern**
```javascript
{
  type: "pattern_detection",
  priority: "INFO",
  timestamp: "2026-02-01T10:00:00Z",
  title: "Weekend shopping pattern detected 📊",
  message: "Saturday & Sunday consistently show 35% higher sales than weekdays.",
  data: {
    weekdayAverage: 2800,
    weekendAverage: 3780,
    difference: 35
  },
  recommendation: "Schedule more staff on weekends. Ensure high-velocity items (avocados, milk, bread) are fully stocked Friday night.",
  actionable: true
}
```

### **Insight 7: Expense Anomaly**
```javascript
{
  type: "expense_alert",
  priority: "WARNING",
  timestamp: "2026-01-31T16:00:00Z",
  title: "Utility costs higher than usual 💡",
  message: "Electricity bill this month: $1,850 (+22% vs last month). Investigate potential equipment issues.",
  data: {
    category: "Utilities",
    currentMonth: 1850,
    lastMonth: 1515,
    changePercent: 22
  },
  recommendation: "Check refrigeration units for efficiency. One faulty unit could be driving costs up.",
  actionable: true
}
```

---

## **📈 Profit Forecast Data**

### **Historical Profit (Last 60 Days)**
```javascript
// Daily profit samples
[
  { date: "2025-12-03", revenue: 2850, expenses: 1387, profit: 1463 },
  { date: "2025-12-04", revenue: 2920, expenses: 1412, profit: 1508 },
  { date: "2025-12-05", revenue: 3100, expenses: 1450, profit: 1650 },
  // ... weekday pattern averages ~$1400-1600 profit
  
  { date: "2025-12-07", revenue: 3800, expenses: 1520, profit: 2280 }, // Saturday spike
  { date: "2025-12-08", revenue: 3650, expenses: 1490, profit: 2160 }, // Sunday spike
  
  // Holiday season boost (Dec 20-31)
  { date: "2025-12-23", revenue: 4200, expenses: 1680, profit: 2520 },
  { date: "2025-12-24", revenue: 4850, expenses: 1850, profit: 3000 },
  
  // Post-holiday dip (Jan 2-7)
  { date: "2026-01-03", revenue: 2650, expenses: 1380, profit: 1270 },
  { date: "2026-01-04", revenue: 2580, expenses: 1350, profit: 1230 },
  
  // Recovery and growth (Jan 15-31)
  { date: "2026-01-25", revenue: 2950, expenses: 1420, profit: 1530 },
  { date: "2026-01-28", revenue: 3080, expenses: 1450, profit: 1630 },
  { date: "2026-01-31", revenue: 3200, expenses: 1480, profit: 1720 },
  
  // ... (Generate smooth progression showing upward trend)
]

// Monthly Summary
januarySummary: {
  totalRevenue: 87450,
  totalCOGS: 54280,
  grossProfit: 33170,
  totalExpenses: 25812,
  netProfit: 7358,
  profitMargin: 8.4
}
```

### **30-Day Forecast (February 2026)**
```javascript
{
  method: "7-day moving average + linear trend + seasonal adjustment",
  confidence: 78, // percentage
  
  scenarios: {
    worstCase: {
      totalProfit: 6890,
      assumptions: "Kombucha trend reverses, spoilage increases, weather impacts foot traffic"
    },
    expected: {
      totalProfit: 8240,
      assumptions: "Current trends continue, normal seasonal patterns, spoilage prevention working"
    },
    bestCase: {
      totalProfit: 9580,
      assumptions: "Valentine's Day boost, kombucha trend accelerates, zero spoilage"
    }
  },
  
  keyDrivers: [
    { driver: "Kombucha sales surge", impact: "+$420" },
    { driver: "Avocado stable demand", impact: "+$280" },
    { driver: "Reduced spoilage (alerts working)", impact: "+$650" },
    { driver: "Valentine's Day week", impact: "+$580" },
    { driver: "Rising utility costs", impact: "-$180" }
  ],
  
  dailyForecast: [
    { date: "2026-02-01", predicted: 245, confidence: 85 },
    { date: "2026-02-02", predicted: 258, confidence: 84 },
    { date: "2026-02-03", predicted: 262, confidence: 83 },
    // ... weekend spikes on Feb 8-9
    { date: "2026-02-08", predicted: 385, confidence: 80 }, // Saturday
    { date: "2026-02-09", predicted: 368, confidence: 79 }, // Sunday
    // ... Valentine's week boost Feb 10-14
    { date: "2026-02-14", predicted: 420, confidence: 72 }, // Valentine's Day
    // ... (30 days total)
  ]
}
```

---

## **📊 Before vs After Metrics**

### **Before Visionary ERP (Last Year Same Period)**
```javascript
{
  monthlyProfit: 4250,
  spoilageWaste: 710, // dollars
  stockouts: 8, // occurrences
  manualHours: 25, // hours spent on spreadsheets
  forecastAccuracy: 0, // no forecasting
  avgProfitMargin: 4.8
}
```

### **After Visionary ERP (Current - 3 Months In)**
```javascript
{
  monthlyProfit: 7358,
  spoilageWaste: 142, // 80% reduction!
  stockouts: 1, // 87% reduction!
  manualHours: 3, // 88% time saved!
  forecastAccuracy: 78, // new capability
  avgProfitMargin: 8.4, // 75% improvement!
  
  dollarsaved: {
    spoilagePrevention: 568,
    stockoutPrevention: 840,
    betterPurchasing: 420,
    timeSaved: 330, // 22 hours × $15/hr
    totalMonthly: 2158
  }
}
```

---

## **🎯 Sarah's Success Story (Narrative)**

### **Week 1: Discovery**
> *"I opened Fresh Valley Market 5 years ago with a dream of bringing organic, sustainable food to my community. But I was drowning in spreadsheets and throwing away hundreds of dollars in spoiled food every week. When I saw 18 units of expensive blue cheese about to expire, I knew I needed help."*

### **Week 4: Early Wins**
> *"The first month with Visionary ERP was eye-opening. The AI caught my artisan cheese sitting too long and suggested a discount. I sold it all in 2 days instead of tossing it. That one alert saved me $117. The velocity dashboard showed me that kombucha was flying off shelves - something I hadn't noticed because I was too busy with paperwork."*

### **Month 3: Transformation**
> *"Three months in, and I can't imagine running my stores without it. I check the app every morning on my phone - it takes 2 minutes to see what needs attention. Last week, it warned me that avocados (my #1 seller!) were about to run out. I placed an emergency order and avoided a stockout that would have cost me $800 in lost sales.*

> *The profit forecast is surprisingly accurate - 78% confidence and it's been within $200 of actual every month. I finally feel like I'm running my business instead of my business running me. My profit margin went from 4.8% to 8.4%. That's an extra $3,000 a month!"*

---

## **💾 Data File Structure for Implementation**

```javascript
// sarahChenData.js
export const sarahChenUser = {
  profile: { /* profile data */ },
  products: [ /* 30 products */ ],
  transactions: [ /* 300+ transactions */ ],
  expenses: { /* monthly expenses */ },
  alerts: [ /* 5 current alerts */ ],
  insights: [ /* 7 AI insights */ ],
  forecast: { /* prediction data */ },
  metrics: {
    before: { /* last year stats */ },
    after: { /* current stats */ }
  }
}
```

---

**This complete demo dataset tells Sarah Chen's compelling story of transformation, with realistic data that demonstrates all key features of Visionary ERP! 🚀**