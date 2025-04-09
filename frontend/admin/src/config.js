// API endpoints configuration
const config = {
    userServiceUrl: process.env.REACT_APP_USER_SERVICE_URL || 'http://user-service:3001',
    questionServiceUrl: process.env.REACT_APP_QUESTION_SERVICE_URL || 'http://question-service:3002',
    matchingServiceUrl: process.env.REACT_APP_MATCHING_SERVICE_URL || 'http://matching-service:3003',
    collabServiceUrl: process.env.REACT_APP_COLLAB_SERVICE_URL || 'http://collab-service:3004',
};

export default config; 