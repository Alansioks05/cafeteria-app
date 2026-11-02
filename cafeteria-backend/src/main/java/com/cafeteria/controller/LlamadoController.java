package com.cafeteria.controller;

import com.cafeteria.domain.entity.Llamado;
import com.cafeteria.domain.entity.Mesa;
import com.cafeteria.dto.LlamadoRequestDTO;
import com.cafeteria.dto.LlamadoResponseDTO;
import com.cafeteria.repository.LlamadoRepository;
import com.cafeteria.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/llamados")
@CrossOrigin(origins = "*")
public class LlamadoController {

    @Autowired
    private LlamadoRepository llamadoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<?> crearLlamado(@RequestBody LlamadoRequestDTO request) {
        Mesa mesa = mesaRepository.findByCodigoQrToken(request.codigoQrToken())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

        Llamado llamado = new Llamado();
        llamado.setMesa(mesa);
        llamado.setMotivo(request.motivo());
        llamadoRepository.save(llamado);

        // Usamos un DTO en lugar de un Map para evitar la ambigüedad
        LlamadoResponseDTO payload = new LlamadoResponseDTO(
                llamado.getId(),
                mesa.getNumeroMesa(),
                llamado.getMotivo(),
                llamado.getCreadoEn()
        );

        messagingTemplate.convertAndSend("/topic/llamados", payload);

        return ResponseEntity.ok("Llamado enviado");
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<LlamadoResponseDTO>> obtenerPendientes() {
        List<Llamado> llamados = llamadoRepository.findByAtendidoFalseOrderByCreadoEnAsc();
        List<LlamadoResponseDTO> response = llamados.stream()
                .map(l -> new LlamadoResponseDTO(
                        l.getId(),
                        l.getMesa().getNumeroMesa(),
                        l.getMotivo(),
                        l.getCreadoEn()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/atender")
    public ResponseEntity<?> atenderLlamado(@PathVariable Integer id) {
        Llamado llamado = llamadoRepository.findById(id).orElseThrow();
        llamado.setAtendido(true);
        llamadoRepository.save(llamado);
        return ResponseEntity.ok("Llamado atendido");
    }
}