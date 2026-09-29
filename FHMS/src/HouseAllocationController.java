import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class HouseAllocationController {

    /**
     * Fetches all faculty details from the database.
     *
     * @return A list of faculty details.
     * @throws SQLException If an error occurs while accessing the database.
     */
    public List<String[]> fetchFacultyData() throws SQLException {
        String query = "SELECT id, name, email, department, grade, contact FROM faculty";
        List<String[]> facultyList = new ArrayList<>();

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                // Create an array representing a row of faculty data
                String[] rowData = new String[]{
                        String.valueOf(resultSet.getInt("id")),
                        resultSet.getString("name"),
                        resultSet.getString("email"),
                        resultSet.getString("department"),
                        resultSet.getString("grade"),
                        resultSet.getString("contact")
                };
                facultyList.add(rowData); // Add row to the list
            }
        }

        return facultyList; // Return all faculty data
    }
}
