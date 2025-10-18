package org.example.lab2.classes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.IntStream;

public class Validator {
  private List<Integer> x;
  private int R;
  private double y;
  private HashMap<String, String> errors = new HashMap<>();
  private int diffCount = 0;

  private final List<Integer> xRange = IntStream.rangeClosed(-5, 3).boxed().toList();
  private final List<Integer> RRange = IntStream.rangeClosed(1, 5).boxed().toList();

  public Validator(List<String> xStrings, String y, String R) {
    this.x = validateX(xStrings);
    this.y = validateY(y);
    this.R = validateR(R);
  }

  public boolean validate() {
    return errors.isEmpty();
  }

  private List<Integer> validateX(List<String> xs) {
    errors.remove("x");
    List<Integer> result = new ArrayList<>();

    for (String s : xs) {
      String t = (s == null) ? "" : s.trim();
      if (t.isEmpty()) {
        diffCount++;
        continue;
      }
      try {
        result.add(Integer.parseInt(t));
      } catch (NumberFormatException e) {
        diffCount++;
        continue;
      }
    }
    if (result.isEmpty()) {
      errors.put("x", "X'ы не числа");
    }
    return result;
  }

  private double validateY(String y) {
    errors.remove("y");
    try {
      return Double.parseDouble(y);
    } catch (Exception e) {
      errors.put("y", "Y не число");
      return 0;
    }
  }

  private int validateR(String R) {
    errors.remove("r");
    try {
      return Integer.parseInt(R);
    } catch (Exception e) {
      errors.put("r", "R не число");
      return 0;
    }
  }

  public boolean check() {
    checkX();
    checkY();
    checkR();
    return errors.isEmpty();
  }

  private void checkX() {
    errors.remove("x");
    x.removeIf(par -> (!xRange.contains(par)));
    if (x.isEmpty()) errors.put("x", "X'ы должны быть -5<=x<=3");
  }

  private void checkY() {
    errors.remove("y");
    if (y >= -5 && y <= 3) {
      return;
    }
    errors.put("y", "Y должен быть -5<=y<=3");
  }

  private void checkR() {
    errors.remove("r");
    if (RRange.contains(R)) {
      return;
    }
    errors.put("r", "R должен быть 1<=r<=5");
  }

  public HashMap<String, String> getErrors() {
    return errors;
  }

  public List<Integer> getX() {
    return x;
  }

  public int getR() {
    return R;
  }

  public double getY() {
    return y;
  }

  public int getDiffCount() {
    return diffCount;
  }
}
