import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class VacantHouseController {
    // Fetch vacant houses from the database
    public List<House> fetchVacantHouses() throws SQLException {
        List<House> vacantHouses = new ArrayList<>();

        // SQL query to fetch vacant houses
        String query = "SELECT house_id, address, capacity, availability FROM HouseVacancyFrame WHERE availability = 'Vacant'";

        // Establish a connection using DatabaseConnection
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query);
             ResultSet resultSet = preparedStatement.executeQuery()) {

            // Iterate through the result set and add to the list
            while (resultSet.next()) {
                int houseId = resultSet.getInt("house_id");
                String address = resultSet.getString("address");
                int capacity = resultSet.getInt("capacity");
                String availability = resultSet.getString("availability");

                // Create a new House object and add it to the list
                vacantHouses.add(new House(houseId, address, capacity, availability));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching vacant houses: " + e.getMessage());
            throw e; // Re-throw the exception for error handling in HouseVacancyFrame
        }

        return vacantHouses;
    }
}

