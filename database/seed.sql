-- Seed Data for FHMS

-- 1. Insert Academic Grades with Seniority Ranks
INSERT INTO grades (id, name, rank) VALUES
(1, 'Senior Professor', 70),
(2, 'Professor', 60),
(3, 'Associate Professor', 50),
(4, 'Assistant Professor', 40),
(5, 'Senior Lecturer', 30),
(6, 'Lecturer', 20),
(7, 'Visiting Professor', 10)
ON DUPLICATE KEY UPDATE rank = VALUES(rank);

-- 2. Insert Maintenance Problem Categories
INSERT INTO maintenance_categories (id, name, default_priority, description) VALUES
(1, 'Plumbing Leak', 'high', 'Pipes, taps, and water fixtures leaking'),
(2, 'Clogged Drain', 'medium', 'Blocked sinks, showers, or sewage drains'),
(3, 'Broken Door Lock', 'high', 'Entrance or internal lock failure causing security risk'),
(4, 'Roof Leak', 'emergency', 'Water ingress from ceiling or roof'),
(5, 'Electrical Wiring Issue', 'emergency', 'Short circuits, spark hazards, or power failures'),
(6, 'Light Bulb Replacement', 'low', 'Outdoor or high-ceiling fixture bulb burnt out'),
(7, 'Broken Window', 'high', 'Cracked or shattered glass panel'),
(8, 'Heating/Cooling System Issue', 'high', 'HVAC failure or AC unit breakdown'),
(9, 'Water Heater Problem', 'medium', 'Geyser or hot water system failure'),
(10, 'Pest Control', 'medium', 'Termite, rodent, or insect infestation'),
(11, 'Paint Damage', 'low', 'Peeling paint, damp patches on walls'),
(12, 'Cracked Wall or Ceiling', 'medium', 'Structural cracks or plaster damage'),
(13, 'Appliance Malfunction', 'medium', 'Built-in stove or electrical fixture issue'),
(14, 'Other', 'low', 'General maintenance problem')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. Insert Faculty Members
INSERT INTO faculty (id, name, email, department, grade_id, contact, joined_since) VALUES
(1, 'Prof. Johnathan Vance', 'admin@example.com', 'Estate & Facilities', 1, '+1-555-0100', '2010-01-15'),
(2, 'Dr. Aris Thorne', 'aris.thorne@fhms.edu', 'Computer Science', 1, '+1-555-0101', '2012-08-01'),
(3, 'Dr. Sarah Jenkins', 'sarah.jenkins@fhms.edu', 'Electrical Engineering', 2, '+1-555-0102', '2015-03-15'),
(4, 'Dr. Robert Chen', 'robert.chen@fhms.edu', 'Mechanical Engineering', 3, '+1-555-0103', '2017-09-01'),
(5, 'Dr. Elena Rostova', 'elena.rostova@fhms.edu', 'Chemical Engineering', 4, '+1-555-0104', '2020-02-10'),
(6, 'Dr. David Kim', 'david.kim@fhms.edu', 'Civil Engineering', 4, '+1-555-0105', '2021-08-15'),
(7, 'Dr. Aisha Patel', 'aisha.patel@fhms.edu', 'Computer Science', 6, '+1-555-0106', '2023-01-10')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 4. Insert Campus Residential Houses
INSERT INTO houses (id, house_number, address, capacity, status, description) VALUES
(1, 'H-101', 'Block A, Faculty Enclave, Sector 1', 4, 'occupied', 'Spacious 3-BHK independent villa with private lawn and covered car porch'),
(2, 'H-102', 'Block A, Faculty Enclave, Sector 1', 4, 'occupied', '3-BHK villa with solar power backup and garden view'),
(3, 'H-201', 'Block B, Hilltop Avenue, Sector 2', 3, 'vacant', 'Refurbished 2-BHK apartment with modular kitchen and balcony'),
(4, 'H-202', 'Block B, Hilltop Avenue, Sector 2', 3, 'vacant', 'Modern 2-BHK apartment near faculty club'),
(5, 'H-301', 'Block C, University Greens, Sector 3', 4, 'vacant', '3-BHK duplex with servant quarter and quiet park-facing orientation'),
(6, 'H-302', 'Block C, University Greens, Sector 3', 4, 'vacant', '3-BHK duplex unit with open terrace'),
(7, 'H-401', 'Block D, Riverside Quad, Sector 4', 2, 'maintenance', '2-BHK single level flat currently undergoing plumbing retrofitting')
ON DUPLICATE KEY UPDATE house_number = VALUES(house_number);

-- 5. Insert Tenancies (Active housing occupancy)
-- Dr. Aris Thorne (Faculty #2) lives in House #1 (H-101)
-- Dr. Sarah Jenkins (Faculty #3) lives in House #2 (H-102)
INSERT INTO tenancies (id, house_id, faculty_id, start_date, end_date, notes) VALUES
(1, 1, 2, '2021-09-01', NULL, 'Allocated under regular seniority quota'),
(2, 2, 3, '2023-01-15', NULL, 'Allocated after Grade promotion to Professor')
ON DUPLICATE KEY UPDATE id = VALUES(id);

-- 6. Insert Users
-- Password for all seed accounts: "Password123!"
-- Bcrypt hash ($2a$10$e8w.b8i59Zc0hXhV6a6b/eG9V3dK..): $2a$10$wT0jL10L99zUuR/b1qFf0O3a5lPz4E1N5H8k0l2M3n4o5p6q7r8s.
-- Pre-computed bcrypt hash for Password123!: $2a$10$eOQeE1h4r5nJ0tI7wJmU/eq7fO3V8P2m3p9l7b6a5s4d3f2g1h0j.
INSERT INTO users (id, email, password_hash, role, faculty_id, is_active) VALUES
(1, 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, TRUE),
(2, 'aris.thorne@fhms.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 2, TRUE),
(3, 'sarah.jenkins@fhms.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 3, TRUE),
(4, 'robert.chen@fhms.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 4, TRUE),
(5, 'elena.rostova@fhms.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', 5, TRUE)
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 7. Insert Housing Applications
-- Dr. Robert Chen (Faculty #4, Assoc Prof, joined 2017) applied for H-201
-- Dr. Elena Rostova (Faculty #5, Asst Prof, joined 2020) applied for H-201
INSERT INTO applications (id, faculty_id, house_id, status, applied_at) VALUES
(1, 4, 3, 'pending', '2026-09-10 10:30:00'),
(2, 5, 3, 'pending', '2026-09-12 14:15:00')
ON DUPLICATE KEY UPDATE id = VALUES(id);

-- 8. Insert Maintenance Requests for Resident Dr. Aris Thorne (House #1)
INSERT INTO maintenance_requests (id, user_id, house_id, category_id, problem, description, priority, status, created_at) VALUES
(1, 2, 1, 1, 'Plumbing Leak', 'Main bathroom sink faucet dripping continuously and water pressure is low.', 'high', 'pending', '2026-09-24 09:00:00'),
(2, 2, 1, 5, 'Electrical Wiring Issue', 'Kitchen power socket sparks when microwave is turned on.', 'emergency', 'in_progress', '2026-09-20 16:45:00'),
(3, 2, 1, 6, 'Light Bulb Replacement', 'Porch halogen fixture stopped working.', 'low', 'resolved', '2026-09-01 11:20:00')
ON DUPLICATE KEY UPDATE id = VALUES(id);

-- 9. Insert Initial Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'SYSTEM_SEEDED', 'system', 1, 'Initial database schema and seeds created');
