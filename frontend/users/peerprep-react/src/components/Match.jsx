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
  const [isMatching, setIsMatching] = useState(false);
  const token = localStorage.getItem('token')
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }), // If token exists, copy the 'Authorization': `Bearer ${token}` to the header dict
    //...options.headers, // copy other headers to header dict
  };
  const [roomHostAbortController, setRoomHostAbortController] = useState(null); // Store the controller here

  useEffect(() => {
    // Use the helper function to make a fetch request with Authorization header
    const fetchCategories = async() => {
      try {
        const fetchPromise = await fetch('http://localhost:3002/questions/category', { headers });
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
  }, []);

  useEffect(() => {
    const fetchComplexityOfSelectedCategory = async() => {
      try{
        if (!selectedCategory) return;
        const fetchPromise = await fetch(`http://localhost:3002/questions/category/${selectedCategory}`, { headers });
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
    }, [selectedCategory]);

  useEffect(() => {
    if (selectedComplexity) {
      const filtered = allQuestions.filter((q) => q.complexity === selectedComplexity);
      setFilteredQuestions(filtered);
    }
  }, [selectedComplexity, allQuestions]);

  const handleMatchRandomQuestion = () => {
    const roomHostAbortController = new AbortController();
    setRoomHostAbortController(roomHostAbortController); 
    console.log("Matching a random question...");
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    setSelectedQuestion(randomQuestion);  // Match a random question
    const categorySubmit = selectedCategory.toLocaleLowerCase();
    const complexitySubmit = selectedComplexity.toLocaleLowerCase();
    console.log(randomQuestion);
    const fetchMatch = async() => {
      try{
        const signal = roomHostAbortController.signal;
        const fetchPromise = await fetch(`http://localhost:3003/match/find-match/${categorySubmit}/${complexitySubmit}`, { headers, signal });
        const response = await fetchPromise;
        const responseJson = await response.json();
        console.log(responseJson);
        const roomHost = responseJson.data.roomHost;
        if (roomHost === 'self'){
          const fetchPromise = await fetch('http://localhost:3003/match/sync-with-room-partner', {headers, signal});
          const response = await fetchPromise;
          console.log('room host self');
          const responseJson = await response.json();
          console.log(responseJson);
          if (response.status === 408){
            setIsMatching(false);
          }
          setIsMatching(true);
        }
        else{
          const fetchPromise = await fetch(`http://localhost:3003/match/sync-with-room-host/${roomHost}`, {headers, signal});
          const response = await fetchPromise;
          console.log('room host other')
          const responseJson = await response.json();
          console.log(responseJson);
          if (response.status === 409) {
            setIsMatching(false);
          }
          setIsMatching(true);
        }
      }
      catch(error){
        console.log(error);
      }
    }
    fetchMatch();
  };

  const handleCancelMatch = () => {
    roomHostAbortController.abort();
    // const cancelMatch = async() => {
    //   const fetchPromise = await fetch(`http://localhost:3003/match/sync-with-room-partner/cancel`, {method: 'DELETE', headers});
    //   const response = await fetchPromise;
    //   if (response.status === 200){
    //     console.log('cancel');
    //   }
    // }
    // cancelMatch();
    setIsMatching(false);
    setSelectedQuestion(null);
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
            onClick={isMatching ? handleCancelMatch : handleMatchRandomQuestion}
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            {isMatching ? (
              <>
                <span className="animate-pulse">⏳</span> Cancel
              </>
            ) : (
              'Match'
            )}
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
        <h3 className="text-xl font-bold mb-2">Matched Question</h3>
        <table className="table-auto border-collapse border border-gray-400 w-full">
          <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Title</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Complexity</th>
                <th className="border p-2">Category</th>
              </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">{selectedQuestion.title}</td>
              <td className="border px-4 py-2">{selectedQuestion.description}</td>
              <td className="border px-4 py-2">{selectedQuestion.complexity}</td>
              <td className="border px-4 py-2">{selectedQuestion.categories.join(", ")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )}
    </div>
  );
};

export default MatchPage;
