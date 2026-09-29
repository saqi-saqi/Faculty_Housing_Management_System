import java.sql.Connection;
import java.sql.DriverManager;
//import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class userDAO {
    
    /**
     * Fetches the user ID based on the email and password.
     *
     * @param email    The user's email address.
     * @param password The user's password.
     * @return The user ID if the email and password are valid, or -1 if not found.
     */
    public int getUserIdFromDatabase(String email, String password) {
        String query = "SELECT userid FROM users WHERE email = ? AND password = ?";
        int userId = -1; // Default to -1 if no user found
    
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(query)) {
    
            // Set the email and password in the query
            statement.setString(1, email);
            statement.setString(2, password);
    
            // Execute the query
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    // Retrieve the user ID
                    userId = resultSet.getInt("userid");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching user ID: " + e.getMessage());
        }
    
        return userId; // Return the user ID if found, otherwise return -1
    }
    public boolean isFacultyEmail(String email) {
        String query = "SELECT COUNT(*) FROM faculty WHERE email = ?";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, email);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next() && resultSet.getInt(1) > 0) {
                    return true; // Email exists in faculty table
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    // Check if user already exists in the users table
    public boolean isUserExists(String email) {
        String query = "SELECT COUNT(*) FROM users WHERE email = ?";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, email);
            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next() && resultSet.getInt(1) > 0) {
                    return true; // Email already exists in users table
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
     public boolean addUser(String email, String password) {
        String query = "INSERT INTO users (email, password) VALUES (?, ?)";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, email);
            preparedStatement.setString(2, password);
            int rowsInserted = preparedStatement.executeUpdate();
            return rowsInserted > 0; // Return true if user is successfully added
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}


   
   