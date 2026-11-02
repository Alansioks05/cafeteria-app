package com.cafeteria.repository;

import com.cafeteria.domain.entity.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {

    // Para buscar la mesa escaneando el QR
    Optional<Mesa> findByCodigoQrToken(String codigoQrToken);

    // Para validar que no se repita el número de mesa al crear
    Optional<Mesa> findByNumeroMesa(String numeroMesa);
}