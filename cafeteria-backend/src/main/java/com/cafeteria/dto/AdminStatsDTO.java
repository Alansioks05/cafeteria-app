package com.cafeteria.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminStatsDTO(
        BigDecimal ventasTotales,
        Long totalPedidos,
        List<BaristaStatsDTO> ventasPorBarista
) {}