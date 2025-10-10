package org.example;

import java.util.Locale;

public class Point {
  private final String x;
  private final String y;
  private final String r;
  private final boolean hit;
  private final String time;
  private final double execTime;

  public Point(String x, String y, String r, boolean hit, String time, double execTime) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.hit = hit;
    this.time = time;
    this.execTime = execTime;
  }

  public String toJSON() {
    return String.format(
        Locale.US,
        "{\"x\": %s, \"y\": %s, \"r\": %s, \"hit\": %b, \"time\": \"%s\", \"execMs\": %.3f}",
        x,
        y,
        r,
        hit,
        time,
        execTime);
  }
}
