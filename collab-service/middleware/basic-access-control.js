import jwt from "jsonwebtoken";

export function verifyAccessToken(req, res, next) {
    console.log("Verifying access token...");
    console.log("JWT Secret:", process.env.JWT_SECRET);
    
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("No authorization header found");
        return res.status(401).json({ message: "Authorization header not found" });
    }

    // request auth header: `Authorization: Bearer + <access_token>`
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("No token found in authorization header");
        return res.status(401).json({ message: "No token provided" });
    }

    console.log("Token received:", token);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Token verification failed:", err.message);
            return res.status(401).json({ message: "JWT token verification failed", error: err.message });
        }
        console.log("Token verified successfully. User:", user);
        req.user = { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin };
        req.token = token;
        next();
    });
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