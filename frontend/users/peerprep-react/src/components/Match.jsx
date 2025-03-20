import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from './fetchHelper'; // Import the helper function

const MatchPage = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complexities, setComplexities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedComplexity, setSelectedComplexity] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    // Use the helper function to make a fetch request with Authorization header
    const fetchCategories = async() => {
      try {
        const { fetchPromise, abortController }  = await fetchWithAuth('http://localhost:3002/questions/category')
        const response = await fetchPromise;
        const responseJson = await response.json();
        console.log(responseJson);
        setCategories(responseJson.data);
      }
      catch (err){
        console.error(err.message);
      }
    }
    fetchCategories();
    // fetchWithAuth('http://localhost:3002/questions/category')
    // .then((responseData) => {
    //   console.log("fected")
    //   setCategories(responseData.data);
    // })
    // .catch(() => {
    //   console.error('Error fetching categories');
    // });
  }, []);

  useEffect(() => {
    const fetchComplexityOfSelectedCategory = async() => {
      try{
        if (!selectedCategory) return;
        const { fetchPromise, abortController }  = await fetchWithAuth(`http://localhost:3002/questions/category/${selectedCategory}`);
        const response = await fetchPromise;
        const responseJson = await response.json();
        console.log(responseJson);
        setAllQuestions(responseJson.data);
        const uniqueComplexities = Array.from(new Set(responseJson.data.map(q => q.complexity)));
        setComplexities(uniqueComplexities);
        setSelectedComplexity("");
      }
      catch (err){
        console.error(err.message);
      }
    }
    fetchComplexityOfSelectedCategory();
    
    // if (!selectedCategory) return;
    // fetchWithAuth(`http://localhost:3002/questions/category/${selectedCategory}`)
    //   .then((responseData) => {
    //     setAllQuestions(responseData.data);
    //     const uniqueComplexities = Array.from(new Set(responseData.data.map(q => q.complexity)));
    //     setComplexities(uniqueComplexities);
    //     setSelectedComplexity(""); // Reset complexity selection when category changes
    //   })
    //   .catch(() => {
    //     console.error("Error fetching questions");
    //   })
    }, [selectedCategory]);

  useEffect(() => {
    if (selectedComplexity) {
      const filtered = allQuestions.filter((q) => q.complexity === selectedComplexity);
      setFilteredQuestions(filtered);
    }
  }, [selectedComplexity, allQuestions]);

  const handleMatchRandomQuestion = () => {
    // Placeholder for backend match logic
    console.log("Matching a random question...");
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    setSelectedQuestion(randomQuestion);  // Match a random question
    const categorySubmit = selectedCategory.toLocaleLowerCase();
    const complexitySubmit = selectedComplexity.toLocaleLowerCase();
    console.log(randomQuestion);
    const fetchMatch = async() => {
      const { fetchPromise, abortController } = await fetchWithAuth(`http://localhost:3003/match/find-match/${categorySubmit}/${complexitySubmit}`);
      const response = await fetchPromise;
      const responseJson = await response.json();
      console.log(responseJson);
      const roomHost = responseJson.data.roomHost;
      if(roomHost === 'self'){
        const { fetchPromise, abortController } = await fetchWithAuth('http://localhost:3003/match/sync-with-room-partner');
        const response = await fetchPromise;
        console.log('room host self');
        const responseJson = await response.json();
        console.log(responseJson);
      }
      else{
        const { fetchPromise, abortController } = await fetchWithAuth(`http://localhost:3003/match/sync-with-room-host/${roomHost}`);
        const response = await fetchPromise;
        console.log('room host other')
        const responseJson = await response.json();
        console.log(responseJson);
      }
    }
    fetchMatch();
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Find Practice Parnter</h2>

      {/* Filter Section */}
      <div className="mb-4 flex gap-2">
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2"
        >
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>

         {/* Complexity Dropdown (Dynamically updated) */}
         <select
          value={selectedComplexity}
          onChange={(e) => setSelectedComplexity(e.target.value)}
          className="border p-2"
          disabled={!complexities.length}
        >
          <option value="">Select Complexity</option>
          {complexities.map((complexity, index) => (
            <option key={index} value={complexity}>{complexity}</option>
          ))}
        </select>
      </div>

      {/* Buttons */}
        {/* Match Random Question Button (only visible when both filters are selected) */}
        {selectedCategory && selectedComplexity && (
          <button
            onClick={handleMatchRandomQuestion}
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Match a Random Question in the List
          </button>
        )}

      {/* Question Table (only show if questions are available) */}
      {selectedCategory && selectedComplexity && filteredQuestions.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Title</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Complexity</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{q.title}</td>
                <td className="border p-2">{q.description}</td>
                <td className="border p-2">{q.complexity}</td>
                <td className="border p-2">{q.categories.join(", ")}</td>
                <td className="border p-2">
                  <Link to={q.link} className="text-blue-600 hover:underline">{q.link}</Link>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleSelectQuestion(q)}
                    className="bg-yellow-500 text-white p-2 rounded"
                  >
                    Match this Question
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Selected Question Display (optional) */}
      {selectedQuestion && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Matched Question</h3>
          <div>
            <h4>{selectedQuestion.title}</h4>
            <p>{selectedQuestion.description}</p>
            <p><strong>Complexity:</strong> {selectedQuestion.complexity}</p>
            <p><strong>Categories:</strong> {selectedQuestion.categories.join(", ")}</p>
            <p><strong>ID:</strong> {selectedQuestion._id}</p> {/* This is for backend logic, not shown to user */}
            <a href={selectedQuestion.link} target="_blank" rel="noopener noreferrer" className="text-blue-600">View on LeetCode</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPage;
