import { useLocation } from 'react-router-dom';

const ConditionalWrapper = ({ children }) => {
  const location = useLocation();

  // Define the exact paths where you DO NOT want the component to appear
  const excludedPaths = ['/'];

  // Check if the current pathname is in the excluded array
  if (excludedPaths.includes(location.pathname)) {
    return null; 
  }

  return children;
};

export default ConditionalWrapper;
