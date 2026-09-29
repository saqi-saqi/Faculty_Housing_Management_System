import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class HomeFrame extends JFrame {

    private int userId; // Store the userId

    // Constructor that accepts userId
    public HomeFrame(int userId) {
        System.out.println("UserId received in HomeFrame: " + userId); 
        this.userId = userId; // Store the userId
        initializeFrame();
    }

    // Method to initialize the frame with buttons and layout
    private void initializeFrame() {
        // Set up the home frame
        setTitle("Home");
        setSize(800, 600); // Increased frame size
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Create a panel to hold the buttons
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new GridLayout(2, 1, 20, 20)); // Increased spacing between buttons

        // Button to view house vacancies
        JButton viewVacancyButton = new JButton("View Vacancy of Houses");
        viewVacancyButton.setFont(new Font("Arial", Font.BOLD, 18)); // Larger font for better visibility
        viewVacancyButton.setPreferredSize(new Dimension(300, 50)); // Set button size
        if (HouseDAO.hasHouse(userId)) {
            viewVacancyButton.setEnabled(false);
        }else{
        viewVacancyButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new HouseVacancyFrame(userId); // Redirect to house vacancy management
            }
        });
    }

        // Button to enter the maintenance system
        JButton maintenanceButton = new JButton("Maintenance Section");
        maintenanceButton.setFont(new Font("Arial", Font.BOLD, 18)); // Larger font for better visibility
        maintenanceButton.setPreferredSize(new Dimension(300, 50)); // Set button size
         // Check if the user has a house using HouseDAO class
         if (!HouseDAO.hasHouse(userId)) {
            maintenanceButton.setEnabled(false); // Disable the button if user has no house
        } else {
            maintenanceButton.addActionListener(new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    new Main_MaintenanceFrame(userId); // Redirect to maintenance system and pass userId
                }
            });
        }

        // Create a wrapper panel to center the buttons
        JPanel centerPanel = new JPanel();
        centerPanel.setLayout(new GridBagLayout());
        centerPanel.add(buttonPanel);

        // Add buttons to the panel
        buttonPanel.add(viewVacancyButton);
        buttonPanel.add(maintenanceButton);

        // Add panels to the frame
        add(centerPanel, BorderLayout.CENTER);

        // Set frame visibility
        setVisible(true);
    }

    // Main method to launch the frame (if needed)
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new HomeFrame(1)); // Pass a sample userId for testing
    }
}
