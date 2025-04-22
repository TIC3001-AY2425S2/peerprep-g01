import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './QuestionService.css';

function QuestionService() {
  const [title, setTitle] = useState('');
  const [description, setDecription] = useState('');
  const [categories, setCategories] = useState('');
  const [complexity, setComplexity] = useState('');
  const [link, setLink] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestions, setEditingQuestionId] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [complexityFilter, setComplexityFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showComplexityDropdown, setShowComplexityDropdown] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredDescription, setHoveredDescription] = useState(null);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);


  // Fetch all questions
  const fetchQuestion = async () => {
    try {
      const response = await axios.get('http://localhost:3002/questions');
      setQuestions(response.data.data);
      setFilteredQuestions(response.data.data);
      setCurrentPage(1);
    } 
    catch (error) {
      if (error.response){
        const data = error.response.data;
        console.error("Error fetching question: ", data.message);
        alert(`Error fetching question: ${data.message}`);
      }
      else{
        const unknownError = "Error fetching question: Unknown Error";
        console.error(unknownError);
        alert(unknownError);
      }
    }
  };

  // Complexity filtering function
  const applyFilters = useCallback(() => {
    let results = questions;

    // Apply the filtering function based on Easy, Medium, Hard
    if (complexityFilter !== 'All'){
      results = results.filter((question) => question.complexity === complexityFilter);
    }

    // Apply the filtering function based on the search keyword
    if (searchKeyword){
      const lowercaseKeyword = searchKeyword.toLowerCase();
      results = results.filter(question => question.title.toLowerCase().includes(lowercaseKeyword) ||
                                        question.description.toLowerCase().includes(lowercaseKeyword) ||
                                        (Array.isArray(question.categories) ? question.categories.some(cat => cat.toLowerCase().includes(lowercaseKeyword)) :
                                        question.categories.toLowerCase().includes(lowercaseKeyword))
      );
    }

    setFilteredQuestions(results);
    setCurrentPage(1);
  }, [questions, complexityFilter, searchKeyword]);

  // Complexity filtering change handler
  const handleComplexityFilterChange = (complexity) => {
    setComplexityFilter(complexity);
    setShowComplexityDropdown(false);
  };

  // Search function using keyword
  const handleSearch = () => {
    setSearchKeyword(searchInputValue);
  };

  // To reset the filtering
  const resetFilters = () => {
    setSearchInputValue('');
    setSearchKeyword('');
    setComplexityFilter('All');
    setFilteredQuestions(questions);
    setCurrentPage(1);
  };

  // Page number selection dut to rows per page selecttion
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Display the question in current page if rows per page is selected
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  
  // To calculate the total page
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
        alert('Question updated successfully');
      } else {
        await axios.post('http://localhost:3002/questions', newQuestion);
        alert('Question created successfully');
      }

      setTitle('');
      setDecription('');
      setCategories('');
      setComplexity('');
      setLink('');
      setEditingQuestionId(null);
      fetchQuestion();
      // Hide the create question form. only show the form when click on "create question"
      setShowForm(false);
    } 
    catch (error) {
      if (error.response){
        const data = error.response.data;
        console.error("Error submitting question: ", data.message);
        alert(`Error submitting question: ${data.message}`);
      }
      else{
        const unknownError = "Error submitting question: Unknown Error";
        console.error(unknownError);
        alert(unknownError);
      }
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
    // Show the question form when edit button is press
    setShowForm(true);
  };

  // Delete question
  const handleDelete = async (questionId) => {
    // Add in feedback to confirm on the question deletion
    if (window.confirm('Kindy confirm that you want to delete this question?')){
      try {
        await axios.delete(`http://localhost:3002/questions/${questionId}`);
        alert('Question deleted successfully!');
        fetchQuestion();
      } 
      catch (error) {
        if (error.response){
          const data = error.response.data;
          console.error("Error deleting question: ", data.message);
          alert(`Error deleting question: ${data.message}`);
        }
        else{
          const unknownError = "Error deleting question: Unknown Error";
          console.error(unknownError);
          alert(unknownError);
        }
      }
    }
  };

  // To reset the form
  const resetForm = () => {
    setTitle('');
    setDecription('');
    setCategories('');
    setComplexity('');
    setLink('');
    setEditingQuestionId(null);
    setShowForm(false);
  }

  // To show all the description of the question when hover on the question
  const dynamicTooltipStyle = {
    opacity: hoveredDescription ? 1 : 0,
    left: `${tooltipPosition.x}px`,
    top: `${tooltipPosition.y}px`,
  };

  const formCardStyle = {
    display: showForm ? 'block' : 'none'
  };

  // Display drop down list for selection of complexity
  const dropdownContentStyle = {
    display: showComplexityDropdown ? 'block' : 'none'
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Question Service</h1>
        <div>
          {!showForm ? (
            <button className="btn btn-edit" onClick={() => setShowForm(true)}>
              Create New Question
            </button>
          ) : (
            <button className="btn btn-resetform" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button 
            className="btn btn-success margin-left-10" onClick={() => {
              fetchQuestion();
              resetFilters();
            }}
          >
            Get All Questions
          </button>
        </div>
      </div>

      {/* Question Form */}
      <div className="createquestion" style={formCardStyle}>
        <h2>{editingQuestions ? 'Edit Question' : 'Create New Question'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label className="label">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  className="input"
                  placeholder="Enter Question Title"
                />
              </div>
            </div>
            <div className="form-col">
              <div className="form-group">
                <label className="label">Complexity</label>                
                <select 
                  value={complexity} 
                  onChange={(e) => setComplexity(e.target.value)} 
                  required
                  className="input"
                >
                  <option value="">--Choose an option--</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Categories</label>
            <input 
              type="text" 
              value={categories}
              onChange={(e) => setCategories(e.target.value)} 
              required 
              className="input"
              placeholder="Enter categories"
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDecription(e.target.value)} 
              required 
              className="textarea"
              placeholder="Enter question description"
            />
          </div>
          
          <div className="form-group">
            <label className="label">Link</label>
            <input 
              type="url" 
              value={link} 
              onChange={(e) => setLink(e.target.value)} 
              required 
              className="input"
              placeholder="Enter question link"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-edit">
              {editingQuestions ? 'Update Question' : 'Create Question'}
            </button>
            <button type="button" className="btn btn-resetform" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="createquestion">
        <div className="list-header">
          <h2>Questions List</h2>
          {/*For search keyword*/}
          <div className="search-container">
            <div className="flex-row">
              {/* Complexity Filter Dropdown List*/}
              <div className="complexity-dropdown">

                <button className="complexity-button" onClick={() => setShowComplexityDropdown(!showComplexityDropdown)}>
                  Complexity
                  {/* Dropdown list icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </button>

                {/*To select the complexity level*/}
                <div className="dropdown-content" style={dropdownContentStyle}>
                  
                  <div className={`dropdown-item ${complexityFilter === 'All' ? 'dropdown-item-selected' : ''}`} onClick={() => handleComplexityFilterChange('All')}>
                    <span className="all-selection">All</span>
                  </div>

                  <div className={`dropdown-item ${complexityFilter === 'Easy' ? 'dropdown-item-selected' : ''}`} onClick={() => handleComplexityFilterChange('Easy')}>
                    <span className="easy-selection">Easy</span>
                  </div>

                  <div className={`dropdown-item ${complexityFilter === 'Medium' ? 'dropdown-item-selected' : ''}`} onClick={() => handleComplexityFilterChange('Medium')}>
                    <span className="medium-selection">Medium</span>
                  </div>

                  <div className={`dropdown-item ${complexityFilter === 'Hard' ? 'dropdown-item-selected' : ''}`} onClick={() => handleComplexityFilterChange('Hard')}>
                    <span className="hard-selection">Hard</span>
                  </div>
                </div>
              </div>

              {/* Search function using keyword */}
              <div className="search-input-value">

                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-keyword"
                />

                <button className="search-button" onClick={handleSearch}>
                  {/* Search icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </button>

              </div>
            </div>

            {/* Search function using keyword */}
            {(searchKeyword || complexityFilter !== 'All') && (
              <button className="btn btn-resetfilter margin-left-10" onClick={resetFilters}>
                Clear Search
              </button>
            )}

          </div>
        </div>

        <table className="table">

          <thead>
            <tr>
              <th className="th">Title</th>
              <th className="th">Complexity</th>
              <th className="th">Categories</th>
              <th className="th">Description</th>
              <th className="th">Link</th>
              <th className="th">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentQuestions.length > 0 ? (
              currentQuestions.map((question) => (
                <tr key={question._id} className="white-row">
                  <td className="td">{question.title}</td>

                  <td className="td">
                    <span className={`complexity-badge complexity-badge-${question.complexity.toLowerCase()}`}>
                      {question.complexity}
                    </span>
                  </td>

                  <td className="td">
                    {Array.isArray(question.categories) ? 
                      question.categories.map((cat, index) => (<span key={index} className="category-question">{cat}</span>)) : 
                      <span className="category-question">{question.categories}</span>
                    }
                  </td>

                  <td 
                    className="td hovercell"
                    onMouseEnter={(e) => {
                      setHoveredDescription(question.description);
                      setTooltipPosition({ 
                        x: e.clientX + 10, 
                        y: e.clientY + 10 
                      });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPosition({ 
                        x: e.clientX + 10, 
                        y: e.clientY + 10 
                      });
                    }}
                    onMouseLeave={() => setHoveredDescription(null)}> {question.description}
                  </td>
                  
                  {/*To enable hyperlink in the page */}
                  <td className="td">
                    <a href={question.link} target="_blank" rel="noopener noreferrer" className="link-button">
                      View Problem
                    </a>
                  </td>

                  <td className="td">
                    {/* Edit and Delete button on the page*/}
                    <div className="action-buttons">
                      <button className="edit-button" onClick={() => handleEdit(question)}>
                        Edit
                      </button>

                      <button className="delete-button" onClick={() => handleDelete(question._id)}>
                        Delete
                      </button>
                    </div>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="td no-questions-button">
                  No questions found. Click "Create New Question" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* To select rows per page*/}
        <div className="rowsperpage">
          <div className="questions-per-page">
            <span className="per-page-label">Rows per page:</span>
            <select value={questionsPerPage} onChange={(e) => {
                setQuestionsPerPage(Number(e.target.value));
                setCurrentPage(1); 
              }}
              className="select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          {/*To go to Previous page when you are at the next page*/}
          <div className="previous-button">
            <button onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)} 
              disabled={currentPage === 1}
              className={currentPage === 1 ? "page-button disabled-page-button" : "page-button"}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
              let pageNumber;
              
              // Determine which page numbers to show based on current page
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={currentPage === pageNumber ? "page-button active-page-button" : "page-button"}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {/*To go to Next page when you are at the previous page*/}
            <button onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)} disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "page-button disabled-page-button" : "page-button"}>
              Next
            </button>

          </div>
        </div>
      </div>

      {/* Hover to show the description*/}
      {hoveredDescription && (
        <div className="hovered-description" style={dynamicTooltipStyle}>
          {hoveredDescription}
        </div>
      )}
    </div>
  );
}

export default QuestionService;