package com.cafeteria.controller;

import com.cafeteria.dto.AdminStatsDTO;
import com.cafeteria.dto.BaristaStatsDTO;
import com.cafeteria.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        BigDecimal ventasTotales = pedidoRepository.sumVentasTotales();
        Long totalPedidos = pedidoRepository.countPedidosServidos();

        List<BaristaStatsDTO> statsPorBarista = pedidoRepository.statsPorBarista().stream()
                .map(obj -> new BaristaStatsDTO(
                        (String) obj[0],
                        (Long) obj[1],
                        (BigDecimal) obj[2]
                ))
                .collect(Collectors.toList());

        AdminStatsDTO stats = new AdminStatsDTO(
                ventasTotales != null ? ventasTotales : BigDecimal.ZERO,
                totalPedidos != null ? totalPedidos : 0L,
                statsPorBarista
        );

        return ResponseEntity.ok(stats);
    }
}