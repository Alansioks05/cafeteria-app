package com.cafeteria.controller;

import com.cafeteria.domain.entity.Mesa;
import com.cafeteria.dto.AdminMesaDTO;
import com.cafeteria.dto.MesaEstadoDTO;
import com.cafeteria.repository.MesaRepository;
import com.cafeteria.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/mesas")
@CrossOrigin(origins = "*")
public class AdminMesaController {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<AdminMesaDTO>> listarMesas() {
        return ResponseEntity.ok(mesaRepository.findAll().stream().map(m -> new AdminMesaDTO(
                m.getId(), m.getNumeroMesa(), m.getCodigoQrToken(), m.getEstado().name()
        )).toList());
    }

    @PostMapping
    public ResponseEntity<?> crearMesa(@RequestBody AdminMesaDTO dto) {
        if (mesaRepository.findByNumeroMesa(dto.numeroMesa()).isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe una mesa con ese número");
        }

        Mesa mesa = new Mesa();
        mesa.setNumeroMesa(dto.numeroMesa());
        mesa.setCodigoQrToken("qr_mesa_" + UUID.randomUUID().toString().substring(0, 12));
        mesa.setEstado(com.cafeteria.domain.enums.EstadoMesa.DISPONIBLE);

        mesaRepository.save(mesa);
        return ResponseEntity.ok("Mesa creada exitosamente");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMesa(@PathVariable Integer id) {
        mesaRepository.deleteById(id);
        return ResponseEntity.ok("Mesa eliminada");
    }

    @PatchMapping("/{id}/liberar")
    public ResponseEntity<?> liberarMesa(@PathVariable Integer id) {
        Mesa mesa = mesaRepository.findById(id).orElseThrow();
        mesa.setEstado(com.cafeteria.domain.enums.EstadoMesa.DISPONIBLE);
        mesaRepository.save(mesa);

        // Marcar todos los pedidos servidos de esta mesa como CANCELADOS
        // para que no vuelvan a aparecer en la vista del cliente
        pedidoRepository.findByMesaCodigoQrTokenAndEstadoPedidoIn(
                mesa.getCodigoQrToken(),
                List.of(com.cafeteria.domain.enums.EstadoPedido.SERVIDO)
        ).forEach(p -> {
            p.setEstadoPedido(com.cafeteria.domain.enums.EstadoPedido.CANCELADO);
            pedidoRepository.save(p);
        });

        messagingTemplate.convertAndSend("/topic/mesas", new MesaEstadoDTO(mesa.getId(), mesa.getEstado().name()));

        return ResponseEntity.ok("Mesa liberada");
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id, @RequestParam String nuevoEstado) {
        Mesa mesa = mesaRepository.findById(id).orElseThrow();
        mesa.setEstado(com.cafeteria.domain.enums.EstadoMesa.valueOf(nuevoEstado));
        mesaRepository.save(mesa);

        messagingTemplate.convertAndSend("/topic/mesas", new MesaEstadoDTO(mesa.getId(), mesa.getEstado().name()));

        return ResponseEntity.ok("Estado de la mesa actualizado");
    }
}