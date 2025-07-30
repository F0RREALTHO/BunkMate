package com.example.bunkmate.Model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Integer attendedClasses = 0;
    private Integer missedClasses = 0;
    private Integer requiredPercentage = 75;

    @Transient
    private Double currentAttendancePercentage;
    @Transient
    private Integer classesNeededToReachRequirements;
    @Transient
    private Integer classesCanBeMissed;

    @PostLoad
    public void calculateStats(){
        int totalClasses = attendedClasses + missedClasses;
        double requiredDecimal = requiredPercentage / 100.0;
        if (totalClasses == 0) {
            this.currentAttendancePercentage = 100.0;
        } else {
            double percentage = ((double) attendedClasses / totalClasses) * 100;
            this.currentAttendancePercentage = Math.round(percentage * 10.0) / 10.0;
        }

        if (this.currentAttendancePercentage < requiredPercentage) {
            int needed = (int) Math.ceil((requiredDecimal * totalClasses - attendedClasses) / (1 - requiredDecimal));
            this.classesNeededToReachRequirements = Math.max(0, needed);
            this.classesCanBeMissed = 0;
        } else {
            int canBeMissed = (int) Math.floor((attendedClasses - requiredDecimal * totalClasses) / requiredDecimal);
            this.classesCanBeMissed = Math.max(0, canBeMissed);
            this.classesNeededToReachRequirements = 0;
        }
    }

}