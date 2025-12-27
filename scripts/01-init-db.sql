-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500),
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create sample products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Vintage Denim Jacket', 'Classic 90s blue denim jacket in excellent condition', 45.00, 'Jackets', '/placeholder.svg?height=300&width=300', 8),
('Retro Band T-Shirt', 'Worn-in band tee from the 80s era', 25.00, 'Tops', '/placeholder.svg?height=300&width=300', 12),
('Leather Belt', 'Brown leather belt with brass buckle', 18.00, 'Accessories', '/placeholder.svg?height=300&width=300', 15),
('Vintage Plaid Shirt', 'Cozy flannel shirt perfect for fall', 22.00, 'Tops', '/placeholder.svg?height=300&width=300', 10),
('Corduroy Pants', 'Beige corduroy pants with great fit', 35.00, 'Bottoms', '/placeholder.svg?height=300&width=300', 7),
('Wool Sweater', 'Cream colored wool sweater from the 70s', 30.00, 'Tops', '/placeholder.svg?height=300&width=300', 5),
('Canvas Backpack', 'Durable canvas backpack with leather straps', 50.00, 'Bags', '/placeholder.svg?height=300&width=300', 6),
('Vintage Boots', 'Black leather boots in timeless style', 65.00, 'Shoes', '/placeholder.svg?height=300&width=300', 4);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
