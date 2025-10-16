package org.example.lab2.classes;

public class HitChecker {

  public boolean check(int x, double y, int r) {
    if (x >= 0 && y >= 0) {
      return (x * x + y * y <= r * r) && x <= r / 2 && y <= r / 2;
    }

    if (x < 0 && y < 0) {
      return x >= -r && y >= -0.5 * (x + r);
    }

    if (x >= 0 && y < 0) {
      return x <= r / 2 && y >= -r;
    }

    return false;
  }
}
