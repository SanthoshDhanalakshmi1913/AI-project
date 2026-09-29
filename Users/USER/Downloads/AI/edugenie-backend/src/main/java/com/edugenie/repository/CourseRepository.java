package com.edugenie.repository;

import com.edugenie.entity.Course;
import com.edugenie.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByInstructor(User instructor);

    Optional<Course> findByIdAndInstructor(Long id, User instructor);
}
