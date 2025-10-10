package org.example;

import com.fastcgi.FCGIInterface;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;

class Server {
  private static final String HTTPD_RESPONSE_HEADERS =
      """
        Status: %d %s
        Content-Type: application/json; charset=utf-8
        Content-Length: %d
        \r
        %s
        """;
  private static final ArrayList<Point> history = new ArrayList();

  public static void main(String[] args) {
    FCGIInterface fcgiInterface = new FCGIInterface();
    Validator v = new Validator();
    HitChecker checker = new HitChecker();

    while (fcgiInterface.FCGIaccept() >= 0) {
      long time = System.nanoTime();
      String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");

      if (method.equals("POST")) {
        HashMap<String, String> params = getValues();

        if (!params.isEmpty()) {
          boolean isValid;
          boolean isHit;

          try {
            double x = Double.parseDouble(params.get("x"));
            int y = Integer.parseInt(params.get("y"));
            double r = Double.parseDouble(params.get("r"));

            isValid = v.check(x, y, r);
            isHit = checker.check(x, y, r);
          } catch (Exception e) {
            System.out.println(err("Invalid data", 400));
            continue;
          }
          if (!isValid) System.out.println(err(v.getLog(), 400));
          else
            System.out.println(
                resp(isHit, params.get("x"), params.get("y"), params.get("r"), time));
        } else {
          System.out.println(err("Body is empty", 400));
        }
      } else {
        System.out.println(err("Only POST method", 405));
      }
    }
  }

  private static HashMap<String, String> getValues() {
    HashMap<String, String> map = new HashMap<>();
    String body = getBody();

    for (String pair : body.split("&")) {
      String[] kv = pair.split("=", 2);
      if (kv.length == 2) {
        map.put(kv[0], kv[1]);
      } else {
        map.put(kv[0], "");
      }
    }

    return map;
  }

  private static String getBody() {
    String body = "";
    try {
      String contentLenStr = FCGIInterface.request.params.getProperty("CONTENT_LENGTH");
      int contentLen = 0;
      if (contentLenStr != null) contentLen = Integer.parseInt(contentLenStr);

      byte[] data = new byte[contentLen];
      System.in.read(data, 0, contentLen);
      body = new String(data, StandardCharsets.UTF_8);
    } catch (Exception e) {
      System.out.println(err("Error reading request body", 400));
    }
    return body;
  }

  private static String getHistory() {
    StringBuilder content = new StringBuilder();

    for (int i = 0; i < history.size(); i++) {
      if (i == history.size() - 1) {
        content.append(history.get(i).toJSON());
      } else {
        content.append(history.get(i).toJSON() + ",\n");
      }
    }
    return content.toString();
  }

  private static String resp(boolean isHit, String x, String y, String r, long wt) {
    Point point =
        new Point(
            x,
            y,
            r,
            isHit,
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
            (double) (System.nanoTime() - wt) / 1000000);
    history.add(point);

    String content = "[ " + getHistory() + " ]";

    return String.format(
        HTTPD_RESPONSE_HEADERS,
        200,
        "OK",
        content.getBytes(StandardCharsets.UTF_8).length,
        content);
  }

  private static String err(String msg, int code) {
    String content =
        """
                {"error":"%s"}
                """
            .formatted(msg);
    String status;

    if (code == 405) {
      status = "Method Not Allowed";
    } else if (code == 400) {
      status = "Bad Request";
    } else {
      code = 500;
      status = "Internal Server Error";
    }

    return String.format(
        HTTPD_RESPONSE_HEADERS,
        code,
        status,
        content.getBytes(StandardCharsets.UTF_8).length,
        content);
  }
}
