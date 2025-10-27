import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { UserContext } from '../context/userContext';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const {setCurrentUser} = useContext(UserContext)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    // API call
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, formData);
    //   console.log(response)
      const user = await response.data;
      setCurrentUser(user.user)
      navigate('/dashboard');

    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrors({general: error.response.data.error});
      } else {
        setErrors({general: "An error occurred while loggging in. Please try again later."});
      }
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
  <div  
    className="min-h-screen flex items-center justify-center"
    style={{ paddingTop: "3rem", paddingBottom: "3rem", paddingLeft: "1rem", paddingRight: "1rem" }} // py-12 px-4
  >
    <div className="flex flex-col max-w-md w-full gap-2">
      <div>
        <div
          className="h-12 w-12 bg-slack-purple rounded-lg flex items-center justify-center"
          style={{ marginLeft: "auto", marginRight: "auto" }} // mx-auto
        >
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2
          className="text-center text-3xl font-extrabold text-gray-900"
          style={{ marginTop: "1.5rem" }} // mt-6
        >
          Sign in to your account
        </h2>
        <p
          className="text-center text-sm text-gray-600"
          style={{ marginTop: "0.5rem" }} // mt-2
        >
          Welcome back to your invoice software
        </p>
      </div>

      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        style={{ padding: "2rem" }} // p-8
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errors.general && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg"
              style={{ padding: "1rem" }} // p-4
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div style={{ marginLeft: "0.75rem" }}> {/* ml-3 */}
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "0.5rem" }} // mb-2
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-slack-purple focus:border-transparent transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              style={{ paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }} // px-4 py-3
              placeholder="Enter your email"
            />
            {errors.email && (
              <p
                className="text-red-500 text-sm"
                style={{ marginTop: "0.25rem" }} // mt-1
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "0.5rem" }} // mb-2
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-slack-purple focus:border-transparent transition-all ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              style={{ paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }} // px-4 py-3
              placeholder="Enter your password"
            />
            {errors.password && (
              <p
                className="text-red-500 text-sm"
                style={{ marginTop: "0.25rem" }} // mt-1
              >
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-slack-purple focus:ring-slack-purple border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="block text-sm text-gray-900"
                style={{ marginLeft: "0.5rem" }} // ml-2
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-slack-purple hover:text-slack-purple hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slack-purple transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-slack-purple hover:bg-slack-purple hover:bg-opacity-90"
            }`}
            style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem", paddingLeft: "1rem", paddingRight: "1rem" }} // py-3 px-4
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                style={{ marginLeft: "-0.25rem", marginRight: "0.75rem" }} // -ml-1 mr-3
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-slack-purple hover:text-slack-purple hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Demo Instructions */}
      <div
        className="bg-blue-50 border border-blue-200 rounded-lg"
        style={{ padding: "1rem" }} // p-4
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div style={{ marginLeft: "0.75rem" }}> {/* ml-3 */}
            <h3 className="text-sm font-medium text-blue-800">Demo Instructions</h3>
            <p
              className="text-xs text-blue-700"
              style={{ marginTop: "0.25rem" }} // mt-1
            >
              First complete registration, then use those credentials to login
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default Login;