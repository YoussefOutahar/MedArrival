package com.cnesten.medarrivalbackend.AppStorage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {
    private final Path rootLocation;
    private boolean isInitialized;

    public FileStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getUploadDir());
        this.isInitialized = false;
        boolean success = init();
        if (!success) {
            log.error("Failed to initialize storage service");
        }
    }

    public boolean init() {
        try {
            if (!isInitialized) {
                Files.createDirectories(rootLocation);
                isInitialized = true;
            }
            return true;
        } catch (IOException e) {
            log.error("Could not initialize storage location", e);
            return false;
        }
    }

    public Optional<String> store(MultipartFile file, String subdirectory) {
        if (!isInitialized && !init()) {
            log.error("Storage service not initialized");
            return Optional.empty();
        }

        try {
            Path targetLocation = rootLocation.resolve(subdirectory);
            Files.createDirectories(targetLocation);

            String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

            // Validate file
            if (file.isEmpty()) {
                log.error("Failed to store empty file: {}", filename);
                return Optional.empty();
            }
            if (filename.contains("..")) {
                log.error("Cannot store file with relative path outside current directory: {}", filename);
                return Optional.empty();
            }

            String extension = StringUtils.getFilenameExtension(filename);
            String storedFilename = UUID.randomUUID() + "." + extension;

            Files.copy(file.getInputStream(),
                    targetLocation.resolve(storedFilename),
                    StandardCopyOption.REPLACE_EXISTING);

            return Optional.of(subdirectory + "/" + storedFilename);

        } catch (IOException e) {
            log.error("Failed to store file", e);
            return Optional.empty();
        }
    }

    public Optional<Resource> loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return Optional.of(resource);
            } else {
                log.error("Could not read file: {}", filename);
                return Optional.empty();
            }

        } catch (MalformedURLException e) {
            log.error("Could not read file: {}", filename, e);
            return Optional.empty();
        }
    }

    public MediaType getMediaTypeForFileName(String filename) {
        String extension = StringUtils.getFilenameExtension(filename);
        if (extension == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        return switch (extension.toLowerCase()) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

    public boolean delete(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            return FileSystemUtils.deleteRecursively(file);
        } catch (IOException e) {
            log.error("Could not delete file: {}", filename, e);
            return false;
        }
    }

    public boolean isInitialized() {
        return isInitialized;
    }
}