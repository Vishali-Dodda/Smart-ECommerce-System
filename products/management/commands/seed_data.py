from decimal import Decimal

from django.core.management.base import BaseCommand
from products.models import Category, Product


CATEGORIES = [
    {
        "name": "Electronics",
        "description": "Everyday electronic devices and accessories.",
    },
    {
        "name": "Laptops & Computers",
        "description": "Laptops, monitors and computer accessories.",
    },
    {
        "name": "Mobile Phones & Accessories",
        "description": "Smartphones, chargers and mobile accessories.",
    },
    {
        "name": "Audio",
        "description": "Headphones, earbuds and speakers.",
    },
    {
        "name": "Cameras & Accessories",
        "description": "Cameras and photography accessories.",
    },
    {
        "name": "TVs & Home Entertainment",
        "description": "Smart TVs and home entertainment devices.",
    },
    {
        "name": "Fashion",
        "description": "Clothing, footwear and fashion accessories.",
    },
    {
        "name": "Home & Kitchen",
        "description": "Useful products for home and kitchen.",
    },
    {
        "name": "Beauty & Personal Care",
        "description": "Personal care and grooming products.",
    },
    {
        "name": "Sports & Fitness",
        "description": "Fitness equipment and sports accessories.",
    },
    {
        "name": "Books",
        "description": "Programming, technology and general books.",
    },
    {
        "name": "Gaming",
        "description": "Gaming peripherals and accessories.",
    },
]


PRODUCTS = [
    # Electronics
    {
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse with adjustable DPI and long battery life.",
        "price": Decimal("899.00"),
        "stock": 45,
        "category": "Electronics",
    },
    {
        "name": "Mechanical Keyboard",
        "description": "Compact mechanical keyboard with tactile switches and RGB lighting.",
        "price": Decimal("2499.00"),
        "stock": 30,
        "category": "Electronics",
    },
    {
        "name": "USB-C Hub",
        "description": "Multi-port USB-C hub with HDMI, USB and fast charging support.",
        "price": Decimal("1499.00"),
        "stock": 25,
        "category": "Electronics",
    },
    {
        "name": "Power Bank 20000mAh",
        "description": "High-capacity power bank with fast charging and dual USB output.",
        "price": Decimal("1799.00"),
        "stock": 4,
        "category": "Electronics",
    },

    # Laptops & Computers
    {
        "name": "Gaming Laptop",
        "description": "High-performance gaming laptop with dedicated graphics and fast SSD storage.",
        "price": Decimal("74999.00"),
        "stock": 10,
        "category": "Laptops & Computers",
    },
    {
        "name": "Business Laptop",
        "description": "Reliable productivity laptop designed for office and professional workloads.",
        "price": Decimal("58999.00"),
        "stock": 15,
        "category": "Laptops & Computers",
    },
    {
        "name": "Ultrabook 14",
        "description": "Slim and lightweight laptop with a high-resolution display.",
        "price": Decimal("67999.00"),
        "stock": 8,
        "category": "Laptops & Computers",
    },
    {
        "name": "24-inch Full HD Monitor",
        "description": "Full HD IPS monitor suitable for work, study and entertainment.",
        "price": Decimal("10999.00"),
        "stock": 20,
        "category": "Laptops & Computers",
    },

    # Mobile Phones & Accessories
    {
        "name": "Smartphone Pro 5G",
        "description": "5G smartphone with AMOLED display, advanced camera and fast charging.",
        "price": Decimal("32999.00"),
        "stock": 18,
        "category": "Mobile Phones & Accessories",
    },
    {
        "name": "Smartphone Protective Case",
        "description": "Shock-resistant protective case with a slim premium design.",
        "price": Decimal("699.00"),
        "stock": 50,
        "category": "Mobile Phones & Accessories",
    },
    {
        "name": "65W Fast Charger",
        "description": "Compact 65W USB-C fast charger compatible with phones and laptops.",
        "price": Decimal("1999.00"),
        "stock": 35,
        "category": "Mobile Phones & Accessories",
    },
    {
        "name": "Wireless Charging Pad",
        "description": "Fast wireless charging pad with a compact non-slip design.",
        "price": Decimal("1299.00"),
        "stock": 22,
        "category": "Mobile Phones & Accessories",
    },

    # Audio
    {
        "name": "Wireless Headphones",
        "description": "Over-ear wireless headphones with active noise cancellation.",
        "price": Decimal("4999.00"),
        "stock": 24,
        "category": "Audio",
    },
    {
        "name": "True Wireless Earbuds",
        "description": "Compact wireless earbuds with clear audio and long battery life.",
        "price": Decimal("2999.00"),
        "stock": 40,
        "category": "Audio",
    },
    {
        "name": "Bluetooth Speaker",
        "description": "Portable Bluetooth speaker with rich sound and water resistance.",
        "price": Decimal("2499.00"),
        "stock": 16,
        "category": "Audio",
    },
    {
        "name": "Wired Earphones",
        "description": "Lightweight wired earphones with an in-line microphone.",
        "price": Decimal("599.00"),
        "stock": 60,
        "category": "Audio",
    },

    # Cameras
    {
        "name": "Mirrorless Camera",
        "description": "Compact mirrorless camera designed for high-quality photography and video.",
        "price": Decimal("64999.00"),
        "stock": 6,
        "category": "Cameras & Accessories",
    },
    {
        "name": "Action Camera",
        "description": "4K action camera with electronic image stabilization.",
        "price": Decimal("8999.00"),
        "stock": 12,
        "category": "Cameras & Accessories",
    },
    {
        "name": "Camera Tripod",
        "description": "Adjustable aluminum tripod suitable for cameras and smartphones.",
        "price": Decimal("1999.00"),
        "stock": 18,
        "category": "Cameras & Accessories",
    },
    {
        "name": "Camera Backpack",
        "description": "Padded camera backpack with dedicated compartments for equipment.",
        "price": Decimal("2799.00"),
        "stock": 14,
        "category": "Cameras & Accessories",
    },

    # TV & Home Entertainment
    {
        "name": "43-inch Smart TV",
        "description": "4K smart television with streaming apps and built-in Wi-Fi.",
        "price": Decimal("32999.00"),
        "stock": 9,
        "category": "TVs & Home Entertainment",
    },
    {
        "name": "55-inch 4K Smart TV",
        "description": "Large 4K smart TV with HDR support and immersive picture quality.",
        "price": Decimal("52999.00"),
        "stock": 5,
        "category": "TVs & Home Entertainment",
    },
    {
        "name": "Streaming Stick",
        "description": "Compact streaming device for accessing popular entertainment services.",
        "price": Decimal("3999.00"),
        "stock": 25,
        "category": "TVs & Home Entertainment",
    },
    {
        "name": "2.1 Channel Soundbar",
        "description": "Compact soundbar with wireless subwoofer for home entertainment.",
        "price": Decimal("6999.00"),
        "stock": 11,
        "category": "TVs & Home Entertainment",
    },

    # Fashion
    {
        "name": "Classic Cotton T-Shirt",
        "description": "Comfortable everyday cotton T-shirt with a regular fit.",
        "price": Decimal("799.00"),
        "stock": 70,
        "category": "Fashion",
    },
    {
        "name": "Slim Fit Denim Jeans",
        "description": "Classic denim jeans with a comfortable slim fit.",
        "price": Decimal("1999.00"),
        "stock": 35,
        "category": "Fashion",
    },
    {
        "name": "Running Shoes",
        "description": "Lightweight running shoes designed for daily training and walking.",
        "price": Decimal("2999.00"),
        "stock": 28,
        "category": "Fashion",
    },
    {
        "name": "Everyday Backpack",
        "description": "Durable everyday backpack with laptop compartment and multiple pockets.",
        "price": Decimal("1799.00"),
        "stock": 32,
        "category": "Fashion",
    },

    # Home & Kitchen
    {
        "name": "Digital Air Fryer",
        "description": "Digital air fryer with multiple cooking modes and easy temperature control.",
        "price": Decimal("4999.00"),
        "stock": 15,
        "category": "Home & Kitchen",
    },
    {
        "name": "Electric Kettle",
        "description": "Fast-boiling stainless steel electric kettle with automatic shut-off.",
        "price": Decimal("1299.00"),
        "stock": 40,
        "category": "Home & Kitchen",
    },
    {
        "name": "Coffee Maker",
        "description": "Compact coffee maker suitable for everyday home brewing.",
        "price": Decimal("3499.00"),
        "stock": 18,
        "category": "Home & Kitchen",
    },
    {
        "name": "Mixer Grinder",
        "description": "Powerful mixer grinder with multiple stainless steel jars.",
        "price": Decimal("3999.00"),
        "stock": 20,
        "category": "Home & Kitchen",
    },

    # Beauty & Personal Care
    {
        "name": "Electric Beard Trimmer",
        "description": "Rechargeable beard trimmer with adjustable length settings.",
        "price": Decimal("1499.00"),
        "stock": 30,
        "category": "Beauty & Personal Care",
    },
    {
        "name": "Hair Dryer",
        "description": "Compact hair dryer with multiple heat and speed settings.",
        "price": Decimal("1899.00"),
        "stock": 25,
        "category": "Beauty & Personal Care",
    },
    {
        "name": "Daily Face Wash",
        "description": "Gentle daily face wash suitable for regular skincare routines.",
        "price": Decimal("499.00"),
        "stock": 50,
        "category": "Beauty & Personal Care",
    },
    {
        "name": "Personal Grooming Kit",
        "description": "Multi-purpose grooming kit with several interchangeable attachments.",
        "price": Decimal("2499.00"),
        "stock": 17,
        "category": "Beauty & Personal Care",
    },

    # Sports & Fitness
    {
        "name": "Premium Yoga Mat",
        "description": "Non-slip exercise mat designed for yoga, stretching and workouts.",
        "price": Decimal("1299.00"),
        "stock": 35,
        "category": "Sports & Fitness",
    },
    {
        "name": "Adjustable Dumbbell Set",
        "description": "Adjustable dumbbell set suitable for strength training at home.",
        "price": Decimal("4999.00"),
        "stock": 12,
        "category": "Sports & Fitness",
    },
    {
        "name": "Fitness Band",
        "description": "Fitness tracker with activity monitoring, sleep tracking and notifications.",
        "price": Decimal("2499.00"),
        "stock": 21,
        "category": "Sports & Fitness",
    },
    {
        "name": "Resistance Band Set",
        "description": "Set of resistance bands for strength training and mobility exercises.",
        "price": Decimal("999.00"),
        "stock": 45,
        "category": "Sports & Fitness",
    },

    # Books
    {
        "name": "Python Programming Guide",
        "description": "Practical introduction to Python programming for beginners and developers.",
        "price": Decimal("699.00"),
        "stock": 25,
        "category": "Books",
    },
    {
        "name": "Clean Code",
        "description": "A practical guide to writing readable, maintainable and reliable software.",
        "price": Decimal("899.00"),
        "stock": 18,
        "category": "Books",
    },
    {
        "name": "Data Structures & Algorithms",
        "description": "Comprehensive guide to fundamental data structures and algorithms.",
        "price": Decimal("799.00"),
        "stock": 22,
        "category": "Books",
    },
    {
        "name": "Machine Learning Fundamentals",
        "description": "Introduction to core machine learning concepts and practical techniques.",
        "price": Decimal("999.00"),
        "stock": 15,
        "category": "Books",
    },

    # Gaming
    {
        "name": "Gaming Mouse",
        "description": "High-precision gaming mouse with programmable buttons and RGB lighting.",
        "price": Decimal("1999.00"),
        "stock": 26,
        "category": "Gaming",
    },
    {
        "name": "Gaming Headset",
        "description": "Surround-sound gaming headset with a noise-isolating microphone.",
        "price": Decimal("2999.00"),
        "stock": 19,
        "category": "Gaming",
    },
    {
        "name": "Gaming Keyboard",
        "description": "Mechanical gaming keyboard with RGB lighting and programmable keys.",
        "price": Decimal("3499.00"),
        "stock": 14,
        "category": "Gaming",
    },
    {
        "name": "Wireless Game Controller",
        "description": "Ergonomic wireless controller compatible with PC and supported devices.",
        "price": Decimal("2499.00"),
        "stock": 20,
        "category": "Gaming",
    },
]


class Command(BaseCommand):
    help = "Populate the database with development e-commerce data."

    def handle(self, *args, **options):
        categories = {}

        for category_data in CATEGORIES:
            category, _ = Category.objects.update_or_create(
                name=category_data["name"],
                defaults={
                    "description": category_data["description"],
                },
            )
            categories[category.name] = category

        created_count = 0
        skipped_count = 0

        for product_data in PRODUCTS:
            category = categories[product_data["category"]]

            product_exists = Product.objects.filter(
                name=product_data["name"],
                category=category,
            ).exists()

            if product_exists:
                skipped_count += 1
                continue

            Product.objects.create(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                stock=product_data["stock"],
                is_active=True,
                category=category,
            )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Development data seeded successfully."
            )
        )

        self.stdout.write(
            f"Categories processed: {len(CATEGORIES)}"
        )

        self.stdout.write(
            f"Products created: {created_count}"
        )

        self.stdout.write(
            f"Products skipped: {skipped_count}"
        )