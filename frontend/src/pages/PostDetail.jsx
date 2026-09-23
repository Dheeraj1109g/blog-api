import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getPost,
  getComments,
  addComment,
  deletePost,
} from '../api.js';
import { useAuth } from '../auth.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../utils.js';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getPost(id), getComments(id)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  // The backend enforces ownership (403), but we match its rule client-side:
  // the logged-in username equals the post's author field.
  const canManage = !!(user && post && post.author === user.username);

  const onDelete = async () => {
    try {
      await deletePost(id);
      navigate('/');
    } catch (e) {
      setError(e.message);
      setConfirmDelete(false);
    }
  };

  const onSubmitComment = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const c = await addComment(id, draft.trim());
      setComments((prev) => [...prev, c]);
      setDraft('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <Spinner label="Loading article…" />;
  if (error && !post) return <div className="alert alert-error">{error}</div>;
  if (!post) return null;

  return (
    <article className="post-detail">
      <Link to="/" className="back-link">
        ← Back to feed
      </Link>

      <header className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="avatar">{post.author?.[0]?.toUpperCase()}</span>
          <div>
            <div className="meta-author">{post.author}</div>
            <time className="muted">
              Published {formatDate(post.created_at)}
              {post.updated_at ? ` · Updated ${formatDate(post.updated_at)}` : ''}
            </time>
          </div>
          {canManage && (
            <div className="post-actions">
              <Link to={`/posts/${post.id}/edit`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
              {confirmDelete ? (
                <span className="confirm-delete">
                  <button className="btn btn-danger btn-sm" onClick={onDelete}>
                    Confirm delete
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  className="btn btn-ghost btn-sm danger-text"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="post-body">{post.content}</div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="comments">
        <h2>Comments <span className="count-badge">{comments.length}</span></h2>

        {user ? (
          <form className="comment-form" onSubmit={onSubmitComment}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              required
            />
            <button
              className="btn btn-primary"
              disabled={posting || !draft.trim()}
              type="submit"
            >
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="muted comment-login-hint">
            <Link to="/login">Log in</Link> to join the discussion.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="muted">No comments yet — be the first.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment">
                <div className="comment-head">
                  <span className="avatar avatar-sm">#{c.owner_id}</span>
                  <span className="muted">{formatDate(c.created_at)}</span>
                </div>
                <p>{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
