package com.example.bunkmate.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    @RequestMapping(value = "/health", method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Map<String,Object>> health() {
        Map<String,Object> status = new HashMap<>();
        status.put("status","UP");
        status.put("timestamp",System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }
}
