import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class SignUpFrame extends JFrame {

    public SignUpFrame() {
        // Set frame properties
        setTitle("Sign Up");
        setSize(500, 400); // Adjusted size for better visibility
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Create form elements
        JPanel formPanel = new JPanel();
        formPanel.setLayout(new GridLayout(4, 2, 10, 10)); // Adjusted layout to 4 rows, 2 columns
        formPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Create larger font for labels
        Font labelFont = new Font("Arial", Font.BOLD, 16); // Larger font for labels

        JLabel emailLabel = new JLabel("Email:");
        emailLabel.setFont(labelFont); // Apply font to label
        JTextField emailField = new JTextField();
        
        JLabel passwordLabel = new JLabel("Password:");
        passwordLabel.setFont(labelFont); // Apply font to label
        JPasswordField passwordField = new JPasswordField();
        
        JLabel confirmPasswordLabel = new JLabel("Confirm Password:");
        confirmPasswordLabel.setFont(labelFont); // Apply font to label
        JPasswordField confirmPasswordField = new JPasswordField();

        // Add components to formPanel
        formPanel.add(emailLabel);
        formPanel.add(emailField);
        formPanel.add(passwordLabel);
        formPanel.add(passwordField);
        formPanel.add(confirmPasswordLabel);
        formPanel.add(confirmPasswordField);

        // Add form to frame
        add(formPanel, BorderLayout.CENTER);

        // Create button panel
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 10, 10)); // Centering buttons
        JButton signUpButton = new JButton("Sign Up");
        JButton backButton = new JButton("Back");
        buttonPanel.add(backButton);
        buttonPanel.add(signUpButton);
        add(buttonPanel, BorderLayout.SOUTH);

        signUpButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String email = emailField.getText().trim();
                String password = new String(passwordField.getPassword());
                String confirmPassword = new String(confirmPasswordField.getPassword());
        
                // Validation logic
                if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                    JOptionPane.showMessageDialog(null, "All fields are required.", "Error", JOptionPane.ERROR_MESSAGE);
                } else if (!password.equals(confirmPassword)) {
                    JOptionPane.showMessageDialog(null, "Passwords do not match.", "Error", JOptionPane.ERROR_MESSAGE);
                } else {
                    userDAO userDAO = new userDAO();
                    if (userDAO.isFacultyEmail(email)) {
                        if (userDAO.addUser(email, password)) {
                            JOptionPane.showMessageDialog(null, "Sign Up Successful!", "Success", JOptionPane.INFORMATION_MESSAGE);
                            new Main_LoginFrame();
                            dispose();
                        } else {
                            JOptionPane.showMessageDialog(null, "User already exists.", "Error", JOptionPane.ERROR_MESSAGE);
                            new SignInFrame();  // Open the login frame
                            dispose();
                        }
                    } else {
                        JOptionPane.showMessageDialog(null, "this Email is not associated with any faculty member.", "Error", JOptionPane.ERROR_MESSAGE);
                    }
                }
            }
        });
        

        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new Main_LoginFrame();
                dispose();
            }
        });

        // Set frame visibility
        setVisible(true);
    }

    public static void main(String[] args) {
        new SignUpFrame();
    }
}
