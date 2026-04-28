-- Run this SQL in your MySQL database to set up tables

CREATE DATABASE IF NOT EXISTS mala_business CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mala_business;

CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mala_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    date DATE NOT NULL,
    num_malas INT NOT NULL,
    pattern_name VARCHAR(100) NOT NULL,
    price_per_piece DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_status ENUM('paid','pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    date DATE NOT NULL,
    malas_sold INT NOT NULL,
    pattern_name VARCHAR(100) NOT NULL,
    sell_price_per_piece DECIMAL(10,2) NOT NULL,
    making_cost_per_piece DECIMAL(10,2) NOT NULL,
    payment_received DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);