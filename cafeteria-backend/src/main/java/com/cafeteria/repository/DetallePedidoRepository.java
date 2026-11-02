package com.cafeteria.repository;

import com.cafeteria.domain.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
    // Las consultas de detalles normalmente se hacen a través del Pedido (cascade)
}