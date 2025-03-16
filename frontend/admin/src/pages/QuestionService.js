import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuestionService() {
  const [title, setTitle] = useState('');
  const [description, setDecription] = useState('');
  const [categories, setCategories] = useState('');
  const [complexity, setComplexity] = useState('');
  const [link, setLink] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestions, setEditingQuestionId] = useState(null);

  // Fetch all questions
  const fetchQuestion = async () => {
    try {
      const response = await axios.get('http://localhost:3002/questions');
      setQuestions(response.data.data);
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  // Handle form submit (create or update question)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = { title, description, categories, complexity, link };

    try {
      if (editingQuestions) {
        await axios.patch(`http://localhost:3002/questions/${editingQuestions}`, newQuestion);
        alert('Question updated successfully!');
      } else {
        await axios.post('http://localhost:3002/questions', newQuestion);
        alert('Question created successfully!');
      }

      setTitle('');
      setDecription('');
      setCategories('');
      setComplexity('');
      setLink('');
      setEditingQuestionId(null);
      fetchQuestion();
    } catch (error) {
      console.error("Error submitting question", error);
    }
  };

  // Edit question details
  const handleEdit = (question) => {
    setTitle(question.title);
    setDecription(question.description);
    setCategories(question.categories);
    setComplexity(question.complexity);
    setLink(question.link);
    setEditingQuestionId(question._id);
  };

  // Delete question
  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`http://localhost:3002/questions/${questionId}`);
      alert('Question deleted successfully!');
      fetchQuestion();
    } catch (error) {
      console.error("Error deleting question", error);
    }
  };

  // Styles
  const inputStyle = {
    width: '100%', 
    padding: '8px', 
    fontSize: '16px', 
    boxSizing: 'border-box',
    border: '1px solid #ccc', 
    borderRadius: '4px'
  };
  const tableStyle = {
    width: '100%', // Limit table width
    margin: '20px auto', // Center the table
    borderCollapse: 'collapse',
    fontSize: '18px',
    textAlign: 'left',
    border: '2px solid black',
    backgroundColor: 'white', // Keep it clean
  };

  const thTdStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd',
  };

  const stripedRowStyle = {
    backgroundColor: '#f9f9f9',
  };

  const buttonStyle = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '5px',
    transition: '0.3s',
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007BFF',
    color: 'white',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#DC3545',
    color: 'white',
  };

  return (
    <div className="Home">
      <h1>Question Service</h1>

      <button 
        style={{ ...buttonStyle, backgroundColor: '#28A745', color: 'white' }} 
        onClick={() => fetchQuestion()}
      >
        Get All Questions
      </button>

      {/* Question Form */}
      <form onSubmit={handleSubmit}>
        <table style={tableStyle}>
          <tbody>
            <tr style={stripedRowStyle}>
              <td style={thTdStyle}><b>Title</b></td>
              <td style={thTdStyle}>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  style={inputStyle}
                />
              </td>
            </tr>
            <tr>
              <td style={thTdStyle}><b>Description</b></td>
              <td style={thTdStyle}>
                <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDecription(e.target.value)} 
                  required 
                  style={inputStyle}
                />  
              </td>
            </tr>
            <tr style={stripedRowStyle}>
              <td style={thTdStyle}><b>Categories</b></td>
              <td style={thTdStyle}>
                <input 
                  type="text" 
                  value={categories} 
                  onChange={(e) => setCategories(e.target.value)} 
                  required 
                  style={inputStyle}
                />
              </td>
            </tr>
            <tr>
              <td style={thTdStyle}><b>Complexity</b></td>
              <td style={thTdStyle}>
                <select 
                  value={complexity} 
                  onChange={(e) => setComplexity(e.target.value)} 
                  required
                  style={inputStyle}
                >
                  <option value="">--Choose an option--</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </td>
            </tr>
            <tr style={stripedRowStyle}>
              <td style={thTdStyle}><b>Link</b></td>
              <td style={thTdStyle}>
                <input 
                  type="url" 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  required 
                  style={inputStyle}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ textAlign: 'left', padding: '10px' }}>
                <button 
                  type="submit" 
                  style={{ ...buttonStyle, backgroundColor: '#FFC107', color: 'black' }}
                >
                  {editingQuestions ? 'Update Question' : 'Create Question'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <h2>Questions List</h2>
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: '#343A40', color: 'white' }}>
            <th style={thTdStyle}>Title</th>
            <th style={thTdStyle}>Complexity</th>
            <th style={thTdStyle}>Categories</th>
            <th style={thTdStyle}>Link</th>
            <th style={thTdStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question._id} style={stripedRowStyle}>
              <td style={thTdStyle}>{question.title}</td>
              <td style={thTdStyle}>{question.complexity}</td>
              <td style={thTdStyle}>{question.categories.join(', ')}</td>
              <td style={thTdStyle}>
                <a href={question.link} target="_blank" rel="noopener noreferrer">{question.link}</a>
              </td>
              <td style={thTdStyle}>
                <button style={editButtonStyle} onClick={() => handleEdit(question)}>Edit</button>
                <button style={deleteButtonStyle} onClick={() => handleDelete(question._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuestionService;