import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableCellRenderer;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;
import java.util.List;

public class AdminRequestManagementFrame extends JFrame {
    private JTable table; // Declare table at the class level
    private String adminId;

    public AdminRequestManagementFrame(String adminId) {
        this.adminId = adminId;
        setTitle("Admin Maintenance Requests Management");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        String[] columnNames = {"Request ID", "Problem", "Description", "Request Date", "Status", "User ID", "Change Status"};

        DefaultTableModel tableModel = new DefaultTableModel(columnNames, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                // Only the "Change Status" column will be editable
                return column == 6;
            }
        };

        try {
            MaintenanceRequestDAO dbController = new MaintenanceRequestDAO();
            List<MaintenanceRequest> requests = dbController.fetchAllRequests();  // Fetch all requests from all users

            for (MaintenanceRequest request : requests) {
                tableModel.addRow(new Object[]{
                        request.getRequestId(),
                        request.getProblem(),
                        request.getDescription(),
                        request.getRequestDate(),
                        request.getStatus(),
                        request.getUserId(),
                        "Change Status"  // Button for changing the status
                });
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null, "Error fetching data from the database.", "Error", JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
        }

        table = new JTable(tableModel); // Initialize table here
        table.setFont(new Font("Arial", Font.PLAIN, 14));
        table.setRowHeight(25);

        // Set custom table rendering for the "Change Status" column
        table.getColumn("Change Status").setCellRenderer(new ButtonRenderer());
        table.getColumn("Change Status").setCellEditor(new ButtonEditor(new JCheckBox(), table));

        // Adjust column widths
        table.getColumnModel().getColumn(5).setPreferredWidth(100); // Shrink "User ID" column
        table.getColumnModel().getColumn(6).setPreferredWidth(150); // Widen "Change Status" column

        JScrollPane scrollPane = new JScrollPane(table);
        add(scrollPane, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        JButton backButton = new JButton("Back");

        backButton.addActionListener(e -> {
            new EstateFrame();  // Assuming you have an Admin Home Frame
            dispose();
        });

        buttonPanel.add(backButton);
        add(buttonPanel, BorderLayout.SOUTH);

        setVisible(true);
    }

    // Custom button renderer for the "Change Status" column
    class ButtonRenderer extends JButton implements TableCellRenderer {
        public ButtonRenderer() {
            setText("Change Status");
            setOpaque(true);
        }

        public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            setText("Change Status");  // Ensure text is set correctly
            return this;
        }
    }

    // Custom button editor for the "Change Status" column
    class ButtonEditor extends DefaultCellEditor {
        protected JButton button;
        private JTable table;  // Added table reference here
        private String requestId;
        private String status;

        public ButtonEditor(JCheckBox checkBox, JTable table) {
            super(checkBox);
            this.table = table;  // Initialize table reference
            button = new JButton();
            button.setOpaque(true);
            button.setText("Change Status");  // Set the text to "Change Status"
            button.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    int row = table.getSelectedRow();  // Use the table reference
                    requestId = (String) table.getValueAt(row, 0); // Get request ID
                    status = (String) table.getValueAt(row, 4);  // Get current status

                    // Check if the status is "Pending", and if so, ask for confirmation to change to "Resolved"
                    if ("Pending".equals(status)) {
                        int confirmation = JOptionPane.showConfirmDialog(null, 
                                "Are you sure you want to change the status to 'Resolved'?", 
                                "Confirm Status Change", 
                                JOptionPane.YES_NO_OPTION);

                        if (confirmation == JOptionPane.YES_OPTION) {
                            String newStatus = "Resolved";  // Change to "Resolved"
                            boolean updated = updateRequestStatus(requestId, newStatus);
                            if (updated) {
                                JOptionPane.showMessageDialog(null, "Request status updated to Resolved!", "Success", JOptionPane.INFORMATION_MESSAGE);
                                table.setValueAt(newStatus, row, 4);  // Update status in table
                            } else {
                                JOptionPane.showMessageDialog(null, "Failed to update request status.", "Error", JOptionPane.ERROR_MESSAGE);
                            }
                        }
                    } else {
                        JOptionPane.showMessageDialog(null, "Status can only be changed for pending requests.", "Error", JOptionPane.ERROR_MESSAGE);
                    }
                }
            });
        }

        public Component getTableCellEditorComponent(JTable table, Object value, boolean isSelected, int row, int column) {
            return button;
        }

        // Method to update the request status in the database
        private boolean updateRequestStatus(String requestId, String newStatus) {
            try {
                MaintenanceRequestDAO dao = new MaintenanceRequestDAO();
                return dao.updateRequestStatus(requestId, newStatus); // Call the DAO method to update the database
            } catch (SQLException e) {
                e.printStackTrace();
                return false;
            }
        }
    }

    public static void main(String[] args) {
        new AdminRequestManagementFrame("admin123");
    }
}
