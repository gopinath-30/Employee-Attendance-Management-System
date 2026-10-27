package com.eams.service;

import com.eams.dto.HolidayRequest;
import com.eams.entity.Holiday;
import com.eams.exception.ConflictException;
import com.eams.exception.ResourceNotFoundException;
import com.eams.repository.HolidayRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public List<Holiday> getAll() {
        return holidayRepository.findAll();
    }

    public Holiday create(HolidayRequest request) {
        if (holidayRepository.existsByDate(request.getDate())) {
            throw new ConflictException("A holiday is already defined for " + request.getDate());
        }
        return holidayRepository.save(Holiday.builder().date(request.getDate()).name(request.getName()).build());
    }

    public Holiday update(Long id, HolidayRequest request) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id " + id));

        if (!holiday.getDate().equals(request.getDate()) && holidayRepository.existsByDate(request.getDate())) {
            throw new ConflictException("A holiday is already defined for " + request.getDate());
        }

        holiday.setDate(request.getDate());
        holiday.setName(request.getName());
        return holidayRepository.save(holiday);
    }

    public void delete(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw new ResourceNotFoundException("Holiday not found with id " + id);
        }
        holidayRepository.deleteById(id);
    }
}
