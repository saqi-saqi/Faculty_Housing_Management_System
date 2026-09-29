
public class MaintenanceRequest {
    private String requestId;
    private String problem;
    private String description;
    private String requestDate;
    private String status;
    private int userId;  // Assuming there is a userId field in MaintenanceRequest

    // Constructor
    public MaintenanceRequest(String requestId, String problem, String description, String requestDate, String status, int userId) {
        this.requestId = requestId;
        this.problem = problem;
        this.description = description;
        this.requestDate = requestDate;
        this.status = status;
        this.userId = userId;  // Initialize userId
    }

    // Getters and Setters
    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(String requestDate) {
        this.requestDate = requestDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUserId() {
        return userId;  // Added userId getter method
    }

    public void setUserId(int userId) {
        this.userId = userId;  // Added userId setter method
    }

    @Override
    public String toString() {
        return "MaintenanceRequest{" +
                "requestId='" + requestId + '\'' +
                ", problem='" + problem + '\'' +
                ", description='" + description + '\'' +
                ", requestDate='" + requestDate + '\'' +
                ", status='" + status + '\'' +
                ", userId='" + userId + '\'' +  // Included userId in toString method
                '}';
    }
}
