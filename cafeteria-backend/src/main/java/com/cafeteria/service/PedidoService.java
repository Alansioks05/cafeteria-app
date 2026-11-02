package com.cafeteria.service;

import com.cafeteria.domain.entity.*;
import com.cafeteria.domain.enums.EstadoMesa;
import com.cafeteria.domain.enums.EstadoPedido;
import com.cafeteria.dto.DetalleKdsDTO;
import com.cafeteria.dto.DetallePedidoRequestDTO;
import com.cafeteria.dto.MesaEstadoDTO;
import com.cafeteria.dto.PedidoClienteDTO;
import com.cafeteria.dto.PedidoKdsDTO;
import com.cafeteria.dto.PedidoRequestDTO;
import com.cafeteria.dto.PedidoResponseDTO;
import com.cafeteria.repository.MesaRepository;
import com.cafeteria.repository.PedidoRepository;
import com.cafeteria.repository.ProductoRepository;
import com.cafeteria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public PedidoResponseDTO crearPedido(PedidoRequestDTO request) {
        Mesa mesa = mesaRepository.findByCodigoQrToken(request.codigoQrToken())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada con ese código QR"));

        Pedido pedido = new Pedido();
        pedido.setMesa(mesa);
        pedido.setEstadoPedido(EstadoPedido.PENDIENTE);

        BigDecimal totalPedido = BigDecimal.ZERO;

        for (DetallePedidoRequestDTO detalleDto : request.detalles()) {
            Producto producto = productoRepository.findById(detalleDto.productoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado ID: " + detalleDto.productoId()));

            if (!producto.getDisponible()) {
                throw new RuntimeException("El producto '" + producto.getNombre() + "' no está disponible.");
            }

            BigDecimal precioUnitario = detalleDto.precioFinal() != null
                    ? detalleDto.precioFinal()
                    : producto.getPrecioBase();

            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(detalleDto.cantidad()));

            DetallePedido detalle = new DetallePedido();
            detalle.setProducto(producto);
            detalle.setCantidad(detalleDto.cantidad());
            detalle.setPersonalizacionesElegidas(detalleDto.personalizacionesElegidas());
            detalle.setSubtotal(subtotal);

            pedido.addDetalle(detalle);
            totalPedido = totalPedido.add(subtotal);
        }

        pedido.setTotal(totalPedido);
        mesa.setEstado(EstadoMesa.OCUPADA);
        mesaRepository.save(mesa);

        messagingTemplate.convertAndSend("/topic/mesas", new MesaEstadoDTO(mesa.getId(), mesa.getEstado().name()));

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        PedidoResponseDTO response = new PedidoResponseDTO(
                pedidoGuardado.getId(),
                mesa.getNumeroMesa(),
                pedidoGuardado.getEstadoPedido().name(),
                pedidoGuardado.getTotal(),
                pedidoGuardado.getCreadoEn(),
                pedidoGuardado.getDetalles().stream().map(d -> new DetalleKdsDTO(
                        d.getCantidad(),
                        d.getProducto().getNombre(),
                        d.getPersonalizacionesElegidas()
                )).toList()
        );

        messagingTemplate.convertAndSend("/topic/pedidos/nuevos", response);

        return response;
    }

    @Transactional(readOnly = true)
    public List<PedidoKdsDTO> obtenerPedidosActivos() {
        List<Pedido> pedidos = pedidoRepository.findActivosWithMesaAndDetalles(
                List.of(EstadoPedido.PENDIENTE, EstadoPedido.EN_PREPARACION)
        );

        return pedidos.stream().map(p -> new PedidoKdsDTO(
                p.getId(),
                p.getMesa().getNumeroMesa(),
                p.getEstadoPedido().name(),
                p.getTotal(),
                p.getCreadoEn(),
                p.getDetalles().stream().map(d -> new DetalleKdsDTO(
                        d.getCantidad(),
                        d.getProducto().getNombre(),
                        d.getPersonalizacionesElegidas()
                )).toList()
        )).toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoClienteDTO> obtenerPedidosActivosDeMesa(String codigoQrToken) {
        List<Pedido> pedidosActivos = pedidoRepository.findByMesaCodigoQrTokenAndEstadoPedidoIn(
                codigoQrToken,
                List.of(EstadoPedido.PENDIENTE, EstadoPedido.EN_PREPARACION)
        );

        List<Pedido> pedidosServidosRecientes = pedidoRepository
                .findByMesaCodigoQrTokenAndEstadoPedidoAndCreadoEnAfter(
                        codigoQrToken,
                        EstadoPedido.SERVIDO,
                        LocalDateTime.now().minusMinutes(5)
                );

        List<Pedido> todos = new ArrayList<>(pedidosActivos);
        todos.addAll(pedidosServidosRecientes);

        return todos.stream().map(p -> new PedidoClienteDTO(
                p.getId(),
                p.getMesa().getNumeroMesa(),
                p.getEstadoPedido().name(),
                p.getCreadoEn(),
                p.getDetalles().stream().map(d -> new DetalleKdsDTO(
                        d.getCantidad(),
                        d.getProducto().getNombre(),
                        d.getPersonalizacionesElegidas()
                )).toList()
        )).collect(Collectors.toList());
    }

    @Transactional
    public void actualizarEstado(Integer pedidoId, EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setEstadoPedido(nuevoEstado);

        if (nuevoEstado == EstadoPedido.SERVIDO) {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario barista = usuarioRepository.findByUsername(username).orElse(null);
            pedido.setBarista(barista);
        }

        pedidoRepository.save(pedido);

        PedidoClienteDTO pedidoActualizado = new PedidoClienteDTO(
                pedido.getId(),
                pedido.getMesa().getNumeroMesa(),
                pedido.getEstadoPedido().name(),
                pedido.getCreadoEn(),
                pedido.getDetalles().stream().map(d -> new DetalleKdsDTO(
                        d.getCantidad(),
                        d.getProducto().getNombre(),
                        d.getPersonalizacionesElegidas()
                )).toList()
        );
        messagingTemplate.convertAndSend("/topic/pedidos/estado", pedidoActualizado);

        messagingTemplate.convertAndSend("/topic/mesas",
                new MesaEstadoDTO(pedido.getMesa().getId(), pedido.getMesa().getEstado().name()));
    }

    // CAMBIO: No cambia el estado del pedido, lo deja como SERVIDO
    @Transactional
    public void confirmarRecepcion(Integer pedidoId) {
        // No hacemos nada con el pedido, solo confirmamos que el cliente lo recibió
        // El pedido sigue como SERVIDO para las estadísticas
    }

    // CAMBIO: No cambia el estado de los pedidos, solo libera la mesa
    @Transactional
    public void liberarMesaCliente(String codigoQrToken) {
        Mesa mesa = mesaRepository.findByCodigoQrToken(codigoQrToken)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

        // No cambiamos los pedidos a CANCELADO, los dejamos como SERVIDO
        mesa.setEstado(EstadoMesa.DISPONIBLE);
        mesaRepository.save(mesa);

        messagingTemplate.convertAndSend("/topic/mesas", new MesaEstadoDTO(mesa.getId(), mesa.getEstado().name()));
    }
}