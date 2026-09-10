-- Columns required by the Add product and Edit product forms.
-- Safe to run once on the existing products table.

ALTER TABLE products
  ADD COLUMN price DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER productCode,
  ADD COLUMN description TEXT NULL AFTER price,
  ADD COLUMN storeAvailability VARCHAR(255) NULL AFTER description;
