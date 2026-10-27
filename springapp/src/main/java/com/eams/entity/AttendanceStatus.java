package com.eams.entity;

public enum AttendanceStatus {
    PRESENT("Present"),
    HALF_DAY("Half-day"),
    PARTIAL("Partial"),
    ABSENT("Absent"),
    IN_PROGRESS("In Progress");

    private final String label;

    AttendanceStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
