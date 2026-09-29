import javax.swing.*;
import java.awt.*;
//import java.awt.event.ActionEvent;

public class AddRequestFrame extends JFrame {
    private int userId;

    public AddRequestFrame(int userId) {
        this.userId = userId;
        initializeFrame();
    }

    private void initializeFrame() {
        setTitle("Add Maintenance Request");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel panel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // Problem Label and ComboBox
        JLabel problemLabel = new JLabel("Problem:");
        gbc.gridx = 0;
        gbc.gridy = 0;
        panel.add(problemLabel, gbc);

        String[] maintenanceProblems = {
                "Other", "Leaky Faucet", "Clogged Drain", "Broken Door Lock", "Roof Leak",
                "Electrical Wiring Issue", "Light Bulb Replacement", "Broken Window",
                "Heating/Cooling System Issue", "Water Heater Problem", "Pest Control",
                "Paint Damage", "Plumbing Leak", "Cracked Wall or Ceiling", "Appliance Malfunction"
        };
        JComboBox<String> problemComboBox = new JComboBox<>(maintenanceProblems);
        gbc.gridx = 1;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        panel.add(problemComboBox, gbc);

        // Description Label and TextArea
        JLabel descriptionLabel = new JLabel("Description:");
        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.gridwidth = 1;
        panel.add(descriptionLabel, gbc);

        JTextArea descriptionArea = new JTextArea(5, 20);
        JScrollPane descriptionScrollPane = new JScrollPane(descriptionArea);
        gbc.gridx = 1;
        gbc.gridy = 1;
        gbc.gridwidth = 2;
        panel.add(descriptionScrollPane, gbc);

        // Submit Button
        JButton submitButton = new JButton("Submit Request");
        gbc.gridx = 1;
        gbc.gridy = 2;
        gbc.gridwidth = 1;
        panel.add(submitButton, gbc);

        // Back Button
        JButton backButton = new JButton("Back");
        gbc.gridx = 2;
        gbc.gridy = 2;
        panel.add(backButton, gbc);

        submitButton.addActionListener(e -> handleSubmit(problemComboBox, descriptionArea));

        backButton.addActionListener(e -> {
            new Main_MaintenanceFrame(userId);  // Go back to the main frame
            dispose();
        });

        add(panel);
        setVisible(true);
    }

    private void handleSubmit(JComboBox<String> problemComboBox, JTextArea descriptionArea) {
        String problem = (String) problemComboBox.getSelectedItem();
        String description = descriptionArea.getText().trim();
    
        if (description.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Description field is required.", "Error", JOptionPane.ERROR_MESSAGE);
        } else {
            MaintenanceRequestDAO dao = new MaintenanceRequestDAO();
            String status = "Pending";
            String requestDate = java.time.LocalDate.now().toString();
    
            try {
                // Check if userId is valid (not 0)
                if (userId != 0) {
                    dao.insertMaintenanceRequest(problem, description, status, requestDate, userId);
                    JOptionPane.showMessageDialog(this, "Maintenance Request Submitted Successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
                    dispose();
                } else {
                    JOptionPane.showMessageDialog(this, "Invalid user ID.", "Error", JOptionPane.ERROR_MESSAGE);
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error submitting the request: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }
    
    public static void main(String[] args) {
        new AddRequestFrame(1);
    }
}
