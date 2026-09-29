import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Main_Login extends JFrame {

    public Main_Login() {
        // Set frame properties
        setTitle("Welcome to Faculty Maintenance System");
        setSize(800, 600);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Add welcome message
        JLabel welcomeLabel = new JLabel("Welcome to the FHMS", JLabel.CENTER);
        welcomeLabel.setFont(new Font("Arial", Font.BOLD, 24));
        add(welcomeLabel, BorderLayout.NORTH);

        // Create a panel for buttons
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.gridy = GridBagConstraints.RELATIVE;
        gbc.insets = new Insets(20, 0, 20, 0);

        // "Sign In" button
        JButton signInButton = new JButton("Sign In");
        signInButton.setPreferredSize(new Dimension(200, 50));
        buttonPanel.add(signInButton, gbc);

        signInButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new SignInFrame(); // Redirect to Sign In frame
                dispose(); // Close the Main_Login
            }
        });

        // "Sign Up" button
        JButton signUpButton = new JButton("Sign Up");
        signUpButton.setPreferredSize(new Dimension(200, 50));
        buttonPanel.add(signUpButton, gbc);

        signUpButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new SignUpFrame(); // Redirect to Sign Up frame
                dispose(); // Close the Main_Login
            }
        });

        // Add the panel to the frame
        add(buttonPanel, BorderLayout.CENTER);

        // Set frame visibility
        setVisible(true);
    }

    public static void main(String[] args) {
        new Main_Login();
    }
}
