package com.cafeteria.controller;

import com.cafeteria.domain.entity.Mesa;
import com.cafeteria.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    @GetMapping("/token/{token}")
    public ResponseEntity<?> obtenerMesaPorToken(@PathVariable String token) {
        return mesaRepository.findByCodigoQrToken(token)
                .map(mesa -> ResponseEntity.ok(Map.of(
                        "id", mesa.getId(),
                        "numeroMesa", mesa.getNumeroMesa(),
                        "estado", mesa.getEstado()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}