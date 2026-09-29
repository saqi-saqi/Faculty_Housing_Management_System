import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DatabaseController {

    private static Connection getConnection() throws SQLException {
        String url = "jdbc:mysql://localhost:3306/fhms"; // Replace with your database URL
        String username = "root"; 
        String password = ""; 
        return DriverManager.getConnection(url, username, password);
    }

    // Fetch faculty members with the same or equal grade for conflict resolution
    public List<String> fetchFacultyInConflict(String grade) throws SQLException {
        String query = "SELECT id, name, grade FROM faculty WHERE grade >= ?";
        List<String> facultyInConflict = new ArrayList<>();

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, grade);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    // Get faculty member ID and name
                    String id = resultSet.getString("id");
                    String name = resultSet.getString("name");
                    // Add to the list in the format "Name (Grade)"
                    facultyInConflict.add(name + " (" + resultSet.getString("grade") + ")");
                }
            }
        }

        return facultyInConflict;  // Return the list of faculty members
    }
}
