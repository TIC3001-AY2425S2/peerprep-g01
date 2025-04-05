import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from 'socket.io-client';
import { jwtDecode } from "jwt-decode";
import MatchTimer from "./MatchTimer";

const MatchPage = () => {
  const [questionsListOfSelectedCategory, setQuestionsList] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complexities, setComplexities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedComplexity, setSelectedComplexity] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [matchCode, setMatchCode] = useState(0);
  const [matchedQuestion, setMatchedQuestion] = useState(null);
  const [matchedData, setMatchedData] = useState(null);
  const [collabRoomMessage, setCollabRoomMessage] = useState("");
  const [collabRoomData, setCollabRoomData] = useState(null);
  
  const collabRoomDataRetry = useRef(0);
  const matchSyncSocket = useRef(null);
  
  const token = localStorage.getItem('token')
  const tokenDecoded = jwtDecode(token);
  const headerWithAuth = {
    ...(token && { 'Authorization': `Bearer ${token}` }), // If token exists, copy the 'Authorization': `Bearer ${token}` to the header dict
  };

  async function fetchCategories() {
    try {
      const fetchPromise = await fetch('http://localhost:3002/questions/category', { headers: headerWithAuth });
      const response = await fetchPromise;
      const responseJson = await response.json();
      console.log('fetchCategories: ', responseJson);
      setCategories(responseJson.data);
    }
    catch (err){
      console.error(err.message);
    }
  }

  async function fetchQuestionsOfSelectedCategory() {
    try{
      if (!selectedCategory) return;
      const fetchPromise = await fetch(`http://localhost:3002/questions/category/${selectedCategory}`, { headers: headerWithAuth });
      const response = await fetchPromise;
      const responseJson = await response.json();
      console.log('fetchQuestionsOfSelectedCategory: ', responseJson);
      setQuestionsList(responseJson.data);
    }
    catch (err){
      console.error(err.message);
    } 
  }

  async function getUniqueComplexities() {
    try{
      const uniqueComplexities = Array.from(new Set(questionsListOfSelectedCategory.map(q => q.complexity)));
      setComplexities(uniqueComplexities);
      setSelectedComplexity("");
    }
    catch (err){
      console.error(err.message);
    } 
  }

  async function setupCollabRoom(matchUuid, questionId, userId){
    try{
      const postData = {matchUuid, questionId, userId};
      const fetchPromise = await fetch(`http://localhost:3004/collab/create-collab`, { 
        headers: { ...headerWithAuth, 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(postData),
      });
      const response = await fetchPromise;
      const responseJson = await response.json();
      console.log('setupCollabRoom: ', responseJson);
      return responseJson;
    }
    catch(err){
      console.error(err.message);
    }
  }

  async function getCollabRoomData(matchUuid){
    try{
      const fetchPromise = await fetch(`http://localhost:3004/collab/matchUuid/${matchUuid}`, { 
        headers: { ...headerWithAuth }
      });
      const response = await fetchPromise;
      const responseJson = await response.json();
      console.log('getCollabRoomData: ', responseJson);
      return responseJson;
    }
    catch(err){
      console.error(err.message);
    }
  }

  function resetState(){
    setMatchCode(0);
    setMatchedData(null);
    setCollabRoomData(null);
    setCollabRoomMessage('');
  }

  // run on load
  useEffect(() => {
    fetchCategories();
  }, []);

  // run when user selected a category to get all the questions of the selected category
  useEffect(() => {
    resetState();
    fetchQuestionsOfSelectedCategory();
  }, [selectedCategory]);

  // runs when the questions list is updated with the questions list changed
  useEffect(() => {
    resetState();
    getUniqueComplexities();
  }, [questionsListOfSelectedCategory]);

  useEffect(() => {
    resetState();
    const isQuestionsListEmpty = questionsListOfSelectedCategory.length === 0;
    if (selectedComplexity && !isQuestionsListEmpty) {
      const filtered = questionsListOfSelectedCategory.filter((q) => q.complexity === selectedComplexity);
      setFilteredQuestions(filtered);
    }
  }, [selectedComplexity, questionsListOfSelectedCategory]);

  useEffect(() => {
    console.log('matchCode changed:', JSON.stringify(matchCode));
  }, [matchCode]);  // This will run whenever matchCode changes

  useEffect(() => {
    console.log('selectedQuestion changed:', JSON.stringify(selectedQuestion));
  }, [selectedQuestion]);  // This will run whenever matchCode changes

  useEffect(() => {
    console.log('matchedData changed:', JSON.stringify(matchedData));
    const myFunc = async() => {
      if(matchedData){
        const questionId = matchedData.data.matchQuestionId;
        setMatchedQuestion(questionsListOfSelectedCategory.find((question) => question._id === questionId));
        const responseJson = await setupCollabRoom(matchedData.data.matchUuid, matchedData.data.matchQuestionId, tokenDecoded.id);
        console.log('matchedData responseJson.message: ', responseJson.message);
        setCollabRoomMessage(responseJson.message);
      }
    }
    myFunc();
  }, [matchedData]);

  useEffect(() => {
    console.log('collabRoomMessage changed:', collabRoomMessage);
    console.log('collabRoomDataRetry: ', collabRoomDataRetry);
    const myFunc = async() => {
      if(collabRoomDataRetry.current > 3){
        console.log('collabRoomDataRetry exceed');
        return;
      }
      if(collabRoomMessage.toLowerCase() === "success" || collabRoomMessage.toLowerCase() === "retry"){
        let responseJson = await getCollabRoomData(matchedData.data.matchUuid);
        setCollabRoomData(responseJson);
        setCollabRoomMessage("");
        collabRoomDataRetry.current = 0;
      }
    }

    myFunc();
  }, [collabRoomMessage]);

  useEffect(() => {
    console.log('collabRoomData changed:', collabRoomData);
    
    // sometimes, the getCollabRoomData() returns a collab data of value null. This is to trigger the function to get the collab data again
    if(!(collabRoomData?.data) && matchedData){
      setCollabRoomMessage("retry"); 
      collabRoomDataRetry.current++;
    }
  }, [collabRoomData]);

  function handleGoToCollab() {
    const collabId = collabRoomData?.data._id;
    // const url = `http://localhost:3000/?collabId=${collabId}`;
    const url = `http://localhost:3000/${collabId}`;
    resetState();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleMatchRandomQuestion() {
    console.log("Matching a random question...");
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    setSelectedQuestion(randomQuestion);  // Match a random question
    const categorySubmit = selectedCategory.toLocaleLowerCase();
    const complexitySubmit = selectedComplexity.toLocaleLowerCase();
    console.log('randomQuestion: ', randomQuestion);
    const fetchMatch = async() => {
      try{
        const fetchPromise = await fetch(`http://localhost:3003/match/find-match/${categorySubmit}/${complexitySubmit}`, { 
          headers: { ...headerWithAuth, 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({'_id': randomQuestion._id}),
        });
        const response = await fetchPromise;
        const responseJson = await response.json();
        console.log("find-match responseJson: ", JSON.stringify(responseJson));
        console.log("response: ", response);
        setMatchCode(response.status);
        if (response.status !== 202){
          return;
        }
        const matchHostId = responseJson.data.matchHost.id;
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

        if (matchHostId === tokenDecoded.id){
          console.log("i am the match host. match data is: ", JSON.stringify(responseJson.data));
          matchSyncSocket.current.on('connect', () => {
            console.log('match host connected to socket server: ', matchSyncSocket.current.id)
            matchSyncSocket.current.emit('syncWithMatchGuest', { data: responseJson.data });
            console.log('syncWithMatchGuest emit: ', JSON.stringify(responseJson.data))
          })
          
          matchSyncSocket.current.on('syncWithMatchGuest', (message) => {
            console.log('syncWithMatchGuest: ', message);
            matchSyncSocket.current.disconnect();
            if(message.httpCode !== 200){
              setSelectedQuestion(null);
              setMatchCode(message.httpCode);
            }
            else{
              setMatchedData(message.data);
              setMatchCode(message.httpCode);
            }
          });
        }
        else{
          console.log("i am the match guest. match data is: ", JSON.stringify(responseJson.data));
          matchSyncSocket.current.on('connect', () => {
            console.log('match guest client connected to server: ', matchSyncSocket.current.id)
            matchSyncSocket.current.emit('syncWithMatchHost', { data: responseJson.data});
          })

          matchSyncSocket.current.on('syncWithMatchHost', (message) => {
            console.log('syncWithMatchHost message: ', message);
            matchSyncSocket.current.disconnect();
            if(message.httpCode !== 200){
              setSelectedQuestion(null);
            }
            else{
              setMatchedData(message.data);
              setMatchCode(message.httpCode);
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
          <div>
            <button
              onClick={
                (matchCode === 0) ? handleMatchRandomQuestion
                : (matchCode === 202) ? handleCancelMatch
                : (matchCode === 200 && collabRoomData?.data) ? handleGoToCollab
                : handleMatchRandomQuestion
              }
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              {(matchCode === 202) ? (
                <>
                  <span className="animate-pulse">⏳</span> Cancel
                </>
              ) : matchCode === 200 && collabRoomData?.data ? (
                'Collab with Partner'
              ) : (
                'Match'
              )}
            </button>
          </div>
        )}

      {
        matchCode === 408 ? (
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
            <span>Finding Match for: <span className="font-semibold">{selectedQuestion.title}</span></span>
            <MatchTimer initialSeconds={30}/>
          </>
        ) : matchCode === 500 ? (
          <>
            <span>Connection to server error</span>
          </>
        ) : matchCode === 0 ? (
          <>
            <span></span>
          </>
        ) : matchCode === 200 ? (
          <>
            <span>Match success</span>
          </>
        ) : (
          <>
            <span>Other match code {matchCode}</span>
          </>
        )
      }

      {(matchedData && matchedQuestion && collabRoomData?.data) && (
        <>
          <div>
            <table className="w-full border-collapse border border-gray-300" style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Field</th>
                  <th className="border p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Question ID</td>
                  <td className="border p-2">{matchedQuestion._id}</td>
                </tr>
                <tr>
                  <td className="border p-2">Question Title</td>
                  <td className="border p-2">{matchedQuestion.title}</td>
                </tr>
                <tr>
                  <td className="border p-2">Matched User</td>
                  <td className="border p-2">{matchedData.data.matchHost ? matchedData.data.matchHost.username : matchedData.data.matchGuest.username}</td>
                </tr>
                <tr>
                  <td className="border p-2">Match UUID</td>
                  <td className="border p-2">{matchedData.data.matchUuid}</td>
                </tr>
                <tr>
                  <td className="border p-2">Collab ID</td>
                  <td className="border p-2">{collabRoomData.data._id}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
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
