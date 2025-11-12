package com.oaktown.library;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.oaktown.library.dao.ChatMessageDAO;
import com.oaktown.library.model.ChatMessage;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket server for real-time chat between admins and members
 */
public class WebSocketChatServer {
    
    private static final int PORT = 8081;
    private final ChatMessageDAO chatMessageDAO;
    private final ObjectMapper objectMapper;
    private final Map<String, SocketChannel> connectedClients; // userId:userType -> SocketChannel
    private ServerSocketChannel serverChannel;
    private Selector selector;
    private volatile boolean running = false;

    public WebSocketChatServer() {
        this.chatMessageDAO = new ChatMessageDAO();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.connectedClients = new ConcurrentHashMap<>();
    }

    public static void main(String[] args) {
        WebSocketChatServer server = new WebSocketChatServer();
        try {
            server.start();
        } catch (Exception e) {
            System.err.println("WebSocket server error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void start() throws IOException {
        serverChannel = ServerSocketChannel.open();
        serverChannel.bind(new InetSocketAddress(PORT));
        serverChannel.configureBlocking(false);

        selector = Selector.open();
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        running = true;
        System.out.println("WebSocket Chat Server started on port " + PORT);
        System.out.println("Server is ready to accept connections...");
        System.out.println("Press Ctrl+C to stop the server.");

        while (running) {
            // Use timeout to allow periodic checks
            int readyChannels = selector.select(1000);
            
            if (readyChannels == 0) {
                // No channels ready, continue loop
                continue;
            }
            
            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = selectedKeys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();
                iterator.remove();

                try {
                    if (key.isAcceptable()) {
                        handleAccept(key);
                    } else if (key.isReadable()) {
                        handleRead(key);
                    }
                } catch (Exception e) {
                    System.err.println("Error handling key: " + e.getMessage());
                    key.cancel();
                    if (key.channel() != null) {
                        try {
                            key.channel().close();
                        } catch (IOException ex) {
                            // Ignore
                        }
                    }
                }
            }
        }
    }

    private void handleAccept(SelectionKey key) throws IOException {
        ServerSocketChannel serverChannel = (ServerSocketChannel) key.channel();
        SocketChannel clientChannel = serverChannel.accept();
        clientChannel.configureBlocking(false);
        clientChannel.register(selector, SelectionKey.OP_READ);
        System.out.println("New connection accepted");
    }

    private void handleRead(SelectionKey key) throws IOException {
        SocketChannel clientChannel = (SocketChannel) key.channel();
        ByteBuffer buffer = ByteBuffer.allocate(4096);

        int bytesRead = clientChannel.read(buffer);
        if (bytesRead == -1) {
            handleDisconnect(clientChannel);
            key.cancel();
            clientChannel.close();
            return;
        }

        buffer.flip();
        String message = StandardCharsets.UTF_8.decode(buffer).toString();

        // Check if this is a WebSocket handshake
        if (message.startsWith("GET ")) {
            handleWebSocketHandshake(clientChannel, message);
        } else {
            // Handle WebSocket frame
            handleWebSocketFrame(clientChannel, buffer);
        }
    }

    private void handleWebSocketHandshake(SocketChannel clientChannel, String request) throws IOException {
        // Extract WebSocket key from headers
        String webSocketKey = null;
        String[] lines = request.split("\r\n");
        for (String line : lines) {
            if (line.startsWith("Sec-WebSocket-Key:")) {
                webSocketKey = line.substring("Sec-WebSocket-Key:".length()).trim();
                break;
            }
        }

        if (webSocketKey == null) {
            clientChannel.close();
            return;
        }

        // Generate WebSocket accept key
        String acceptKey = generateWebSocketAcceptKey(webSocketKey);

        // Send WebSocket handshake response
        String response = "HTTP/1.1 101 Switching Protocols\r\n" +
                "Upgrade: websocket\r\n" +
                "Connection: Upgrade\r\n" +
                "Sec-WebSocket-Accept: " + acceptKey + "\r\n\r\n";

        clientChannel.write(ByteBuffer.wrap(response.getBytes(StandardCharsets.UTF_8)));
        System.out.println("WebSocket handshake completed");
    }

    private String generateWebSocketAcceptKey(String webSocketKey) {
        try {
            String magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            byte[] hash = sha1.digest((webSocketKey + magic).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating WebSocket accept key", e);
        }
    }

    private void handleWebSocketFrame(SocketChannel clientChannel, ByteBuffer buffer) throws IOException {
        buffer.rewind();
        
        if (buffer.remaining() < 2) {
            return;
        }

        byte firstByte = buffer.get();
        byte secondByte = buffer.get();
        
        boolean fin = (firstByte & 0x80) != 0;
        int opcode = firstByte & 0x0F;
        boolean masked = (secondByte & 0x80) != 0;
        long payloadLength = secondByte & 0x7F;

        if (payloadLength == 126) {
            if (buffer.remaining() < 2) return;
            payloadLength = buffer.getShort() & 0xFFFF;
        } else if (payloadLength == 127) {
            if (buffer.remaining() < 8) return;
            payloadLength = buffer.getLong();
        }

        byte[] maskingKey = new byte[4];
        if (masked) {
            if (buffer.remaining() < 4) return;
            buffer.get(maskingKey);
        }

        if (buffer.remaining() < payloadLength) {
            return;
        }

        byte[] payload = new byte[(int) payloadLength];
        buffer.get(payload);

        if (masked) {
            for (int i = 0; i < payload.length; i++) {
                payload[i] = (byte) (payload[i] ^ maskingKey[i % 4]);
            }
        }

        String messageText = new String(payload, StandardCharsets.UTF_8);

        // Handle different opcodes
        if (opcode == 0x1) { // Text frame
            handleChatMessage(clientChannel, messageText);
        } else if (opcode == 0x8) { // Close frame
            handleDisconnect(clientChannel);
            clientChannel.close();
        } else if (opcode == 0x9) { // Ping frame
            sendPong(clientChannel, payload);
        }
    }

    private void handleChatMessage(SocketChannel clientChannel, String messageText) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> messageData = objectMapper.readValue(messageText, Map.class);
            String type = (String) messageData.get("type");

            if ("register".equals(type)) {
                // Register client connection
                String userId = (String) messageData.get("userId");
                String userType = (String) messageData.get("userType");
                String key = userId + ":" + userType;
                connectedClients.put(key, clientChannel);
                System.out.println("Client registered: " + key);
                
                // Send confirmation
                Map<String, Object> response = new HashMap<>();
                response.put("type", "registered");
                response.put("status", "success");
                sendMessage(clientChannel, objectMapper.writeValueAsString(response));
                
            } else if ("message".equals(type)) {
                // Handle chat message
                String senderType = (String) messageData.get("senderType");
                String senderId = (String) messageData.get("senderId");
                String senderName = (String) messageData.get("senderName");
                String receiverType = (String) messageData.get("receiverType");
                String receiverId = (String) messageData.get("receiverId");
                String receiverName = (String) messageData.get("receiverName");
                String message = (String) messageData.get("message");

                // Create and save chat message
                ChatMessage chatMessage = new ChatMessage(
                    senderType, senderId, senderName,
                    receiverType, receiverId, receiverName,
                    message
                );

                boolean saved = chatMessageDAO.saveMessage(chatMessage);

                if (saved) {
                    // Send message to receiver if online
                    String receiverKey = receiverId + ":" + receiverType;
                    SocketChannel receiverChannel = connectedClients.get(receiverKey);
                    
                    Map<String, Object> messageToSend = new HashMap<>();
                    messageToSend.put("type", "message");
                    messageToSend.put("id", chatMessage.getId());
                    messageToSend.put("senderType", senderType);
                    messageToSend.put("senderId", senderId);
                    messageToSend.put("senderName", senderName);
                    messageToSend.put("receiverType", receiverType);
                    messageToSend.put("receiverId", receiverId);
                    messageToSend.put("receiverName", receiverName);
                    messageToSend.put("message", message);
                    messageToSend.put("timestamp", chatMessage.getTimestamp().toString());
                    messageToSend.put("isRead", false);

                    String jsonMessage = objectMapper.writeValueAsString(messageToSend);

                    if (receiverChannel != null && receiverChannel.isOpen()) {
                        sendMessage(receiverChannel, jsonMessage);
                    }

                    // Send confirmation to sender
                    sendMessage(clientChannel, jsonMessage);
                }
            }

        } catch (Exception e) {
            System.err.println("Error handling chat message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendMessage(SocketChannel channel, String message) throws IOException {
        byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
        ByteBuffer buffer = ByteBuffer.allocate(messageBytes.length + 10);

        // First byte: FIN bit + opcode (0x1 for text)
        buffer.put((byte) 0x81);

        // Second byte: mask bit (0) + payload length
        if (messageBytes.length <= 125) {
            buffer.put((byte) messageBytes.length);
        } else if (messageBytes.length <= 65535) {
            buffer.put((byte) 126);
            buffer.putShort((short) messageBytes.length);
        } else {
            buffer.put((byte) 127);
            buffer.putLong(messageBytes.length);
        }

        buffer.put(messageBytes);
        buffer.flip();

        while (buffer.hasRemaining()) {
            channel.write(buffer);
        }
    }

    private void sendPong(SocketChannel channel, byte[] payload) throws IOException {
        ByteBuffer buffer = ByteBuffer.allocate(payload.length + 2);
        buffer.put((byte) 0x8A); // FIN + Pong opcode
        buffer.put((byte) payload.length);
        buffer.put(payload);
        buffer.flip();
        channel.write(buffer);
    }

    private void handleDisconnect(SocketChannel clientChannel) {
        // Remove client from connected clients
        connectedClients.entrySet().removeIf(entry -> entry.getValue().equals(clientChannel));
        System.out.println("Client disconnected");
    }

    public void stop() {
        running = false;
        try {
            if (selector != null) selector.close();
            if (serverChannel != null) serverChannel.close();
        } catch (IOException e) {
            System.err.println("Error stopping WebSocket server: " + e.getMessage());
        }
    }
}
