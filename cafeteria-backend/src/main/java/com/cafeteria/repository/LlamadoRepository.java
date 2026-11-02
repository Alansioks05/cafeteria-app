package com.cafeteria.repository;

import com.cafeteria.domain.entity.Llamado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LlamadoRepository extends JpaRepository<Llamado, Integer> {
    List<Llamado> findByAtendidoFalseOrderByCreadoEnAsc();
}