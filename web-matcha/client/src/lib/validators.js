export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function validatePassword(pw) {
    const s = String(pw);

    if(s.length < 8) 
        return "Password must be at least 8 characters.";
    
    if(!/[A-Z]/.test(s)) 
        return "Password must contain at least 1 uppercase letter (A-Z).";
    
    if(!/[a-z]/.test(s)) 
        return "Password must contain at least 1 lowercase letter (a-z).";
    
    if(!/[0-9]/.test(s)) 
        return "Password must contain at least 1 number (0-9).";
    
    if(!/[^A-Za-z0-9]/.test(s))
        return "Password must contain at least 1 special character (e.g. !@#$).";

    return "";
}
