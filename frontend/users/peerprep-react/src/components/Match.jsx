import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from 'socket.io-client';
import { jwtDecode } from "jwt-decode";

const MatchPage = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complexities, setComplexities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedComplexity, setSelectedComplexity] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  // const [isMatching, setIsMatching] = useState(false);
  const [matchCode, setMatchCode] = useState(0);

  //const [matchData, setMatchData] = useState(null);
  const matchSyncSocket = useRef(null);
  const matchData = useRef(null);
  // const [roomHostAbortController, setRoomHostAbortController] = useState(null); // Store the controller here
  
  const token = localStorage.getItem('token')
  const tokenDecoded = jwtDecode(token);
  // console.log('tokenDecoded: ', tokenDecoded)
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }), // If token exists, copy the 'Authorization': `Bearer ${token}` to the header dict
    //...options.headers, // copy other headers to header dict
  };

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
      // setIsMatching(false);
      setMatchCode(0);
      setFilteredQuestions(filtered);
    }
  }, [selectedComplexity, allQuestions]);

  useEffect(() => {
    if (selectedComplexity) {
      const filtered = allQuestions.filter((q) => q.complexity === selectedComplexity);
      // setIsMatching(false);
      setMatchCode(0);
      setFilteredQuestions(filtered);
      
    }
  }, [selectedComplexity, allQuestions]);

  useEffect(() => {
    console.log('matchCode changed:', JSON.stringify(matchCode));
  }, [matchCode]);  // This will run whenever matchCode changes

  useEffect(() => {
    console.log('selectedQuestion changed:', JSON.stringify(selectedQuestion));
  }, [selectedQuestion]);  // This will run whenever matchCode changes

  useEffect(() => {
    console.log('matchData changed:', JSON.stringify(matchData));
  }, [matchData]);

  const handleMatchRandomQuestion = () => {
    // const roomHostAbortController = new AbortController();
    // setRoomHostAbortController(roomHostAbortController); 
    console.log("Matching a random question...");
    matchData.current = null;
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    setSelectedQuestion(randomQuestion);  // Match a random question
    const categorySubmit = selectedCategory.toLocaleLowerCase();
    const complexitySubmit = selectedComplexity.toLocaleLowerCase();
    console.log('randomQuestion: ', randomQuestion);
    const fetchMatch = async() => {
      try{
        // const signal = roomHostAbortController.signal;
        const fetchPromise = await fetch(`http://localhost:3003/match/find-match/${categorySubmit}/${complexitySubmit}`, { headers });
        const response = await fetchPromise;
        const responseJson = await response.json();
        console.log("find-match responseJson: ", JSON.stringify(responseJson));
        const roomHostId = responseJson.data.roomHost.id;
        const roomHostUsername = responseJson.data.roomHost.username;
        const matchUuid = responseJson.data.matchUuid;
        setMatchCode(202);
        matchSyncSocket.current = io("http://localhost:3003", {
          auth: {
              token, // Send the token in the handshake
          },
          reconnection: false,
          // reconnectionAttempts: 3,
          timeout: 2000
        });

        matchSyncSocket.current.onerror('connect_error', (error) => {
          console.error('Connection error:', error);
          matchSyncSocket.current.disconnect();
          setMatchCode(500);
        });

        matchSyncSocket.current.on("disconnect", (reason) => {
          console.log("Disconnected:", reason);
          matchSyncSocket.current.disconnect();
          if (reason === 'transport close'){
            setMatchCode(500);
            return;
          }
        });

        if (roomHostId === tokenDecoded.id){
          console.log("i am the room host. Room data is: ", JSON.stringify(responseJson.data));
          matchSyncSocket.current.on('connect', () => {
            console.log('room host connected to socket server: ', matchSyncSocket.current.id)
            matchSyncSocket.current.emit('syncWithRoomGuest', { data: responseJson.data });
            console.log('syncWithRoomGuest emit: ', JSON.stringify(responseJson.data))
          })
          
          matchSyncSocket.current.on('syncWithRoomGuest', (message) => {
            console.log('syncWithRoomGuest: ', message);
            setMatchCode(message.httpCode);
            matchSyncSocket.current.disconnect();
            if(message.httpCode !== 200){
              setSelectedQuestion(null);
            }
            else{
              matchData.current = message.data;
            }
          });
        }
        else{
          console.log("i am the room guest. Room data is: ", JSON.stringify(responseJson.data));
          matchSyncSocket.current.on('connect', () => {
            console.log('room guest client connected to server: ', matchSyncSocket.current.id)
            matchSyncSocket.current.emit('syncWithRoomHost', { data: responseJson.data});
          })

          matchSyncSocket.current.on('syncWithRoomHost', (message) => {
            console.log('syncWithRoomHost message: ', message);
            setMatchCode(message.httpCode);
            matchSyncSocket.current.disconnect();
            if(message.httpCode !== 200){
              setSelectedQuestion(null);
            }
            else{
              matchData.current = message.data;
            }
          });
          
        }
      }
      catch(error){
        console.log('fetchMatch error: ', error.message);
        setMatchCode(500);
      }
    }
    fetchMatch();
  };

  const handleCancelMatch = () => {
    console.log('cancel match');
    if (matchSyncSocket){
      matchSyncSocket.current.disconnect();
    }
    // setIsMatching(false);
    setSelectedQuestion(null);
    setMatchCode(499);
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
            onClick={(matchCode === 202) ? handleCancelMatch : handleMatchRandomQuestion}
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            {(matchCode === 202) ? (
              <>
                <span className="animate-pulse">⏳</span> Cancel
              </>
            ) : (
              'Match'
            )}
          </button>
        )}

      {(matchCode !== 0) && (
        <div className="mt-4 flex items-center space-x-2">
          {matchCode === 200 ? (
            <>
              <span className="font-semibold">
                Found Match for <span className="text-blue-600">{selectedQuestion.title}</span> with {" "}
                <span className="font-bold">{JSON.stringify(matchData)}</span>
              </span>
            </>
          ) : matchCode === 408 ? (
            <>
              <span className="font-semibold">
                No match found. Try again
              </span>
            </>
          ) : matchCode === 409 ? (
            <>
              <span className="font-semibold">
                Match conflict. Try again
              </span>
            </>
          ) : matchCode === 499 ? (
            <>
              <span className="font-semibold">
                Match cancelled
              </span>
            </>
          ) : matchCode === 202 ? (
            <>
              <span className="animate-pulse text-yellow-500">⏳</span>
              <span>Finding Match for <span className="font-semibold">{selectedQuestion.title}</span></span>
            </>
          ) : matchCode === 500 ? (
            <>
              <span>Connection to server error</span>
            </>
          ) : (
            <>
              <span>Other match code {matchCode}</span>
            </>
          )}
        </div>
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
                    {/* Match this Question */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MatchPage;
