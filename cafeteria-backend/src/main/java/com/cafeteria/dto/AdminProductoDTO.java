package com.cafeteria.dto;

import java.math.BigDecimal;

public record AdminProductoDTO(
        Integer id,
        Integer categoriaId,
        String nombre,
        String descripcion,
        BigDecimal precioBase,
        String imagenUrl,
        Boolean disponible
) {}