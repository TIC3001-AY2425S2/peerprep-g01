import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from "styled-components";


function Home() {
  const [title, setTitle] = useState('');
  const [description, setDecription] = useState('');
  const [categories, setCategories] = useState('');
  const [complexity, setComplexity] = useState('');
  const [link, setLink] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestions, setEditingQuestionId] = useState(null);



  // Create a styled button component
  const BlueButton = styled.button`
    background-color: blue;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background-color: darkblue;
    }
  `;

  const GreenButton = styled.button`
  background-color: green;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;

    &:hover {
      background-color: darkgreen;
    }
`;

  const RedButton = styled.button`
    background-color: red;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background-color: darkred;
    }
  `;

  const GreyButton = styled.button`
    background-color: grey;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background-color: darkgrey;
  }
`;


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
    axios.get('http://localhost:3002/questions')
      .then(response => {
        setQuestions(response.data.data);  // Set items in state
      })
      .catch(error => {
        console.error("There was an error fetching the items:", error);
      });
  }, []);




  // Handle form submit (create or update question)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = { title, description, categories, complexity, link};

    try {
      if (editingQuestions) {
        // Update question
        await axios.patch(`http://localhost:3002/questions/${editingQuestions}`, newQuestion);
        alert('Questions updated successfully!');
      } 
      else {
        // Create new question
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
      alert('User deleted successfully!');
      fetchQuestion();
    } catch (error) {
      console.error("Error deleting question", error);
    }
  };

  // fetch title
  const handlefetch = async () => {
    try {
      await axios.get(`http://localhost:3002/questions/`);
      alert('All questions fetched successfully!');
      fetchQuestion();
    } catch (error) {
      console.error("Error in question title", error);
    }
  };

  return (
    <div className="Home">
      <h1>Question Service</h1>

      <GreyButton onClick={() => handlefetch()}>Get All Questions</GreyButton>

      {/* Question Form */}
      <form onSubmit={handleSubmit}>
        <table border={'1'} style={{ width: '100%', position: "relative", borderCollapse: "collapse", backgroundColor: 'lightblue'}} >
            <tbody>
                <tr>
                    <td width={'20%'}><b>Title</b></td>
                    <td>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </td>
                </tr>
                <tr>
                    <td ><b>Description</b></td>
                    <td>
                        <input type="text" value={description} onChange={(e) => setDecription(e.target.value)} required />  
                    </td>
                </tr>
                <tr>
                    <td><b>Categories</b></td>
                    <td>
                        <input type="text" value={categories} onChange={(e) => setCategories(e.target.value)} required />
                    </td>
                </tr>
                <tr>
                    <td><b>Complexity</b></td>
                    <td>
                        {/* <input type="text" value={complexity} onChange={(e) => setComplexity(e.target.value)} required /> */}
                        <select value={complexity} onChange={(e) => setComplexity(e.target.value)} required>
                          <option value="">--Choose an option--</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td><b>Link</b></td>
                    <td>
                        <input type="url" value={link} onChange={(e) => setLink(e.target.value)} required />
                    </td>
                </tr>
                <tr>
                    <td colSpan={'2'} style={{ textAlign: 'left' }}>
                        {/* <button type="submit">{editingQuestions ? 'Update Question' : 'Create Question'}</button> */}
                        <GreenButton type="submit">{editingQuestions ? 'Update Question' : 'Create Question'}</GreenButton>
                    </td>
                </tr>
            </tbody>
        </table>
      </form>

      <h2>Questions List</h2>
      <ul>
        {questions.map((question, index) => (
          <table border={'1'} key={question._id}       
            style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#f2f2f2", 
          }} >
            <tbody>
              {/* Display item number and _id */}
              Question: {index + 1}
              <tr>
                    <td width={'20%'}><b>Title</b></td>
                    <td>
                        {question.title}
                    </td>
                </tr>
                <tr>
                    <td><b>Complexity</b></td>
                    <td>
                        {question.complexity}
                    </td>
                </tr>
                <tr>
                    <td><b>Link</b></td>
                      <a
                        href={question.link ? question.link : '#'} // If link is empty or undefined, fallback to '#'
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {question.link ? question.link  : 'Link not available'}
                      </a>
                </tr>
              {/* <p>{question.title}</p> */}
              {/* <p>{question.description}</p>
              <p>{question.categories}</p> */}
              {/* <p>{question.complexity}</p> */}
              <td colSpan={'2'} style={{ textAlign: 'left' }}>
                <BlueButton onClick={() => handleEdit(question)}>Edit</BlueButton>
                <RedButton onClick={() => handleDelete(question._id)}>Delete</RedButton>
              </td>
            </tbody>
          </table>
        ))}
      </ul>
    </div>
  );
}

export default Home;

