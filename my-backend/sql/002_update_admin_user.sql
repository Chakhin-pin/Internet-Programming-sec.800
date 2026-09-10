-- Update the account shown as user_id 3 in phpMyAdmin.
-- The password hash is bcrypt for the password supplied by the project owner.

UPDATE users
SET
  username = 'chakhin.p@ku.th',
  password = '$2b$12$xFDfo4vApvvqQ1OsB56o4e51wybmY.TKPtlGjfwhYtAOjH845O3iC',
  role = 'admin'
WHERE user_id = 3;
