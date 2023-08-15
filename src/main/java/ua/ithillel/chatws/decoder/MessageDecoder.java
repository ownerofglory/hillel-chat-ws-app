package ua.ithillel.chatws.decoder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.websocket.DecodeException;
import jakarta.websocket.Decoder;
import ua.ithillel.chatws.model.Message;

public class MessageDecoder implements Decoder.Text<Message> {
    @Override
    public Message decode(String s) throws DecodeException {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.readValue(s, Message.class);
        } catch (JsonProcessingException e) {
            return new Message();
        }
    }

    @Override
    public boolean willDecode(String s) {
        return s != null;
    }
}
