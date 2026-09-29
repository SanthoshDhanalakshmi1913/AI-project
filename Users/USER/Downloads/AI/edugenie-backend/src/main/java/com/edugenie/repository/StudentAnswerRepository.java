package com.edugenie.repository;

import com.edugenie.entity.QuizAttempt;
import com.edugenie.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findByAttemptOrderByIdAsc(QuizAttempt attempt);

    List<StudentAnswer> findByAttemptId(Long attemptId);
}
