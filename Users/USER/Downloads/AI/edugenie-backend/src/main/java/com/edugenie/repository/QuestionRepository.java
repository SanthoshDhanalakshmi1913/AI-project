package com.edugenie.repository;

import com.edugenie.entity.Question;
import com.edugenie.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuizId(Long quizId);

    List<Question> findByQuizOrderByIdAsc(Quiz quiz);
}
