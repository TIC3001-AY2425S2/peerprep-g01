import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MatchPage = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complexities, setComplexities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedComplexity, setSelectedComplexity] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);


  useEffect(() => {
    // Fetch available categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3002/questions/category");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // useEffect(() => {
  //   // Fetch questions only when both filters are selected
  //   if (!selectedCategory || !selectedComplexity) return;

  //   const fetchQuestions = async () => {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:3002/questions/?category=${selectedCategory}&complexity=${selectedComplexity}`
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch questions");
  //       }

  //       const data = await response.json();
  //       setQuestions(data.data);
  //     } catch (error) {
  //       console.error("Error fetching questions:", error);
  //     }
  //   };

  //   fetchQuestions();
  // }, [selectedCategory, selectedComplexity]);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchQuestionsByCategory = async () => {
      try {
        const response = await fetch(`http://localhost:3002/questions/category/${selectedCategory}`);
        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();
        setAllQuestions(data.data);

        // Extract unique complexity levels
        const uniqueComplexities = Array.from(new Set(data.data.map(q => q.complexity)));
        setComplexities(uniqueComplexities);
        setSelectedComplexity(""); // Reset complexity selection when category changes
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestionsByCategory();
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
