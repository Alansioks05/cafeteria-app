package com.cafeteria.domain.entity;

import com.cafeteria.domain.enums.EstadoMesa;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mesas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Integer id;

    @Column(name = "numero_mesa", nullable = false, unique = true, length = 10)
    private String numeroMesa;

    @Column(name = "codigo_qr_token", nullable = false, unique = true, length = 64)
    private String codigoQrToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoMesa estado = EstadoMesa.DISPONIBLE;
}