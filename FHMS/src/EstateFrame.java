import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class EstateFrame extends JFrame {

    public EstateFrame() {
        // Set frame properties
        setTitle("Estate Management System");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        // Create the main panel for the estate system
        JPanel panel = new JPanel();
        panel.setLayout(new GridBagLayout());
        panel.setBackground(new Color(240, 248, 255));  // Light blue background
        getContentPane().add(panel);

        // GridBagConstraints for better control over component positioning
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(10, 10, 10, 10);  // Adding padding around components

        // Title label with custom font and color
        JLabel titleLabel = new JLabel("Estate Management System");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 28));
        titleLabel.setForeground(new Color(0, 51, 102));  // Dark blue color
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        // GridBagConstraints for title label
        gbc.gridwidth = 2;
        gbc.gridy = 0;  // Position title at the top
        panel.add(titleLabel, gbc);

        // Space between title and buttons
        panel.add(Box.createRigidArea(new Dimension(0, 40)), gbc);

        // Buttons for navigating to different sections
        JButton houseAllocationButton = createButton("House Allocation System");
        JButton manageRequestsButton = createButton("Manage Maintenance Requests");

        // GridBagConstraints for buttons
        gbc.gridwidth = 1;
        gbc.gridy = 1;
        panel.add(houseAllocationButton, gbc);

        gbc.gridy = 2;
        panel.add(manageRequestsButton, gbc);  

        // ActionListeners for buttons
        houseAllocationButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                dispose();  
                HouseAllocationFrame.main(new String[]{});  
            }
        });

        manageRequestsButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Assuming adminId is passed as a parameter (you should replace it with the actual admin ID)
                String adminId = "admin1234"; // Replace with actual logic to get admin ID
                new AdminRequestManagementFrame(adminId);  // Open AdminRequestManagementFrame with adminId
                dispose();
            }
        });

        setVisible(true);
    }

    private JButton createButton(String text) {
        JButton button = new JButton(text);
        button.setFont(new Font("Arial", Font.PLAIN, 16));
        button.setBackground(new Color(0, 123, 255));
        button.setForeground(Color.WHITE);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(250, 40));
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));
        button.setBorder(BorderFactory.createLineBorder(new Color(0, 102, 204), 2));
        button.setBorderPainted(true);
        return button;
    }

    public static void main(String[] args) {
        new EstateFrame();
    }
}






// import javax.swing.*;
// import java.awt.*;
// import java.awt.event.ActionEvent;
// import java.awt.event.ActionListener;

// public class EstateFrame extends JFrame {

//     public EstateFrame() {
//         // Set frame properties
//         setTitle("Estate Management System");
//         setSize(800, 600);
//         setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
//         setLocationRelativeTo(null);

//         // Create the main panel for the estate system
//         JPanel panel = new JPanel();
//         panel.setLayout(new GridBagLayout());
//         panel.setBackground(new Color(240, 248, 255));  // Light blue background
//         getContentPane().add(panel);

//         // GridBagConstraints for better control over component positioning
//         GridBagConstraints gbc = new GridBagConstraints();
//         gbc.fill = GridBagConstraints.HORIZONTAL;
//         gbc.insets = new Insets(10, 10, 10, 10);  // Adding padding around components

//         // Title label with custom font and color
//         JLabel titleLabel = new JLabel("Estate Management System");
//         titleLabel.setFont(new Font("Arial", Font.BOLD, 28));
//         titleLabel.setForeground(new Color(0, 51, 102));  // Dark blue color
//         titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
//         // GridBagConstraints for title label
//         gbc.gridwidth = 2;
//         gbc.gridy = 0;  // Position title at the top
//         panel.add(titleLabel, gbc);

//         // Space between title and buttons
//         panel.add(Box.createRigidArea(new Dimension(0, 40)), gbc);

//         // Buttons for navigating to different sections
//         JButton houseAllocationButton = createButton("House Allocation System");
//         JButton resolveApplicationButton = createButton("Resolve Application Issues");

//         // GridBagConstraints for buttons (button 1)
//         gbc.gridwidth = 1;
//         gbc.gridy = 1;  // Place first button below the title
//         panel.add(houseAllocationButton, gbc);

//         // GridBagConstraints for buttons (button 2)
//         gbc.gridy = 2;  // Place second button below the first button
//         panel.add(resolveApplicationButton, gbc);

//         // ActionListeners for buttons
//         houseAllocationButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Navigate to House Allocation Form
//                 dispose();  // Close EstateFrame
//                 HouseAllocationForm.main(new String[]{});  // Open House Allocation Form
//             }
//         });

//         resolveApplicationButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Navigate to Resolve Application Issues Form
//                 dispose();  // Close EstateFrame
//                 IssuesForm.main(new String[]{});  // Open IssuesForm (Resolve Application Issues)
//             }
//         });

//         // Show the Estate Frame
//         setVisible(true);
//     }

//     // Method to create a button with custom styling
//     private JButton createButton(String text) {
//         JButton button = new JButton(text);
//         button.setFont(new Font("Arial", Font.PLAIN, 16));
//         button.setBackground(new Color(0, 123, 255));  // Blue color for the button
//         button.setForeground(Color.WHITE);  // White text
//         button.setFocusPainted(false);  // Removes focus border when clicked
//         button.setPreferredSize(new Dimension(250, 40));  // Set preferred button size
//         button.setCursor(new Cursor(Cursor.HAND_CURSOR));  // Change cursor to hand on hover
//         button.setBorder(BorderFactory.createLineBorder(new Color(0, 102, 204), 2));  // Blue border
//         button.setBorderPainted(true);  // Border painted
//         return button;
//     }

//     public static void main(String[] args) {
//         // Create an instance of EstateFrame
//         new EstateFrame();
//     }
// }
