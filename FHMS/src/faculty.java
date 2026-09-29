public class faculty {
    private int id;
    private String name;
    private String email;
    private String department;
    private String grade;
    private String contact;

    public faculty(int id, String name, String email, String department, String grade, String contact) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.grade = grade;
        this.contact = contact;
    }

    // Add getters here
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getDepartment() {
        return department;
    }

    public String getGrade() {
        return grade;
    }

    public String getContact() {
        return contact;
    }
}
