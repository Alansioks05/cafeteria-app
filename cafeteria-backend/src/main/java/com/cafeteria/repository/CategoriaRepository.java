package com.cafeteria.repository;

import com.cafeteria.domain.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    // Para traer las categorías ordenadas
    List<Categoria> findAllByOrderByOrdenAsc();
}