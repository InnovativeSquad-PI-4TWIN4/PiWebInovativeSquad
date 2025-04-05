import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSave, FaTrash, FaTags, FaFolder, FaSpinner, FaExclamationTriangle, FaEye, FaEdit } from 'react-icons/fa';
import './Notes.scss';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [categories] = useState(['Personal', 'Work', 'Study', 'Other']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:3000/api/notes';

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        setIsEmpty(true);
        setNotes([]);
      } else {
        setIsEmpty(false);
        setNotes(data.data);
        if (!activeNote) {
          selectNote(data.data[0]._id, 'view');
        }
      }
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError(err.message || 'Failed to connect to server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [token]);

  const createNewNote = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Create a temporary local note first
      const tempNote = {
        _id: `temp-${Date.now()}`,
        title: 'Untitled Note',
        content: '',
        category: 'Personal',
        tags: [],
        updatedAt: new Date().toISOString(),
        user: 'local-user'
      };
  
      // Optimistically update the UI
      setNotes(prevNotes => [tempNote, ...prevNotes]);
      setActiveNote(tempNote._id);
      setTitle(tempNote.title);
      setContent(tempNote.content);
      setTags(tempNote.tags);
      setSelectedCategory(tempNote.category);
      setIsEmpty(false);
      setViewMode('edit');
  
      // Then try to save to server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: tempNote.title,
          content: tempNote.content,
          category: tempNote.category,
          tags: tempNote.tags
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create note on server');
      }
  
      const result = await response.json();
      const newNote = result.data;
  
      // Update the state with the server-created note
      setNotes(prevNotes => prevNotes.map(note => 
        note._id === tempNote._id ? newNote : note
      ));
      setActiveNote(newNote._id);
      
    } catch (err) {
      console.error('Error creating note:', err);
      // Revert the optimistic update if there was an error
      setNotes(prevNotes => prevNotes.filter(note => note._id !== tempNote._id));
      setError(err.message || 'Note created locally but failed to save to server');
      
      // If there are no other notes, reset to empty state
      if (notes.length === 0) {
        setIsEmpty(true);
        setActiveNote(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const selectNote = (id, mode = 'view') => {
    const note = notes.find(note => note._id === id);
    if (note) {
      setActiveNote(id);
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setSelectedCategory(note.category || 'Personal');
      setViewMode(mode);
    }
  };

  const saveNote = async () => {
    if (!activeNote) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`${API_URL}/${activeNote}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          category: selectedCategory,
          tags
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update note');
      }
  
      const updatedNote = await response.json();
      
      // Update the notes list with the new data
      setNotes(prevNotes => prevNotes.map(note => 
        note._id === activeNote ? { ...note, ...updatedNote.data } : note
      ));
      
      // Also update the active note's data
      setTitle(updatedNote.data.title);
      setContent(updatedNote.data.content);
      setTags(updatedNote.data.tags || []);
      setSelectedCategory(updatedNote.data.category || 'Personal');
      setViewMode('view');
      
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.message || 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!activeNote) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`${API_URL}/${activeNote}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete note');
        }

        const filteredNotes = notes.filter(note => note._id !== activeNote);
        setNotes(filteredNotes);
        
        if (filteredNotes.length > 0) {
          selectNote(filteredNotes[0]._id, 'view');
        } else {
          setActiveNote(null);
          setTitle('');
          setContent('');
          setTags([]);
          setSelectedCategory('Personal');
          setIsEmpty(true);
        }
      } catch (err) {
        console.error('Error deleting note:', err);
        setError(err.message || 'Failed to delete note. Please try again.');
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() !== '' && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
    }
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const changeCategory = (category) => {
    setSelectedCategory(category);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="notes-loading">
        <FaSpinner className="spinning-icon" />
        <p>Loading your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notes-error">
        <div className="error-icon">
          <FaExclamationTriangle />
        </div>
        <h3>Couldn't load notes</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={fetchNotes}>
            <FaSpinner className="spinning-icon" /> Retry
          </button>
          {notes.length === 0 && (
            <button onClick={createNewNote} disabled={saving}>
              <FaPlus /> Create Local Note
            </button>
          )}
        </div>
        {notes.length > 0 && (
          <div className="local-notes-warning">
            <p>You have local notes that haven't been saved to the server</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-sidebar">
        <div className="notes-actions">
          <button className="new-note-btn" onClick={createNewNote} disabled={saving}>
            {saving ? <FaSpinner className="spinning-icon" /> : <FaPlus />} New Note
          </button>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="category-filter">
          <div className="category-header">
            <FaFolder className="category-icon" />
            <span>Categories</span>
          </div>
          <div className="category-list">
            <div
              className={`category-item ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All Notes
            </div>
            {categories.map(category => (
              <div
                key={category}
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        
        <div className="notes-list">
          {isEmpty ? (
            <div className="no-notes">
              <p>You don't have any notes yet</p>
              <button className="create-first-note" onClick={createNewNote}>
                Create Your First Note
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="no-notes">
              {searchTerm ? 'No notes match your search' : 'No notes in this category'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note._id}
                className={`note-item ${activeNote === note._id ? 'active' : ''}`}
                onClick={() => selectNote(note._id, 'view')}
              >
                <h3 className="note-item-title">{note.title}</h3>
                <p className="note-item-preview">
                  {note.content.substring(0, 60)}
                  {note.content.length > 60 ? '...' : ''}
                </p>
                <div className="note-item-meta">
                  <span className="note-item-date">
                    {formatDate(note.updatedAt)}
                  </span>
                  <span className="note-item-category">{note.category}</span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="note-item-tags">
                    {note.tags.map(tag => (
                      <span key={tag} className="note-tag small">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="note-editor">
        {activeNote === null ? (
          <div className="no-note-selected">
            <div className="no-note-icon">📝</div>
            <h2>No Note Selected</h2>
            <p>{isEmpty ? 'Create your first note to get started' : 'Select a note from the sidebar'}</p>
            <button className="create-first-note" onClick={createNewNote}>
              {isEmpty ? 'Create Your First Note' : 'Create New Note'}
            </button>
          </div>
        ) : (
          <>
            <div className="note-toolbar">
              <div className="note-info">
                {viewMode === 'edit' ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="note-title-input"
                    placeholder="Note Title"
                  />
                ) : (
                  <h2 className="note-title">{title}</h2>
                )}
                <div className="note-metadata">
                  Last edited: {formatDate(notes.find(note => note._id === activeNote)?.updatedAt)}
                </div>
              </div>
              <div className="note-actions">
                {viewMode === 'edit' ? (
                  <>
                    <select
                      value={selectedCategory}
                      onChange={(e) => changeCategory(e.target.value)}
                      className="category-select"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <button 
                      className="save-note-btn" 
                      onClick={saveNote}
                      disabled={saving}
                    >
                      {saving ? <FaSpinner className="spinning-icon" /> : <FaSave />} Save
                    </button>
                    <button className="delete-note-btn" onClick={deleteNote}>
                      <FaTrash /> Delete
                    </button>
                  </>
                ) : (
                  <button 
                    className="edit-note-btn" 
                    onClick={() => setViewMode('edit')}
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
            </div>
            
            <div className="tags-container">
              <div className="tags-header">
                <FaTags className="tags-icon" />
                <span>Tags:</span>
              </div>
              <div className="tags-list">
                {tags.map(tag => (
                  <div key={tag} className="note-tag">
                    {tag}
                    {viewMode === 'edit' && (
                      <span className="remove-tag" onClick={() => removeTag(tag)}>×</span>
                    )}
                  </div>
                ))}
                {viewMode === 'edit' && (
                  showTagInput ? (
                    <div className="tag-input-container">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onBlur={addTag}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="tag-input"
                        placeholder="Add tag..."
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button className="add-tag-btn" onClick={() => setShowTagInput(true)}>
                      <FaPlus /> Add Tag
                    </button>
                  )
                )}
              </div>
            </div>
            
            <div className="note-content-container">
              {viewMode === 'edit' ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="note-content"
                  placeholder="Start writing your note here..."
                />
              ) : (
                <div className="note-content-view">
                  {content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph || <br />}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;