import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class HouseDAO {

    // Method to check if the user has a house
    public static boolean hasHouse(int userId) {
        boolean hasHouse = false;

        // Set up database connection
        try (Connection connection = DatabaseConnection.getConnection()) {
            // Step 1: Get the facultyId from user_faculty_mapping table
            String facultyIdQuery = "SELECT facultyid FROM user_faculty_mapping WHERE userId = ?";
            try (PreparedStatement stmt1 = connection.prepareStatement(facultyIdQuery)) {
                stmt1.setInt(1, userId);
                ResultSet rs1 = stmt1.executeQuery();

                if (rs1.next()) {
                    int facultyId = rs1.getInt("facultyid"); // Get facultyId

                    // Step 2: Check if the facultyId exists in the occupiedhouses table
                    String houseQuery = "SELECT COUNT(*) FROM occupiedhouses WHERE facultyId = ?";
                    try (PreparedStatement stmt2 = connection.prepareStatement(houseQuery)) {
                        stmt2.setInt(1, facultyId);
                        ResultSet rs2 = stmt2.executeQuery();

                        if (rs2.next()) {
                            hasHouse = rs2.getInt(1) > 0; // Check if there is any house for the facultyId
                        }
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace(); // Handle any exceptions
        }

        return hasHouse;
    }
    public List<House> fetchVacantHouses() throws SQLException {
        List<House> vacantHouses = new ArrayList<>();

        // SQL query to fetch vacant houses
        String query = "SELECT houseiD, address, status FROM Houses WHERE status = 'Vacant'";

        // Establish a connection using DatabaseConnection
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            // Iterate through the result set and add to the list
            while (resultSet.next()) {
                int houseID = resultSet.getInt("houseid");
                String address = resultSet.getString("address");
                 String status = resultSet.getString("status");

                // Create a new House object and add it to the list
                vacantHouses.add(new House(houseID,address,status));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching vacant houses: " + e.getMessage());
            throw e; // Re-throw the exception for error handling in HouseVacancyFrame
        }

        return vacantHouses;
    }

}
