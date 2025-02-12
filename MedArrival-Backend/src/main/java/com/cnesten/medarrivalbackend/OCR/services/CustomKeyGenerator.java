package com.cnesten.medarrivalbackend.OCR.services;

import jakarta.validation.constraints.NotNull;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;

@Component
public class CustomKeyGenerator implements KeyGenerator {

    @NotNull
    @Override
    public Object generate(Object target, Method method, Object... params) {
        try {
            StringBuilder keyBuilder = new StringBuilder();
            keyBuilder.append(method.getName());

            for (Object param : params) {
                if (param instanceof MultipartFile) {
                    MultipartFile file = (MultipartFile) param;
                    String fileHash = DigestUtils.md5DigestAsHex(file.getBytes());
                    keyBuilder.append("_").append(fileHash);
                } else {
                    keyBuilder.append("_").append(param.toString());
                }
            }

            return keyBuilder.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating cache key", e);
        }
    }
}
