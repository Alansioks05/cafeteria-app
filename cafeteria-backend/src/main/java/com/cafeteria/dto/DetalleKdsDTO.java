package com.cafeteria.dto;

public record DetalleKdsDTO(
        Integer cantidad,
        String nombreProducto,
        String personalizacionesElegidas
) {}