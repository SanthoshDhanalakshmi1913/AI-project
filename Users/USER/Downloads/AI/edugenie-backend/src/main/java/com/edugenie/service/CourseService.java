package com.edugenie.service;

import com.edugenie.request.CourseRequest;
import com.edugenie.response.CourseResponse;

import java.util.List;

public interface CourseService {

    CourseResponse createCourse(CourseRequest request, String email);

    List<CourseResponse> getAllCourses();

    CourseResponse getCourseById(Long courseId);

    CourseResponse updateCourse(Long courseId, CourseRequest request, String email);

    void deleteCourse(Long courseId, String email);
}
