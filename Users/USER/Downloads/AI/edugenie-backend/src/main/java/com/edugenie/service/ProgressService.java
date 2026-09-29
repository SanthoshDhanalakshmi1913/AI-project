package com.edugenie.service;

import com.edugenie.response.StudentProgressResponse;

public interface ProgressService {

    StudentProgressResponse getMyProgress(String email);

    StudentProgressResponse getCourseProgress(Long courseId, String email);
}
