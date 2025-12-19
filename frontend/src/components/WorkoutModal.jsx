import React, { useState } from 'react'
import { createWorkout, deleteWorkout } from '../api'
import './WorkoutModal.css'

function WorkoutModal({ date, isOpen, onClose, existingWorkout, onWorkoutUpdated }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [notes, setNotes] = useState(existingWorkout?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today
  const hasWorkout = !!existingWorkout

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isToday) {
      setError('You can only mark workouts for today')
      return
    }

    if (!image && !hasWorkout) {
      setError('Please upload a gym selfie')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (hasWorkout) {
        // Delete existing workout
        await deleteWorkout(date)
        onWorkoutUpdated()
        onClose()
      } else {
        // Create new workout
        await createWorkout(date, image, notes)
        onWorkoutUpdated()
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Failed to save workout')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setImage(null)
    setImagePreview(null)
    setNotes(existingWorkout?.notes || '')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{hasWorkout ? 'Workout Details' : 'Mark Workout as Done'}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        {!isToday && (
          <div className="error-message">
            You can only mark workouts for today ({today})
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {hasWorkout && (
          <div className="existing-workout">
            <div className="workout-image">
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${existingWorkout.image_url}`} 
                alt="Gym selfie"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            {existingWorkout.notes && (
              <div className="workout-notes">
                <strong>Notes:</strong>
                <p>{existingWorkout.notes}</p>
              </div>
            )}
          </div>
        )}

        {!hasWorkout && isToday && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="image">
                Gym Selfie (Required) *
                <span className="help-text">Photo must be taken today</span>
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                required
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Workout Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Bench press 3x5 @ 185lbs, Squats 3x8 @ 225lbs..."
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={loading || !image}>
                {loading ? 'Saving...' : 'Mark as Done'}
              </button>
            </div>
          </form>
        )}

        {hasWorkout && isToday && (
          <div className="modal-actions">
            <button 
              className="delete-button" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Remove Workout'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutModal

