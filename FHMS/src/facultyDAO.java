import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class facultyDAO {

    public List<String[]> fetchFacultyData() throws SQLException {
        // Ensure the join matches facultyId and UserID correctly
        String query = "SELECT f.id, f.name, f.email, f.department, f.grade, f.contact " +
                       "FROM faculty f " +
                       "JOIN applications a ON f.id = a.FacultyID " + // Update the column name if needed
                       "WHERE a.HouseID IS NOT NULL";  // Only include faculty who applied for a house
    
        List<String[]> facultyList = new ArrayList<>();
    
        // Use the centralized DatabaseConnection class to get a connection
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {
    
            // Loop through the result set and add each faculty member to the list
            while (resultSet.next()) {
                String[] rowData = new String[]{
                        String.valueOf(resultSet.getInt("id")),
                        resultSet.getString("name"),
                        resultSet.getString("email"),
                        resultSet.getString("department"),
                        resultSet.getString("grade"),
                        resultSet.getString("contact")
                };
                facultyList.add(rowData);  // Add the row to the facultyList
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw e;  // Rethrow the exception to the calling code
        }
    
        return facultyList;  // Return the list of faculty members who have applied for a house
    }
    
    public faculty fetchFacultyByUserId(int userId) throws SQLException {
        String query = "SELECT facultyid, name, email, department, grade, contact " +
                       "FROM user_faculty_mapping " +
                       "WHERE userid = ?";  // Ensure the table column name for userid is correct
    
        faculty faculty = null;
    
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
    
            statement.setInt(1, userId);
            System.out.println("UserId received in ApplicationPage: " + userId);
            // Execute the query
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    // Create the faculty object with the data from the result set
                    faculty = new faculty(
                        resultSet.getInt("facultyid"),               // Get faculty ID
                        resultSet.getString("name"),
                        resultSet.getString("email"),
                        resultSet.getString("department"),
                        resultSet.getString("grade"),
                        resultSet.getString("contact")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw e; // Re-throw the exception to notify the caller
        }
    
        return faculty; // Return the faculty object
    }
    
}
