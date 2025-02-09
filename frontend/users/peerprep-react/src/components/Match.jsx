import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MatchPage = () => {
  const [questions, setQuestions] = useState([]);  // Store API data
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");

  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem("token"); // Get the JWT token from localStorage
      let headers = {};
      if (token) {
        headers = { Authorization: `Bearer ${token}` };
      }

      try {
        const response = await fetch("http://localhost:3002/questions/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...headers, // Spread the token header if it exists
          },
        });
        
        
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        
        const data = await response.json();
        setQuestions(data.data);
      } 
      catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  // Filter questions based on search
  const filteredQuestions = questions.filter((q) => {
    if (searchField === "all") {
      return Object.values(q).some((val) =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return q[searchField]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Match Questions</h2>

      {/* Search Section */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 w-full"
        />
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="border p-2"
        >
          <option value="all">All Fields</option>
          <option value="title">Title</option>
          <option value="description">Description</option>
          <option value="complexity">Complexity</option>
          <option value="categories">Categories</option>
        </select>
      </div>

      {/* Question Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Complexity</th>
            <th className="border p-2">Categories</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchPage;
