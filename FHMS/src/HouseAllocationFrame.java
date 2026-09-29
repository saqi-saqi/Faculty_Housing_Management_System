import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;
import java.util.List;

public class HouseAllocationFrame {

    public static void main(String[] args) {
        JFrame frame = new JFrame("House Allocation");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(800, 600);
        frame.setLocationRelativeTo(null);

        JPanel panel = new JPanel();
        panel.setLayout(null);
        frame.add(panel);

        // Table to display faculty details
        JTable facultyTable = new JTable();
        DefaultTableModel tableModel = new DefaultTableModel(new Object[][]{}, new String[]{
                "Name", "Email", "Department", "Grade", "houseiD"
        });
        facultyTable.setModel(tableModel);

        JScrollPane tableScrollPane = new JScrollPane(facultyTable);
        tableScrollPane.setBounds(10, 60, 760, 200);
        panel.add(tableScrollPane);

        JLabel statusLabel = new JLabel("Status: Waiting for input...");
        statusLabel.setBounds(10, 400, 400, 25);
        panel.add(statusLabel);

        // Button to fetch data
        JButton fetchButton = new JButton("Fetch Faculty Data");
        fetchButton.setBounds(10, 280, 200, 25);
        panel.add(fetchButton);

        // Allocate House button
        JButton allocateButton = new JButton("Allocate Houses Automatically");
        allocateButton.setBounds(220, 280, 220, 25);
        panel.add(allocateButton);

        // Back button
        JButton backButton = new JButton("Back");
        backButton.setBounds(10, 320, 150, 25);
        panel.add(backButton);

        // ActionListener for Fetch Data button
        fetchButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    // Fetch data from database, sorted by seniority (higher grades first)
                    ApplicationDAO controller = new ApplicationDAO();
                    List<String[]> facultyData = controller.fetchFacultyDatabyseniority();

                    // Clear the table first
                    tableModel.setRowCount(0);

                    // Add rows to the table model
                    for (String[] row : facultyData) {
                        tableModel.addRow(row);
                    }

                    statusLabel.setText("Status: Faculty data fetched successfully!");

                } catch (SQLException ex) {
                    ex.printStackTrace();
                    statusLabel.setText("Status: Error fetching faculty data.");
                }
            }
        });

        // ActionListener for Allocate House button (automatic allocation)
        allocateButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    ApplicationDAO applicationdao = new ApplicationDAO();
                    // Fetch faculty members based on seniority (already done by fetch button)
                    int totalAllocated = 0;

                    for (int row = 0; row < tableModel.getRowCount(); row++) {
                        //String facultyId = tableModel.getValueAt(row, 0).toString();
                        String facultyName = tableModel.getValueAt(row, 0).toString();

                        // Automatically allocate a house based on seniority
                        boolean success = applicationdao.allocateHouseAutomatically();

                        if (success) {
                            totalAllocated++;
                            // Show message about successful allocation
                            JOptionPane.showMessageDialog(frame, "House allocated to " + facultyName + ".",
                                    "House Allocation", JOptionPane.INFORMATION_MESSAGE);
                            
                            // Remove the allocated faculty from the table
                            tableModel.removeRow(row);
                            row--;  // Adjust row index after removal
                        } else {
                            statusLabel.setText("Status: No available houses.");
                            break;  // No more houses to allocate
                        }
                    }

                    // Show a summary message after the allocation process
                     if (totalAllocated == 0) {
                        JOptionPane.showMessageDialog(frame, "No houses could be allocated.", "House Allocation", JOptionPane.WARNING_MESSAGE);
                     }
                        //     JOptionPane.showMessageDialog(frame, totalAllocated + " houses successfully allocated.",
                    //             "House Allocation", JOptionPane.INFORMATION_MESSAGE);
                    // } else {
                    //     
                    // }
                } catch (SQLException ex) {
                    ex.printStackTrace();
                    statusLabel.setText("Status: Error during house allocation.");
                }
            }
        });

        // ActionListener for Back button
        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                frame.dispose();
                new EstateFrame(); // Navigate back to the previous frame
            }
        });

        frame.setVisible(true);
    }
}






// import javax.swing.*;
// import javax.swing.table.DefaultTableModel;
// import java.awt.event.ActionEvent;
// import java.awt.event.ActionListener;
// import java.sql.SQLException;
// import java.util.List;

// public class HouseAllocationFrame {

//     public static void main(String[] args) {
//         JFrame frame = new JFrame("House Allocation");
//         frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
//         frame.setSize(800, 600);
//         frame.setLocationRelativeTo(null);

//         JPanel panel = new JPanel();
//         panel.setLayout(null);
//         frame.add(panel);

//         // Table to display faculty details
//         JTable facultyTable = new JTable();
//         DefaultTableModel tableModel = new DefaultTableModel(new Object[][]{}, new String[]{
//                  "Name", "Email", "Department", "Grade","houseiD"
//         });
//         facultyTable.setModel(tableModel);

//         JScrollPane tableScrollPane = new JScrollPane(facultyTable);
//         tableScrollPane.setBounds(10, 60, 760, 200);
//         panel.add(tableScrollPane);

//         JLabel statusLabel = new JLabel("Status: Waiting for input...");
//         statusLabel.setBounds(10, 400, 400, 25);
//         panel.add(statusLabel);

//         // Button to fetch data
//         JButton fetchButton = new JButton("Fetch Faculty Data");
//         fetchButton.setBounds(10, 280, 200, 25);
//         panel.add(fetchButton);

//         // Allocate House button
//         JButton allocateButton = new JButton("Allocate Houses Automatically");
//         allocateButton.setBounds(220, 280, 220, 25);
//         panel.add(allocateButton);

//         // Back button
//         JButton backButton = new JButton("Back");
//         backButton.setBounds(10, 320, 150, 25);
//         panel.add(backButton);

//         // ActionListener for Fetch Data button
//         fetchButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 try {
//                     // Fetch data from database, sorted by seniority (higher grades first)
//                     ApplicationDAO controller = new ApplicationDAO();
//                     List<String[]> facultyData = controller.fetchFacultyDatabyseniority();

//                     // Clear the table first
//                     tableModel.setRowCount(0);

//                     // Add rows to the table model
//                     for (String[] row : facultyData) {
//                         tableModel.addRow(row);
//                     }

//                     statusLabel.setText("Status: Faculty data fetched successfully!");

//                 } catch (SQLException ex) {
//                     ex.printStackTrace();
//                     statusLabel.setText("Status: Error fetching faculty data.");
//                 }
//             }
//         });

//         // ActionListener for Allocate House button (automatic allocation)
//         allocateButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 try {
//                     ApplicationDAO applicationdao = new ApplicationDAO();
//                     // Fetch faculty members based on seniority (already done by fetch button)
//                     int totalAllocated = 0;

//                     for (int row = 0; row < tableModel.getRowCount(); row++) {
//                         String facultyId = tableModel.getValueAt(row, 0).toString();
//                         String facultyName = tableModel.getValueAt(row, 1).toString();

//                         // Automatically allocate a house based on seniority
//                         boolean success = applicationdao.allocateHouseAutomatically();

//                         if (success) {
//                             totalAllocated++;
//                             statusLabel.setText("Status: House allocated to " + facultyName + ".");
//                         } else {
//                             statusLabel.setText("Status: No available houses.");
//                             break;  // No more houses to allocate
//                         }
//                     }

//                     // Show a summary message after the allocation process
//                     if (totalAllocated > 0) {
//                         JOptionPane.showMessageDialog(frame, totalAllocated + " houses successfully allocated.",
//                                 "House Allocation", JOptionPane.INFORMATION_MESSAGE);
//                     } else {
//                         JOptionPane.showMessageDialog(frame, "No houses could be allocated.", "House Allocation", JOptionPane.WARNING_MESSAGE);
//                     }
//                 } catch (SQLException ex) {
//                     ex.printStackTrace();
//                     statusLabel.setText("Status: Error during house allocation.");
//                 }
//             }
//         });

//         // ActionListener for Back button
//         backButton.addActionListener(new ActionListener() {
//             @Override
//             public void actionPerformed(ActionEvent e) {
//                 frame.dispose();
//                 new EstateFrame(); // Navigate back to the previous frame
//             }
//         });

//         frame.setVisible(true);
//     }
// }


















// // import javax.swing.*;
// // import javax.swing.table.DefaultTableModel;
// // import java.awt.event.ActionEvent;
// // import java.awt.event.ActionListener;
// // import java.sql.SQLException;
// // import java.util.List;

// // public class HouseAllocationForm {

// //     public static void main(String[] args) {
// //         JFrame frame = new JFrame("House Allocation");
// //         frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
// //         frame.setSize(800, 600);
// //         frame.setLocationRelativeTo(null);

// //         JPanel panel = new JPanel();
// //         panel.setLayout(null);
// //         frame.add(panel);

// //         // Remove the text field for faculty name input (no longer needed)
// //         /*
// //         JLabel nameInputLabel = new JLabel("Enter Faculty Name:");
// //         nameInputLabel.setBounds(10, 20, 150, 25);
// //         panel.add(nameInputLabel);

// //         JTextField nameInputField = new JTextField();
// //         nameInputField.setBounds(160, 20, 200, 25);
// //         panel.add(nameInputField);
// //         */

// //         // Table to display faculty details
// //         JTable facultyTable = new JTable();
// //         DefaultTableModel tableModel = new DefaultTableModel(new Object[][]{}, new String[]{
// //                 "ID", "Name", "Email", "Department", "Grade", "Contact"
// //         });
// //         facultyTable.setModel(tableModel);

// //         JScrollPane tableScrollPane = new JScrollPane(facultyTable);
// //         tableScrollPane.setBounds(10, 60, 760, 200);
// //         panel.add(tableScrollPane);

// //         JLabel statusLabel = new JLabel("Status: Waiting for input...");
// //         statusLabel.setBounds(10, 400, 400, 25);
// //         panel.add(statusLabel);

// //         // Button to fetch data
// //         JButton fetchButton = new JButton("Fetch Faculty Data");
// //         fetchButton.setBounds(10, 280, 200, 25);
// //         panel.add(fetchButton);

// //         // Allocate House button
// //         JButton allocateButton = new JButton("Allocate House");
// //         allocateButton.setBounds(220, 280, 150, 25);
// //         panel.add(allocateButton);

// //         // Back button
// //         JButton backButton = new JButton("Back");
// //         backButton.setBounds(10, 320, 150, 25);
// //         panel.add(backButton);

// //         // ActionListener for Fetch Data button
// //         fetchButton.addActionListener(new ActionListener() {
// //             @Override
// //             public void actionPerformed(ActionEvent e) {
// //                 try {
// //                     // Fetch data from database
// //                     facultydao controller = new facultydao();
// //                     List<String[]> facultyData = controller.fetchFacultyData();

// //                     // Clear the table first
// //                     tableModel.setRowCount(0);

// //                     // Add rows to the table model
// //                     for (String[] row : facultyData) {
// //                         tableModel.addRow(row);
// //                     }

// //                     statusLabel.setText("Status: Faculty data fetched successfully!");

// //                 } catch (SQLException ex) {
// //                     ex.printStackTrace();
// //                     statusLabel.setText("Status: Error fetching faculty data.");
// //                 }
// //             }
// //         });

// //         // ActionListener for Allocate House button
// //         allocateButton.addActionListener(new ActionListener() {
// //             @Override
// //             public void actionPerformed(ActionEvent e) {
// //                 int selectedRow = facultyTable.getSelectedRow();  // Get the selected row index

// //                 if (selectedRow == -1) {
// //                     statusLabel.setText("Status: Please select a faculty member!");
// //                     return;
// //                 }

// //                 // Get faculty details from the selected row
// //                 String facultyId = tableModel.getValueAt(selectedRow, 0).toString();
// //                 String facultyName = tableModel.getValueAt(selectedRow, 1).toString();

// //                 // Perform the house allocation here (e.g., update the database)
// //                 // For now, just show a success message
// //                 try {
// //                     Applicationdao applicationdao = new Applicationdao();
// //                     boolean success = applicationdao.allocateHouseToFaculty(Integer.parseInt(facultyId));

// //                     if (success) {
// //                         JOptionPane.showMessageDialog(frame, "House successfully allocated to " + facultyName + ".", 
// //                                 "House Allocation", JOptionPane.INFORMATION_MESSAGE);
// //                     } else {
// //                         statusLabel.setText("Status: Failed to allocate house.");
// //                     }
// //                 } catch (SQLException ex) {
// //                     ex.printStackTrace();
// //                     statusLabel.setText("Status: Error during house allocation.");
// //                 }
// //             }
// //         });

// //         // ActionListener for Back button
// //         backButton.addActionListener(new ActionListener() {
// //             @Override
// //             public void actionPerformed(ActionEvent e) {
// //                 frame.dispose();
// //                 new EstateFrame(); // Navigate back to the previous frame
// //             }
// //         });

// //         frame.setVisible(true);
// //     }
// // }
