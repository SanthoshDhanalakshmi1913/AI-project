package com.edugenie.repository;

import com.edugenie.entity.Question;
import com.edugenie.entity.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {

    List<QuizOption> findByQuestionOrderByIdAsc(Question question);
}
