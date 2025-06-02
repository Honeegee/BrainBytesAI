import { useState, useEffect } from 'react';

export default function PasswordStrength({ password }) {
  const [strength, setStrength] = useState({
    score: 0,
    message: '',
    color: '',
  });

  useEffect(() => {
    const calculateStrength = pass => {
      if (!pass) {
        return {
          score: 0,
          message: '',
          color: 'bg-gray-300',
        };
      }

      let score = 0;
      const checks = {
        length: pass.length >= 8,
        hasUpperCase: /[A-Z]/.test(pass),
        hasLowerCase: /[a-z]/.test(pass),
        hasNumbers: /\d/.test(pass),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      };

      // Calculate score
      score += checks.length ? 1 : 0;
      score += checks.hasUpperCase ? 1 : 0;
      score += checks.hasLowerCase ? 1 : 0;
      score += checks.hasNumbers ? 1 : 0;
      score += checks.hasSpecialChar ? 1 : 0;

      // Determine message and color
      const strengthLevels = {
        0: { message: '', color: 'bg-gray-300' },
        1: { message: 'Very Weak', color: 'bg-red-500' },
        2: { message: 'Weak', color: 'bg-orange-500' },
        3: { message: 'Medium', color: 'bg-yellow-500' },
        4: { message: 'Strong', color: 'bg-blue-500' },
        5: { message: 'Very Strong', color: 'bg-green-500' },
      };

      return {
        score,
        ...strengthLevels[score],
      };
    };

    setStrength(calculateStrength(password));
  }, [password]);

  if (!password) return null;

  return (
    <div className='mt-2 transition-all duration-300'>
      <div className='relative h-1 w-full bg-gray-200 rounded-full overflow-hidden'>
        <div
          className={`absolute inset-y-0 left-0 ${strength.color} transition-all duration-300`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
      <div className='flex items-center justify-between mt-1'>
        <p
          className={`text-xs ${strength.score <= 2 ? 'text-red-400' : strength.score <= 3 ? 'text-yellow-400' : 'text-green-400'}`}
        >
          {strength.message}
        </p>
        <p className='text-xs text-text-medium'>{strength.score}/5</p>
      </div>
      {strength.score < 5 && (
        <div className='mt-2 p-2 bg-red-900 bg-opacity-20 rounded-md'>
          <p className='text-xs text-red-400 mb-1'>Password must have:</p>
          <ul className='text-xs text-red-400 space-y-0.5 ml-1'>
            {!password?.length >= 8 && <li>• At least 8 characters</li>}
            {!/[A-Z]/.test(password) && <li>• One uppercase letter</li>}
            {!/[a-z]/.test(password) && <li>• One lowercase letter</li>}
            {!/\d/.test(password) && <li>• One number</li>}
            {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && (
              <li>• One special character</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
