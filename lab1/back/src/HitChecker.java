package org.example;

public class HitChecker {

  public boolean check(double x, double y, double r) {
    if (x >= 0 && y >= 0) {
      return x * x + y * y <= r * r;
    }

    if (x < 0 && y < 0) {
      return x >= -r / 2 && y >= -r;
    }

    if (x >= 0 && y < 0) {
      return y >= x - r && y >= -r && x <= r;
    }

    return false;
  }
}
