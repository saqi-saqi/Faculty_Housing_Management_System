import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class HouseAllocationForm {

    public static void main(String[] args) {
        // Create a frame for the House Allocation form
        JFrame frame = new JFrame("House Allocation");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(600, 400);
        frame.setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        panel.setLayout(null);
        frame.add(panel);

        // Dropdown Menu (ComboBox) for selecting a form
        JLabel selectFormLabel = new JLabel("Select Form:");
        selectFormLabel.setBounds(10, 20, 120, 25);
        panel.add(selectFormLabel);

        String[] formOptions = {"Form 1", "Form 2", "Form 3", "Form 4", "Form 5", 
                                "Form 6", "Form 7", "Form 8", "Form 9", "Form 10"};
        JComboBox<String> formComboBox = new JComboBox<>(formOptions);
        formComboBox.setBounds(140, 20, 200, 25);
        panel.add(formComboBox);

        // Labels and text fields for faculty member details
        JLabel nameLabel = new JLabel("Faculty Name:");
        nameLabel.setBounds(10, 60, 120, 25);
        panel.add(nameLabel);

        JTextField nameField = new JTextField();
        nameField.setBounds(140, 60, 200, 25);
        panel.add(nameField);

        JLabel deptLabel = new JLabel("Department:");
        deptLabel.setBounds(10, 100, 120, 25);
        panel.add(deptLabel);

        JTextField deptField = new JTextField();
        deptField.setBounds(140, 100, 200, 25);
        panel.add(deptField);

        JLabel gradeLabel = new JLabel("Grade:");
        gradeLabel.setBounds(10, 140, 120, 25);
        panel.add(gradeLabel);

        JTextField gradeField = new JTextField();
        gradeField.setBounds(140, 140, 200, 25);
        panel.add(gradeField);

        JLabel seniorityLabel = new JLabel("Seniority Level:");
        seniorityLabel.setBounds(10, 180, 120, 25);
        panel.add(seniorityLabel);

        JTextField seniorityField = new JTextField();
        seniorityField.setBounds(140, 180, 200, 25);
        panel.add(seniorityField);

        // Status label to display eligibility
        JLabel statusLabel = new JLabel("Status: Waiting for input...");
        statusLabel.setBounds(10, 220, 400, 25);
        panel.add(statusLabel);

        // Button to verify eligibility
        JButton verifyButton = new JButton("Verify Eligibility");
        verifyButton.setBounds(10, 260, 150, 25);
        panel.add(verifyButton);

        // Button to allocate house
        JButton allocateButton = new JButton("Allocate House");
        allocateButton.setBounds(180, 260, 150, 25);
        panel.add(allocateButton);

        // Button to view available houses
        JButton viewHousesButton = new JButton("View Available Houses");
        viewHousesButton.setBounds(350, 260, 200, 25);
        panel.add(viewHousesButton);

        // Navigation buttons for Next and Back
        JButton nextButton = new JButton("Next");
        nextButton.setBounds(180, 300, 150, 25);
        panel.add(nextButton);

        JButton backButton = new JButton("Back");
        backButton.setBounds(350, 300, 150, 25);
        panel.add(backButton);

        // Dummy Data for each form (1-10)
        String[][] dummyData = {
            {"John Doe", "Computer Science", "A", "Senior"},
            {"Jane Smith", "Mathematics", "B", "Junior"},
            {"Mark Brown", "Physics", "C", "Senior"},
            {"Alice White", "Engineering", "A", "Senior"},
            {"Bob Green", "Biology", "B", "Junior"},
            {"Eve Black", "Chemistry", "A", "Senior"},
            {"Tom Blue", "Economics", "B", "Junior"},
            {"Sarah Yellow", "History", "C", "Junior"},
            {"David Grey", "Philosophy", "A", "Senior"},
            {"Linda Orange", "Psychology", "B", "Senior"}
        };

        // ActionListener for the Dropdown Menu to fill the form fields with the selected form's data
        formComboBox.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Get the selected index from the ComboBox
                int selectedIndex = formComboBox.getSelectedIndex();

                // Fill the form with the selected form's dummy data
                nameField.setText(dummyData[selectedIndex][0]);
                deptField.setText(dummyData[selectedIndex][1]);
                gradeField.setText(dummyData[selectedIndex][2]);
                seniorityField.setText(dummyData[selectedIndex][3]);

                // Disable the text fields to make them non-editable
                nameField.setEditable(false);
                deptField.setEditable(false);
                gradeField.setEditable(false);
                seniorityField.setEditable(false);
            }
        });

        // ActionListener for Verify Eligibility button
        verifyButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = nameField.getText();
                String grade = gradeField.getText();
                String seniority = seniorityField.getText();

                if (name.isEmpty() || grade.isEmpty() || seniority.isEmpty()) {
                    statusLabel.setText("Status: Please fill all fields!");
                    return;
                }

                // Simulate eligibility check (example: Grade A or B)
                if (grade.equals("A") || grade.equals("B")) {
                    statusLabel.setText("Status: " + name + " is eligible for house allocation.");
                } else {
                    statusLabel.setText("Status: " + name + " is NOT eligible for house allocation (Grade too low).");
                }
            }
        });

        // ActionListener for Allocate House button
        allocateButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String name = nameField.getText();

                if (name.isEmpty()) {
                    statusLabel.setText("Status: Please enter the Faculty Name!");
                    return;
                }

                // Simulate house allocation (this can be extended to include real functionality)
                statusLabel.setText("Status: House allocated to " + name + ".");
            }
        });

        // ActionListener for View Available Houses button
        viewHousesButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                JOptionPane.showMessageDialog(frame, "Available Houses:\nHouse A, House B, House C", "Available Houses", JOptionPane.INFORMATION_MESSAGE);
            }
        });

        // ActionListener for Next button
        nextButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Navigate to resolve application issues form (as per original functionality)
                frame.dispose();  // Close HouseAllocationForm
                IssuesForm.main(new String[]{});  // Assuming IssuesForm is implemented
            }
        });

        // ActionListener for Back button
        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Navigate back to the Estate Frame
                frame.dispose();  // Close HouseAllocationForm
                new EstateFrame();  // Open EstateFrame again
            }
        });

        frame.setVisible(true);
    }
}
