package org.example.lab2.Servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.example.lab2.classes.HitChecker;
import org.example.lab2.classes.Point;

public class AreaHitServlet extends HttpServlet {
  private final String AREA = "/WEB-INF/views/result.jsp";

  HitChecker hc = new HitChecker();

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    long start = (long) req.getAttribute("startTime");

    List<Integer> x = (List<Integer>) req.getAttribute("x");
    String y = req.getParameter("y");
    String R = req.getParameter("R");

    List<Point> points = new ArrayList<>();
    x.forEach(
        par ->
            points.add(
                new Point(
                    par.toString(),
                    y,
                    R,
                    hc.check(par, Double.parseDouble(y), Integer.parseInt(R)))));

    req.setAttribute("results", points);
    String nowTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    req.setAttribute("nowTime", nowTime);
    long elapsedMs = (System.nanoTime() - start) / 1000000;
    req.setAttribute("elapsedMs", elapsedMs);
    req.getRequestDispatcher(AREA).forward(req, resp);
  }
}
