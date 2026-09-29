import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;
import java.util.List;

public class HouseVacancyFrame extends JFrame {

    private int userId;

    // Constructor accepting userId as a parameter
    public HouseVacancyFrame(int userId) {
        this.userId = userId; // Initialize the userId

        setTitle("House Vacancy Section");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Create the header label
        JLabel headerLabel = new JLabel("List of Vacant Houses", SwingConstants.CENTER);
        headerLabel.setFont(new Font("Arial", Font.BOLD, 16));
        add(headerLabel, BorderLayout.NORTH);

        // Fetch vacant houses from the database using DatabaseController
        HouseDAO dbController = new HouseDAO();
        List<House> vacantHouses = null;

        try {
            vacantHouses= dbController.fetchVacantHouses(); // Fetch vacant houses from the database
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error fetching vacant houses: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            return; // If error occurs, exit the frame
        }

        // Prepare the data for the table
        String[] columnNames = {"House ID", "Address"};
        Object[][] data = new Object[vacantHouses.size()][2];

        for (int i = 0; i < vacantHouses.size(); i++) {
            House house = vacantHouses.get(i);
            data[i][0] = house.getHouseId();
            data[i][1] = house.getAddress();
            // data[i][2] = house.getstatus();
        }

        // Set up the table with an uneditable model
        DefaultTableModel tableModel = new DefaultTableModel(data, columnNames) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false; // Makes the table cells uneditable
            }
        };
        JTable table = new JTable(tableModel);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION); // Enable row selection
        JScrollPane scrollPane = new JScrollPane(table);

        // Add the table to the center region
        add(scrollPane, BorderLayout.CENTER);

        // Create buttons for "House Allocation Application" and "Back"
        JButton allocationButton = new JButton("House Allocation Application");
        allocationButton.setFont(new Font("Arial", Font.PLAIN, 14));

        JButton backButton = new JButton("Back");
        backButton.setFont(new Font("Arial", Font.PLAIN, 14));

        // Add action listener for the allocation button
        allocationButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Check if a row is selected
                int selectedRow = table.getSelectedRow();
                if (selectedRow == -1) {
                    JOptionPane.showMessageDialog(null, "Please select a house from the list.", "No House Selected", JOptionPane.WARNING_MESSAGE);
                    return;
                }

                // Retrieve the houseId from the selected row
                int houseId = (int) table.getValueAt(selectedRow, 0); // Assuming houseId is in the first column
                new ApplicationForm(userId, houseId); // Pass userId and houseId to the ApplicationPage
                dispose(); // Close HouseVacancyFrame
            }
        });

        // Add action listener for the back button
        backButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                new HomeFrame(userId); // Return to the HomeFrame
                dispose();
            }
        });

        // Add buttons to the bottom panel
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 20, 10));
        buttonPanel.add(allocationButton);
        buttonPanel.add(backButton);

        add(buttonPanel, BorderLayout.SOUTH);

        setVisible(true);
    }
}
