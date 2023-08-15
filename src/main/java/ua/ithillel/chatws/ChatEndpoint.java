package ua.ithillel.chatws;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import ua.ithillel.chatws.decoder.MessageDecoder;
import ua.ithillel.chatws.encoder.MessageEncoder;
import ua.ithillel.chatws.model.Message;

import java.io.IOException;
import java.util.HashMap;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint(value = "/chat/{username}",
    encoders = MessageEncoder.class, decoders = MessageDecoder.class)
public class ChatEndpoint {
    private Session session;
    private static Set<ChatEndpoint> chatEndpoints = new CopyOnWriteArraySet<>();
    private static HashMap<String, String> users = new HashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        System.out.println(session + username);
        this.session = session;
        chatEndpoints.add(this);
        users.put(session.getId(), username);

        Message message = new Message();
        message.setContent("joined the chat");
        message.setUser(username);
        message.setService(true);
        broadcast(message);
    }

    @OnMessage
    public void onMessage(Session session, Message message) {
        System.out.println(session + " " +  message);
        message.setUser(users.get(session.getId()));
        broadcast(message);
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        // WebSocket connection closes
        System.out.println("Closed: " + session);
        chatEndpoints.remove(this);
        Message message = new Message();
        message.setUser(users.get(session.getId()));
        message.setContent("left the chat");
        message.setService(true);
        broadcast(message);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
        System.out.println("Error: " + session + " " + throwable.getMessage());
        Message message = new Message();
        message.setUser("");
        message.setContent("Something wen wrong");
        message.setService(true);
        broadcast(message);
    }

    private static void broadcast(Message message) {
        chatEndpoints.forEach(chatEndpoint -> {
            synchronized (chatEndpoint) {
                try {
                    chatEndpoint.session.getBasicRemote()
                            .sendObject(message);
                } catch (EncodeException e) {
                    throw new RuntimeException(e);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }
}
