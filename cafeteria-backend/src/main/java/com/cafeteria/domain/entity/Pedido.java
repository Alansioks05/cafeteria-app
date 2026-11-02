package com.cafeteria.domain.entity;

import com.cafeteria.domain.enums.EstadoPedido;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mesa_id", nullable = false)
    private Mesa mesa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barista_id")
    private Usuario barista; // <-- Relación con el barista

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pedido", nullable = false, length = 20)
    @Builder.Default
    private EstadoPedido estadoPedido = EstadoPedido.PENDIENTE;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(
            mappedBy = "pedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<DetallePedido> detalles = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
    }

    public void addDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }

    public void removeDetalle(DetallePedido detalle) {
        detalles.remove(detalle);
        detalle.setPedido(null);
    }
}