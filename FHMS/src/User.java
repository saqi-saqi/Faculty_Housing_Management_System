public class User {
    private int userId;
    private String email;
    private String password;

    // Constructor for creating a user without a userId (e.g., during sign-up or validation)
    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Constructor for a user with a userId (e.g., after sign-in)
    public User(int userId, String email, String password) {
        this.userId = userId;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Convenience method to check if the user's email and password are valid
    public boolean isValid() {
        return isValidEmail(email) && password != null && !password.isEmpty();
    }

    // Method to validate email format using a regular expression
    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email != null && email.matches(emailRegex);
    }

    @Override
    public String toString() {
        return "User{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
