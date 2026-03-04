import { createContext, useEffect, useState } from "react"

export const UserContext = createContext()

const UserProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for user in localStorage on initial load
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser))
            } catch (error) {
                console.error('Error parsing saved user:', error)
                localStorage.removeItem('user')
            }
        }
        setIsLoading(false)
    }, [])

    const updateUser = (userData) => {
        setCurrentUser(userData)
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData))
        } else {
            localStorage.removeItem('user')
        }
    }

    return (
        <UserContext.Provider value={{
            currentUser, 
            setCurrentUser: updateUser,
            isLoading
        }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider