package com.cafeteria.dto;

import java.math.BigDecimal;

public record ProductoDTO(
        Integer id,
        String nombre,
        String descripcion,
        BigDecimal precioBase,
        String imagenUrl,
        Integer categoriaId
) {}