package com.cafeteria.dto;

import java.math.BigDecimal;

public record AdminOpcionDTO(
        Integer id,
        String nombreOpcion,
        BigDecimal costoAdicional,
        String tipoGrupo
) {}