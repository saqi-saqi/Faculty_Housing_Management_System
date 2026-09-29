import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;
import java.awt.event.ActionEvent;

public class WithdrawRequestsFrame extends JFrame {
    private int userId;

    public WithdrawRequestsFrame(int userId) {
        this.userId = userId; // Store the userId
        initializeFrame();
    }

    private void initializeFrame() {
        setTitle("Withdraw Maintenance Requests");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Column names for the table
        String[] columnNames = {"Request ID", "Problem", "Description", "Request Date", "Status"};

        // Create a table model
        DefaultTableModel tableModel = new DefaultTableModel(columnNames, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false; // Make all cells non-editable
            }
        };

        // Populate the table with data from the database
        try {
            MaintenanceRequestDAO dbController = new MaintenanceRequestDAO();
            List<MaintenanceRequest> requests = dbController.fetchPendingRequests(userId);

            // Add each request to the table model
            for (MaintenanceRequest request : requests) {
                tableModel.addRow(new Object[]{
                        request.getRequestId(),
                        request.getProblem(),
                        request.getDescription(),
                        request.getRequestDate(),
                        request.getStatus()
                });
            }

        } catch (Exception ex) {
            JOptionPane.showMessageDialog(null, "Error fetching data from the database.", "Error", JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
        }

        // Create the table
        JTable table = new JTable(tableModel);
        table.setFont(new Font("Arial", Font.PLAIN, 14));
        table.setRowHeight(25);
        JScrollPane scrollPane = new JScrollPane(table);
        add(scrollPane, BorderLayout.CENTER);

        // Create buttons
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        JButton cancelRequestButton = new JButton("Cancel Request");
        buttonPanel.add(cancelRequestButton);

        cancelRequestButton.addActionListener((ActionEvent e) -> {
            int selectedRow = table.getSelectedRow();
            if (selectedRow == -1) {
                JOptionPane.showMessageDialog(null, "No request selected.", "Error", JOptionPane.ERROR_MESSAGE);
            } else {
                String requestId = (String) tableModel.getValueAt(selectedRow, 0);
                String removedRequest = "Request ID: " + requestId +
                        ", Problem: " + tableModel.getValueAt(selectedRow, 1);
                int confirmation = JOptionPane.showConfirmDialog(null,
                        "Are you sure you want to cancel this request?\n" + removedRequest,
                        "Confirm Cancellation", JOptionPane.YES_NO_OPTION);

                if (confirmation == JOptionPane.YES_OPTION) {
                    try {
                        MaintenanceRequestDAO dbController = new MaintenanceRequestDAO();
                        if (dbController.cancelMaintenanceRequest(requestId)) {
                            tableModel.removeRow(selectedRow);
                            JOptionPane.showMessageDialog(null, "Request canceled successfully.", "Success", JOptionPane.INFORMATION_MESSAGE);
                        } else {
                            JOptionPane.showMessageDialog(null, "Error canceling the request.", "Error", JOptionPane.ERROR_MESSAGE);
                        }
                    } catch (Exception ex) {
                        JOptionPane.showMessageDialog(null, "Error updating the database.", "Error", JOptionPane.ERROR_MESSAGE);
                        ex.printStackTrace();
                    }
                }
            }
        });

        JButton backButton = new JButton("Back");
        buttonPanel.add(backButton);

        backButton.addActionListener(e -> {
            new Main_MaintenanceFrame(userId); // Navigate back to the main maintenance frame
            dispose();
        });

        add(buttonPanel, BorderLayout.SOUTH);
        setVisible(true);
    }

    // Main method to test the frame
    public static void main(String[] args) {
        // Testing with a specific userId, e.g., "1"
        new WithdrawRequestsFrame(1);  // Pass a valid user ID here for testing
    }
}
