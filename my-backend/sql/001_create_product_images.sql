-- Store each product's primary image in MySQL instead of a device-local file:// URI.
-- This migration deliberately leaves products.image unchanged, so existing records remain intact.
-- If products.id is not INT, change product_id below to exactly match its type and signedness.

CREATE TABLE IF NOT EXISTS product_images (
  product_id INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NULL,
  byte_size INT UNSIGNED NOT NULL,
  image_data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
