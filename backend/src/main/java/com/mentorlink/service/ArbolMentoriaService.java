package com.mentorlink.service;

import com.mentorlink.model.ArbolMentoria;
import com.mentorlink.model.Estudiante;
import com.mentorlink.model.Materia;
import com.mentorlink.repository.ArbolMentoriaRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ArbolMentoriaService {

    private final ArbolMentoriaRepository arbolRepository;

    public ArbolMentoriaService(ArbolMentoriaRepository arbolRepository) {
        this.arbolRepository = arbolRepository;
    }

    public ArbolMentoria crearNodo(Estudiante mentor, Estudiante aprendiz, Materia materia) {
        ArbolMentoria nodo = new ArbolMentoria();
        nodo.setMentor(mentor);
        nodo.setAprendiz(aprendiz);
        nodo.setMateria(materia);

        Optional<ArbolMentoria> padre = arbolRepository.findByAprendizId(mentor.getId());
        if (padre.isPresent()) {
            nodo.setGeneracion(padre.get().getGeneracion() + 1);
            nodo.setNodoPadreId(padre.get().getId());
        } else {
            nodo.setGeneracion(1);
        }

        return arbolRepository.save(nodo);
    }

    public List<ArbolMentoria> arbolDe(Estudiante estudiante) {
        List<ArbolMentoria> resultado = new ArrayList<>();
        cargarSubarbol(estudiante.getId(), resultado);
        return resultado;
    }

    private void cargarSubarbol(UUID mentorId, List<ArbolMentoria> resultado) {
        List<ArbolMentoria> hijos = arbolRepository.findByMentorId(mentorId);
        for (ArbolMentoria h : hijos) {
            resultado.add(h);
            cargarSubarbol(h.getAprendiz().getId(), resultado);
        }
    }

    public Map<String, Object> impacto(Estudiante estudiante) {
        List<ArbolMentoria> arbol = arbolDe(estudiante);
        int directos = (int) arbol.stream().filter(n -> n.getGeneracion() == 1).count();
        int indirectos = (int) arbol.stream().filter(n -> n.getGeneracion() > 1).count();
        int generaciones = arbol.stream().mapToInt(ArbolMentoria::getGeneracion).max().orElse(0);
        Map<String, Object> impacto = new HashMap<>();
        impacto.put("directos", directos);
        impacto.put("indirectos", indirectos);
        impacto.put("total", directos + indirectos);
        impacto.put("generaciones", generaciones);
        return impacto;
    }
}
