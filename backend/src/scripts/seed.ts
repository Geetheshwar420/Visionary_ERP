import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import admin, { db, collections, FieldValue } from '../config/firebase';

const SEED_USER = {
    email: 'sara@vision.com',
    password: 'saravision',
    name: 'Sarah Chen'
};

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. Create or Get User
        let userId: string;
        const userSnapshot = await collections.users.where('email', '==', SEED_USER.email).get();

        const hashedPassword = await bcrypt.hash(SEED_USER.password, 12);

        if (userSnapshot.empty) {
            userId = uuidv4();
            await collections.users.doc(userId).set({
                id: userId,
                email: SEED_USER.email,
                name: SEED_USER.name,
                password: hashedPassword,
                role: 'admin',
                businessName: 'Fresh Valley Market',
                locations: ['Downtown', 'Westside', 'Suburban'],
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
            console.log('✅ Created user: sara@vision.com');
        } else {
            userId = userSnapshot.docs[0].id;
            await collections.users.doc(userId).update({
                password: hashedPassword,
                name: SEED_USER.name,
                updatedAt: FieldValue.serverTimestamp()
            });
            console.log('✅ Updated existing user: sara@vision.com');
        }

        // Clear existing data for this user to avoid duplication
        const clearCollection = async (collName: keyof typeof collections) => {
            const snapshot = await collections[collName].where('userId', '==', userId).get();
            const batch = db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        };

        console.log('🧹 Clearing previous data for user...');
        await Promise.all([
            clearCollection('products'),
            clearCollection('transactions'),
            clearCollection('insights'),
            clearCollection('spoilageRisks')
        ]);

        // 2. Seed Products
        const products = [
            // Dairy & Eggs
            { id: "PROD-001", name: "Organic Whole Milk", sku: "MILK-ORG-001", category: "Dairy", quantity: 65, costPrice: 2.80, sellingPrice: 5.49, expiryDate: "2026-02-08", velocity: 28, supplier: "Green Valley Farms", lastRestocked: "2026-01-29" },
            { id: "PROD-002", name: "Almond Milk (Unsweetened)", sku: "MILK-ALM-002", category: "Dairy", quantity: 42, costPrice: 2.50, sellingPrice: 4.99, expiryDate: "2026-02-12", velocity: 18, supplier: "Nutty Delights Co", lastRestocked: "2026-01-30" },
            { id: "PROD-003", name: "Greek Yogurt (Vanilla)", sku: "YOG-GRK-003", category: "Dairy", quantity: 88, costPrice: 1.20, sellingPrice: 2.99, expiryDate: "2026-02-15", velocity: 12, supplier: "Olympus Dairy", lastRestocked: "2026-02-01" },
            { id: "PROD-004", name: "Artisan Blue Cheese", sku: "CHZ-BLU-004", category: "Dairy", quantity: 18, costPrice: 6.50, sellingPrice: 12.99, expiryDate: "2026-02-04", velocity: 2, supplier: "Craft Cheese Co", lastRestocked: "2026-01-15" },
            { id: "PROD-005", name: "Organic Free-Range Eggs (Dozen)", sku: "EGG-ORG-005", category: "Dairy", quantity: 95, costPrice: 3.20, sellingPrice: 6.99, expiryDate: "2026-02-18", velocity: 22, supplier: "Happy Hens Farm", lastRestocked: "2026-02-01" },
            { id: "PROD-006", name: "Goat Cheese Log", sku: "CHZ-GOT-006", category: "Dairy", quantity: 12, costPrice: 4.00, sellingPrice: 8.99, expiryDate: "2026-02-06", velocity: 3, supplier: "Meadow Goats", lastRestocked: "2026-01-20" },
            { id: "PROD-007", name: "Kefir (Plain)", sku: "KEF-PLN-007", category: "Dairy", quantity: 24, costPrice: 2.10, sellingPrice: 4.49, expiryDate: "2026-02-10", velocity: 6, supplier: "Probiotic Pros", lastRestocked: "2026-01-28" },
            { id: "PROD-008", name: "Vegan Cream Cheese", sku: "CHZ-VGN-008", category: "Dairy", quantity: 31, costPrice: 2.80, sellingPrice: 5.99, expiryDate: "2026-02-20", velocity: 8, supplier: "Plant-Based Paradise", lastRestocked: "2026-01-31" },
            // Produce
            { id: "PROD-009", name: "Organic Spinach (5oz)", sku: "VEG-SPN-009", category: "Produce", quantity: 48, costPrice: 1.50, sellingPrice: 3.99, expiryDate: "2026-02-05", velocity: 15, supplier: "Fresh Fields Co", lastRestocked: "2026-02-01" },
            { id: "PROD-010", name: "Avocados (Each)", sku: "FRT-AVO-010", category: "Produce", quantity: 120, costPrice: 0.80, sellingPrice: 2.49, expiryDate: "2026-02-07", velocity: 35, supplier: "Tropical Imports", lastRestocked: "2026-02-01" },
            { id: "PROD-011", name: "Organic Kale Bundle", sku: "VEG-KLE-011", category: "Produce", quantity: 22, costPrice: 1.20, sellingPrice: 2.99, expiryDate: "2026-02-06", velocity: 9, supplier: "Green Harvest", lastRestocked: "2026-01-31" },
            { id: "PROD-012", name: "Heirloom Tomatoes (lb)", sku: "VEG-TOM-012", category: "Produce", quantity: 8, costPrice: 2.50, sellingPrice: 5.99, expiryDate: "2026-02-04", velocity: 4, supplier: "Heritage Gardens", lastRestocked: "2026-01-27" },
            { id: "PROD-013", name: "Organic Baby Carrots (1lb)", sku: "VEG-CRT-013", category: "Produce", quantity: 56, costPrice: 1.00, sellingPrice: 2.49, expiryDate: "2026-02-14", velocity: 11, supplier: "Root Veggie Co", lastRestocked: "2026-02-01" },
            { id: "PROD-014", name: "Dragon Fruit (Each)", sku: "FRT-DRG-014", category: "Produce", quantity: 14, costPrice: 3.00, sellingPrice: 6.99, expiryDate: "2026-02-05", velocity: 2, supplier: "Exotic Fruits Inc", lastRestocked: "2026-01-28" },
            { id: "PROD-015", name: "Mixed Salad Greens (10oz)", sku: "VEG-SLD-015", category: "Produce", quantity: 38, costPrice: 2.20, sellingPrice: 4.99, expiryDate: "2026-02-07", velocity: 13, supplier: "Fresh Fields Co", lastRestocked: "2026-02-01" },
            // Bakery
            { id: "PROD-016", name: "Sourdough Bread Loaf", sku: "BKY-SRD-016", category: "Bakery", quantity: 28, costPrice: 2.50, sellingPrice: 5.99, expiryDate: "2026-02-04", velocity: 16, supplier: "Artisan Bakers", lastRestocked: "2026-02-01" },
            { id: "PROD-017", name: "Gluten-Free Muffins (4-pack)", sku: "BKY-MFN-017", category: "Bakery", quantity: 18, costPrice: 3.00, sellingPrice: 7.99, expiryDate: "2026-02-06", velocity: 7, supplier: "Free & Delicious", lastRestocked: "2026-01-30" },
            { id: "PROD-018", name: "Organic Bagels (6-pack)", sku: "BKY-BGL-018", category: "Bakery", quantity: 42, costPrice: 2.20, sellingPrice: 4.99, expiryDate: "2026-02-08", velocity: 14, supplier: "Bagel Bros", lastRestocked: "2026-02-01" },
            { id: "PROD-019", name: "Vegan Croissants (Each)", sku: "BKY-CRS-019", category: "Bakery", quantity: 9, costPrice: 1.80, sellingPrice: 3.99, expiryDate: "2026-02-03", velocity: 3, supplier: "Plant Pastries", lastRestocked: "2026-01-27" },
            { id: "PROD-020", name: "Whole Wheat Tortillas (12-pack)", sku: "BKY-TRT-020", category: "Bakery", quantity: 54, costPrice: 1.50, sellingPrice: 3.49, expiryDate: "2026-02-15", velocity: 10, supplier: "Wrap It Up Co", lastRestocked: "2026-02-01" },
            // Beverages
            { id: "PROD-021", name: "Kombucha - Ginger Lemon", sku: "BEV-KOM-021", category: "Beverages", quantity: 72, costPrice: 1.80, sellingPrice: 3.99, expiryDate: "2026-03-01", velocity: 24, supplier: "Booch Masters", lastRestocked: "2026-02-01" },
            { id: "PROD-022", name: "Cold Pressed Orange Juice", sku: "BEV-OJ-022", category: "Beverages", quantity: 35, costPrice: 3.50, sellingPrice: 7.99, expiryDate: "2026-02-06", velocity: 11, supplier: "Fresh Squeeze Inc", lastRestocked: "2026-01-31" },
            { id: "PROD-023", name: "Coconut Water (1L)", sku: "BEV-COC-023", category: "Beverages", quantity: 48, costPrice: 2.00, sellingPrice: 4.49, expiryDate: "2026-04-15", velocity: 9, supplier: "Tropical Hydration", lastRestocked: "2026-01-28" },
            { id: "PROD-024", name: "Organic Green Tea (16 bags)", sku: "BEV-TEA-024", category: "Beverages", quantity: 62, costPrice: 2.50, sellingPrice: 5.99, expiryDate: "2026-08-01", velocity: 6, supplier: "Zen Leaf Teas", lastRestocked: "2026-01-20" },
            { id: "PROD-025", name: "Sparkling Elderflower Water", sku: "BEV-ELD-025", category: "Beverages", quantity: 16, costPrice: 1.50, sellingPrice: 3.99, expiryDate: "2026-02-20", velocity: 3, supplier: "Fancy Fizz Co", lastRestocked: "2026-01-22" },
            { id: "PROD-026", name: "Protein Smoothie - Chocolate", sku: "BEV-SMO-026", category: "Beverages", quantity: 28, costPrice: 2.80, sellingPrice: 5.99, expiryDate: "2026-02-09", velocity: 8, supplier: "Power Blend", lastRestocked: "2026-01-30" },
            // Specialty
            { id: "PROD-027", name: "Organic Honey (12oz)", sku: "SPC-HNY-027", category: "Specialty", quantity: 34, costPrice: 4.00, sellingPrice: 9.99, expiryDate: "2027-01-01", velocity: 5, supplier: "Bee Happy Apiaries", lastRestocked: "2026-01-15" },
            { id: "PROD-028", name: "Truffle-Infused Olive Oil", sku: "SPC-OIL-028", category: "Specialty", quantity: 8, costPrice: 12.00, sellingPrice: 24.99, expiryDate: "2026-06-30", velocity: 1, supplier: "Gourmet Imports", lastRestocked: "2025-12-10" },
            { id: "PROD-029", name: "Matcha Powder (4oz)", sku: "SPC-MAT-029", category: "Specialty", quantity: 22, costPrice: 8.00, sellingPrice: 16.99, expiryDate: "2026-09-01", velocity: 4, supplier: "Japanese Tea Masters", lastRestocked: "2026-01-18" },
            { id: "PROD-030", name: "Himalayan Pink Salt (8oz)", sku: "SPC-SLT-030", category: "Specialty", quantity: 45, costPrice: 3.00, sellingPrice: 7.99, expiryDate: "2028-01-01", velocity: 6, supplier: "Mountain Minerals", lastRestocked: "2026-01-05" }
        ];

        const prodBatch = db.batch();
        for (const p of products) {
            const ref = collections.products.doc(p.id);
            prodBatch.set(ref, { ...p, userId, createdAt: FieldValue.serverTimestamp() });
        }
        await prodBatch.commit();
        console.log(`✅ Seeded ${products.length} products`);

        // 3. Seed Transactions (Sales & Expenses)
        const sales = [
            { date: "2026-01-02", productId: "PROD-010", quantity: 38, revenue: 94.62, cost: 30.40 },
            { date: "2026-01-02", productId: "PROD-001", quantity: 25, revenue: 137.25, cost: 70.00 },
            { date: "2026-01-02", productId: "PROD-021", quantity: 22, revenue: 87.78, cost: 39.60 },
            { date: "2026-01-03", productId: "PROD-010", quantity: 42, revenue: 104.58, cost: 33.60 },
            { date: "2026-01-03", productId: "PROD-001", quantity: 28, revenue: 153.72, cost: 78.40 },
            { date: "2026-01-03", productId: "PROD-005", quantity: 20, revenue: 139.80, cost: 64.00 },
            { date: "2026-01-04", productId: "PROD-010", quantity: 55, revenue: 136.95, cost: 44.00 },
            { date: "2026-01-04", productId: "PROD-021", quantity: 35, revenue: 139.65, cost: 63.00 },
            { date: "2026-01-05", productId: "PROD-016", quantity: 24, revenue: 143.76, cost: 60.00 },
            { date: "2026-01-10", productId: "PROD-004", quantity: 2, revenue: 25.98, cost: 13.00 },
            { date: "2026-01-15", productId: "PROD-028", quantity: 1, revenue: 24.99, cost: 12.00 },
            { date: "2026-01-18", productId: "PROD-004", quantity: 1, revenue: 12.99, cost: 6.50 },
            { date: "2026-01-25", productId: "PROD-019", quantity: 3, revenue: 11.97, cost: 5.40 },
            { date: "2026-01-28", productId: "PROD-021", quantity: 28, revenue: 111.72, cost: 50.40 },
            { date: "2026-01-29", productId: "PROD-021", quantity: 30, revenue: 119.70, cost: 54.00 },
            { date: "2026-01-30", productId: "PROD-021", quantity: 32, revenue: 127.68, cost: 57.60 },
            { date: "2026-01-31", productId: "PROD-021", quantity: 35, revenue: 139.65, cost: 63.00 }
        ];

        const expensesData = {
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
        };

        const transBatch = db.batch();

        // Add Sales
        sales.forEach(s => {
            const id = uuidv4();
            transBatch.set(collections.transactions.doc(id), {
                id,
                userId,
                type: 'income',
                category: 'Sales',
                description: `Sale of product ${s.productId}`,
                amount: s.revenue,
                date: s.date,
                status: 'completed',
                productId: s.productId,
                quantity: s.quantity,
                cost: s.cost,
                createdAt: FieldValue.serverTimestamp()
            });
        });

        // Add Expenses
        Object.entries(expensesData).forEach(([category, items]) => {
            items.forEach(item => {
                const id = uuidv4();
                transBatch.set(collections.transactions.doc(id), {
                    id,
                    userId,
                    type: 'expense',
                    category: category.charAt(0).toUpperCase() + category.slice(1),
                    description: item.description,
                    amount: item.amount,
                    date: item.date,
                    status: 'completed',
                    createdAt: FieldValue.serverTimestamp()
                });
            });
        });

        await transBatch.commit();
        console.log(`✅ Seeded transactions (${sales.length} sales, ${Object.values(expensesData).flat().length} expenses)`);

        // 4. Seed Alerts (Spoilage Risks)
        const alerts = [
            { productId: "PROD-004", productName: "Artisan Blue Cheese", riskScore: 92, priority: "CRITICAL", quantity: 18, expiryDate: "2026-02-04", daysUntilExpiry: 3, currentVelocity: 2, potentialLoss: 117.00, recommendation: "URGENT: Apply 40% discount immediately or donate to food bank. At current rate, only 6 units will sell before expiry.", suggestedAction: "Discount to $7.79 (40% off) to move all units in 2 days", timestamp: "2026-02-01T07:30:00Z" },
            { productId: "PROD-019", productName: "Vegan Croissants", riskScore: 88, priority: "CRITICAL", quantity: 9, expiryDate: "2026-02-03", daysUntilExpiry: 2, currentVelocity: 3, potentialLoss: 16.20, recommendation: "Discount by 35% today. Bundle with coffee promotion at Downtown location.", suggestedAction: "Discount to $2.59 and create 'Breakfast Combo' deal", timestamp: "2026-02-01T07:30:00Z" },
            { productId: "PROD-012", productName: "Heirloom Tomatoes", riskScore: 76, priority: "WARNING", quantity: 8, expiryDate: "2026-02-04", daysUntilExpiry: 3, currentVelocity: 4, potentialLoss: 20.00, recommendation: "Reduce price by 25% or create 'Chef's Special' promotion", suggestedAction: "Feature in store recipe cards and discount to $4.49/lb", timestamp: "2026-02-01T07:30:00Z" },
            { productId: "PROD-006", productName: "Goat Cheese Log", riskScore: 64, priority: "WARNING", quantity: 12, expiryDate: "2026-02-06", daysUntilExpiry: 5, currentVelocity: 3, potentialLoss: 48.00, recommendation: "Monitor closely. Consider 20% discount in 2 days if velocity doesn't improve.", suggestedAction: "Pair with crackers display or create cheese board promotion", timestamp: "2026-02-01T08:00:00Z" },
            { productId: "PROD-014", productName: "Dragon Fruit", riskScore: 52, priority: "INFO", quantity: 14, expiryDate: "2026-02-05", daysUntilExpiry: 4, currentVelocity: 2, potentialLoss: 42.00, recommendation: "Consider reducing future orders. Create smoothie recipe promotion.", suggestedAction: "Reduce next order to 6 units instead of 15", timestamp: "2026-02-01T09:00:00Z" }
        ];

        const alertBatch = db.batch();
        for (const a of alerts) {
            const id = uuidv4();
            alertBatch.set(collections.spoilageRisks.doc(id), { id, userId, ...a, status: 'active', createdAt: FieldValue.serverTimestamp() });
        }
        await alertBatch.commit();
        console.log(`✅ Seeded ${alerts.length} alerts`);

        // 5. Seed Insights
        const insights = [
            { type: "velocity_increase", priority: "IMPORTANT", timestamp: "2026-02-01T06:00:00Z", title: "Kombucha sales surging! 📈", message: "Kombucha - Ginger Lemon velocity increased 45% this week (from 16 to 24 units/day).", data: { productId: "PROD-021", previousVelocity: 16, currentVelocity: 24, changePercent: 45 }, recommendation: "Increase next order from 60 to 90 units. Consider adding new kombucha flavors.", actionable: true },
            { type: "stockout_risk", priority: "CRITICAL", timestamp: "2026-02-01T07:15:00Z", title: "Avocados running low! 🥑", message: "At current velocity (35 units/day), avocados will stock out in 3.4 days.", data: { productId: "PROD-010", currentStock: 120, velocity: 35, daysToStockout: 3.4 }, recommendation: "URGENT: Place emergency order for 150 units today. Avocados are your #1 revenue driver.", actionable: true },
            { type: "profit_forecast", priority: "INFO", timestamp: "2026-02-01T05:00:00Z", title: "Great news - profit trending up! 💰", message: "February profit forecast: $8,240 (+12% vs January)", data: { currentMonth: "January", actualProfit: 7357.50, nextMonth: "February", predictedProfit: 8240.00, changePercent: 12 }, recommendation: "Keep up the momentum! Top drivers: Kombucha (+45%), Avocados (stable), Organic Milk (+8%)", actionable: false },
            { type: "overstock_warning", priority: "WARNING", timestamp: "2026-02-01T08:30:00Z", title: "Truffle oil not moving ⚠️", message: "Truffle-Infused Olive Oil: Only 1 unit sold in 30 days. 8 units still in stock.", data: { productId: "PROD-028", velocity: 1, stockLevel: 8, daysOfInventory: 240 }, recommendation: "Stop reordering. Create premium gift basket promotion or discount by 30%.", actionable: true },
            { type: "seasonal_trend", priority: "INFO", timestamp: "2026-02-01T09:00:00Z", title: "Valentine's Day opportunity 💝", message: "Specialty items and organic products typically see 20% sales boost during Valentine's week (Feb 10-14).", data: { event: "Valentine's Day", daysUntil: 9, expectedBoost: 0.20 }, recommendation: "Stock up on: Artisan cheeses, organic chocolates, fresh flowers, champagne alternatives. Create gift basket bundles.", actionable: true },
            { type: "pattern_detection", priority: "INFO", timestamp: "2026-02-01T10:00:00Z", title: "Weekend shopping pattern detected 📊", message: "Saturday & Sunday consistently show 35% higher sales than weekdays.", data: { weekdayAverage: 2800, weekendAverage: 3780, difference: 35 }, recommendation: "Schedule more staff on weekends. Ensure high-velocity items (avocados, milk, bread) are fully stocked Friday night.", actionable: true },
            { type: "expense_alert", priority: "WARNING", timestamp: "2026-01-31T16:00:00Z", title: "Utility costs higher than usual 💡", message: "Electricity bill this month: $1,850 (+22% vs last month). Investigate potential equipment issues.", data: { category: "Utilities", currentMonth: 1850, lastMonth: 1515, changePercent: 22 }, recommendation: "Check refrigeration units for efficiency. One faulty unit could be driving costs up.", actionable: true }
        ];

        const insightBatch = db.batch();
        for (const iny of insights) {
            const id = uuidv4();
            insightBatch.set(collections.insights.doc(id), { id, userId, ...iny, createdAt: FieldValue.serverTimestamp() });
        }
        await insightBatch.commit();
        console.log(`✅ Seeded ${insights.length} insights`);

        console.log('✨ Seeding complete!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Seeding failed:');
        if (error.code) console.error('Error Code:', error.code);
        if (error.message) console.error('Error Message:', error.message);
        if (error.stack) console.error('Stack Trace:', error.stack);
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

seed();
