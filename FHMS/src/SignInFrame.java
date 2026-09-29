import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.FocusEvent;
import java.awt.event.FocusListener;

public class SignInFrame extends JFrame {
    private userDAO cuser = new userDAO(); // Database controller instance

    public SignInFrame() {
        // Set frame properties
        setTitle("Sign In");
        setSize(800, 600); // Adjusted size for better visibility
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Create form elements
        JPanel formPanel = new JPanel();
        formPanel.setLayout(new GridLayout(3, 2, 10, 10)); // Layout with 3 rows and 2 columns
        formPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Create larger font for labels and fields
        Font labelFont = new Font("Arial", Font.BOLD, 16); // Larger font for labels
        Font fieldFont = new Font("Arial", Font.PLAIN, 14); // Font for text fields

        // Labels and Fields
        JLabel emailLabel = new JLabel("Email:");
        emailLabel.setFont(labelFont); // Apply font to label
        JTextField emailField = new JTextField("Enter email address");  // Placeholder text
        emailField.setFont(fieldFont); // Apply font to text field

        JLabel passwordLabel = new JLabel("Password:");
        passwordLabel.setFont(labelFont); // Apply font to label
        JPasswordField passwordField = new JPasswordField();
        passwordField.setFont(fieldFont); // Apply font to password field

        // Focus listeners to handle placeholder behavior for email field
        emailField.addFocusListener(new FocusListener() {
            @Override
            public void focusGained(FocusEvent e) {
                if (emailField.getText().equals("Enter email address")) {
                    emailField.setText("");  // Clear placeholder
                }
            }

            @Override
            public void focusLost(FocusEvent e) {
                if (emailField.getText().isEmpty()) {
                    emailField.setText("Enter email address");  // Restore placeholder
                }
            }
        });

        // Add components to form panel
        formPanel.add(emailLabel);
        formPanel.add(emailField);
        formPanel.add(passwordLabel);
        formPanel.add(passwordField);

        // Add form to frame
        add(formPanel, BorderLayout.CENTER);

        // Create button panel
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 10, 10)); // Centering buttons

        JButton signInButton = new JButton("Sign In");
        signInButton.setFont(new Font("Arial", Font.BOLD, 14)); // Larger font for buttons
        JButton backButton = new JButton("Back");
        backButton.setFont(new Font("Arial", Font.BOLD, 14)); // Larger font for buttons

        buttonPanel.add(signInButton);
        buttonPanel.add(backButton);

        add(buttonPanel, BorderLayout.SOUTH);

        // Sign-in button action
        signInButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String email = emailField.getText().trim();
                String password = new String(passwordField.getPassword());

                // Admin login check
                if (email.equals("admin@example.com") && password.equals("admin1234")) {
                    JOptionPane.showMessageDialog(null, "Admin Sign In Successful!", "Success", JOptionPane.INFORMATION_MESSAGE);

                    // Navigate to EstateFrame
                    SwingUtilities.invokeLater(() -> new EstateFrame());
                    dispose(); // Close SignInFrame
                    return;
                }

                // Create a User object
                User user = new User(email, password);

                // Validate email and password
                if (!user.isValid()) {
                    JOptionPane.showMessageDialog(null, "Please enter a valid email and password.", "Error", JOptionPane.ERROR_MESSAGE);
                } else {
                    // Fetch user ID from the database using DatabaseController
                    int userId = cuser.getUserIdFromDatabase(user.getEmail(), user.getPassword());
                    System.out.println("Fetched userId: " + userId);

                    if (userId != -1) {  // Check if userId is valid (assuming -1 means not found)
                        // User found, set userId and proceed
                        user.setUserId(userId);
                        JOptionPane.showMessageDialog(null, "Sign In Successful!", "Success", JOptionPane.INFORMATION_MESSAGE);

                        // Pass the userId to the HomeFrame
                        SwingUtilities.invokeLater(() -> {
                            new HomeFrame(userId);  // Pass the userId to the next frame
                        });

                        dispose(); // Close the SignInFrame
                    } else {
                        JOptionPane.showMessageDialog(null, "Invalid email or password.", "Error", JOptionPane.ERROR_MESSAGE);
                    }
                }
            }
        });

        // Back button action
        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new Main_LoginFrame(); // Return to main welcome frame
                dispose();
            }
        });

        // Set frame visibility
        setVisible(true);
    }

    public static void main(String[] args) {
        // Launch SignInFrame
        SwingUtilities.invokeLater(() -> new SignInFrame());
    }
}
