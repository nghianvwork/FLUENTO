import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ArrowLeft, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityApi } from '../../services/apiServices';
import {
  CommunityClubDetail,
  CommunityClubMember,
  CommunityPost,
} from '../../types';

export default function CommunityClub() {
  const { id } = useParams();
  const clubId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const [detail, setDetail] = useState<CommunityClubDetail | null>(null);
  const [members, setMembers] = useState<CommunityClubMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commenting, setCommenting] = useState<Record<number, boolean>>({});

  const loadClub = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const [detailRes, memberRes, postRes] = await Promise.all([
        communityApi.getClubDetail(clubId),
        communityApi.getClubMembers(clubId),
        communityApi.getClubPosts(clubId),
      ]);
      setDetail(detailRes.data.data);
      setMembers(memberRes.data.data);
      setPosts(postRes.data.data);
    } catch {
      toast.error('Khong the tai thong tin club');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClub();
  }, [clubId]);

  const toggleJoin = async () => {
    if (!detail) return;
    try {
      const res = detail.joined
        ? await communityApi.leaveClub(detail.id)
        : await communityApi.joinClub(detail.id);
      setDetail(res.data.data);
      const memberRes = await communityApi.getClubMembers(detail.id);
      setMembers(memberRes.data.data);
      toast.success(res.data.data.joined ? 'Joined club' : 'Left club');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to update club';
      toast.error(message);
    }
  };

  const handlePost = async () => {
    if (!detail) return;
    if (!postContent.trim()) return;
    if (!detail.joined) {
      toast.error('Join club to post');
      return;
    }
    setPosting(true);
    try {
      const res = await communityApi.createClubPost(detail.id, { content: postContent.trim() });
      setPosts((prev) => [res.data.data, ...prev]);
      setPostContent('');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to post';
      toast.error(message);
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (postId: number) => {
    if (!detail) return;
    const content = commentDrafts[postId] || '';
    if (!content.trim()) return;
    if (!detail.joined) {
      toast.error('Join club to comment');
      return;
    }
    setCommenting((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await communityApi.addClubComment(detail.id, postId, { content: content.trim() });
      setPosts((prev) => prev.map((post) => post.id === postId
        ? { ...post, comments: [...post.comments, res.data.data] }
        : post));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Unable to comment';
      toast.error(message);
    } finally {
      setCommenting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  if (!detail && loading) {
    return <div className="text-center text-muted" style={{ padding: 80 }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/app/community')} style={{ marginBottom: 12 }}>
          <ArrowLeft size={14} /> Back to Community
        </button>
        <div className="page-title">{detail?.name || 'Community Club'}</div>
        <div className="page-subtitle">{detail?.focus} · {detail?.level} · {detail?.members || 0} members</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Club Overview</div>
            <div className="text-sm text-muted">Join to unlock posts, comments, and member-only threads.</div>
          </div>
          <button className="btn btn-primary" onClick={toggleJoin} disabled={loading}>
            {detail?.joined ? 'Leave Club' : 'Join Club'}
          </button>
        </div>
      </div>

      <div className="card-grid" style={{ alignItems: 'start' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Club Posts</div>
              <div className="card-desc">Share ideas, ask questions, and learn together</div>
            </div>
            <MessageSquare size={18} color="var(--accent-cyan)" />
          </div>

          <div className="chat-input-area" style={{ marginBottom: 16, padding: 0, borderTop: 'none' }}>
            <input
              className="chat-input"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share an update with the club..."
            />
            <button className="btn btn-primary" onClick={handlePost} disabled={posting}>
              {posting ? '...' : 'Post'}
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="text-sm text-muted">No posts yet. Be the first to start the conversation.</div>
          ) : posts.map((post) => (
            <div key={post.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600 }}>{post.authorName}</div>
              <div className="text-sm text-muted" style={{ marginBottom: 8 }}>{new Date(post.createdAt).toLocaleString()}</div>
              <div style={{ marginBottom: 12 }}>{post.content}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="chat-message ai" style={{ maxWidth: '100%' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{comment.authorName}</div>
                    <div className="text-sm text-muted" style={{ marginBottom: 6 }}>{new Date(comment.createdAt).toLocaleString()}</div>
                    <div>{comment.content}</div>
                  </div>
                ))}
                {post.comments.length === 0 && (
                  <div className="text-sm text-muted">No replies yet.</div>
                )}
              </div>

              <div className="chat-input-area" style={{ padding: 0, borderTop: 'none' }}>
                <input
                  className="chat-input"
                  value={commentDrafts[post.id] || ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  placeholder="Write a reply..."
                />
                <button
                  className="btn btn-secondary"
                  onClick={() => handleComment(post.id)}
                  disabled={commenting[post.id]}
                >
                  {commenting[post.id] ? '...' : 'Reply'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Members</div>
              <div className="card-desc">Active learners in this club</div>
            </div>
            <Users size={18} color="var(--accent-orange)" />
          </div>
          {members.length === 0 ? (
            <div className="text-sm text-muted">No members yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 600 }}>{member.fullName}</div>
                    <div className="text-sm text-muted">{member.role}</div>
                  </div>
                  <span className="badge badge-cyan">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
