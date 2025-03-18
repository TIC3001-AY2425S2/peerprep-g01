import { useEffect, useState } from "react";

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        if (token) {
            setIsLoggedIn(true);
            setUsername(storedUsername || "User");
        }
    }, []);

    return (
        <>
            <h1>Homepage</h1>
            <div>
                {isLoggedIn ? (
                    <>
                        <h1>Welcome, {username}!</h1>
                        <p>You are now logged in.</p>
                    </>
                ) : (
                    <>
                        <h1>Welcome to our website!</h1>
                        <p>Please <a href="/login">log in</a> or <a href="/signup">sign up</a> to continue.</p>
                    </>
                )}
            </div>
        </>
    );
}