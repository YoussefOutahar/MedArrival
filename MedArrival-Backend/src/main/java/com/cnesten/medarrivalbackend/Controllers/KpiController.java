package com.cnesten.medarrivalbackend.Controllers;

import com.cnesten.medarrivalbackend.DTO.KPI.KpiDTO;
import com.cnesten.medarrivalbackend.Service.KpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/kpis")
@RequiredArgsConstructor
public class KpiController {
    private final KpiService kpiService;

    @GetMapping("/dashboard")
    public ResponseEntity<KpiDTO> getDashboardKpis() {
        return ResponseEntity.ok(kpiService.getDashboardKpis());
    }
}
