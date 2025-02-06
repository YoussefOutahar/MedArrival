package com.cnesten.medarrivalbackend.Projections;

public interface DailyMetricProjection {
    String getDate();
    Double getValue();
}
