package org.example.lab2.classes;

public class Point {
  private final String x;
  private final String y;
  private final String r;
  private final boolean hit;

  public Point(String x, String y, String r, boolean hit) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.hit = hit;
  }

  public String getX() {
    return x;
  }

  public String getY() {
    return y;
  }

  public String getR() {
    return r;
  }

  public boolean isHit() {
    return hit;
  }
}
