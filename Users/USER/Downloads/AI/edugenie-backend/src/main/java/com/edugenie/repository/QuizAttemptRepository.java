package com.edugenie.repository;

import com.edugenie.entity.QuizAttempt;
import com.edugenie.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserOrderByCompletedAtDesc(User user);

    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(Long userId);
}
