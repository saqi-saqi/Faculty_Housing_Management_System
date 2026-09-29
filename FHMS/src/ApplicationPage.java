import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ApplicationPage extends JFrame {

    private String userId;
    private JTextField fullNameField, emailField, contactField;
    private JComboBox<String> departmentComboBox, gradeComboBox;
    private JButton backButton;
    
    // Constructor that accepts facultyEmail
    public ApplicationPage(String facultyEmail) {
        try {
            // Fetch faculty information using the email
           userdao dbController = new userdao();
            faculty faculty = dbController.fetchFacultyByEmail(facultyEmail);

            setTitle("User Application Page");
            setSize(800, 600);
            setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            setLocationRelativeTo(null);
            setLayout(new BorderLayout());

            // Main panel with a custom layout
            JPanel mainPanel = new JPanel();
            mainPanel.setLayout(new BorderLayout());
            mainPanel.setBackground(new Color(240, 248, 255)); // Light blue background
            add(mainPanel);

            // Shadow effect panel for the form
            JPanel formPanel = new JPanel();
            formPanel.setLayout(null);
            formPanel.setBackground(Color.WHITE);
            formPanel.setBounds(50, 50, 500, 500);
            formPanel.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1),
                    BorderFactory.createMatteBorder(8, 8, 8, 8, new Color(220, 220, 220))
            ));
            formPanel.setOpaque(true);
            mainPanel.add(formPanel);

            // Labels and Text Fields for Faculty Information
            JLabel titleLabel = new JLabel("User Application Page");
            titleLabel.setFont(new Font("Arial", Font.BOLD, 18));
            titleLabel.setBounds(150, 10, 300, 25);
            titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
            formPanel.add(titleLabel);

            JLabel nameLabel = new JLabel("Full Name:");
            nameLabel.setBounds(30, 50, 150, 25);
            formPanel.add(nameLabel);

            fullNameField = new JTextField(faculty.getName()); // Prepopulate with the faculty name
            fullNameField.setBounds(180, 50, 250, 25);
            fullNameField.setEditable(false); // Make it non-editable
            formPanel.add(fullNameField);

            JLabel departmentLabel = new JLabel("Department:");
            departmentLabel.setBounds(30, 90, 150, 25);
            formPanel.add(departmentLabel);

            String[] departments = {"Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Business Administration", "Chemical Engineering"};
            departmentComboBox = new JComboBox<>(departments);
            departmentComboBox.setBounds(180, 90, 250, 25);
            departmentComboBox.setSelectedItem(faculty.getDepartment()); // Prepopulate with faculty department
            departmentComboBox.setEnabled(false); // Make it non-editable
            formPanel.add(departmentComboBox);

            JLabel gradeLabel = new JLabel("Grade:");
            gradeLabel.setBounds(30, 130, 150, 25);
            formPanel.add(gradeLabel);

            String[] grades = {"Assistant Professor", "Associate Professor", "Professor", "Senior Professor", "Lecturer", "Senior Lecturer", "Visiting Professor"};
            gradeComboBox = new JComboBox<>(grades);
            gradeComboBox.setBounds(180, 130, 250, 25);
            gradeComboBox.setSelectedItem(faculty.getGrade()); // Prepopulate with faculty grade
            gradeComboBox.setEnabled(false); // Make it non-editable
            formPanel.add(gradeComboBox);

            JLabel emailLabel = new JLabel("Email:");
            emailLabel.setBounds(30, 170, 150, 25);
            formPanel.add(emailLabel);

            emailField = new JTextField(faculty.getEmail()); // Prepopulate with faculty email
            emailField.setBounds(180, 170, 250, 25);
            emailField.setEditable(false); // Make it non-editable
            formPanel.add(emailField);

            JLabel contactLabel = new JLabel("Contact Number:");
            contactLabel.setBounds(30, 210, 150, 25);
            formPanel.add(contactLabel);

            contactField = new JTextField(faculty.getContact()); // Prepopulate with faculty contact
            contactField.setBounds(180, 210, 250, 25);
            contactField.setEditable(false); // Make it non-editable
            formPanel.add(contactField);

            // Submit Button with Hover Effect
            JButton submitButton = new JButton("Submit Application");
            submitButton.setBounds(180, 350, 200, 30);
            submitButton.setBackground(new Color(240, 248, 255));
            submitButton.setBorder(BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1));
            formPanel.add(submitButton);

            // Back Button to redirect to the home frame
            backButton = new JButton("Back to Home");
            backButton.setBounds(180, 400, 200, 30);
            backButton.setBackground(new Color(240, 248, 255));
            backButton.setBorder(BorderFactory.createLineBorder(Color.LIGHT_GRAY, 1));

            backButton.addActionListener(new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    // Redirect to Home Frame
                    new HomeFrame(userId); // Open HomeFrame
                    dispose(); // Close ApplicationPage
                }
            });
            formPanel.add(backButton);

            // Display the form
            setVisible(true);

        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error retrieving faculty data: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
