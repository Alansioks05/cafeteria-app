package com.cafeteria.controller;

import com.cafeteria.domain.entity.Usuario;
import com.cafeteria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/baristas")
@CrossOrigin(origins = "*")
public class BaristaController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarBaristas() {
        return ResponseEntity.ok(
                usuarioRepository.findAll().stream()
                        .filter(u -> u.getRol().equals("BARISTA"))
                        .toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> crearBarista(@RequestBody Usuario request) {
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("El usuario ya existe");
        }

        Usuario nuevo = new Usuario();
        nuevo.setUsername(request.getUsername());
        nuevo.setPassword(passwordEncoder.encode(request.getPassword()));
        nuevo.setRol("BARISTA");
        nuevo.setActivo(true);

        usuarioRepository.save(nuevo);
        return ResponseEntity.ok("Barista creado exitosamente");
    }
}