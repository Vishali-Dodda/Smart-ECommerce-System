# ShopFusion

A full-stack e-commerce web application built with React and Django REST Framework, featuring product management, shopping cart, checkout, order processing, inventory management, and role-based admin access.

## Overview

ShopFusion provides a complete e-commerce experience for customers while offering administrators tools to manage products, categories, inventory, and orders.

The application follows a REST API architecture, with React handling the frontend and Django REST Framework powering the backend and business logic.

## Key Features

### Customer

- User registration and JWT-based authentication
- Browse products and categories
- Search, filter, sort, and paginate products
- Product details with images and stock information
- Add and manage products in the shopping cart
- Checkout and place orders
- View order history and order details
- Cancel eligible orders

### Admin

- Secure admin-only access
- Manage products and categories
- Manage inventory and product availability
- View and manage customer orders
- Update order status

### Application

- RESTful API architecture
- JWT authentication and authorization
- Product and stock validation
- Automatic inventory updates during order processing
- Responsive and user-friendly interface

## Tech Stack

**Frontend**
- React
- React Router
- JavaScript
- CSS
- Vite

**Backend**
- Python
- Django
- Django REST Framework
- Simple JWT
- django-filter
- django-cors-headers

**Database**
- PostgreSQL

**Tools**
- Git
- GitHub
- VS Code

## Project Structure

```text
Smart-ECommerce-System/
├── cart/
├── orders/
├── products/
├── users/
├── inventory/
├── frontend/
├── manage.py
├── requirements.txt
└── README.md
```

### Installation
1. Clone the repository
```text
git clone https://github.com/Vishali-Dodda/Smart-ECommerce-System.git
cd Smart-ECommerce-System
```
2. Backend Setup

Create and activate a virtual environment:

```text
python -m venv venv
```

Windows:

```text
venv\Scripts\activate
```

Install dependencies:

```text
pip install -r requirements.txt
```

3. Configure Environment Variables

Create a .env file in the project root and add the required Django and PostgreSQL configuration.
```text
Example:

SECRET_KEY=your-secret-key
DEBUG=True

DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
```

4. Run Database Migrations
```text
python manage.py migrate
```

5. Start the Backend
```text
python manage.py runserver
```
6. Start the Frontend

Open a second terminal:
```text
cd frontend
npm install
npm run dev
```

The application can then be accessed through the URL provided by Vite.

### Author

### Vishali Dodda
