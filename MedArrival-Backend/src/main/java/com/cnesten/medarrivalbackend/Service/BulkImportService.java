package com.cnesten.medarrivalbackend.Service;

import com.cnesten.medarrivalbackend.Models.Client.Client;
import com.cnesten.medarrivalbackend.Models.Client.ClientType;
import com.cnesten.medarrivalbackend.Models.Supplier;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkImportService {
    private final ClientService clientService;
    private final SupplierService supplierService;

    public List<Client> importClientsFromFile(MultipartFile file) throws IOException {
        List<Client> clients;

        if (isExcelFile(file)) {
            clients = importClientsFromExcel(file);
        } else if (isCsvFile(file)) {
            clients = importClientsFromCsv(file);
        } else {
            throw new IllegalArgumentException("Unsupported file format. Please use CSV or Excel file.");
        }

        List<Client> savedClients = new ArrayList<>();
        for (Client client : clients) {
            savedClients.add(clientService.save(client));
        }
        return savedClients;
    }

    public List<Supplier> importSuppliersFromFile(MultipartFile file) throws IOException {
        List<Supplier> suppliers = new ArrayList<>();

        if (isExcelFile(file)) {
            suppliers = importSuppliersFromExcel(file);
        } else if (isCsvFile(file)) {
            suppliers = importSuppliersFromCsv(file);
        } else {
            throw new IllegalArgumentException("Unsupported file format. Please use CSV or Excel file.");
        }

        List<Supplier> savedSuppliers = new ArrayList<>();
        for (Supplier supplier : suppliers) {
            savedSuppliers.add(supplierService.save(supplier));
        }
        return savedSuppliers;
    }

    private List<Client> importClientsFromExcel(MultipartFile file) throws IOException {
        List<Client> clients = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();

        // Skip header row
        if (rows.hasNext()) {
            rows.next();
        }

        while (rows.hasNext()) {
            Row row = rows.next();
            Client client = new Client();
            client.setName(getCellValueAsString(row.getCell(0)));
            client.setAddress(getCellValueAsString(row.getCell(2)));
            client.setClientType(ClientType.valueOf(getCellValueAsString(row.getCell(3))));
            clients.add(client);
        }

        workbook.close();
        return clients;
    }

    private List<Supplier> importSuppliersFromExcel(MultipartFile file) throws IOException {
        List<Supplier> suppliers = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();

        // Skip header row
        if (rows.hasNext()) {
            rows.next();
        }

        while (rows.hasNext()) {
            Row row = rows.next();
            Supplier supplier = new Supplier();
            supplier.setName(getCellValueAsString(row.getCell(0)));
            supplier.setAddress(getCellValueAsString(row.getCell(1)));
            supplier.setPhone(getCellValueAsString(row.getCell(2)));
            supplier.setEmail(getCellValueAsString(row.getCell(3)));
            suppliers.add(supplier);
        }

        workbook.close();
        return suppliers;
    }

    private List<Client> importClientsFromCsv(MultipartFile file) throws IOException {
        List<Client> clients = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;

        // Skip header row
        reader.readLine();

        while ((line = reader.readLine()) != null) {
            String[] values = line.split(",");
            Client client = new Client();
            client.setName(values[0].trim());
            client.setAddress(values[2].trim());
            client.setClientType(ClientType.valueOf(values[3].trim()));
            clients.add(client);
        }

        reader.close();
        return clients;
    }

    private List<Supplier> importSuppliersFromCsv(MultipartFile file) throws IOException {
        List<Supplier> suppliers = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;

        // Skip header row
        reader.readLine();

        while ((line = reader.readLine()) != null) {
            String[] values = line.split(",");
            Supplier supplier = new Supplier();
            supplier.setName(values[0].trim());
            supplier.setAddress(values[1].trim());
            supplier.setPhone(values[2].trim());
            supplier.setEmail(values[3].trim());
            suppliers.add(supplier);
        }

        reader.close();
        return suppliers;
    }

    private boolean isExcelFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
                contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
                        contentType.equals("application/vnd.ms-excel")
        );
    }

    private boolean isCsvFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
                contentType.equals("text/csv") ||
                        contentType.equals("application/csv") ||
                        contentType.equals("application/vnd.ms-excel")
        );
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            default -> null;
        };
    }

    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null) {
            return null;
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> (int) cell.getNumericCellValue();
            case STRING -> Integer.parseInt(cell.getStringCellValue());
            default -> null;
        };
    }
}