-- Demo accounts for local testing. Run once after the users table exists.
-- admin / Admin@123
-- customer / Customer@123
INSERT INTO users (username, password, role)
VALUES
  ('admin', '$2b$12$mcKzAL6oPGzd0Pw3y9210ePwriHdqMaVCv/5UMqJ5VxakJWnZaQ9u', 'admin'),
  ('customer', '$2b$12$127EJtZbszdiO2OWXnF1bOMDgBWh78V.HCJDfIK1cUe9TFT5xVdp2', 'customer')
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  role = VALUES(role);
