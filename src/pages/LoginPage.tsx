import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  // Basic state for validation (can be expanded)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [createError, setCreateError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username || !password) {
      setLoginError('Username and password are required.');
      return;
    }
    // TODO: Implement actual login logic
    console.log('Login attempt:', { username, password });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newUsername || !newPassword) {
      setCreateError('Username and password are required.');
      return;
    }
    // TODO: Implement actual account creation logic
    console.log('Create account attempt:', { newUsername, newPassword });
  };

  return (
    // Mimic HN's body padding/margin if needed, or apply directly here
    <div className="p-4 bg-hn-bg text-hn-normal text-sm">
      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} method="post" action="login" className="mb-8">
        <h2 className="text-lg mb-2">Login</h2>
        {loginError && <p className="text-red-500 text-xs mb-2">{loginError}</p>}
        <table className="border-collapse">
          <tbody>
            <tr>
              <td className="pr-2 pb-1 align-top"><label htmlFor="username">username:</label></td>
              <td><input 
                    type="text" 
                    id="username" 
                    name="acct" // HN uses 'acct' for username
                    size={20} 
                    autoCorrect="off" 
                    spellCheck="false" 
                    autoCapitalize="off" 
                    autoFocus={true} 
                    className="border border-gray-400 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-hn-orange focus:border-hn-orange"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  /></td>
            </tr>
            <tr>
              <td className="pr-2 pb-1 align-top"><label htmlFor="password">password:</label></td>
              <td><input 
                    type="password" 
                    id="password" 
                    name="pw" // HN uses 'pw' for password
                    size={20} 
                    className="border border-gray-400 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-hn-orange focus:border-hn-orange"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  /></td>
            </tr>
            <tr>
              <td></td>
              <td className="pt-2">
                <button 
                  type="submit" 
                  className="bg-hn-orange text-black px-2 py-0.5 text-sm border border-hn-orange hover:bg-opacity-90 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-hn-orange"
                >
                  login
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
      <Link to="/forgot" className="text-hn-gray hover:underline text-sm">Forgot your password?</Link>

      {/* Spacer */}
      <div className="h-10"></div> 

      {/* Create Account Form */}
      <form onSubmit={handleCreateSubmit} method="post" action="create"> 
        <h2 className="text-lg mb-2">Create Account</h2>
        {createError && <p className="text-red-500 text-xs mb-2">{createError}</p>}
        <table className="border-collapse">
          <tbody>
            <tr>
              <td className="pr-2 pb-1 align-top"><label htmlFor="new-username">username:</label></td>
              <td><input 
                    type="text" 
                    id="new-username" 
                    name="acct" // HN uses 'acct'
                    size={20} 
                    autoCorrect="off" 
                    spellCheck="false" 
                    autoCapitalize="off" 
                    className="border border-gray-400 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-hn-orange focus:border-hn-orange"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  /></td>
            </tr>
            <tr>
              <td className="pr-2 pb-1 align-top"><label htmlFor="new-password">password:</label></td>
              <td><input 
                    type="password" 
                    id="new-password" 
                    name="pw" // HN uses 'pw'
                    size={20} 
                    className="border border-gray-400 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-hn-orange focus:border-hn-orange"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  /></td>
            </tr>
            <tr>
              <td></td>
              <td className="pt-2">
                <button 
                  type="submit" 
                  className="bg-hn-orange text-black px-2 py-0.5 text-sm border border-hn-orange hover:bg-opacity-90 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-hn-orange"
                >
                  create account
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default LoginPage;