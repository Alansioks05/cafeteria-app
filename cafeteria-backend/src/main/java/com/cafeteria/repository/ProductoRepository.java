package com.cafeteria.repository;

import com.cafeteria.domain.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    // Para el menú: traer solo los disponibles por categoría
    List<Producto> findByCategoriaIdAndDisponibleTrue(Integer categoriaId);
}