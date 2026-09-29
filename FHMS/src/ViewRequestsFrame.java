import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.*;
import java.util.List;

public class ViewRequestsFrame extends JFrame {
    private int userId;

    public ViewRequestsFrame(int userId) {
        this.userId = userId;
        setTitle("View Maintenance Requests");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        String[] columnNames = {"RequestID", "Problem", "Description", "RequestDate", "Status"};

        DefaultTableModel tableModel = new DefaultTableModel(columnNames, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        try {
            MaintenanceRequestDAO dbController = new MaintenanceRequestDAO();
            System.out.println("Fetching requests for userId: " + userId);  // Debug: Log userId
            List<MaintenanceRequest> requests = dbController.fetchRequestsByUserId(userId);
        
            System.out.println("Requests retrieved: " + requests.size());  // Debug: Log the number of requests fetched
            
            for (MaintenanceRequest request : requests) {
                System.out.println("Adding request to table: " + request.getRequestId());  // Debug: Log each request being added
                tableModel.addRow(new Object[]{
                        request.getRequestId(),
                        request.getProblem(),
                        request.getDescription(),
                        request.getRequestDate(),
                        request.getStatus()
                });
            }
        } catch (SQLException ex) {
            System.out.println("Error during database interaction: " + ex.getMessage());  // Log the error message
            JOptionPane.showMessageDialog(null, "Error fetching data from the database.", "Error", JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
        }
        
        JTable table = new JTable(tableModel);
        table.setFont(new Font("Arial", Font.PLAIN, 14));
        table.setRowHeight(25);

        JScrollPane scrollPane = new JScrollPane(table);
        add(scrollPane, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        JButton backButton = new JButton("Back");

        backButton.addActionListener(e -> {
            new Main_MaintenanceFrame(userId);  // Go back to the main frame
            dispose();
        });

        buttonPanel.add(backButton);
        add(buttonPanel, BorderLayout.SOUTH);

        setVisible(true);
    }

    public static void main(String[] args) {
        new ViewRequestsFrame(1);
    }
}
