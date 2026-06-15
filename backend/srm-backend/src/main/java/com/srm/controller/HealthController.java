package com.srm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/", "/health"})
    public ResponseEntity<String> health() {
        return ResponseEntity.ok(
                "SRM backend is running on port 8007. Open the frontend at http://localhost:5174"
        );
    }
}
