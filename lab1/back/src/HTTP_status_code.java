package org.example;

public enum HTTP_status_code {
    OK_status(200, "OK"),
    BAD_REQUEST_status(400, "Bad Request"),
    METHOD_NOT_ALLOWED_status(405, "Method Not Allowed"),
    INTERNAL_SERVER_ERROR_status(500, "Internal Server Error");

    private final int statusCode;
    private final String statusText;

    HTTP_status_code(int statusCode, String statusText) {
        this.statusCode = statusCode;
        this.statusText = statusText;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getStatusText() {
        return statusText;
    }

    public static String getTextByCode(int code){
        for (HTTP_status_code status : HTTP_status_code.values()) {
            if (status.getStatusCode() == code) {
                return status.getStatusText();
            }
        }
        return null;
    }
}
