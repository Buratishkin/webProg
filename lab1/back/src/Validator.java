package org.example;

import org.example.exceptions.ValidateException;
import java.util.List;
import java.util.stream.IntStream;

public class Validator {
    private final List<Integer> yRange = IntStream
            .range(1, 10)
            .boxed()
            .toList();

    public void check(double x, Integer y, double r) throws ValidateException {
        checkX(x);
        checkY(y);
        checkR(r);

    }

    public void checkY(int y) throws ValidateException {
        if (yRange.contains(y)) {
            return;
        }
        throw new ValidateException("Y must be selected");
    }

    public void checkX(double x) throws ValidateException {
        if (-3 <= x && x <= 5) {
            return;
        }
        throw new ValidateException("x value must be -3<=x<=5");
    }

    public void checkR(double r) throws ValidateException {
        if (1 <= r && r <= 4) {
            return;
        }
        throw new ValidateException("R value must be 1<=R<=4");
    }
}
