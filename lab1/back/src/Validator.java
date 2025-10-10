package org.example;

import java.util.LinkedList;
import java.util.List;

public class Validator {
  private final List<Integer> yRange = new LinkedList<>();
  private String log = "all ok";

  public Validator() {
    yRange.add(-4);
    yRange.add(-3);
    yRange.add(-2);
    yRange.add(-1);
    yRange.add(0);
    yRange.add(1);
    yRange.add(2);
    yRange.add(3);
    yRange.add(4);
  }

  public boolean check(double x, Integer y, double r) {
    return checkX(x) && checkY(y) && checkR(r);
  }

  public String getLog() {
    return log;
  }

  public boolean checkY(int y) {
    if (yRange.contains(y)) {
      return true;
    }
    log = "Y must be selected";
    return false;
  }

  public boolean checkX(double x) {
    if (-3 <= x && x <= 5) {
      return true;
    }
    log = "X value must be -3<=x<=5";
    return false;
  }

  public boolean checkR(double r) {
    if (1 <= r && r <= 4) {
      return true;
    }
    log = "R value must be 1<=x<=4";
    return false;
  }
}
