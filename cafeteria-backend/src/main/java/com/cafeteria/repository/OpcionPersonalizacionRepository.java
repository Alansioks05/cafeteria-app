package com.cafeteria.repository;

import com.cafeteria.domain.entity.OpcionPersonalizacion;
import com.cafeteria.domain.enums.TipoGrupoOpcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpcionPersonalizacionRepository extends JpaRepository<OpcionPersonalizacion, Integer> {
    // Para agrupar las opciones por tipo (LECHE, EXTRA, etc.)
    List<OpcionPersonalizacion> findByTipoGrupo(TipoGrupoOpcion tipoGrupo);
}