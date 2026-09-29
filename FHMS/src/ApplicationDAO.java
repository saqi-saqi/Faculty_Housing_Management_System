import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JOptionPane;

public class ApplicationDAO {

    public boolean submitApplication(int userId, int facultyId, int houseId) throws SQLException {
    String query = "INSERT INTO applications (UserID, FacultyID, HouseID, AppliedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)";
    
    try (Connection connection = DatabaseConnection.getConnection();
         PreparedStatement statement = connection.prepareStatement(query)) {
        
        statement.setInt(1, userId);        // UserID
        statement.setInt(2, facultyId);     // FacultyID
        statement.setInt(3, houseId);       // HouseID
        
        int rowsAffected = statement.executeUpdate();
        return rowsAffected > 0;  // Return true if insertion was successful
        
    } catch (SQLException e) {
        // Check for duplicate entry error
        if (e.getSQLState().equals("23000")) { // MySQL error code for duplicate entry
            System.out.println("Duplicate entry: Faculty has already applied for this house.");
            JOptionPane.showMessageDialog(null, "You have already applied for this house.", "Duplicate Application", JOptionPane.WARNING_MESSAGE);
            return false;  // Return false if a duplicate entry is found
        } else {
            throw e;  // Re-throw if it's a different SQL exception
        }
    }
}
// Method to fetch the next available house
private int fetchAvailableHouse() throws SQLException {
    String query = "SELECT HouseID FROM houses WHERE Status = 'Vacant' LIMIT 1";
    try (Connection connection = DatabaseConnection.getConnection();
         PreparedStatement statement = connection.prepareStatement(query);
         ResultSet resultSet = statement.executeQuery()) {
         
        if (resultSet.next()) {
            return resultSet.getInt("HouseID");
        } else {
            // No vacant houses available
            return -1;
        }
    }
}

public boolean allocateHouseAutomatically() throws SQLException {
    Connection connection = null;
    try {
        // Start the connection and transaction
        connection = DatabaseConnection.getConnection();
        connection.setAutoCommit(false); // Start transaction

        // Query to find the most senior faculty member and the house they applied for, ensuring the house is still available
        String selectApplicationQuery = "SELECT a.HouseID, f.id AS FacultyID, f.name, f.joinedsince, f.grade " +
                                        "FROM applications a " +
                                        "JOIN faculty f ON a.FacultyID = f.id " +
                                        "LEFT JOIN occupiedhouses oh ON a.HouseID = oh.HouseID " + // Ensure house hasn't been allocated
                                        "WHERE oh.HouseID IS NULL " + // House should not be allocated yet
                                        "ORDER BY f.grade DESC, f.joinedsince ASC " + // Prioritize by faculty grade and join date
                                        "LIMIT 1";

        try (PreparedStatement selectApplicationStmt = connection.prepareStatement(selectApplicationQuery);
             ResultSet applicationResultSet = selectApplicationStmt.executeQuery()) {

            if (applicationResultSet.next()) {
                int houseId = applicationResultSet.getInt("HouseID");
                int facultyId = applicationResultSet.getInt("FacultyID");

                // Insert the allocation into the occupiedhouses table
                String allocateHouseQuery = "INSERT INTO occupiedhouses (HouseID, FacultyID, OccupiedSince) VALUES (?, ?, CURDATE())";
                try (PreparedStatement allocateStmt = connection.prepareStatement(allocateHouseQuery)) {
                    allocateStmt.setInt(1, houseId);
                    allocateStmt.setInt(2, facultyId);
                    int rowsAffected = allocateStmt.executeUpdate();

                    if (rowsAffected > 0) {
                        // Update house status to 'Occupied'
                        String updateHouseStatusQuery = "UPDATE houses SET Status = 'Occupied' WHERE HouseID = ?";
                        try (PreparedStatement updateHouseStmt = connection.prepareStatement(updateHouseStatusQuery)) {
                            updateHouseStmt.setInt(1, houseId);
                            updateHouseStmt.executeUpdate();
                        }

                        // Commit the transaction
                        connection.commit();
                        System.out.println("House " + houseId + " allocated to Faculty ID: " + facultyId);
                        return true;
                    }
                }
            } else {
                System.out.println("No eligible applications for houses found for allocation.");
                connection.rollback(); // Rollback in case of failure
                return false;
            }
        }
    } catch (SQLException e) {
        if (connection != null) {
            connection.rollback(); // Rollback if any failure occurs
        }
        throw e; // Propagate exception
    } finally {
        if (connection != null) {
            connection.setAutoCommit(true); // Restore auto-commit after transaction
        }
    }
    return false;
}

// // Method to allocate the house based on seniority and grade and those who have applied
// public boolean allocateHouseAutomatically() throws SQLException {
//     // First, fetch the next available house
//     int houseId = fetchAvailableHouse();

//     if (houseId == -1) {
//         // No available houses
//         System.out.println("No vacant houses available.");
//         return false;
//     }

//     // Query to find the most senior faculty member who has applied for a house but hasn't been allocated one yet
//     String selectFacultyQuery = "SELECT f.id, f.name, f.joinedsince, f.grade " +
//                                 "FROM faculty f " +
//                                 "JOIN applications a ON f.id = a.FacultyID " +  // Faculty must have applied for a house
//                                 "LEFT JOIN occupiedhouses oh ON f.id = oh.FacultyID " +
//                                 "WHERE oh.FacultyID IS NULL " +  // Ensure they haven't been allocated a house yet
//                                 "ORDER BY f.grade DESC, f.joinedsince ASC " + // Prioritize by grade and then by seniority
//                                 "LIMIT 1";

//     // Allocate the house to the faculty member
//     try (Connection connection = DatabaseConnection.getConnection();
//          PreparedStatement selectFacultyStmt = connection.prepareStatement(selectFacultyQuery);
//          ResultSet facultyResultSet = selectFacultyStmt.executeQuery()) {

//         if (facultyResultSet.next()) {
//             int facultyId = facultyResultSet.getInt("id");

//             // Now, insert the allocation into the occupiedhouses table
//             String allocateHouseQuery = "INSERT INTO occupiedhouses (HouseID, FacultyID, OccupiedSince) VALUES (?, ?, CURDATE())";
//             try (PreparedStatement allocateStmt = connection.prepareStatement(allocateHouseQuery)) {
//                 allocateStmt.setInt(1, houseId);  // Set HouseID
//                 allocateStmt.setInt(2, facultyId);  // Set FacultyID
//                 int rowsAffected = allocateStmt.executeUpdate();

//                 if (rowsAffected > 0) {
//                     // Update the house status to 'Occupied' in the houses table
//                     String updateHouseStatusQuery = "UPDATE houses SET Status = 'Occupied' WHERE HouseID = ?";
//                     try (PreparedStatement updateHouseStmt = connection.prepareStatement(updateHouseStatusQuery)) {
//                         updateHouseStmt.setInt(1, houseId);
//                         updateHouseStmt.executeUpdate();
//                     }

//                     System.out.println("House " + houseId + " allocated to Faculty ID: " + facultyId);
//                     return true;
//                 }
//             }
//         } else {
//             // No eligible faculty members found
//             System.out.println("No eligible faculty members who have applied are available for allocation.");
//             return false;
//         }
//     }
//     return false;
// }

public List<String[]> fetchFacultyDatabyseniority() throws SQLException {
    String query = "SELECT f.name, f.email, f.department, f.grade,a.houseid " +
                   "FROM faculty f " +
                   "JOIN applications a ON f.id = a.FacultyID " +  // Faculty must have applied for a house
                   "LEFT JOIN occupiedhouses oh ON f.id = oh.FacultyID " +
                   "WHERE oh.FacultyID IS NULL " +  // Ensure they haven't been allocated a house yet
                   "ORDER BY f.grade DESC, f.joinedsince ASC";  // Order by grade (higher first) and seniority (longer service first)

    List<String[]> facultyList = new ArrayList<>();
    try (Connection connection = DatabaseConnection.getConnection();
         PreparedStatement statement = connection.prepareStatement(query);
         ResultSet resultSet = statement.executeQuery()) {
        while (resultSet.next()) {
            String[] rowData = new String[]{
                resultSet.getString("name"),
                resultSet.getString("email"),
                resultSet.getString("department"),
                resultSet.getString("grade"),
                String.valueOf(resultSet.getInt("HouseID"))
            };
            facultyList.add(rowData);
        }
    }
    return facultyList;
}

 // Method to fetch conflict applicants based on the selected grade
    public List<String> getConflictApplicants(String grade) throws SQLException {
        String query = "SELECT name, grade, id FROM faculty WHERE grade = ? OR grade = 'Senior " + grade + "'";  // Example: Fetching same or senior grade applicants
        List<String> applicants = new ArrayList<>();

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, grade);
            ResultSet resultSet = statement.executeQuery();

            while (resultSet.next()) {
                // Add the applicant's name and ID to the list
                String name = resultSet.getString("name");
                int id = resultSet.getInt("id");
                applicants.add(name + " (ID: " + id + ")");
            }
        }

        return applicants;
    }
}









// public List<String[]> fetchFacultyDatabyseniority() throws SQLException {
//     String query = "SELECT f.name, f.email, f.department, f.grade,a.houseid " +
//                    "FROM faculty f " +
//                    "JOIN applications a ON f.id = a.FacultyID " +  // Faculty must have applied for a house
//                    "LEFT JOIN occupiedhouses oh ON f.id = oh.FacultyID " +
//                    "WHERE oh.FacultyID IS NULL " +  // Ensure they haven't been allocated a house yet
//                    "ORDER BY f.grade DESC, f.joinedsince ASC";  // Order by grade (higher first) and seniority (longer service first)

//     List<String[]> facultyList = new ArrayList<>();
//     try (Connection connection = DatabaseConnection.getConnection();
//          PreparedStatement statement = connection.prepareStatement(query);
//          ResultSet resultSet = statement.executeQuery()) {
//         while (resultSet.next()) {
//             String[] rowData = new String[]{
//                 resultSet.getString("name"),
//                 resultSet.getString("email"),
//                 resultSet.getString("department"),
//                 resultSet.getString("grade"),
//                 String.valueOf(resultSet.getInt("HouseID"))
//             };
//             facultyList.add(rowData);
//         }
//     }
//     return facultyList;
// }

    









// public List<String[]> fetchFacultyDatabyseniority() throws SQLException {
//     String query = "SELECT f.id, f.name, f.email, f.department, f.grade, f.contact " +
//                    "FROM faculty f " +
//                    "JOIN applications a ON f.id = a.FacultyID " +  // Faculty must have applied for a house
//                    "LEFT JOIN occupiedhouses oh ON f.id = oh.FacultyID " +
//                    "WHERE oh.FacultyID IS NULL " +  // Ensure they haven't been allocated a house yet
//                    "ORDER BY f.grade DESC, f.joinedsince ASC";  // Order by grade (higher first) and seniority (longer service first)

//     List<String[]> facultyList = new ArrayList<>();
//     try (Connection connection = DatabaseConnection.getConnection();
//          PreparedStatement statement = connection.prepareStatement(query);
//          ResultSet resultSet = statement.executeQuery()) {
//         while (resultSet.next()) {
//             String[] rowData = new String[]{
//                 String.valueOf(resultSet.getInt("id")),
//                 resultSet.getString("name"),
//                 resultSet.getString("email"),
//                 resultSet.getString("department"),
//                 resultSet.getString("grade"),
//                 resultSet.getString("contact")
//             };
//             facultyList.add(rowData);
//         }
//     }
//     return facultyList;
// }