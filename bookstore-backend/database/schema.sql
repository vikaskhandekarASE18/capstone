-- BookStore E-Commerce Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone         VARCHAR(20),
    gift_points   INTEGER NOT NULL DEFAULT 0 CHECK (gift_points >= 0),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─────────────────────────────────────────────
--  ADDRESSES
-- ─────────────────────────────────────────────
CREATE TABLE addresses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       VARCHAR(50) NOT NULL,
    street      TEXT NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country     VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ─────────────────────────────────────────────
--  PUBLISHERS
-- ─────────────────────────────────────────────
CREATE TABLE publishers (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  BRANDS
-- ─────────────────────────────────────────────
CREATE TABLE brands (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) UNIQUE NOT NULL,
    logo_url    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ─────────────────────────────────────────────
--  BOOKS
-- ─────────────────────────────────────────────
CREATE TABLE books (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title          VARCHAR(500) NOT NULL,
    author         VARCHAR(255) NOT NULL,
    isbn           VARCHAR(20) UNIQUE,
    price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= 0),
    description    TEXT,
    image_url      TEXT,
    category_id    UUID REFERENCES categories(id),
    publisher_id   UUID REFERENCES publishers(id),
    brand_id       UUID REFERENCES brands(id),
    stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    rating         NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    review_count   INTEGER NOT NULL DEFAULT 0,
    is_featured    BOOLEAN NOT NULL DEFAULT false,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    language       VARCHAR(50),
    pages          INTEGER,
    published_year INTEGER,
    tags           TEXT[],
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_brand_id ON books(brand_id);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_books_rating ON books(rating DESC);
CREATE INDEX idx_books_title_author ON books USING gin(to_tsvector('english', title || ' ' || author));

-- ─────────────────────────────────────────────
--  BOOK_CATEGORIES (many-to-many)
-- ─────────────────────────────────────────────
CREATE TABLE book_categories (
    book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, category_id)
);

-- ─────────────────────────────────────────────
--  INVENTORY (stock movement log)
-- ─────────────────────────────────────────────
CREATE TABLE inventory (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id    UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    change     INTEGER NOT NULL, -- positive = restock, negative = sold
    reason     VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_book_id ON inventory(book_id);

-- ─────────────────────────────────────────────
--  CARTS
-- ─────────────────────────────────────────────
CREATE TABLE carts (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  CART_ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE cart_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    book_id    UUID NOT NULL REFERENCES books(id),
    quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, book_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- ─────────────────────────────────────────────
--  ORDERS
-- ─────────────────────────────────────────────
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    shipping_address_id UUID NOT NULL REFERENCES addresses(id),
    status              order_status NOT NULL DEFAULT 'pending',
    total_amount        NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    gift_points_used    INTEGER NOT NULL DEFAULT 0,
    gift_points_earned  INTEGER NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ─────────────────────────────────────────────
--  ORDER_ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id     UUID NOT NULL REFERENCES books(id),
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ─────────────────────────────────────────────
--  PAYMENTS
-- ─────────────────────────────────────────────
CREATE TYPE payment_method AS ENUM ('card', 'upi', 'net_banking', 'cod');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

CREATE TABLE payments (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id       UUID UNIQUE NOT NULL REFERENCES orders(id),
    method         payment_method NOT NULL,
    status         payment_status NOT NULL DEFAULT 'pending',
    amount         NUMERIC(10, 2) NOT NULL,
    transaction_id VARCHAR(100),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);

-- ─────────────────────────────────────────────
--  ORDER_STATUS_HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE order_status_history (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status order_status,
    new_status order_status NOT NULL,
    note       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ─────────────────────────────────────────────
--  REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE reviews (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id),
    book_id    UUID NOT NULL REFERENCES books(id),
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, book_id)
);

CREATE INDEX idx_reviews_book_id ON reviews(book_id);

-- ─────────────────────────────────────────────
--  GIFT_POINTS (transaction log)
-- ─────────────────────────────────────────────
CREATE TABLE gift_points (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id),
    points     INTEGER NOT NULL, -- positive = earned, negative = redeemed
    reason     VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gift_points_user_id ON gift_points(user_id);

-- ─────────────────────────────────────────────
--  TRIGGERS: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
--  SEED DATA
-- ─────────────────────────────────────────────
-- Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Fiction', 'fiction', 'Novels and stories', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
  ('Non-Fiction', 'non-fiction', 'Real world topics', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
  ('Science & Tech', 'science-tech', 'Science and technology', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'),
  ('History', 'history', 'Historical works', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'),
  ('Self Help', 'self-help', 'Personal development', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
  ('Children', 'children', 'Children''s books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400');

-- Publishers
INSERT INTO publishers (name, description) VALUES
  ('Penguin Books', 'International publisher'),
  ('HarperCollins', 'Global publisher'),
  ('Oxford University Press', NULL),
  ('Rupa Publications', NULL);

-- Brands
INSERT INTO brands (name) VALUES
  ('Penguin Classics'),
  ('HarperOne'),
  ('Vintage Books'),
  ('Scholastic'),
  ('Bloomsbury');
