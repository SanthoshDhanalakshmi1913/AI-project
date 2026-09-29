package com.edugenie.repository;

import com.edugenie.entity.ChatConversation;
import com.edugenie.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    List<ChatConversation> findByUserOrderByUpdatedAtDesc(User user);
}
