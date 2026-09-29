package com.edugenie.service;

import com.edugenie.request.StudyNotesRequest;
import com.edugenie.response.StudyNotesResponse;

public interface StudyNotesService {

    StudyNotesResponse generateStudyNotes(StudyNotesRequest request, String email);
}
