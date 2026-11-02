package com.cafeteria.controller;

import com.cafeteria.domain.entity.Categoria;
import com.cafeteria.domain.entity.OpcionPersonalizacion;
import com.cafeteria.domain.entity.Producto;
import com.cafeteria.dto.AdminOpcionDTO;
import com.cafeteria.dto.AdminProductoDTO;
import com.cafeteria.repository.CategoriaRepository;
import com.cafeteria.repository.OpcionPersonalizacionRepository;
import com.cafeteria.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu")
@CrossOrigin(origins = "*")
public class AdminMenuController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private OpcionPersonalizacionRepository opcionRepository;

    // --- PRODUCTOS ---

    @GetMapping("/productos")
    public ResponseEntity<List<AdminProductoDTO>> listarProductos() {
        return ResponseEntity.ok(productoRepository.findAll().stream().map(p -> new AdminProductoDTO(
                p.getId(), p.getCategoria().getId(), p.getNombre(), p.getDescripcion(),
                p.getPrecioBase(), p.getImagenUrl(), p.getDisponible()
        )).toList());
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping("/productos")
    public ResponseEntity<?> crearProducto(@RequestBody AdminProductoDTO dto) {
        Producto producto = new Producto();
        producto.setCategoria(categoriaRepository.findById(dto.categoriaId()).orElseThrow());
        producto.setNombre(dto.nombre());
        producto.setDescripcion(dto.descripcion());
        producto.setPrecioBase(dto.precioBase());
        producto.setImagenUrl(dto.imagenUrl());
        producto.setDisponible(dto.disponible() != null ? dto.disponible() : true);
        productoRepository.save(producto);
        return ResponseEntity.ok("Producto creado");
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<?> editarProducto(@PathVariable Integer id, @RequestBody AdminProductoDTO dto) {
        Producto producto = productoRepository.findById(id).orElseThrow();
        producto.setCategoria(categoriaRepository.findById(dto.categoriaId()).orElseThrow());
        producto.setNombre(dto.nombre());
        producto.setDescripcion(dto.descripcion());
        producto.setPrecioBase(dto.precioBase());
        producto.setImagenUrl(dto.imagenUrl());
        if (dto.disponible() != null) producto.setDisponible(dto.disponible());
        productoRepository.save(producto);
        return ResponseEntity.ok("Producto actualizado");
    }

    @PatchMapping("/productos/{id}/disponibilidad")
    public ResponseEntity<?> cambiarDisponibilidad(@PathVariable Integer id) {
        Producto producto = productoRepository.findById(id).orElseThrow();
        producto.setDisponible(!producto.getDisponible());
        productoRepository.save(producto);
        return ResponseEntity.ok("Disponibilidad cambiada");
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Integer id) {
        productoRepository.deleteById(id);
        return ResponseEntity.ok("Producto eliminado");
    }

    // --- OPCIONES (EXTRAS) ---

    @GetMapping("/opciones")
    public ResponseEntity<List<AdminOpcionDTO>> listarOpciones() {
        return ResponseEntity.ok(opcionRepository.findAll().stream().map(o -> new AdminOpcionDTO(
                o.getId(), o.getNombreOpcion(), o.getCostoAdicional(), o.getTipoGrupo().name()
        )).toList());
    }

    @PostMapping("/opciones")
    public ResponseEntity<?> crearOpcion(@RequestBody AdminOpcionDTO dto) {
        OpcionPersonalizacion opcion = new OpcionPersonalizacion();
        opcion.setNombreOpcion(dto.nombreOpcion());
        opcion.setCostoAdicional(dto.costoAdicional());
        opcion.setTipoGrupo(com.cafeteria.domain.enums.TipoGrupoOpcion.valueOf(dto.tipoGrupo()));
        opcionRepository.save(opcion);
        return ResponseEntity.ok("Opción creada");
    }

    @PutMapping("/opciones/{id}")
    public ResponseEntity<?> editarOpcion(@PathVariable Integer id, @RequestBody AdminOpcionDTO dto) {
        OpcionPersonalizacion opcion = opcionRepository.findById(id).orElseThrow();
        opcion.setNombreOpcion(dto.nombreOpcion());
        opcion.setCostoAdicional(dto.costoAdicional());
        opcion.setTipoGrupo(com.cafeteria.domain.enums.TipoGrupoOpcion.valueOf(dto.tipoGrupo()));
        opcionRepository.save(opcion);
        return ResponseEntity.ok("Opción actualizada");
    }

    @DeleteMapping("/opciones/{id}")
    public ResponseEntity<?> eliminarOpcion(@PathVariable Integer id) {
        opcionRepository.deleteById(id);
        return ResponseEntity.ok("Opción eliminada");
    }
}