package com.cafeteria.dto;

import java.math.BigDecimal;

public record BaristaStatsDTO(
        String username,
        Long pedidosAtendidos,
        BigDecimal totalVendido
) {}