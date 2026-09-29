package com.edugenie.service;

import com.edugenie.request.LessonRequest;
import com.edugenie.response.LessonResponse;

import java.util.List;

public interface LessonService {

    LessonResponse createLesson(Long courseId, LessonRequest request, String email);

    List<LessonResponse> getLessonsByCourse(Long courseId);

    LessonResponse updateLesson(Long lessonId, LessonRequest request, String email);

    void deleteLesson(Long lessonId, String email);
}
