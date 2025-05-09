import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/Auth.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    if (!form.username) newErrors.username = 'Username is required'
    if (!form.email) newErrors.email = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (form.password && form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (form.username && form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await axios.post('http://localhost:5000/api/auth/register', form)
      navigate('/login')
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      setErrors({ submit: message })
    } finally {
      setIsLoading(false)
    }
  }  
  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Create Account</h2>

        <div className="auth-input-group">
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={form.username}
            className={`auth-input ${errors.username ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.username && <span className="auth-error">{errors.username}</span>}
        </div>

        <div className="auth-input-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            className={`auth-input ${errors.email ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.email && <span className="auth-error">{errors.email}</span>}
        </div>

        <div className="auth-input-group">
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            className={`auth-input ${errors.password ? 'error' : ''}`}
            disabled={isLoading}
          />
          {errors.password && <span className="auth-error">{errors.password}</span>}
        </div>

        {errors.submit && <div className="auth-submit-error">{errors.submit}</div>}

        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
