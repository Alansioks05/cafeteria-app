package com.cafeteria.dto;

import java.math.BigDecimal;

public record DetallePedidoRequestDTO(
        Integer productoId,
        Integer cantidad,
        String personalizacionesElegidas,
        BigDecimal precioFinal // <-- NUEVO CAMPO
) {}