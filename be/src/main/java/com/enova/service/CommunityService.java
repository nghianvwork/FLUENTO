package com.enova.service;

import com.enova.dto.response.*;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.*;
import com.enova.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {
    private final CommunityClubRepository clubRepository;
    private final ClubMembershipRepository membershipRepository;
    private final CommunityEventRepository eventRepository;
    private final EventReservationRepository reservationRepository;
        private final ClubPostRepository postRepository;
        private final ClubPostCommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<CommunityClubResponse> getClubs(Long userId) {
        List<CommunityClub> clubs = clubRepository.findAll();
        Set<Long> joinedClubIds = membershipRepository.findByUserIdAndLeftAtIsNull(userId)
                .stream().map(m -> m.getClub().getId()).collect(Collectors.toSet());

        return clubs.stream().map(club -> buildClubResponse(club, joinedClubIds.contains(club.getId())))
                .collect(Collectors.toList());
    }

    public CommunityClubDetailResponse getClubDetail(Long clubId, Long userId) {
        CommunityClub club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        boolean joined = membershipRepository.findByUserIdAndClubIdAndLeftAtIsNull(userId, clubId).isPresent();
        long members = membershipRepository.countByClubIdAndLeftAtIsNull(clubId);
        return CommunityClubDetailResponse.builder()
                .id(club.getId())
                .name(club.getName())
                .focus(club.getFocus())
                .level(club.getLevel())
                .members(members)
                .joined(joined)
                .build();
    }

    public List<CommunityClubMemberResponse> getClubMembers(Long clubId) {
        CommunityClub club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        return membershipRepository.findByClubIdAndLeftAtIsNull(club.getId()).stream()
                .map(membership -> CommunityClubMemberResponse.builder()
                        .id(membership.getUser().getId())
                        .fullName(membership.getUser().getFullName())
                        .avatarUrl(membership.getUser().getAvatarUrl())
                        .role(membership.getUser().getRole().name())
                        .build())
                .collect(Collectors.toList());
    }

    public List<CommunityPostResponse> getClubPosts(Long clubId) {
        CommunityClub club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        return postRepository.findByClubIdOrderByCreatedAtDesc(club.getId()).stream()
                .map(this::buildPostResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityPostResponse createPost(Long clubId, Long userId, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content is required");
        }
        CommunityClub club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ensureJoined(clubId, userId);

        ClubPost post = ClubPost.builder()
                .club(club)
                .author(user)
                .content(content.trim())
                .build();
        postRepository.save(post);
        return buildPostResponse(post);
    }

    @Transactional
    public CommunityPostCommentResponse addComment(Long clubId, Long postId, Long userId, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content is required");
        }
        ClubPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getClub().getId().equals(clubId)) {
            throw new ResourceNotFoundException("Post not in club");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ensureJoined(clubId, userId);

        ClubPostComment comment = ClubPostComment.builder()
                .post(post)
                .author(user)
                .content(content.trim())
                .build();
        commentRepository.save(comment);
        return buildCommentResponse(comment);
    }

    @Transactional
    public CommunityClubResponse joinClub(Long clubId, Long userId) {
        CommunityClub club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClubMembership membership = membershipRepository.findByUserIdAndClubId(userId, clubId)
                .orElse(null);
        if (membership == null) {
            membership = ClubMembership.builder().club(club).user(user).build();
        } else {
            membership.setLeftAt(null);
            membership.setJoinedAt(LocalDateTime.now());
        }
        membershipRepository.save(membership);
        return buildClubResponse(club, true);
    }

    @Transactional
    public CommunityClubResponse leaveClub(Long clubId, Long userId) {
        CommunityClub club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        ClubMembership membership = membershipRepository.findByUserIdAndClubIdAndLeftAtIsNull(userId, clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));
        membership.setLeftAt(LocalDateTime.now());
        membershipRepository.save(membership);
        return buildClubResponse(club, false);
    }

    public List<CommunityEventResponse> getEvents(Long userId) {
        List<CommunityEvent> events = eventRepository.findAll();
        Set<Long> reservedEventIds = reservationRepository.findByUserIdAndCanceledAtIsNull(userId)
                .stream().map(r -> r.getEvent().getId()).collect(Collectors.toSet());

        return events.stream()
                .map(event -> buildEventResponse(event, reservedEventIds.contains(event.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityEventResponse reserveEvent(Long eventId, Long userId) {
        CommunityEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (reservationRepository.findByUserIdAndEventIdAndCanceledAtIsNull(userId, eventId).isPresent()) {
            return buildEventResponse(event, true);
        }

        long currentReserved = reservationRepository.countByEventIdAndCanceledAtIsNull(eventId);
        if (currentReserved >= event.getCapacity()) {
            throw new IllegalArgumentException("Event is full");
        }

        EventReservation reservation = reservationRepository.findByUserIdAndEventId(userId, eventId)
                .orElse(null);
        if (reservation == null) {
            reservation = EventReservation.builder().event(event).user(user).build();
        } else {
            reservation.setCanceledAt(null);
            reservation.setReservedAt(LocalDateTime.now());
        }
        reservationRepository.save(reservation);
        return buildEventResponse(event, true);
    }

    @Transactional
    public CommunityEventResponse cancelReservation(Long eventId, Long userId) {
        CommunityEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        EventReservation reservation = reservationRepository.findByUserIdAndEventIdAndCanceledAtIsNull(userId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
        reservation.setCanceledAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        return buildEventResponse(event, false);
    }

        public CommunityMatchResponse findMatch(Long userId) {
                List<ClubMembership> memberships = membershipRepository.findByUserIdAndLeftAtIsNull(userId);
                if (memberships.isEmpty()) {
                        throw new IllegalArgumentException("Join a club first to get matched");
                }

                for (ClubMembership membership : memberships) {
                        Long clubId = membership.getClub().getId();
                        List<ClubMembership> others = membershipRepository.findByClubIdAndLeftAtIsNull(clubId).stream()
                                        .filter(m -> !m.getUser().getId().equals(userId))
                                        .collect(Collectors.toList());
                        if (!others.isEmpty()) {
                                ClubMembership picked = others.get(0);
                                return CommunityMatchResponse.builder()
                                                .memberId(picked.getUser().getId())
                                                .memberName(picked.getUser().getFullName())
                                                .memberAvatarUrl(picked.getUser().getAvatarUrl())
                                                .memberRole(picked.getUser().getRole().name())
                                                .clubId(picked.getClub().getId())
                                                .clubName(picked.getClub().getName())
                                                .build();
                        }
                }

                throw new IllegalArgumentException("No matches available yet");
        }

    private CommunityClubResponse buildClubResponse(CommunityClub club, boolean joined) {
        long members = membershipRepository.countByClubIdAndLeftAtIsNull(club.getId());
        return CommunityClubResponse.builder()
                .id(club.getId())
                .name(club.getName())
                .focus(club.getFocus())
                .level(club.getLevel())
                .members(members)
                .joined(joined)
                .build();
    }

    private CommunityEventResponse buildEventResponse(CommunityEvent event, boolean reservedByUser) {
        int reserved = (int) reservationRepository.countByEventIdAndCanceledAtIsNull(event.getId());
        return CommunityEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .timeLabel(event.getTimeLabel())
                .host(event.getHost())
                .reserved(reserved)
                .capacity(event.getCapacity())
                .reservedByUser(reservedByUser)
                .build();
    }

        private CommunityPostResponse buildPostResponse(ClubPost post) {
                List<CommunityPostCommentResponse> comments = commentRepository
                                .findByPostIdOrderByCreatedAtAsc(post.getId()).stream()
                                .map(this::buildCommentResponse)
                                .collect(Collectors.toList());

                return CommunityPostResponse.builder()
                                .id(post.getId())
                                .authorId(post.getAuthor().getId())
                                .authorName(post.getAuthor().getFullName())
                                .authorAvatarUrl(post.getAuthor().getAvatarUrl())
                                .content(post.getContent())
                                .createdAt(post.getCreatedAt())
                                .comments(comments)
                                .build();
        }

        private CommunityPostCommentResponse buildCommentResponse(ClubPostComment comment) {
                return CommunityPostCommentResponse.builder()
                                .id(comment.getId())
                                .authorId(comment.getAuthor().getId())
                                .authorName(comment.getAuthor().getFullName())
                                .authorAvatarUrl(comment.getAuthor().getAvatarUrl())
                                .content(comment.getContent())
                                .createdAt(comment.getCreatedAt())
                                .build();
        }

        private void ensureJoined(Long clubId, Long userId) {
                if (membershipRepository.findByUserIdAndClubIdAndLeftAtIsNull(userId, clubId).isEmpty()) {
                        throw new IllegalArgumentException("Join the club to continue");
                }
        }
}
