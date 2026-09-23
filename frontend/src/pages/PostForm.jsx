import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPost, updatePost, getPost } from '../api.js';
import { useAuth } from '../auth.jsx';
import Spinner from '../components/Spinner.jsx';

export default function PostForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEdit = mode === 'edit';
  const [title, setTitle] = useState('');
  // Author must equal the logged-in username — backend only allows
  // owners (matched by username) to edit/delete their posts.
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getPost(id)
      .then((p) => {
        if (user && p.author !== user.username) {
          setError('You can only edit your own posts.');
          return;
        }
        setTitle(p.title);
        setContent(p.content);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isEdit, id, user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updatePost(id, { title: title.trim(), content: content.trim() });
        navigate(`/posts/${id}`);
      } else {
        const post = await createPost({
          title: title.trim(),
          content: content.trim(),
          author: user.username,
        });
        navigate(`/posts/${post.id}`);
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading…" />;

  return (
    <div className="form-page">
      <Link to={isEdit ? `/posts/${id}` : '/'} className="back-link">
        ← Cancel
      </Link>
      <h1>{isEdit ? 'Edit article' : 'Write a new article'}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="card form" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A catchy headline…"
            maxLength={200}
            required
          />
        </label>

        {!isEdit && (
          <label className="field">
            <span>Author</span>
            <input type="text" value={user?.username || ''} readOnly disabled />
            <small className="muted">Posts are published under your username.</small>
          </label>
        )}

        <label className="field">
          <span>Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your story…"
            rows={12}
            required
          />
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
