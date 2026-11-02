package com.cafeteria.repository;

import com.cafeteria.domain.entity.Pedido;
import com.cafeteria.domain.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    List<Pedido> findByEstadoPedidoInOrderByCreadoEnAsc(List<EstadoPedido> estados);

    @Query("SELECT DISTINCT p FROM Pedido p " +
            "JOIN FETCH p.mesa " +
            "JOIN FETCH p.detalles d " +
            "JOIN FETCH d.producto " +
            "WHERE p.estadoPedido IN :estados ORDER BY p.creadoEn ASC")
    List<Pedido> findActivosWithMesaAndDetalles(@Param("estados") List<EstadoPedido> estados);

    // --- ESTADÍSTICAS ---
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.estadoPedido = 'SERVIDO'")
    BigDecimal sumVentasTotales();

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.estadoPedido = 'SERVIDO'")
    Long countPedidosServidos();

    @Query("SELECT p.barista.username, COUNT(p), COALESCE(SUM(p.total), 0) " +
            "FROM Pedido p WHERE p.estadoPedido = 'SERVIDO' AND p.barista IS NOT NULL " +
            "GROUP BY p.barista.username")
    List<Object[]> statsPorBarista();

    // --- CONSULTAS PARA EL CLIENTE ---
    List<Pedido> findByMesaCodigoQrTokenAndEstadoPedidoIn(String codigoQrToken, List<EstadoPedido> estados);

    List<Pedido> findByMesaCodigoQrTokenAndEstadoPedidoAndCreadoEnAfter(
            String codigoQrToken,
            EstadoPedido estado,
            LocalDateTime fecha
    );
}