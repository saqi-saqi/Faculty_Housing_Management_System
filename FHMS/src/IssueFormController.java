import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class IssueFormController {

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
