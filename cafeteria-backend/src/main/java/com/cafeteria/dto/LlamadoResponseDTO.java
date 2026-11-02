package com.cafeteria.dto;

import java.time.LocalDateTime;

public record LlamadoResponseDTO(
        Integer id,
        String numeroMesa,
        String motivo,
        LocalDateTime creadoEn
) {}