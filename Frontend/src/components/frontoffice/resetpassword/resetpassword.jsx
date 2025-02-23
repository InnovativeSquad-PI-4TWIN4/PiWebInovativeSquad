import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.scss';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { token } = useParams(); // Capture le token depuis l'URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:3000/users/reset-password/${token}`, {
                password: newPassword
            });
            setMessage(response.data.message);

            setTimeout(() => {
                navigate('/signin'); // ✅ Redirection vers Sign In après succès
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-box">
                <h2>Reset Password</h2>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
