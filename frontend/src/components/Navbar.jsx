import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">✒︎</span> Inkwell
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            Feed
          </NavLink>
          {user && (
            <NavLink to="/new" className="nav-link">
              Write
            </NavLink>
          )}
        </nav>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-chip" title={user.username}>
                <span className="avatar">{user.username[0]?.toUpperCase()}</span>
                {user.username}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
