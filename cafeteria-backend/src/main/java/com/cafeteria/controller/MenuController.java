package com.cafeteria.controller;

import com.cafeteria.domain.entity.Categoria;
import com.cafeteria.domain.entity.OpcionPersonalizacion;
import com.cafeteria.domain.entity.Producto;
import com.cafeteria.dto.ProductoDTO;
import com.cafeteria.repository.CategoriaRepository;
import com.cafeteria.repository.OpcionPersonalizacionRepository;
import com.cafeteria.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private OpcionPersonalizacionRepository opcionRepository;

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> obtenerCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAllByOrderByOrdenAsc());
    }

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoDTO>> obtenerProductos(
            @RequestParam(required = false) Integer categoriaId) {

        List<Producto> productos;

        if (categoriaId != null) {
            productos = productoRepository.findByCategoriaIdAndDisponibleTrue(categoriaId);
        } else {
            productos = productoRepository.findAll();
        }

        List<ProductoDTO> respuesta = productos.stream()
                .map(p -> new ProductoDTO(
                        p.getId(),
                        p.getNombre(),
                        p.getDescripcion(),
                        p.getPrecioBase(),
                        p.getImagenUrl(),
                        p.getCategoria().getId()
                ))
                .toList();

        return ResponseEntity.ok(respuesta);
    }

    // NUEVO ENDPOINT PARA LAS PERSONALIZACIONES
    @GetMapping("/opciones")
    public ResponseEntity<List<OpcionPersonalizacion>> obtenerOpciones() {
        return ResponseEntity.ok(opcionRepository.findAll());
    }
}