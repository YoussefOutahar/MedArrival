package com.cnesten.medarrivalbackend.Utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;

public  class ByteArrayMultipartFile implements MultipartFile {
    private final byte[] content;
    private final String filename;
    private final String originalFilename;
    private final String contentType;

    public ByteArrayMultipartFile(String filename, String originalFilename, String contentType, byte[] content) {
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.content = content;
    }

    @Override
    public String getName() {
        return filename;
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return content == null || content.length == 0;
    }

    @Override
    public long getSize() {
        return content.length;
    }

    @Override
    public byte[] getBytes() throws IOException {
        return content;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}