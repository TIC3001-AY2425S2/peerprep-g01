import jwt from "jsonwebtoken";

export function verifyAccessToken(req, res, next) {
    
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header not found" });
    }

    // request auth header: `Authorization: Bearer + <access_token>`
    const token = authHeader.split(" ")[1];
    if (token){
        const decode =  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({ message: "JWT token verification failed" });
            }
            req.user = { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin };
            req.token = token;
            next();
        });
    }
    //next();
}

export function verifyIsAdmin(req, res, next) {
    
    try{
        if (req.user.isAdmin) {
            next();
        } 
        else {
            return res.status(403).json({ message: "Not authorized to access this resource" });
        }
    }
    catch (err){
        return res.status(500).json({message: `error processing JWT`});
    }
    //next();
}

export function verifySocketAccessToken(socket, next) {
    const token = socket.handshake.auth.token; // Getting token from socket handshake
    const roomNonce = socket.handshake.auth.roomNonce;
    console.log('verifySocketAccessToken in progress');
    if (!token) {
        console.log('verifySocketAccessToken Authorization token not found');
        // socket.emit('verifySocketAccessToken', 'Fail');
        // socket.disconnect();
        return next(new Error("Authorization token not found"));
    }

    // Verify token using JWT_SECRET (you can keep it in environment variables)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new Error("JWT token verification failed"));
        }

        console.log('verifySocketAccessToken OK');
        // Attach the decoded user to the socket object
        socket.user = { id: user.id, username: user.username, email: user.email };
        next();
    });
}
