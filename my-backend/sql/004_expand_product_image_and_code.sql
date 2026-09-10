-- Allows the Add product form to persist a Base64 product image and longer product codes.
-- Existing values are preserved; this migration does not delete or rewrite any rows.

ALTER TABLE products
  MODIFY COLUMN productCode VARCHAR(255) NOT NULL,
  MODIFY COLUMN image LONGTEXT NOT NULL;
