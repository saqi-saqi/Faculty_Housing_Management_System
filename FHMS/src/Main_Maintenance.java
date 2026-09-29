import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Main_Maintenance extends JFrame {

    private String userId; // Store the userId

    // Constructor accepting userId
    public Main_Maintenance(String userId) {
        this.userId = userId; // Set userId for use in actions

        // Set frame properties
        setTitle("Faculty House Maintenance");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null); // Center the frame on the screen
        setLayout(new BorderLayout());

        // Create a panel for buttons
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.gridy = GridBagConstraints.RELATIVE;
        gbc.insets = new Insets(10, 0, 10, 0);

        // "Add Maintenance Request" button
        JButton addRequestButton = new JButton("Add Maintenance Request");
        addRequestButton.setPreferredSize(new Dimension(250, 50));
        buttonPanel.add(addRequestButton, gbc);

        addRequestButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Open the "Add Maintenance Request" screen, passing userId
                new AddRequestFrame(userId);
                dispose();
            }
        });

        // "View Maintenance Requests" button
        JButton viewRequestButton = new JButton("View Maintenance Requests");
        viewRequestButton.setPreferredSize(new Dimension(250, 50));
        buttonPanel.add(viewRequestButton, gbc);

        viewRequestButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Open the "View Maintenance Requests" screen, passing userId
                new ViewRequestsFrame(userId);
                dispose();
            }
        });

        // "Withdraw Maintenance Requests" button
        JButton withdrawRequestButton = new JButton("Withdraw Maintenance Requests");
        withdrawRequestButton.setPreferredSize(new Dimension(250, 50));
        buttonPanel.add(withdrawRequestButton, gbc);

        withdrawRequestButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Open the "Withdraw Maintenance Requests" screen, passing userId
                new WithdrawRequestsFrame(userId); // Correct the case to userId
                dispose();
            }
        });
        
        // Back Button Panel
        JPanel backPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        JButton backButton = new JButton("Back");
        backButton.setPreferredSize(new Dimension(150, 40));
        backButton.setFont(new Font("Arial", Font.BOLD, 14));
        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Return to HomeFrame, passing userId
                new HomeFrame(userId);
                dispose();
            }
        });

        backPanel.add(backButton);

        // Add panels to the frame
        add(buttonPanel, BorderLayout.CENTER);
        add(backPanel, BorderLayout.SOUTH);

        // Set frame visibility
        setVisible(true);
    }

    // Main method to test the frame
    public static void main(String[] args) {
        String userId = "user123"; // This should be fetched after successful login
        new Main_Maintenance(userId);
    }
}


















// import javax.swing.*;
// import java.awt.*;
// import java.awt.event.ActionEvent;
// import java.awt.event.ActionListener;
// import java.sql.*;
// import java.util.List;

// public class Main_Maintenance extends JFrame {

//     private String userId; // Store the userId

//     // Constructor accepting userId
//     public Main_Maintenance(String userId) {
//         this.userId = userId; // Set userId for use in actions

//         // Set frame properties
//         setTitle("Faculty House Maintenance");
//         setSize(800, 600);
//         setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
//         setLocationRelativeTo(null); // Center the frame on the screen
//         setLayout(new BorderLayout());

//         // Create a panel for buttons
//         JPanel buttonPanel = new JPanel();
//         buttonPanel.setLayout(new GridBagLayout());
//         GridBagConstraints gbc = new GridBagConstraints();
//         gbc.gridx = 0;
//         gbc.gridy = GridBagConstraints.RELATIVE;
//         gbc.insets = new Insets(10, 0, 10, 0);

//         // "Add Maintenance Request" button
//         JButton addRequestButton = new JButton("Add Maintenance Request");
//         addRequestButton.setPreferredSize(new Dimension(250, 50));
//         buttonPanel.add(addRequestButton, gbc);

//         addRequestButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Open the "Add Maintenance Request" screen, passing userId
//                 new AddRequestFrame(userId);
//                 dispose();
//             }
//         });

//         // "View Maintenance Requests" button
//         JButton viewRequestButton = new JButton("View Maintenance Requests");
//         viewRequestButton.setPreferredSize(new Dimension(250, 50));
//         buttonPanel.add(viewRequestButton, gbc);

//         viewRequestButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Open the "View Maintenance Requests" screen, passing userId
//                 new ViewRequestsFrame(userId);
//                 dispose();
//             }
//         });

//         // "View All Maintenance Requests" button
//         JButton viewAllRequestsButton = new JButton("View All Maintenance Requests");
//         viewAllRequestsButton.setPreferredSize(new Dimension(250, 50));
//         buttonPanel.add(viewAllRequestsButton, gbc);

//         viewAllRequestsButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Open the "View All Maintenance Requests" screen
//                 new ViewAllRequestsFrame();
//             }
//         });

//         // "Withdraw Maintenance Requests" button
//         JButton withdrawRequestButton = new JButton("Withdraw Maintenance Requests");
//         withdrawRequestButton.setPreferredSize(new Dimension(250, 50));
//         buttonPanel.add(withdrawRequestButton, gbc);

//         withdrawRequestButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Open the "Withdraw Maintenance Requests" screen, passing userId
//                 new WithdrawRequestsFrame(userId); // Correct the case to userId
//                 dispose();
//             }
//         });

//         // Back Button Panel
//         JPanel backPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
//         JButton backButton = new JButton("Back");
//         backButton.setPreferredSize(new Dimension(150, 40));
//         backButton.setFont(new Font("Arial", Font.BOLD, 14));
//         backButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 // Return to HomeFrame, passing userId
//                 new HomeFrame(userId);
//                 dispose();
//             }
//         });

//         backPanel.add(backButton);

//         // Add panels to the frame
//         add(buttonPanel, BorderLayout.CENTER);
//         add(backPanel, BorderLayout.SOUTH);

//         // Set frame visibility
//         setVisible(true);
//     }

//     // Main method to test the frame
//     public static void main(String[] args) {
//         String userId = "user123"; // This should be fetched after successful login
//         new Main_Maintenance(userId);
//     }
// }
