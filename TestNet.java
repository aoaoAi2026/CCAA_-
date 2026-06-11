import java.net.*;
import java.io.*;
public class TestNet {
    public static void main(String[] args) throws Exception {
        String url = "https://maven.aliyun.com/repository/google/com/android/tools/build/gradle/8.1.0/gradle-8.1.0.pom";
        System.out.println("Testing: " + url);
        URL u = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) u.openConnection();
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(60000);
        conn.connect();
        System.out.println("Response code: " + conn.getResponseCode());
        System.out.println("Content length: " + conn.getContentLength());
        conn.disconnect();
    }
}
