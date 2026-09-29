import javax.swing.*;
// import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class IssuesForm {

    public static void main(String[] args) {
        JFrame frame = new JFrame("Resolve Application Issues");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(700, 600);
        frame.setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        panel.setLayout(null);
        frame.add(panel);

        // Conflict Details Section
        JLabel conflictLabel = new JLabel("Conflict Details:");
        conflictLabel.setBounds(10, 10, 200, 25);
        panel.add(conflictLabel);

        JLabel applicantsLabel = new JLabel("Applicants in Conflict:");
        applicantsLabel.setBounds(10, 50, 150, 25);
        panel.add(applicantsLabel);

        JTextArea applicantsArea = new JTextArea("Example: Faculty A, Faculty B"); // Placeholder for actual data
        applicantsArea.setBounds(170, 50, 480, 60);
        applicantsArea.setEditable(false);
        applicantsArea.setLineWrap(true);
        applicantsArea.setWrapStyleWord(true);
        panel.add(applicantsArea);

        JLabel availableHousesLabel = new JLabel("Available Houses:");
        availableHousesLabel.setBounds(10, 130, 150, 25);
        panel.add(availableHousesLabel);

        JTextField availableHousesField = new JTextField("Example: 2"); // Placeholder for actual data
        availableHousesField.setBounds(170, 130, 200, 25);
        availableHousesField.setEditable(false);
        panel.add(availableHousesField);

        // Resolution Policies Section
        JLabel resolutionLabel = new JLabel("Resolution Policies:");
        resolutionLabel.setBounds(10, 180, 200, 25);
        panel.add(resolutionLabel);

        JCheckBox seniorityCheck = new JCheckBox("Apply Additional Seniority Constraints");
        seniorityCheck.setBounds(10, 210, 300, 25);
        panel.add(seniorityCheck);

        JCheckBox achievementsCheck = new JCheckBox("Consider Number of Achievements");
        achievementsCheck.setBounds(10, 240, 300, 25);
        panel.add(achievementsCheck);

        JCheckBox tenureCheck = new JCheckBox("Apply Tenure-Based Priority");
        tenureCheck.setBounds(10, 270, 300, 25);
        panel.add(tenureCheck);

        JCheckBox departmentPriorityCheck = new JCheckBox("Department-Based Priority");
        departmentPriorityCheck.setBounds(10, 300, 300, 25);
        panel.add(departmentPriorityCheck);

        // Finalized Decision Section
        JLabel decisionLabel = new JLabel("Finalized List of Allotted Faculty Members:");
        decisionLabel.setBounds(10, 350, 300, 25);
        panel.add(decisionLabel);

        JTextArea decisionArea = new JTextArea();
        decisionArea.setBounds(10, 380, 640, 80);
        decisionArea.setLineWrap(true);
        decisionArea.setWrapStyleWord(true);
        panel.add(decisionArea);

        // Buttons
        JButton resolveButton = new JButton("Resolve Conflict");
        resolveButton.setBounds(10, 480, 200, 30);
        panel.add(resolveButton);

        JButton sendLettersButton = new JButton("Send Letters");
        sendLettersButton.setBounds(230, 480, 200, 30);
        sendLettersButton.setEnabled(false); // Initially disabled
        panel.add(sendLettersButton);

        JButton updateSystemButton = new JButton("Update System");
        updateSystemButton.setBounds(450, 480, 200, 30);
        updateSystemButton.setEnabled(false); // Initially disabled
        panel.add(updateSystemButton);

        // Back Button to navigate to Estate frame
        JButton backButton = new JButton("Back");
        backButton.setBounds(550, 520, 120, 30); // Adjusted for alignment
        panel.add(backButton);

        // Action Listeners
        resolveButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Resolve conflict and display the finalized list
                String resolvedApplicants = "Finalized List:\nFaculty A (Seniority)\nFaculty C (Achievements)";
                decisionArea.setText(resolvedApplicants);

                // Enable next steps
                sendLettersButton.setEnabled(true);
                updateSystemButton.setEnabled(true);

                JOptionPane.showMessageDialog(frame, "Conflict resolved successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        sendLettersButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Simulate sending letters
                JOptionPane.showMessageDialog(frame, "Letters sent to allotted faculty members.", "Success", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        updateSystemButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Simulate system update
                JOptionPane.showMessageDialog(frame, "Allocation records updated successfully.", "System Updated", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        // Back Button ActionListener to go back to Estate frame
        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                frame.dispose();  // Close IssuesForm
                EstateFrame.main(new String[]{});  // Open EstateFrame (assuming EstateFrame is the class for the Estate form)
            }
        });

        frame.setVisible(true);
    }
}
