package com.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "equipment_activities")
public class EquipmentActivity {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Member member;

    @Column(nullable = false)
    private String date; // format: yyyy-MM-dd

    @Column(nullable = false)
    private String startTime; // format: HH:mm:ss

    private String endTime; // format: HH:mm:ss, null if active

    public EquipmentActivity() {}

    public EquipmentActivity(String id, Equipment equipment, Member member, String date, String startTime, String endTime) {
        this.id = id;
        this.equipment = equipment;
        this.member = member;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}
