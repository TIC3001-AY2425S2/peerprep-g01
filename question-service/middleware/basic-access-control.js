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
            next();
        });
    }
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
}
