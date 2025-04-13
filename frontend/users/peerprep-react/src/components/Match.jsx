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
        console.log('Setting up collab room with:', {
          matchUuid: matchedData.data.matchUuid,
          questionId: questionId,
          userId: tokenDecoded.id
        });
        setMatchedQuestion(questionsListOfSelectedCategory.find((question) => question._id === questionId));
        const responseJson = await setupCollabRoom(matchedData.data.matchUuid, questionId, tokenDecoded.id);
        console.log('setupCollabRoom response:', responseJson);
        if (responseJson && responseJson.message) {
          setCollabRoomMessage(responseJson.message.toLowerCase());
        }
      }
    }
    myFunc();
  }, [matchedData]);

  useEffect(() => {
    console.log('collabRoomMessage changed:', collabRoomMessage);
    console.log('collabRoomDataRetry:', collabRoomDataRetry.current);
    const myFunc = async() => {
      if(collabRoomDataRetry.current > 3){
        console.log('collabRoomDataRetry exceed');
        return;
      }
      if(collabRoomMessage === "success" || collabRoomMessage === "retry"){
        console.log('Fetching collab room data for matchUuid:', matchedData.data.matchUuid);
        let responseJson = await getCollabRoomData(matchedData.data.matchUuid);
        console.log('getCollabRoomData response:', responseJson);
        if (responseJson && responseJson.data) {
          setCollabRoomData(responseJson);
          setCollabRoomMessage("");
          collabRoomDataRetry.current = 0;
        } else {
          console.log('No collab room data yet, retrying...');
          setCollabRoomMessage("retry");
          collabRoomDataRetry.current++;
        }
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
    const questionId = collabRoomData?.data.questionId;
    const url = `http://localhost:2999/collab/${collabId}/${questionId}`;
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
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%"
    }}>
      {matchCode === 0 && !matchedData && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{fontSize: "36px",fontWeight: "500",marginBottom: "30px",color: "#333"}}>Find Practice Partner</h1>
          
          <div style={{ marginBottom: "20px" }}>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                width: "100%",
                marginBottom: "15px",
                backgroundColor: "white",
                color: "black"
              }}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedComplexity} 
              onChange={(e) => setSelectedComplexity(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                width: "100%",
                backgroundColor: "white",
                color: "black"
              }}
              disabled={!selectedCategory || complexities.length === 0}
            >
              <option value="">Select Complexity</option>
              {complexities.map((complexity) => (
                <option key={complexity} value={complexity}>
                  {complexity}
                </option>
              ))}
            </select>
          </div>
          
          {selectedCategory && selectedComplexity && filteredQuestions.length > 0 && (
            <button
              onClick={handleMatchRandomQuestion}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Start Matching
            </button>
          )}
        </div>
      )}

      {matchCode === 202 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{fontSize: "36px",fontWeight: "500",marginBottom: "30px",color: "#333"}}>Matching In Progress</h1>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <MatchTimer initialSeconds={30}/>
          </div>
          
          <p style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: "25px"
          }}>
            Waiting for another user to match with you...
          </p>
          
          <button
            onClick={handleCancelMatch}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            <span style={{ marginRight: "8px" }}>⏳</span> Cancel
          </button>
        </div>
      )}
      
      {matchCode === 200 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{fontSize: "36px",fontWeight: "500",marginBottom: "30px",color: "#333"}}>Match Found!</h1>
          
          {collabRoomData?.data ? (
            <>
              <p style={{fontSize: "16px",color: "#666",marginBottom: "25px"}}>Your collaboration room is ready</p>
              
              <button
                onClick={handleGoToCollab}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Collab with Partner
              </button>
            </>
          ) : (
            <>
              <p style={{fontSize: "16px",color: "#666",marginBottom: "25px"}}>Setting up collaboration room...</p>
              
              <button
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  opacity: "0.7"
                }}
                disabled
              >
                <span style={{ marginRight: "8px" }}>⏳</span> Setting up collab room...
              </button>
            </>
          )}
        </div>
      )}

      {matchCode === 408 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{fontSize: "36px",fontWeight: "500",marginBottom: "30px",color: "#333"}}>Match Timed Out</h1>
          
          <p style={{fontSize: "16px",color: "#666",marginBottom: "25px"}}>No match found. Please try again.</p>
          
          <button
            onClick={() => setMatchCode(0)}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {matchCode === 500 && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          textAlign: "center"
        }}>
          <h1 style={{fontSize: "36px",fontWeight: "500",marginBottom: "30px",color: "#f44336"}}>Error</h1>
          <p style={{fontSize: "16px",color: "#666",marginBottom: "25px"}}>Something went wrong. Please try again.</p>
          
          <button
            onClick={() => setMatchCode(0)}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {(matchedData && matchedQuestion && collabRoomData?.data) && (
        <>
          <div>
            <table className="full-border-table">
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
      {selectedCategory && selectedComplexity && filteredQuestions.length > 0 && matchCode === 0 && !matchedData && (
        <div style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "20px auto 0",
          backgroundColor: "white",
          borderRadius: "4px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <table style={{width: "100%",borderCollapse: "collapse"}}>
            <thead>
              <tr style={{backgroundColor: "#333",color: "white"}}>
                <th style={{padding: "12px 16px",textAlign: "left",fontWeight: "500",width: "20%"}}>Title</th>
                <th style={{padding: "12px 16px",textAlign: "center",fontWeight: "500",width: "12%"}}>Complexity</th>
                <th style={{padding: "12px 16px",textAlign: "left",fontWeight: "500",width: "18%"}}>Categories</th>
                <th style={{padding: "12px 16px",textAlign: "left",fontWeight: "500",width: "30%"}}>Description</th>
                <th style={{padding: "12px 16px",textAlign: "center",fontWeight: "500",width: "10%"}}>Link</th>
                <th style={{padding: "12px 16px",textAlign: "center",fontWeight: "500",width: "10%"}}>Match</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q, index) => (
                <tr key={index} style={{borderBottom: "1px solid #eee"}}>
                  <td style={{padding: "12px 16px",textAlign: "left",fontWeight: "500",color: "#666"}} title={q.title}>{q.title}</td>
                  <td style={{padding: "12px 16px",textAlign: "center"}}>
                    <span style={{
                      display: "inline-block",
                      backgroundColor: q.complexity === "Easy" ? "#e9f7ef" : q.complexity === "Medium" ? "#fef5e7" : "#fae5e5",
                      color: q.complexity === "Easy" ? "#27ae60" : q.complexity === "Medium" ? "#f39c12" : "#e74c3c",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}>
                      {q.complexity}
                    </span>
                  </td>
                  <td style={{padding: "12px 16px"}}>
                    <div style={{display: "flex",flexWrap: "wrap",gap: "4px"}}>
                      {q.categories && q.categories.map((cat, catIndex) => (
                        <span key={catIndex} style={{
                          backgroundColor: "#ecf0f1",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#555"
                        }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{padding: "12px 16px",color: "#666",fontSize: "14px"}} title={q.description}>
                    {q.description && q.description.length > 80 
                      ? `${q.description.substring(0, 80)}...` 
                      : q.description}
                  </td>
                  <td style={{padding: "12px 16px",textAlign: "center"}}>
                    <a href={q.link} target="_blank" rel="noopener noreferrer" style={{color: "#4285f4",textDecoration: "none",fontWeight: "500"}}title={q.link}>
                      View Problem
                    </a>
                  </td>
                  <td style={{padding: "12px 16px",textAlign: "center"}}>
                    <button
                      onClick={() => {
                        setSelectedQuestion(q);
                        handleMatchRandomQuestion();
                      }}
                      style={{
                        backgroundColor: "#333",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}
                    >
                      Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchPage;
