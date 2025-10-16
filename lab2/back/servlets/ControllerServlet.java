package org.example.lab2.Servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import org.example.lab2.classes.Validator;

public class ControllerServlet extends HttpServlet {
  private final String MAIN = "/WEB-INF/views/main_page.jsp";
  private final String AREA_SERV = "/area-check";
  private Validator v;

  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    long start = System.nanoTime();

    String[] xs = request.getParameterValues("x");
    String y = request.getParameter("y");
    String R = request.getParameter("R");
    List<String> x =
        (xs == null)
            ? Collections.emptyList()
            : Arrays.stream(xs)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

    if (XYRIsNull(x, y, R, request)) {
      request.getRequestDispatcher(MAIN).forward(request, response);
      return;
    }

    v = new Validator(x, y, R);
    if (!(v.validate() && v.check())) {
      request.setAttribute("errors", v.getErrors());
      request.getRequestDispatcher(MAIN).forward(request, response);
    } else {
      request.setAttribute("x", v.getX());
      request.setAttribute("diff", v.getDiffCount());
      request.setAttribute("startTime", start);
      request.getRequestDispatcher(AREA_SERV).forward(request, response);
    }
  }

  private boolean XYRIsNull(List<String> x, String y, String R, HttpServletRequest request)
      throws ServletException, IOException {
    boolean pip = false;
    HashMap<String, String> errors = new HashMap<>();
    if (x.isEmpty()) {
      errors.put("x", "Выберите хотя бы один Х");
      pip = true;
    }
    if (y == null || y.isBlank()) {
      errors.put("y", "Введите Y: 5<=y<=3");
      pip = true;
    }
    if (R == null || R.isBlank()) {
      errors.put("r", "Выберите R");
      pip = true;
    }
    request.setAttribute("errors", errors);
    return pip;
  }
}
