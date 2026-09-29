public class House {
    private int houseId;
    private String address;
    private String status;

    // Constructor
    public House(int houseId, String address, String status) {
        this.houseId = houseId;
        this.address = address;
        this.status = status;
    }

    // Getters
    public int getHouseId() {
        return houseId;
    }

    public String getAddress() {
        return address;
    }

    public String getstatus() {
        return status;
    }
}
