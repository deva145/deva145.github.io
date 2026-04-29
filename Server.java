import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

public class Server {

    private static final int PORT = 8000;
    private static final Path ROOT = Paths.get(".").toAbsolutePath().normalize();

    private static final Map<String, String> MIME = Map.of(
            "html", "text/html; charset=utf-8",
            "css",  "text/css; charset=utf-8",
            "js",   "application/javascript; charset=utf-8",
            "json", "application/json; charset=utf-8",
            "png",  "image/png",
            "jpg",  "image/jpeg",
            "jpeg", "image/jpeg",
            "svg",  "image/svg+xml",
            "ico",  "image/x-icon"
    );

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new StaticHandler());
        server.setExecutor(null);

        System.out.println("\n  [35m✪  Devanandan's Portfolio Server[0m");
        System.out.println("  [36m→  Running at http://localhost:" + PORT + "[0m");
        System.out.println("  [90m→  Serving from " + ROOT + "[0m");
        System.out.println("  [90m→  Press Ctrl+C to stop[0m\n");

        server.start();
    }

    static class StaticHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String uri = exchange.getRequestURI().getPath();
            if (uri.equals("/")) uri = "/index.html";

            Path requested = ROOT.resolve(uri.substring(1)).normalize();

            if (!requested.startsWith(ROOT)) {
                send(exchange, 403, "text/plain", "Forbidden".getBytes());
                return;
            }

            File file = requested.toFile();
            if (!file.exists() || file.isDirectory()) {
                send(exchange, 404, "text/html",
                        "<h1>404 — Not Found</h1>".getBytes());
                logRequest(exchange, 404);
                return;
            }

            String ext = getExtension(file.getName());
            String contentType = MIME.getOrDefault(ext, "application/octet-stream");
            byte[] data = Files.readAllBytes(requested);

            send(exchange, 200, contentType, data);
            logRequest(exchange, 200);
        }

        private void send(HttpExchange exchange, int status, String contentType, byte[] body) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(status, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        }

        private String getExtension(String name) {
            int dot = name.lastIndexOf('.');
            return dot == -1 ? "" : name.substring(dot + 1).toLowerCase();
        }

        private void logRequest(HttpExchange exchange, int status) {
            String color = status == 200 ? "[32m" : "[31m";
            System.out.printf("  %s%d[0m  %s  %s%n",
                    color, status,
                    exchange.getRequestMethod(),
                    exchange.getRequestURI().getPath());
        }
    }
}
