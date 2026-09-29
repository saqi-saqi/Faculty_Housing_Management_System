import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MaintenanceRequestDAO {

    // Fetch all maintenance requests from all users
    public List<MaintenanceRequest> fetchAllRequests() throws SQLException {
        String query = "SELECT requestid, problem, description, requestdate, status, userid FROM maintenancerequests";  // Query to fetch all requests
        
        List<MaintenanceRequest> requests = new ArrayList<>();

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                requests.add(new MaintenanceRequest(
                        resultSet.getString("requestid"),
                        resultSet.getString("problem"),
                        resultSet.getString("description"),
                        resultSet.getDate("requestdate").toString(),
                        resultSet.getString("status"),
                        resultSet.getInt("userid") // Added userId
                ));
            }
        }

        return requests;
    }

    // Update request status
    public boolean updateRequestStatus(String requestId, String newStatus) throws SQLException {
        String query = "UPDATE maintenancerequests SET status = ? WHERE requestid = ? AND status = 'Pending'";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, newStatus);
            statement.setString(2, requestId);

            int rowsUpdated = statement.executeUpdate();
            return rowsUpdated > 0;
        }
    }

    // Fetch all pending maintenance requests for a specific user
    public List<MaintenanceRequest> fetchPendingRequests(int userId) throws SQLException {
        String query = "SELECT requestid, problem, description, requestdate, status " +
                       "FROM maintenancerequests " +
                       "WHERE status = 'Pending' AND userID = ?";  // Correct query
        
        List<MaintenanceRequest> requests = new ArrayList<>();

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    requests.add(new MaintenanceRequest(
                            resultSet.getString("requestid"),
                            resultSet.getString("problem"),
                            resultSet.getString("description"),
                            resultSet.getDate("requestdate").toString(),
                            resultSet.getString("status"),
                            userId  // Added userId for proper request association
                    ));
                }
            }
        }

        return requests;
    }

    // Cancel a maintenance request by updating its status to "Cancelled"
    public boolean cancelMaintenanceRequest(String requestId) {
        String query = "UPDATE maintenancerequests SET status = 'Cancelled' WHERE requestid = ?";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, requestId);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Failed to cancel request ID " + requestId + ": " + e.getMessage());
            return false;
        }
    }

    // Insert a new maintenance request into the database
    public void insertMaintenanceRequest(String problem, String description, String status, String requestDate, int userId) throws SQLException {
        String query = "INSERT INTO maintenancerequests (problem, description, status, requestdate, userid) VALUES (?, ?, ?, ?, ?)";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, problem);
            statement.setString(2, description);
            statement.setString(3, status);
            statement.setString(4, requestDate);
            statement.setInt(5, userId);

            if (statement.executeUpdate() > 0) {
                System.out.println("Maintenance request inserted successfully.");
            } else {
                throw new SQLException("Failed to insert maintenance request.");
            }
        }
    }

    // Fetch all maintenance requests for a specific user
    public List<MaintenanceRequest> fetchRequestsByUserId(int userId) throws SQLException {
        String query = "SELECT requestid, problem, description, requestdate, status FROM maintenancerequests WHERE userid = ?";
        List<MaintenanceRequest> requests = new ArrayList<>();

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setInt(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    requests.add(new MaintenanceRequest(
                            resultSet.getString("requestid"),
                            resultSet.getString("problem"),
                            resultSet.getString("description"),
                            resultSet.getDate("requestdate").toString(),
                            resultSet.getString("status"),
                            userId  // Added userId for proper request association
                    ));
                }
            }
        }

        return requests;
    }

}






























// public class MaintenanceRequestDAO {

//     /**
//      * Fetches all pending maintenance requests.
//      *
//      * @return A list of pending maintenance requests.
//      * @throws SQLException If an error occurs while accessing the database.
//      */
//     public List<MaintenanceRequest> fetchPendingRequests() throws SQLException {
//         String query = "SELECT requestid, problem, description, requestdate, status
//         FROM maintenancerequests
//         WHERE status = 'Pending' AND userid = "?"";
        
//         List<MaintenanceRequest> requests = new ArrayList<>();

//         try (Connection connection = getConnection();
//              PreparedStatement statement = connection.prepareStatement(query);
//              ResultSet resultSet = statement.executeQuery()) {

//             while (resultSet.next()) {
//                 requests.add(new MaintenanceRequest(
//                         resultSet.getString("requestid"),
//                         resultSet.getString("problem"),
//                         resultSet.getString("description"),
//                         resultSet.getDate("requestdate").toString(),
//                         resultSet.getString("status")
//                 ));
//             }
//         }

//         return requests;
//     }


//     /**
//      * Establishes a connection to the database.
//      *
//      * @return A Connection object.
//      * @throws SQLException If an error occurs while connecting to the database.
//      */
    
//      private static Connection getConnection() throws SQLException {
//         String url = "jdbc:mysql://localhost:3306/fhms-db"; // Replace with your database URL
//         String username = "root"; 
//         String password = ""; 
//         return DriverManager.getConnection(url, username, password);
//     }
    
// }
