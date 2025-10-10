package org.example;

import com.fastcgi.FCGIInterface;
import org.example.exceptions.ValidateException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;

class Server {
    private static final String HTTP_RESPONSE_HEADERS =
            """
                    Status: %d %s
                    Content-Type: application/json; charset=utf-8
                    Content-Length: %d
                    \r
                    %s
                    """;
    private static final ArrayList<Point> history = new ArrayList<>();

    public static void main(String[] args) {
        FCGIInterface fcgiInterface = new FCGIInterface();
        Validator v = new Validator();
        HitChecker checker = new HitChecker();

        while (fcgiInterface.FCGIaccept() >= 0) {
            long time = System.nanoTime();
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");

            if (method.equals("POST")) {
                HashMap<String, String> params = getValues();

                if (params.isEmpty()) {
                    System.out.println(createError("Body is empty", HTTP_status_code.BAD_REQUEST_status));
                    continue;
                }

                boolean isHit;

                try {
                    double x = Double.parseDouble(params.get("x"));
                    int y = Integer.parseInt(params.get("y"));
                    double r = Double.parseDouble(params.get("r"));

                    v.check(x, y, r);
                    isHit = checker.check(x, y, r);

                } catch (ValidateException e) {
                    System.out.println(createError(e.getMessage(), HTTP_status_code.BAD_REQUEST_status));
                    continue;
                } catch (Exception e) {
                    System.out.println(createError("Invalid data", HTTP_status_code.BAD_REQUEST_status));
                    continue;
                }
                System.out.println(
                    createResponse(isHit, params.get("x"), params.get("y"), params.get("r"), time));
            }

        System.out.println(createError("Only POST method", HTTP_status_code.METHOD_NOT_ALLOWED_status));
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
        System.out.println(createError("Error reading request body", HTTP_status_code.BAD_REQUEST_status));
    }
    return body;
}

private static String getStringHistory() {
    StringBuilder content = new StringBuilder();

    for (int i = 0; i < history.size(); i++) {
        if (i == history.size() - 1) {
            content.append(history.get(i).toJSON());
        } else {
            content.append(history.get(i).toJSON()).append(",\n");
        }
    }
    return "[ " + content + " ]";
}

private static String createResponse(boolean isHit, String x, String y, String r, long wt) {
    Point point =
            new Point(
                    x,
                    y,
                    r,
                    isHit,
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                    (double) (System.nanoTime() - wt) / 1000000);
    history.add(point);

    String content = getStringHistory();

    return String.format(
            HTTP_RESPONSE_HEADERS,
            HTTP_status_code.OK_status.getStatusCode(),
            HTTP_status_code.OK_status.getStatusText(),
            content.getBytes(StandardCharsets.UTF_8).length,
            content);
}

private static String createError(String msg, HTTP_status_code code) {
    String content =
            """
                    {"error":"%s"}
                    """
                    .formatted(msg);

  //  String status = HTTP_status_code.getTextByCode(code);

    return String.format(
            HTTP_RESPONSE_HEADERS,
            code.getStatusCode(),
            code.getStatusText(),
            content.getBytes(StandardCharsets.UTF_8).length,
            content);
}
}
