package com.cafeteria.domain.entity;

import com.cafeteria.domain.enums.TipoGrupoOpcion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "opciones_personalizacion",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_opcion_grupo",
                columnNames = {"nombre_opcion", "tipo_grupo"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OpcionPersonalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Integer id;

    @Column(name = "nombre_opcion", nullable = false, length = 80)
    private String nombreOpcion;

    @Column(name = "costo_adicional", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal costoAdicional = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_grupo", nullable = false, length = 30)
    private TipoGrupoOpcion tipoGrupo;
}