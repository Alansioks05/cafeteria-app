package com.cafeteria.controller;

import com.cafeteria.domain.enums.EstadoPedido;
import com.cafeteria.dto.PedidoClienteDTO;
import com.cafeteria.dto.PedidoKdsDTO;
import com.cafeteria.dto.PedidoRequestDTO;
import com.cafeteria.dto.PedidoResponseDTO;
import com.cafeteria.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> crearPedido(@RequestBody PedidoRequestDTO request) {
        try {
            PedidoResponseDTO response = pedidoService.crearPedido(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/activos")
    public ResponseEntity<List<PedidoKdsDTO>> obtenerActivos() {
        return ResponseEntity.ok(pedidoService.obtenerPedidosActivos());
    }

    @GetMapping("/mesa/{codigoQrToken}")
    public ResponseEntity<List<PedidoClienteDTO>> obtenerPedidosDeMesa(@PathVariable String codigoQrToken) {
        return ResponseEntity.ok(pedidoService.obtenerPedidosActivosDeMesa(codigoQrToken));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Integer id,
            @RequestParam String nuevoEstado) {
        try {
            pedidoService.actualizarEstado(id, EstadoPedido.valueOf(nuevoEstado));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmarRecepcion(@PathVariable Integer id) {
        try {
            pedidoService.confirmarRecepcion(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NUEVO: Liberar mesa desde el cliente
    @PatchMapping("/mesa/{codigoQrToken}/liberar")
    public ResponseEntity<?> liberarMesaCliente(@PathVariable String codigoQrToken) {
        try {
            pedidoService.liberarMesaCliente(codigoQrToken);
            return ResponseEntity.ok("Mesa liberada");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}