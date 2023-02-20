package com.project.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.domain.Basket;

public interface BasketRepository extends JpaRepository<Basket, Long> {


}