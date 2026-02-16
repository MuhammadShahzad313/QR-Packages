CREATE DATABASE IF NOT EXISTS qr_packages_db;
USE qr_packages_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_intl VARCHAR(50),
    price_local VARCHAR(50),
    image_url VARCHAR(255),
    category VARCHAR(50),
    stock VARCHAR(50),
    size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(50),
    total DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_name VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);


-- Seed initial data (optional, based on existing shop.html content)
INSERT INTO products (name, description, price_intl, price_local, image_url, category, stock, size) VALUES
('Ripple Wall Coffee Cup – 8 oz', 'Premium ripple wall hot beverage cup.', '$0.06 – $0.08', 'PKR 10 – 14', 'https://images.unsplash.com/photo-1600170311835-f44a6f3dd89f?w=400', 'Hot', '2500 pcs', '8 oz'),
('Ripple Wall Coffee Cup – 12 oz', 'Triple-layer insulated ripple cup.', '$0.07 – $0.10', 'PKR 12 – 18', 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400', 'Hot', '3000 pcs', '12 oz'),
('Ripple Wall Coffee Cup – 16 oz', 'Large ripple wall coffee cup.', '$0.08 – $0.12', 'PKR 14 – 20', 'https://images.unsplash.com/photo-1549399542-7e3f8bde4f32?w=400', 'Hot', '2000 pcs', '16 oz'),
('Single Wall Paper Cup – 6 oz', 'Budget-friendly hot cup.', '$0.02 – $0.04', 'PKR 4 – 7', 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400', 'Hot', '5000 pcs', '6 oz'),
('Single Wall Paper Cup – 8 oz', 'Standard paper hot beverage cup.', '$0.03 – $0.05', 'PKR 6 – 10', 'https://images.unsplash.com/photo-1572868961513-36c6e0d1de87?w=400', 'Hot', '4000 pcs', '8 oz'),
('Double Wall Coffee Cup – 12 oz', 'Heat-resistant double wall cup.', '$0.07 – $0.11', 'PKR 12 – 18', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', 'Hot', '3000 pcs', '12 oz'),
('PET Cold Drink Cup – 12 oz', 'Crystal clear PET cold cup.', '$0.06 – $0.09', 'PKR 10 – 16', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400', 'Cold', '2500 pcs', '12 oz'),
('PET Cold Drink Cup – 16 oz', 'Durable PET juice cup.', '$0.08 – $0.12', 'PKR 14 – 20', 'https://images.unsplash.com/photo-1551022372-0bd7f3aee0f5?w=400', 'Cold', '2000 pcs', '16 oz'),
('PET Cold Drink Cup – 22 oz', 'Large iced drink cup.', '$0.10 – $0.15', 'PKR 18 – 26', 'https://images.unsplash.com/photo-1537009432298-79e4ad5eccee?w=400', 'Cold', '1500 pcs', '22 oz'),
('Ice Cream Cup – 100 ml', 'Small printed ice cream cup.', '$0.03 – $0.05', 'PKR 6 – 10', 'https://images.unsplash.com/photo-1523475496153-3d6ccfca9cfd?w=400', 'Cold', '4000 pcs', '100 ml'),
('Ice Cream Cup – 200 ml', 'Medium-size coated dessert cup.', '$0.04 – $0.06', 'PKR 8 – 12', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400', 'Cold', '3000 pcs', '200 ml'),
('Salad Bowl – 750 ml PET', 'Crystal PET salad bowl.', '$0.12 – $0.18', 'PKR 30 – 45', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400', 'Cold', '1500 pcs', '750 ml'),
('Salad Bowl – 1000 ml PET', 'Large PET food bowl.', '$0.14 – $0.20', 'PKR 35 – 55', 'https://images.unsplash.com/photo-1589476993369-0f43e51bc4ab?w=400', 'Cold', '1200 pcs', '1000 ml'),
('Burger Box (Kraft)', 'Eco-friendly kraft burger box.', '$0.05 – $0.07', 'PKR 12 – 20', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', 'Food', '3000 pcs', 'Standard'),
('Burger Box (White Coated)', 'Food-grade coated burger box.', '$0.06 – $0.09', 'PKR 14 – 22', 'https://images.unsplash.com/photo-1625938146121-f8dc76e95d85?w=400', 'Food', '2500 pcs', 'Standard'),
('Sandwich Wedge Box (Kraft)', 'Triangular window sandwich box.', '$0.08 – $0.12', 'PKR 16 – 26', 'https://images.unsplash.com/photo-1542868727-0d89f6c4151e?w=400', 'Food', '2000 pcs', 'Large'),
('Pizza Box – 12 inch', 'Durable corrugated pizza box.', '$0.20 – $0.28', 'PKR 45 – 70', 'https://images.unsplash.com/photo-1601924582971-dbb57a4d0f88?w=400', 'Food', '1500 pcs', '12 inch'),
('Pizza Box – 14 inch', 'Large size kraft pizza box.', '$0.25 – $0.32', 'PKR 55 – 85', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'Food', '1200 pcs', '14 inch'),
('French Fry Scoop', 'Classic fry serving scoop.', '$0.03 – $0.05', 'PKR 6 – 10', 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400', 'Food', '4000 pcs', 'Standard'),
('French Fry Box (Kraft)', 'Grease-resistant fry box.', '$0.04 – $0.06', 'PKR 8 – 12', 'https://images.unsplash.com/photo-1597401238102-8f4ecf7a64de?w=400', 'Food', '3000 pcs', 'Medium'),
('Paper Food Tray (Small)', 'Coated cardboard food tray.', '$0.04 – $0.06', 'PKR 8 – 12', 'https://images.unsplash.com/photo-1601312379653-72ec2aef0689?w=400', 'Food', '3500 pcs', 'Small'),
('Paper Food Tray (Large)', 'Large kraft tray for meals.', '$0.06 – $0.09', 'PKR 12 – 18', 'https://images.unsplash.com/photo-1601312379715-a0e0eaa90bf7?w=400', 'Food', '2500 pcs', 'Large'),
('Donut Box (4 Count)', 'Window bakery box.', '$0.10 – $0.14', 'PKR 20 – 30', 'https://images.unsplash.com/photo-1584277266909-e1d6d9aed686?w=400', 'Food', '2000 pcs', '4 pcs'),
('Cake Box (10 inch)', 'High-strength cake box.', '$0.20 – $0.28', 'PKR 45 – 70', 'https://images.unsplash.com/photo-1606312619070-d28f52ec8e63?w=400', 'Food', '1000 pcs', '10 inch'),
('Soup Bowl with Lid (500 ml)', 'Thick kraft soup container.', '$0.10 – $0.14', 'PKR 20 – 35', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', 'Food', '1500 pcs', '500 ml'),
('Soup Bowl with Lid (750 ml)', 'Large kraft soup bowl.', '$0.13 – $0.18', 'PKR 25 – 40', 'https://images.unsplash.com/photo-1583071943807-3fd040ae1f26?w=400', 'Food', '1200 pcs', '750 ml'),
('Kraft Takeaway Box (No. 1)', 'Leak-resistant food box.', '$0.08 – $0.12', 'PKR 18 – 26', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', 'Food', '2000 pcs', '700 ml'),
('Kraft Takeaway Box (No. 3)', 'Large kraft food container.', '$0.12 – $0.16', 'PKR 25 – 40', 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=400', 'Food', '1500 pcs', '1100 ml'),
('Popcorn Tub – 32 oz', 'Cinema-style popcorn bucket.', '$0.12 – $0.18', 'PKR 25 – 35', 'https://images.unsplash.com/photo-1512427691650-1f7c1c1c11b1?w=400', 'Snack', '2000 pcs', '32 oz'),
('Popcorn Tub – 46 oz', 'Large kraft popcorn tub.', '$0.14 – $0.20', 'PKR 30 – 45', 'https://images.unsplash.com/photo-1542928658-22224b1a87f7?w=400', 'Snack', '1500 pcs', '46 oz'),
('Paper Straw (White, 6mm)', 'Eco-friendly paper straw.', '$0.005 – $0.01', 'PKR 1 – 2', 'https://images.unsplash.com/photo-1619250914619-74d32eb7a193?w=400', 'Cutlery', '5000 pcs', '6mm x 210 mm'),
('Paper Straw (Striped)', 'Color-striped paper straws.', '$0.005 – $0.012', 'PKR 1 – 3', 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400', 'Cutlery', '4000 pcs', '6mm x 210 mm'),
('Cutlery Set (Spoon, Fork, Tissue)', 'Packed disposable cutlery.', '$0.07 – $0.10', 'PKR 15 – 25', 'https://images.unsplash.com/photo-1611095973517-e66e4f3a3b85?w=400', 'Cutlery', '2000 pcs', '3 pcs'),
('Hot Paper Cup Lid (Black, 80mm)', 'Fits 8oz–10oz cups.', '$0.01 – $0.02', 'PKR 2 – 4', 'https://images.unsplash.com/photo-1618417826267-9234ab8132df?w=400', 'Lids', '4000 pcs', '80 mm'),
('Cold Cup Dome Lid (PET)', 'Dome lid for smoothies.', '$0.02 – $0.03', 'PKR 3 – 6', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 'Lids', '3500 pcs', '98 mm');
