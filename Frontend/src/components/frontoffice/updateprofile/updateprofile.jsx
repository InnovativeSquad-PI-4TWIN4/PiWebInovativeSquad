import React, { useState, useEffect } from 'react';
import './UpdateProfile.scss';

const UpdateProfile = ({ user }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        dateOfBirth: '',
        Skill: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                surname: user.surname || '',
                email: user.email || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                Skill: user.Skill || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/users/updateProfile/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                alert(data.message || 'An error occurred during the update.');
            }
        } catch (err) {
            console.error('Update profile error:', err);
        }
    };

    return (
        <div className="update-profile-container">
            <div className="update-profile-box">
                <h2>Update Profile</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                    <input type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                    <input type="text" name="Skill" value={formData.Skill} onChange={handleChange} placeholder="Skill" />
                    <button type="submit">Update</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
