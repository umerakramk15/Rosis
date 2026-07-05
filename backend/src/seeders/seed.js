require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User             = require('../models/User');
const Product          = require('../models/Product');
const Order            = require('../models/Order');
const Cart             = require('../models/Cart');
const SalesHistory     = require('../models/SalesHistory');
const CompetitorPrices = require('../models/CompetitorPrices');
const AuditLog         = require('../models/AuditLog');
const CoachingHistory  = require('../models/CoachingHistory');

// ── Images ────────────────────────────────────────────────────────────
const IMAGES = {
  shirts: [
    { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', publicId: 'seed/shirt1' },
    { url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', publicId: 'seed/shirt2' },
    { url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500', publicId: 'seed/shirt3' },
    { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', publicId: 'seed/shirt4' },
    { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500', publicId: 'seed/shirt5' },
  ],
  shoes: [
    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', publicId: 'seed/shoe1' },
    { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500', publicId: 'seed/shoe2' },
    { url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500', publicId: 'seed/shoe3' },
    { url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500', publicId: 'seed/shoe4' },
    { url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500', publicId: 'seed/shoe5' },
  ],
  electronics: [
    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', publicId: 'seed/elec1' },
    { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500', publicId: 'seed/elec2' },
    { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500', publicId: 'seed/elec3' },
    { url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500', publicId: 'seed/elec4' },
    { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', publicId: 'seed/elec5' },
  ],
  bags: [
    { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', publicId: 'seed/bag1' },
    { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', publicId: 'seed/bag2' },
    { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', publicId: 'seed/bag3' },
    { url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500', publicId: 'seed/bag4' },
    { url: 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=500', publicId: 'seed/bag5' },
  ],
  watches: [
    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', publicId: 'seed/watch1' },
    { url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500', publicId: 'seed/watch2' },
    { url: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=500', publicId: 'seed/watch3' },
    { url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500', publicId: 'seed/watch4' },
    { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', publicId: 'seed/watch5' },
  ],
  pants: [
    { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', publicId: 'seed/pant1' },
    { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500', publicId: 'seed/pant2' },
    { url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500', publicId: 'seed/pant3' },
    { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500', publicId: 'seed/pant4' },
    { url: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=500', publicId: 'seed/pant5' },
  ],
  jackets: [
    { url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500', publicId: 'seed/jacket1' },
    { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', publicId: 'seed/jacket2' },
    { url: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=500', publicId: 'seed/jacket3' },
  ],
  perfumes: [
    { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500', publicId: 'seed/perfume1' },
    { url: 'https://images.unsplash.com/photo-1594913958771-fe29b3b38e85?w=500', publicId: 'seed/perfume2' },
    { url: 'https://images.unsplash.com/photo-1588514912908-a8c7b3e8ab7e?w=500', publicId: 'seed/perfume3' },
  ],
};

const PRODUCTS = [
  { name: 'Classic White Formal Shirt', category: 'shirts', price: 1200, stock: 150, description: 'Premium quality white formal shirt made from 100% Egyptian cotton. Perfect for office and formal events. Available in all sizes from S to XXL. Easy iron fabric with a slim fit cut for a professional look.' },
  { name: 'Navy Blue Oxford Shirt', category: 'shirts', price: 1500, stock: 90, description: 'Elegant navy blue Oxford shirt crafted from breathable cotton blend. Features button-down collar and chest pocket. Suitable for both casual and semi-formal occasions. Machine washable.' },
  { name: 'Casual Polo Shirt', category: 'shirts', price: 900, stock: 200, description: 'Comfortable everyday polo shirt in pique cotton fabric. Ribbed collar and cuffs for a neat finish. Available in 8 colors. Great for weekend outings and casual office environments.' },
  { name: 'Striped Casual Shirt', category: 'shirts', price: 1100, stock: 110, description: 'Stylish striped casual shirt with a relaxed fit. Made from soft cotton poplin. Suitable for a day out or casual gatherings. Easy to pair with jeans or chinos.' },
  { name: 'Linen Summer Shirt', category: 'shirts', price: 1350, stock: 75, description: 'Lightweight linen shirt perfect for hot Pakistani summers. Breathable fabric keeps you cool all day. Features two chest pockets and a classic collar. Available in beige, white and sky blue.' },
  { name: 'Black Slim Fit Shirt', category: 'shirts', price: 1400, stock: 85, description: 'Modern slim fit black shirt made from premium stretch cotton. Perfect for evening events and dinner parties. Non-iron fabric with a tailored look. Pair with dress trousers for a sharp appearance.' },
  { name: 'Kurta Shalwar Set', category: 'shirts', price: 2800, stock: 60, description: 'Traditional Pakistani kurta shalwar set made from premium lawn fabric. Intricate embroidery on the neckline and cuffs. Comes with matching shalwar. Perfect for Eid, weddings and cultural events.' },
  { name: 'Check Flannel Shirt', category: 'shirts', price: 1250, stock: 95, description: 'Cozy check flannel shirt ideal for winter. Soft brushed cotton interior for warmth and comfort. Classic plaid pattern available in red/black and blue/black. Great for outdoor activities.' },
  { name: 'Graphic Print T-Shirt', category: 'shirts', price: 750, stock: 180, description: 'Trendy graphic print t-shirt made from 100% combed cotton. Soft and comfortable for daily wear. Unique design printed with eco-friendly inks. Available in S, M, L, XL.' },
  { name: 'Henley Collar T-Shirt', category: 'shirts', price: 850, stock: 130, description: 'Stylish henley collar t-shirt with 3-button placket. Made from premium single jersey fabric. Slim fit design that flatters all body types. Available in grey, white, navy and olive.' },
  { name: 'White Running Sneakers', category: 'shoes', price: 3500, stock: 60, description: 'High-performance running sneakers with air cushion sole for maximum comfort. Breathable mesh upper keeps feet cool during workouts. Non-slip rubber outsole. Suitable for gym, running and daily casual wear.' },
  { name: 'Leather Oxford Shoes', category: 'shoes', price: 5500, stock: 35, description: 'Classic full-grain leather Oxford shoes with Blake stitch construction. Premium leather upper with a polished finish. Cushioned insole for all-day comfort. Perfect for formal events and office wear.' },
  { name: 'Sports Joggers', category: 'shoes', price: 2800, stock: 70, description: 'Lightweight sports joggers with responsive foam midsole. Knit upper provides a sock-like fit. Suitable for jogging, gym sessions and casual outings. Available in black, white and grey.' },
  { name: 'Casual Loafers', category: 'shoes', price: 2200, stock: 80, description: 'Comfortable slip-on loafers in genuine suede. Cushioned footbed for all-day wear. Versatile design pairs well with jeans or chinos. Available in tan, navy and black.' },
  { name: 'Formal Derby Shoes', category: 'shoes', price: 4800, stock: 25, description: 'Elegant derby shoes crafted from genuine leather with a rubber sole for durability. Classic cap-toe design suitable for all formal occasions. Comes with a dust bag and box.' },
  { name: 'High Top Canvas Sneakers', category: 'shoes', price: 1800, stock: 100, description: 'Trendy high-top canvas sneakers inspired by classic street style. Rubber vulcanized sole for durability. Lace-up closure with metal eyelets. Available in 6 colors.' },
  { name: 'Sandals for Men', category: 'shoes', price: 1200, stock: 120, description: 'Durable leather sandals with cushioned footbed. Adjustable buckle strap for a secure fit. Ideal for summer wear and everyday casual use. Lightweight and easy to clean.' },
  { name: 'Chelsea Boots', category: 'shoes', price: 6200, stock: 20, description: 'Premium Chelsea boots in full-grain leather. Elastic side panels for easy on/off. Stacked leather heel for added height and style. Perfect for winter and semi-formal outings.' },
  { name: 'Wireless Noise Cancelling Headphones', category: 'electronics', price: 8500, stock: 30, description: 'Premium wireless headphones with active noise cancellation technology. 30-hour battery life with quick charge support. Foldable design for portability. Compatible with all Bluetooth devices. Deep bass and crystal clear highs.' },
  { name: 'Smart Watch Pro', category: 'electronics', price: 12000, stock: 18, description: 'Advanced smartwatch with health monitoring features including heart rate, SpO2 and sleep tracking. 1.4 inch AMOLED display with always-on mode. 7-day battery life. Compatible with Android and iOS. Water resistant up to 50m.' },
  { name: 'Bluetooth Speaker', category: 'electronics', price: 4500, stock: 45, description: 'Portable Bluetooth speaker with 360-degree surround sound. IPX7 waterproof rating for outdoor use. 12-hour playtime on single charge. Built-in microphone for hands-free calling. Pairs with two devices simultaneously.' },
  { name: 'Wireless Earbuds', category: 'electronics', price: 5500, stock: 40, description: 'True wireless earbuds with 6mm dynamic drivers for rich audio. Active noise cancellation and transparency mode. 8-hour playtime plus 24 hours with charging case. IPX4 water resistance. Touch controls.' },
  { name: 'Power Bank 20000mAh', category: 'electronics', price: 3200, stock: 55, description: 'High capacity power bank with 20000mAh battery. Supports fast charging for all devices. Two USB-A ports and one USB-C port. LED indicator for battery level. Compact design fits in pocket easily.' },
  { name: 'USB-C Hub 7-in-1', category: 'electronics', price: 2800, stock: 35, description: 'Multi-port USB-C hub with HDMI 4K output, 3 USB 3.0 ports, SD card reader, microSD slot and 100W PD charging. Compatible with MacBook, iPad Pro and all USB-C laptops.' },
  { name: 'Ring Light 10 inch', category: 'electronics', price: 2200, stock: 50, description: 'Professional 10-inch LED ring light for photography and video. 3 color modes with 10 brightness levels. Flexible phone holder and tripod stand included. Perfect for content creators, makeup and online meetings.' },
  { name: 'Mechanical Keyboard', category: 'electronics', price: 6800, stock: 22, description: 'Compact 75% mechanical keyboard with tactile brown switches. RGB backlight with 18 lighting effects. Detachable USB-C cable. N-key rollover for gaming. Durable PBT keycaps with double-shot legends.' },
  { name: 'Laptop Backpack 15.6 inch', category: 'bags', price: 2500, stock: 80, description: 'Durable laptop backpack with dedicated 15.6 inch padded laptop compartment. Multiple organizer pockets for accessories. Water-resistant polyester outer fabric. Ergonomic padded shoulder straps for comfortable carrying.' },
  { name: 'Leather Office Bag', category: 'bags', price: 4200, stock: 30, description: 'Professional full-grain leather office bag with structured design. Fits 13-inch laptop. Multiple interior pockets with zipper closure. Top handle and detachable shoulder strap. Perfect for business professionals.' },
  { name: 'Travel Duffel Bag', category: 'bags', price: 3200, stock: 45, description: 'Large capacity travel duffel bag with 60L volume. Reinforced handles and padded shoulder strap. Separate shoe compartment at the bottom. Multiple exterior pockets. Folds flat for easy storage.' },
  { name: 'Ladies Handbag', category: 'bags', price: 3800, stock: 40, description: 'Elegant ladies handbag in premium PU leather. Spacious main compartment with interior zip pocket and card slots. Gold-tone hardware accents. Adjustable shoulder strap. Available in black, brown and nude.' },
  { name: 'Crossbody Sling Bag', category: 'bags', price: 1800, stock: 65, description: 'Compact crossbody sling bag perfect for daily essentials. Water-resistant nylon fabric with anti-theft zip. Adjustable strap for comfortable fit. Fits phone, wallet and keys easily.' },
  { name: 'Gym Duffel Bag', category: 'bags', price: 2100, stock: 55, description: 'Lightweight gym duffel bag with wet/dry compartment separation. Ventilated shoe pocket. Multiple zip pockets for accessories. Durable polyester with reinforced stitching. Includes detachable shoulder strap.' },
  { name: 'Analog Classic Watch', category: 'watches', price: 6500, stock: 25, description: 'Timeless analog watch with stainless steel case and genuine leather strap. Japanese quartz movement for precise timekeeping. Scratch-resistant mineral glass. Water resistant to 30m. Available in silver and gold tone.' },
  { name: 'Digital Sports Watch', category: 'watches', price: 4200, stock: 40, description: 'Feature-rich digital sports watch with stopwatch, countdown timer and alarm functions. 100m water resistance suitable for swimming. EL backlight for night visibility. Shock-resistant resin case. 5-year battery life.' },
  { name: 'Luxury Gold Watch', category: 'watches', price: 18000, stock: 10, description: 'Premium luxury watch with 18K gold plated stainless steel case. Swiss quartz movement with date display. Sapphire crystal glass for ultimate scratch resistance. Genuine crocodile leather strap. Comes in gift box.' },
  { name: 'Smart Fitness Band', category: 'watches', price: 3500, stock: 50, description: 'Slim fitness band with heart rate monitoring, step counting and sleep tracking. 1.1 inch color display. 14-day battery life. Waterproof to 5ATM. Compatible with Android and iOS. Multiple sports modes.' },
  { name: 'Chronograph Watch', category: 'watches', price: 8500, stock: 18, description: 'Sophisticated chronograph watch with three-eye sub-dial display. Stainless steel bracelet with butterfly clasp. Scratch-resistant sapphire glass. Precise Japanese quartz movement. 50m water resistance.' },
  { name: 'Minimalist Watch', category: 'watches', price: 5200, stock: 30, description: 'Clean minimalist watch design with ultra-thin case. Genuine Italian leather strap in tan color. Simple dial with hour and minute hands only. Japanese quartz movement. Perfect everyday watch for professionals.' },
  { name: 'Slim Fit Chinos', category: 'pants', price: 1800, stock: 100, description: 'Modern slim fit chinos in stretch cotton twill. Sits below waist with tapered leg. Side and back pockets with button closure. Machine washable. Available in khaki, navy, olive and black.' },
  { name: 'Denim Jeans Classic', category: 'pants', price: 2200, stock: 90, description: 'Classic straight-fit denim jeans in 12oz denim fabric. Five-pocket styling with riveted construction. Slight stretch for comfortable fit. Available in dark wash, medium wash and light blue.' },
  { name: 'Cargo Pants', category: 'pants', price: 1600, stock: 75, description: 'Durable cargo pants with 8 pockets for maximum storage. Relaxed fit with adjustable waistband. Ripstop cotton fabric resistant to tearing. Suitable for outdoor activities and casual wear.' },
  { name: 'Formal Dress Trousers', category: 'pants', price: 2000, stock: 60, description: 'Sharp formal dress trousers in wool blend fabric. Flat-front design with side pockets and back welt pockets. Slim fit with a tailored finish. Available in black, charcoal and navy.' },
  { name: 'Jogger Track Pants', category: 'pants', price: 1100, stock: 130, description: 'Comfortable jogger track pants in cotton fleece. Elastic waistband with drawstring. Ribbed cuffs at ankles. Side zip pockets. Perfect for workouts, running and casual lounging.' },
  { name: 'Linen Trousers', category: 'pants', price: 1700, stock: 70, description: 'Lightweight linen trousers ideal for summer. Relaxed fit with pleated front. Elastic back waistband for comfort. Perfect for casual office wear and outdoor events. Available in beige and white.' },
  { name: 'Leather Biker Jacket', category: 'jackets', price: 9500, stock: 15, description: 'Classic biker jacket in genuine full-grain leather. Asymmetric zip closure with multiple zip pockets. Quilted lining for warmth. Snap-button collar and adjustable waist belt. A timeless style statement.' },
  { name: 'Puffer Jacket', category: 'jackets', price: 5500, stock: 25, description: 'Warm puffer jacket with down-alternative fill for cold winters. Water-resistant outer shell. Stand collar with adjustable hood. Packable design comes with its own storage bag. Available in 5 colors.' },
  { name: 'Denim Jacket', category: 'jackets', price: 3200, stock: 40, description: 'Classic denim jacket in 100% cotton denim. Chest flap pockets and side hand pockets. Metal button closure. Slightly oversized fit for layering. Available in dark wash and light blue.' },
  { name: 'Oud and Rose Perfume 100ml', category: 'perfumes', price: 4500, stock: 35, description: 'Luxurious oriental fragrance blending premium oud wood with fresh rose petals. Long-lasting 12+ hour wear. Imported from UAE. Comes in an elegant glass bottle with gift box. Suitable for men and women.' },
  { name: 'Fresh Aqua Cologne 75ml', category: 'perfumes', price: 2800, stock: 50, description: 'Fresh and invigorating aqua cologne with notes of citrus, sea breeze and white musk. Light and refreshing for daily wear. Alcohol-based formula with good projection. Ideal for office and casual use.' },
  { name: 'Floral Women Perfume 50ml', category: 'perfumes', price: 3200, stock: 40, description: 'Elegant floral perfume with top notes of jasmine and peony, heart of rose and base of sandalwood. Feminine and romantic scent perfect for evenings and special occasions. Long-lasting formula.' },
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));
const pastDate = (daysAgo) => new Date(Date.now() - rand(1, daysAgo) * 24 * 60 * 60 * 1000);

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      Cart.deleteMany(),
      SalesHistory.deleteMany(),
      CompetitorPrices.deleteMany(),
      AuditLog.deleteMany(),
      CoachingHistory.deleteMany(),
    ]);
    console.log('🗑️  Cleared all collections');

    const passwordHash = await bcrypt.hash('Password@123', 12);

    const merchants = await User.insertMany([
      { name: 'Ahmed Khan', email: 'merchant1@test.com', passwordHash, role: 'merchant', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isEmailVerified: true },
      { name: 'Sara Ali', email: 'merchant2@test.com', passwordHash, role: 'merchant', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isEmailVerified: true },
      { name: 'Zain ul Abideen', email: 'merchant3@test.com', passwordHash, role: 'merchant', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', isEmailVerified: true },
      { name: 'Mehwish Tariq', email: 'merchant4@test.com', passwordHash, role: 'merchant', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', isEmailVerified: true },
      { name: 'Hamza Siddiqui', email: 'merchant5@test.com', passwordHash, role: 'merchant', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', isEmailVerified: true },
    ]);

    const customers = await User.insertMany([
      { name: 'Usman Raza', email: 'customer1@test.com', passwordHash, role: 'customer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', isEmailVerified: true, addresses: [{ label: 'home', street: 'House 12, Street 4, Gulberg III', city: 'Lahore', province: 'Punjab', postalCode: '54660', isDefault: true }] },
      { name: 'Fatima Malik', email: 'customer2@test.com', passwordHash, role: 'customer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', isEmailVerified: true, addresses: [{ label: 'home', street: 'Flat 5B, Block 9, Clifton', city: 'Karachi', province: 'Sindh', postalCode: '75600', isDefault: true }] },
      { name: 'Bilal Sheikh', email: 'customer3@test.com', passwordHash, role: 'customer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', isEmailVerified: true, addresses: [{ label: 'work', street: 'Office 301, Evacuee Trust Complex, F-5/1', city: 'Islamabad', province: 'ICT', postalCode: '44000', isDefault: true }] },
      { name: 'Ayesha Noor', email: 'customer4@test.com', passwordHash, role: 'customer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', isEmailVerified: true, addresses: [{ label: 'home', street: 'House 7, Sector G-11/1', city: 'Islamabad', province: 'ICT', postalCode: '44110', isDefault: true }] },
      { name: 'Tariq Mehmood', email: 'customer5@test.com', passwordHash, role: 'customer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', isEmailVerified: true, addresses: [{ label: 'home', street: 'House 45, Phase 6, DHA', city: 'Lahore', province: 'Punjab', postalCode: '54810', isDefault: true }] },
    ]);

    console.log(`👤 Created ${merchants.length} merchants + ${customers.length} customers`);

    const returnReasons = ['Size mismatch reported by customers', 'Color difference from product images', 'Quality below expectations', 'Wrong item delivered', 'Customer changed mind after purchase', 'Defective product on arrival'];

    const productDocs = PRODUCTS.map((p, i) => {
      const imgArr = IMAGES[p.category] || IMAGES.shirts;
      const img = imgArr[i % imgArr.length];
      const merchant = merchants[i % merchants.length];
      const avgRating = randFloat(3.2, 4.9);
      const returnProb = p.category === 'electronics' ? parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)) : parseFloat((Math.random() * 0.22 + 0.03).toFixed(2));
      const returnLevel = returnProb < 0.15 ? 'low' : returnProb < 0.3 ? 'medium' : 'high';

      return {
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        stock: p.stock,
        merchantId: merchant._id,
        images: [img],
        ratings: { average: avgRating, count: rand(15, 350) },
        returnRisk: { level: returnLevel, probability: returnProb, topReason: pick(returnReasons), lastCalculated: new Date() },
        forecastData: { predictedDemand: rand(10, 60), reorderPoint: rand(20, 40), lastUpdated: new Date() },
        suggestedPrice: parseFloat((p.price * (0.9 + Math.random() * 0.2)).toFixed(0)),
        isActive: true,
        createdAt: pastDate(180),
      };
    });

    const products = await Product.insertMany(productDocs);
    console.log(`📦 Created ${products.length} products`);

    const competitors = ['Daraz', 'iShopping.pk', 'HomeShop', 'Goto.com.pk', 'Yayvo'];
    await CompetitorPrices.insertMany(products.map(p => ({
      productId: p._id,
      competitorName: pick(competitors),
      competitorPrice: parseFloat((p.price * (0.82 + Math.random() * 0.35)).toFixed(0)),
      ourPrice: p.price,
      fetchedAt: pastDate(7),
    })));
    console.log(`💰 Created ${products.length} competitor prices`);

    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled'];
    const promoCodes = [{ code: 'SAVE10', discount: 10 }, { code: 'WELCOME20', discount: 20 }, { code: null, discount: 0 }, { code: null, discount: 0 }, { code: null, discount: 0 }];

    const orderDocs = [];
    for (let i = 0; i < 100; i++) {
      const customer = customers[i % customers.length];
      const numItems = rand(1, 4);
      const usedIdx = new Set();
      const selectedProducts = [];
      while (selectedProducts.length < numItems) {
        const idx = rand(0, products.length - 1);
        if (!usedIdx.has(idx)) { usedIdx.add(idx); selectedProducts.push(products[idx]); }
      }
      const items = selectedProducts.map(p => ({ productId: p._id, merchantId: p.merchantId, name: p.name, qty: rand(1, 3), price: p.price }));
      const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
      const promo = pick(promoCodes);
      const deliveryFee = subtotal > 2500 ? 0 : 200;
      const total = subtotal - promo.discount + deliveryFee;
      const status = pick(orderStatuses);
      const createdAt = pastDate(365);
      orderDocs.push({
        userId: customer._id, items, subtotal, discount: promo.discount,
        promoCode: promo.code, deliveryFee, total,
        shippingAddress: customer.addresses[0],
        paymentMethod: 'cod',
        paymentStatus: status === 'delivered' ? 'paid' : 'pending',
        orderStatus: status,
        estimatedDelivery: new Date(createdAt.getTime() + rand(3, 7) * 24 * 60 * 60 * 1000),
        createdAt,
      });
    }
    await Order.insertMany(orderDocs);
    console.log(`🛒 Created 100 orders`);

    const salesDocs = [];
    for (let i = 0; i < 500; i++) {
      const product = products[i % products.length];
      const date = pastDate(365);
      const unitsSold = rand(1, 25);
      salesDocs.push({ productId: product._id, merchantId: product.merchantId, date, unitsSold, revenue: unitsSold * product.price, price: product.price, dayOfWeek: date.getDay(), month: date.getMonth() + 1, category: product.category });
    }
    await SalesHistory.insertMany(salesDocs);
    console.log(`📊 Created 500 sales history records`);

    const actionTypes = ['product_created', 'product_updated', 'price_changed', 'order_status_updated'];
    const rules = ['Accurate product description required', 'No misleading pricing allowed', 'Valid return policy must be stated', 'Correct category labelling mandatory'];
    const auditDocs = [];
    for (const merchant of merchants) {
      for (let i = 0; i < 4; i++) {
        const isViolation = Math.random() < 0.15;
        auditDocs.push({ merchantId: merchant._id, actionType: pick(actionTypes), relatedRule: pick(rules), isViolation, violationDetails: isViolation ? 'Description contains unverified claims about product quality' : null, summary: isViolation ? 'AI compliance check flagged a potential policy violation.' : 'All listings reviewed and found compliant with platform policies.', resourceId: pick(products)._id, createdAt: pastDate(60) });
      }
    }
    await AuditLog.insertMany(auditDocs);
    console.log(`📋 Created ${auditDocs.length} audit logs`);

    const insights = [
      'Your top-selling category is shirts — consider expanding your collection with more colors and sizes.',
      'Return rate for electronics is slightly above average — improve product descriptions with exact specifications.',
      'Weekend sales spike detected on Fridays and Saturdays — schedule flash sales during these peak hours.',
      'Low stock alert on 4 products — reorder before stockout to avoid losing customers to competitors.',
      'Customer repeat purchase rate is 32% — consider launching a loyalty program to increase retention.',
      'Your average order value is Rs. 3,200 — promote bundle deals to push this higher.',
      'Products with 4+ star ratings sell 3x faster — focus on improving quality and customer service.',
      'Karachi and Lahore are your top markets — consider city-specific promotions to boost conversion.',
    ];
    await CoachingHistory.insertMany(merchants.map(m => ({
      merchantId: m._id,
      kpis: { revenue: rand(80000, 800000), totalOrders: rand(30, 300), returnRate: parseFloat((Math.random() * 0.15).toFixed(2)), topProduct: pick(products).name },
      insights: [pick(insights), pick(insights), pick(insights)],
      generatedAt: pastDate(7),
    })));
    console.log(`🧠 Created ${merchants.length} coaching history records`);

    console.log('\n✅ Database seeded successfully!');
    console.log('─────────────────────────────────────────────────');
    console.log('🔑 Test Credentials (all Password@123)');
    console.log('  MERCHANTS: merchant1@test.com to merchant5@test.com');
    console.log('  CUSTOMERS: customer1@test.com to customer5@test.com');
    console.log('─────────────────────────────────────────────────');
    console.log('📦 50 products | 🛒 100 orders | 📊 500 sales records\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
