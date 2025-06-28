import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjusted path
import '../css/Login.css'; // Adjusted path
import google_logo from '../assets/google-logo.png'; // Adjusted path

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from AuthContext

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json(); // Backend should send userId, username, email, profileComplete

            if (response.ok) {
                console.log('Login successful (raw backend response):', data);

                // Construct a complete user object from backend response
                const userDataForContext = {
                    _id: data.userId, // Use _id for consistency with MongoDB IDs
                    id: data.userId, // Keep 'id' for flexibility if other parts use it
                    username: data.username,
                    email: data.email,
                    profileComplete: data.profileComplete,
                };

                console.log('Login successful (userData passed to AuthContext):', userDataForContext);
                login(data.token, userDataForContext);

                // Navigate based on profileComplete status
                if (userDataForContext.profileComplete === false) {
                    navigate('/complete-profile', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }

            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Network error during login:', err);
            setError('An error occurred while logging in. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login to SkillSwap</h2>
                <form onSubmit={handleLogin} className="auth-form">
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>
                    <p className="text-right text-sm">
                        <Link to="/forgotpassword" className="auth-switch-link text-sm">
                            Forgot Password?
                        </Link>
                    </p>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                {/* Social login section moved inside auth-card */}
                <div className="social-login-separator">
                    <hr />
                    <p>OR</p>
                    <hr />
                </div>
                <button className="google-signin-button" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}>
                    <img src={google_logo} alt="Google icon" className="google-icon" />
                    Continue with Google
                </button>

                <p className="auth-switch-link mt-4">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
