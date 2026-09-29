import bcrypt from 'bcryptjs';

export const initialGrades = [
  { id: 1, name: 'Senior Professor', rank: 70 },
  { id: 2, name: 'Professor', rank: 60 },
  { id: 3, name: 'Associate Professor', rank: 50 },
  { id: 4, name: 'Assistant Professor', rank: 40 },
  { id: 5, name: 'Senior Lecturer', rank: 30 },
  { id: 6, name: 'Lecturer', rank: 20 },
  { id: 7, name: 'Visiting Professor', rank: 10 }
];

export const initialCategories = [
  { id: 1, name: 'Plumbing Leak', default_priority: 'high', description: 'Pipes, taps, and water fixtures leaking' },
  { id: 2, name: 'Clogged Drain', default_priority: 'medium', description: 'Blocked sinks, showers, or sewage drains' },
  { id: 3, name: 'Broken Door Lock', default_priority: 'high', description: 'Entrance or internal lock failure causing security risk' },
  { id: 4, name: 'Roof Leak', default_priority: 'emergency', description: 'Water ingress from ceiling or roof' },
  { id: 5, name: 'Electrical Wiring Issue', default_priority: 'emergency', description: 'Short circuits, spark hazards, or power failures' },
  { id: 6, name: 'Light Bulb Replacement', default_priority: 'low', description: 'Outdoor or high-ceiling fixture bulb burnt out' },
  { id: 7, name: 'Broken Window', default_priority: 'high', description: 'Cracked or shattered glass panel' },
  { id: 8, name: 'Heating/Cooling System Issue', default_priority: 'high', description: 'HVAC failure or AC unit breakdown' },
  { id: 9, name: 'Water Heater Problem', default_priority: 'medium', description: 'Geyser or hot water system failure' },
  { id: 10, name: 'Pest Control', default_priority: 'medium', description: 'Termite, rodent, or insect infestation' },
  { id: 11, name: 'Paint Damage', default_priority: 'low', description: 'Peeling paint, damp patches on walls' },
  { id: 12, name: 'Cracked Wall or Ceiling', default_priority: 'medium', description: 'Structural cracks or plaster damage' },
  { id: 13, name: 'Appliance Malfunction', default_priority: 'medium', description: 'Built-in stove or electrical fixture issue' },
  { id: 14, name: 'Other', default_priority: 'low', description: 'General maintenance problem' }
];

export const initialFaculty = [
  { id: 1, name: 'Prof. Johnathan Vance', email: 'admin@example.com', department: 'Estate & Facilities', grade_id: 1, contact: '+1-555-0100', joined_since: '2010-01-15' },
  { id: 2, name: 'Dr. Aris Thorne', email: 'aris.thorne@fhms.edu', department: 'Computer Science', grade_id: 1, contact: '+1-555-0101', joined_since: '2012-08-01' },
  { id: 3, name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@fhms.edu', department: 'Electrical Engineering', grade_id: 2, contact: '+1-555-0102', joined_since: '2015-03-15' },
  { id: 4, name: 'Dr. Robert Chen', email: 'robert.chen@fhms.edu', department: 'Mechanical Engineering', grade_id: 3, contact: '+1-555-0103', joined_since: '2017-09-01' },
  { id: 5, name: 'Dr. Elena Rostova', email: 'elena.rostova@fhms.edu', department: 'Chemical Engineering', grade_id: 4, contact: '+1-555-0104', joined_since: '2020-02-10' },
  { id: 6, name: 'Dr. David Kim', email: 'david.kim@fhms.edu', department: 'Civil Engineering', grade_id: 4, contact: '+1-555-0105', joined_since: '2021-08-15' },
  { id: 7, name: 'Dr. Aisha Patel', email: 'aisha.patel@fhms.edu', department: 'Computer Science', grade_id: 6, contact: '+1-555-0106', joined_since: '2023-01-10' }
];

export const initialHouses = [
  { id: 1, house_number: 'H-101', address: 'Block A, Faculty Enclave, Sector 1', capacity: 4, status: 'occupied', description: 'Spacious 3-BHK independent villa with private lawn and covered car porch' },
  { id: 2, house_number: 'H-102', address: 'Block A, Faculty Enclave, Sector 1', capacity: 4, status: 'occupied', description: '3-BHK villa with solar power backup and garden view' },
  { id: 3, house_number: 'H-201', address: 'Block B, Hilltop Avenue, Sector 2', capacity: 3, status: 'vacant', description: 'Refurbished 2-BHK apartment with modular kitchen and balcony' },
  { id: 4, house_number: 'H-202', address: 'Block B, Hilltop Avenue, Sector 2', capacity: 3, status: 'vacant', description: 'Modern 2-BHK apartment near faculty club' },
  { id: 5, house_number: 'H-301', address: 'Block C, University Greens, Sector 3', capacity: 4, status: 'vacant', description: '3-BHK duplex with servant quarter and quiet park-facing orientation' },
  { id: 6, house_number: 'H-302', address: 'Block C, University Greens, Sector 3', capacity: 4, status: 'vacant', description: '3-BHK duplex unit with open terrace' },
  { id: 7, house_number: 'H-401', address: 'Block D, Riverside Quad, Sector 4', capacity: 2, status: 'maintenance', description: '2-BHK single level flat currently undergoing plumbing retrofitting' }
];

export const initialTenancies = [
  { id: 1, house_id: 1, faculty_id: 2, start_date: '2021-09-01', end_date: null, notes: 'Allocated under regular seniority quota' },
  { id: 2, house_id: 2, faculty_id: 3, start_date: '2023-01-15', end_date: null, notes: 'Allocated after Grade promotion to Professor' }
];

export function getInitialUsers() {
  const defaultHash = bcrypt.hashSync('Password123!', 10);
  const adminHash = bcrypt.hashSync('admin1234', 10);
  
  return [
    { id: 1, email: 'admin@example.com', password_hash: adminHash, role: 'admin', faculty_id: 1, is_active: true },
    { id: 2, email: 'aris.thorne@fhms.edu', password_hash: defaultHash, role: 'faculty', faculty_id: 2, is_active: true },
    { id: 3, email: 'sarah.jenkins@fhms.edu', password_hash: defaultHash, role: 'faculty', faculty_id: 3, is_active: true },
    { id: 4, email: 'robert.chen@fhms.edu', password_hash: defaultHash, role: 'faculty', faculty_id: 4, is_active: true },
    { id: 5, email: 'elena.rostova@fhms.edu', password_hash: defaultHash, role: 'faculty', faculty_id: 5, is_active: true }
  ];
}

export const initialApplications = [
  { id: 1, faculty_id: 4, house_id: 3, status: 'pending', admin_notes: null, applied_at: '2026-09-10 10:30:00' },
  { id: 2, faculty_id: 5, house_id: 3, status: 'pending', admin_notes: null, applied_at: '2026-09-12 14:15:00' }
];

export const initialMaintenanceRequests = [
  { id: 1, user_id: 2, house_id: 1, category_id: 1, problem: 'Plumbing Leak', description: 'Main bathroom sink faucet dripping continuously and water pressure is low.', priority: 'high', status: 'pending', admin_notes: null, resolved_at: null, created_at: '2026-09-24 09:00:00' },
  { id: 2, user_id: 2, house_id: 1, category_id: 5, problem: 'Electrical Wiring Issue', description: 'Kitchen power socket sparks when microwave is turned on.', priority: 'emergency', status: 'in_progress', admin_notes: 'Electrician scheduled for inspection', resolved_at: null, created_at: '2026-09-20 16:45:00' },
  { id: 3, user_id: 2, house_id: 1, category_id: 6, problem: 'Light Bulb Replacement', description: 'Porch halogen fixture stopped working.', priority: 'low', status: 'resolved', admin_notes: 'Replaced with 15W LED bulb', resolved_at: '2026-09-02 14:00:00', created_at: '2026-09-01 11:20:00' }
];
